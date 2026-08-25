// app/api/payment/route.js
// ============================================
// Cashfree Payment Gateway integration.
//   POST { action: 'create_order', userId, planId, billingCycle, currency, couponCode? }
//        -> creates a Cashfree order, returns payment_session_id for the checkout SDK
//   POST { action: 'verify', userId, orderId }
//        -> checks order status with Cashfree; on PAID, activates the plan
//
// Required env vars:
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   CASHFREE_APP_ID, CASHFREE_SECRET_KEY
//   CASHFREE_ENV = 'sandbox' | 'production'   (default 'sandbox')
//   NEXT_PUBLIC_APP_URL  (e.g. https://app.anutask.com) — used for the return URL
// ============================================

import { createClient } from '@supabase/supabase-js';
import { getPlanPrice, PURCHASABLE_PLANS, PLANS } from '../../../config/plans.config';
import { validateCoupon } from '../../../services/couponService';

const CF_API_VERSION = '2023-08-01';

function cfBaseUrl() {
  const env = (process.env.CASHFREE_ENV || 'sandbox').toLowerCase();
  return env === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
}

function cfHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-api-version': CF_API_VERSION,
    'x-client-id': process.env.CASHFREE_APP_ID || '',
    'x-client-secret': process.env.CASHFREE_SECRET_KEY || '',
  };
}

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function activatePlan(adminClient, userId, planId, billingCycle, currency) {
  const now = new Date();
  const periodEnd = billingCycle === 'yearly'
    ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
    : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await adminClient.from('profiles').update({
    subscription_plan: planId,
    subscription_status: 'active',
    billing_cycle: billingCycle,
    currency,
    plan_activated_at: now.toISOString(),
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
    ai_prompts_used: 0,
    ai_prompts_reset_at: now.toISOString(),
    cancel_at_period_end: false,
  }).eq('id', userId);
}

export async function POST(req) {
  const body = await req.json();
  const { action } = body;

  const adminClient = admin();
  if (!adminClient) return Response.json({ error: 'Server configuration missing.' }, { status: 500 });

  if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
    return Response.json({ error: 'Payment gateway is not configured yet. Please add Cashfree API keys.' }, { status: 503 });
  }

  try {
    // =================== CREATE ORDER ===================
    if (action === 'create_order') {
      const { userId, planId, billingCycle = 'monthly', currency = 'INR', couponCode } = body;

      if (!PURCHASABLE_PLANS.includes(planId)) {
        return Response.json({ error: 'This plan cannot be purchased.' }, { status: 400 });
      }

      const baseAmount = getPlanPrice(planId, currency, billingCycle);
      if (!baseAmount || baseAmount <= 0) {
        return Response.json({ error: 'Invalid plan price.' }, { status: 400 });
      }

      // Apply coupon (server-side — never trust a client-sent discount)
      let discountAmount = 0;
      let appliedCoupon = null;
      if (couponCode) {
        const res = await validateCoupon(adminClient, { code: couponCode, planId, currency, baseAmount });
        if (!res.ok) return Response.json({ error: res.error }, { status: 400 });
        discountAmount = res.discount;
        appliedCoupon = res.coupon.code;
      }

      const finalAmount = Math.max(0, Number((baseAmount - discountAmount).toFixed(2)));

      // Load customer details for Cashfree (name/email/phone)
      const { data: profile } = await adminClient
        .from('profiles')
        .select('email, full_name, phone')
        .eq('id', userId)
        .single();

      const localOrderId = `anutask_${planId}_${Date.now()}`;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.anutask.com';

      const orderPayload = {
        order_id: localOrderId,
        order_amount: finalAmount,
        order_currency: currency,
        customer_details: {
          customer_id: userId,
          customer_email: profile?.email || 'user@anutask.com',
          customer_phone: profile?.phone || '9999999999',
          customer_name: profile?.full_name || 'AnuTask User',
        },
        order_meta: {
          // Cashfree replaces {order_id} — we verify server-side on return
          return_url: `${appUrl}/dashboard?cf_order_id={order_id}&cf_return=1`,
        },
        order_note: `AnuTask ${PLANS[planId]?.name || planId} (${billingCycle})`,
        order_tags: {
          plan_id: planId,
          billing_cycle: billingCycle,
          coupon: appliedCoupon || 'none',
        },
      };

      const cfRes = await fetch(`${cfBaseUrl()}/orders`, {
        method: 'POST',
        headers: cfHeaders(),
        body: JSON.stringify(orderPayload),
      });
      const cfData = await cfRes.json();

      if (!cfRes.ok || !cfData.payment_session_id) {
        return Response.json({ error: cfData.message || 'Failed to create payment order.' }, { status: 400 });
      }

      // Record the order locally so verify() has a source of truth
      await adminClient.from('payment_orders').insert({
        user_id: userId,
        cf_order_id: cfData.order_id || localOrderId,
        plan_id: planId,
        billing_cycle: billingCycle,
        currency,
        base_amount: baseAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        coupon_code: appliedCoupon,
        status: 'created',
      });

      return Response.json({
        success: true,
        payment_session_id: cfData.payment_session_id,
        order_id: cfData.order_id || localOrderId,
        final_amount: finalAmount,
        discount_amount: discountAmount,
        currency,
        env: (process.env.CASHFREE_ENV || 'sandbox').toLowerCase(),
      });
    }

    // =================== VERIFY ORDER ===================
    if (action === 'verify') {
      const { userId, orderId } = body;
      if (!orderId) return Response.json({ error: 'Missing order id.' }, { status: 400 });

      // Fetch authoritative status from Cashfree
      const cfRes = await fetch(`${cfBaseUrl()}/orders/${orderId}`, {
        method: 'GET',
        headers: cfHeaders(),
      });
      const cfData = await cfRes.json();

      if (!cfRes.ok) {
        return Response.json({ error: cfData.message || 'Could not verify order.' }, { status: 400 });
      }

      // Load our local record
      const { data: localOrder } = await adminClient
        .from('payment_orders')
        .select('*')
        .eq('cf_order_id', orderId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!localOrder) return Response.json({ error: 'Order not found.' }, { status: 404 });

      const isPaid = cfData.order_status === 'PAID';

      if (isPaid && localOrder.status !== 'paid') {
        // Activate the plan and mark order paid (idempotent guard above)
        await activatePlan(adminClient, userId, localOrder.plan_id, localOrder.billing_cycle, localOrder.currency);
        await adminClient.from('payment_orders')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', localOrder.id);

        // Increment coupon redemption count if one was used
        if (localOrder.coupon_code) {
          const { data: coup } = await adminClient
            .from('coupons').select('id, times_redeemed').ilike('code', localOrder.coupon_code).maybeSingle();
          if (coup) {
            await adminClient.from('coupons')
              .update({ times_redeemed: (coup.times_redeemed || 0) + 1 })
              .eq('id', coup.id);
          }
        }
      } else if (!isPaid && ['FAILED', 'EXPIRED'].includes(cfData.order_status) && localOrder.status === 'created') {
        await adminClient.from('payment_orders')
          .update({ status: cfData.order_status === 'EXPIRED' ? 'expired' : 'failed' })
          .eq('id', localOrder.id);
      }

      return Response.json({
        success: true,
        paid: isPaid,
        order_status: cfData.order_status,
        plan: localOrder.plan_id,
        message: isPaid ? `${PLANS[localOrder.plan_id]?.name || localOrder.plan_id} plan activated!` : 'Payment not completed.',
      });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (e) {
    return Response.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
