// app/api/coupons/route.js
// ============================================
// Coupon endpoints:
//   POST { action: 'validate', code, planId, billingCycle, currency }  -> preview discount
//   POST { action: 'list',   adminToken }                              -> list all coupons (admin)
//   POST { action: 'create', adminToken, coupon }                      -> create coupon (admin)
//   POST { action: 'toggle', adminToken, id, active }                  -> enable/disable (admin)
//   POST { action: 'delete', adminToken, id }                          -> delete coupon (admin)
// ============================================

import { createClient } from '@supabase/supabase-js';
import { getPlanPrice, PURCHASABLE_PLANS } from '../../../config/plans.config';
import { validateCoupon } from '../../../services/couponService';

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// Simple shared-secret gate for admin coupon management.
// Set ADMIN_PANEL_SECRET in env; the admin panel sends it as adminToken.
function isAdmin(token) {
  const secret = process.env.ADMIN_PANEL_SECRET;
  return secret && token && token === secret;
}

export async function POST(req) {
  const body = await req.json();
  const { action } = body;
  const adminClient = admin();
  if (!adminClient) return Response.json({ error: 'Server configuration missing.' }, { status: 500 });

  try {
    // ---------- USER: validate a coupon (preview only) ----------
    if (action === 'validate') {
      const { code, planId, billingCycle = 'monthly', currency = 'INR' } = body;
      if (!PURCHASABLE_PLANS.includes(planId)) {
        return Response.json({ ok: false, error: 'Coupons apply to paid plans only.' }, { status: 400 });
      }
      const baseAmount = getPlanPrice(planId, currency, billingCycle);
      const result = await validateCoupon(adminClient, { code, planId, currency, baseAmount });
      if (!result.ok) return Response.json(result, { status: 200 });
      return Response.json({
        ok: true,
        code: result.coupon.code,
        description: result.coupon.description,
        discount_type: result.coupon.discount_type,
        discount_value: result.coupon.discount_value,
        base_amount: baseAmount,
        discount_amount: result.discount,
        final_amount: result.final,
        currency,
      });
    }

    // ---------- ADMIN: everything below requires the secret ----------
    if (!isAdmin(body.adminToken)) {
      return Response.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    if (action === 'list') {
      const { data, error } = await adminClient
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return Response.json({ coupons: data || [] });
    }

    if (action === 'create') {
      const c = body.coupon || {};
      if (!c.code || !c.discount_type || c.discount_value == null) {
        return Response.json({ error: 'code, discount_type and discount_value are required.' }, { status: 400 });
      }
      if (!['percent', 'flat'].includes(c.discount_type)) {
        return Response.json({ error: 'discount_type must be percent or flat.' }, { status: 400 });
      }
      const row = {
        code: String(c.code).trim().toUpperCase(),
        description: c.description || null,
        discount_type: c.discount_type,
        discount_value: Number(c.discount_value),
        currency: c.currency || 'INR',
        applies_to_plans: Array.isArray(c.applies_to_plans) && c.applies_to_plans.length ? c.applies_to_plans : null,
        max_redemptions: c.max_redemptions ? Number(c.max_redemptions) : null,
        min_amount: c.min_amount ? Number(c.min_amount) : 0,
        active: c.active !== false,
        expires_at: c.expires_at || null,
      };
      const { data, error } = await adminClient.from('coupons').insert(row).select().single();
      if (error) {
        if (error.code === '23505') return Response.json({ error: 'A coupon with that code already exists.' }, { status: 400 });
        throw error;
      }
      return Response.json({ success: true, coupon: data });
    }

    if (action === 'toggle') {
      const { error } = await adminClient.from('coupons').update({ active: !!body.active }).eq('id', body.id);
      if (error) throw error;
      return Response.json({ success: true });
    }

    if (action === 'delete') {
      const { error } = await adminClient.from('coupons').delete().eq('id', body.id);
      if (error) throw error;
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (e) {
    return Response.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
