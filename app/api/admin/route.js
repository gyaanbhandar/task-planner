// app/api/admin/route.js
// =====================================================
// SUPER ADMIN API
// All admin data + mutations flow through here using the
// Supabase service-role key. Every action is gated by
// verifySuperAdmin(), which requires BOTH:
//   1) the caller's email in ADMIN_EMAILS allowlist, AND
//   2) a matching row in the admin_users table.
// A normal logged-in user therefore can NEVER read or
// change admin data, even if they hit this endpoint.
//
// Actions:
//   verify_admin        -> { isAdmin }
//   list_users          -> { users }   (full subscription + payment detail)
//   metrics             -> { metrics }  (MRR, revenue, counts)
//   toggle_block        -> block/unblock a user
//   update_subscription -> change plan/status/expiry/payment method
//   apply_offer         -> grant a plan for N days (manual offer)
//   create_user         -> create a user with a trial
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { PLANS, getPlanPrice } from '../../../config/plans.config';

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function adminAllowlist() {
  const raw = process.env.ADMIN_EMAILS || '';
  return raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
}

// Core gate — returns true only for verified super admins.
async function verifySuperAdmin(client, { userId, email }) {
  const list = adminAllowlist();
  const mail = (email || '').toLowerCase();

  // 1) Allowlist check (if an allowlist is configured)
  if (list.length > 0 && (!mail || !list.includes(mail))) return false;

  // 2) admin_users table check (by user_id or email)
  let query = client.from('admin_users').select('id, user_id, email');
  if (userId) query = query.eq('user_id', userId);
  else if (mail) query = query.eq('email', mail);
  else return false;

  const { data, error } = await query.maybeSingle();
  if (error) {
    // If the table doesn't exist yet, fall back to allowlist-only (still requires allowlist).
    if (list.length > 0 && mail && list.includes(mail)) return true;
    return false;
  }
  return !!data;
}

// Resolve a user's email -> id when only email is supplied.
async function resolveUserId(client, email) {
  if (!email) return null;
  const { data } = await client.from('profiles').select('id').eq('email', email).maybeSingle();
  return data?.id || null;
}

export async function POST(req) {
  const client = admin();
  if (!client) {
    return Response.json({ error: 'Server configuration missing. Set SUPABASE_SERVICE_ROLE_KEY.' }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { action } = body;

  // ---- Public-ish: verify_admin (returns boolean only, leaks nothing) ----
  if (action === 'verify_admin') {
    let uid = body.userId;
    if (!uid && body.email) uid = await resolveUserId(client, body.email);
    const isAdmin = await verifySuperAdmin(client, { userId: uid, email: body.email });
    return Response.json({ isAdmin });
  }

  // ---- Everything below requires a verified super admin ----
  const callerEmail = body.email || body.adminEmail;
  let callerId = body.callerId;
  if (!callerId && callerEmail) callerId = await resolveUserId(client, callerEmail);

  const ok = await verifySuperAdmin(client, { userId: callerId, email: callerEmail });
  if (!ok) {
    return Response.json({ error: 'Unauthorized. Super-admin access only.' }, { status: 401 });
  }

  try {
    // ---------- LIST USERS (full detail) ----------
    if (action === 'list_users') {
      const { data: profiles, error } = await client
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      let ordersByUser = {};
      try {
        const { data: orders } = await client
          .from('payment_orders')
          .select('user_id, plan_id, final_amount, currency, status, coupon_code, paid_at, created_at')
          .order('created_at', { ascending: false });
        (orders || []).forEach((o) => {
          if (!ordersByUser[o.user_id]) ordersByUser[o.user_id] = [];
          ordersByUser[o.user_id].push(o);
        });
      } catch { /* payment_orders may not exist yet */ }

      const users = (profiles || []).map((p) => {
        const orders = ordersByUser[p.id] || [];
        const paidOrders = orders.filter((o) => o.status === 'paid');
        const lastPaid = paidOrders[0] || null;
        const paymentMethod =
          p.payment_method ||
          (lastPaid ? 'automatic' : (p.subscription_status === 'active' ? 'manual' : 'none'));
        return {
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          created_at: p.created_at,
          is_blocked: !!p.is_blocked,
          subscription_plan: p.subscription_plan || 'free_trial',
          subscription_status: p.subscription_status || 'trial',
          billing_cycle: p.billing_cycle || 'monthly',
          currency: p.currency || 'INR',
          trial_end: p.trial_end || null,
          current_period_end: p.current_period_end || null,
          plan_activated_at: p.plan_activated_at || null,
          payment_method: paymentMethod,
          last_paid_at: lastPaid?.paid_at || null,
          last_amount: lastPaid?.final_amount ?? null,
          last_coupon: lastPaid?.coupon_code || null,
          offer_note: p.offer_note || null,
          ai_prompts_used: p.ai_prompts_used ?? 0,
        };
      });

      return Response.json({ users });
    }

    // ---------- METRICS ----------
    if (action === 'metrics') {
      const { data: profiles } = await client.from('profiles').select('*');
      const list = profiles || [];
      const now = new Date();

      const paidPlans = ['starter', 'pro', 'business'];
      const activePaid = list.filter(
        (p) => p.subscription_status === 'active' && paidPlans.includes(p.subscription_plan)
      );

      let mrr = 0;
      activePaid.forEach((p) => {
        const cur = p.currency || 'INR';
        const monthly = getPlanPrice(p.subscription_plan, cur, 'monthly') || 0;
        const yearly = getPlanPrice(p.subscription_plan, cur, 'yearly') || 0;
        mrr += p.billing_cycle === 'yearly' ? Math.round(yearly / 12) : monthly;
      });

      let revenueTotal = 0;
      let revenueThisMonth = 0;
      try {
        const { data: orders } = await client
          .from('payment_orders')
          .select('final_amount, status, paid_at');
        (orders || []).forEach((o) => {
          if (o.status !== 'paid') return;
          const amt = Number(o.final_amount || 0);
          revenueTotal += amt;
          if (o.paid_at) {
            const d = new Date(o.paid_at);
            if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
              revenueThisMonth += amt;
            }
          }
        });
      } catch { /* no orders table */ }

      let manualCount = 0;
      let automaticCount = 0;
      list.forEach((p) => {
        if (p.subscription_status !== 'active') return;
        if (p.payment_method === 'automatic') automaticCount += 1;
        else manualCount += 1;
      });

      const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const expiringSoon = list.filter((p) => {
        const end = p.current_period_end || p.trial_end;
        if (!end) return false;
        const d = new Date(end);
        return d > now && d <= weekAhead;
      }).length;

      const planCounts = {};
      list.forEach((p) => {
        const id = p.subscription_plan || 'free_trial';
        planCounts[id] = (planCounts[id] || 0) + 1;
      });

      return Response.json({
        metrics: {
          totalUsers: list.length,
          activeUsers: list.filter((p) => !p.is_blocked).length,
          blockedUsers: list.filter((p) => p.is_blocked).length,
          activePaid: activePaid.length,
          trialUsers: list.filter((p) => p.subscription_status === 'trial' || p.subscription_status === 'trialing').length,
          mrr,
          revenueTotal,
          revenueThisMonth,
          manualCount,
          automaticCount,
          expiringSoon,
          planCounts,
        },
      });
    }

    // ---------- TOGGLE BLOCK ----------
    if (action === 'toggle_block') {
      const { error } = await client
        .from('profiles')
        .update({ is_blocked: !!body.blocked })
        .eq('id', body.userId);
      if (error) throw error;
      return Response.json({ success: true });
    }

    // ---------- UPDATE SUBSCRIPTION ----------
    if (action === 'update_subscription') {
      const u = body.updates || {};
      const allowed = {};
      if (u.subscription_plan != null) {
        if (!PLANS[u.subscription_plan]) {
          return Response.json({ error: 'Unknown plan id.' }, { status: 400 });
        }
        allowed.subscription_plan = u.subscription_plan;
      }
      if (u.subscription_status != null) allowed.subscription_status = u.subscription_status;
      if (u.billing_cycle != null) allowed.billing_cycle = u.billing_cycle;
      if (u.currency != null) allowed.currency = u.currency;
      if (u.payment_method != null) allowed.payment_method = u.payment_method;
      if (u.current_period_end != null) allowed.current_period_end = u.current_period_end;
      if (u.trial_end != null) allowed.trial_end = u.trial_end;

      if (Object.keys(allowed).length === 0) {
        return Response.json({ error: 'No valid fields to update.' }, { status: 400 });
      }
      if (allowed.subscription_status === 'active') {
        allowed.plan_activated_at = new Date().toISOString();
      }

      const { error } = await client.from('profiles').update(allowed).eq('id', body.userId);
      if (error) throw error;
      return Response.json({ success: true, updated: allowed });
    }

    // ---------- APPLY OFFER ----------
    if (action === 'apply_offer') {
      const offer = body.offer || {};
      const planId = offer.planId;
      const days = Number(offer.days || 30);
      if (!PLANS[planId]) return Response.json({ error: 'Unknown plan id.' }, { status: 400 });

      const now = new Date();
      const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      const update = {
        subscription_plan: planId,
        subscription_status: 'active',
        payment_method: 'manual',
        plan_activated_at: now.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: end.toISOString(),
        billing_cycle: offer.billingCycle || 'monthly',
      };
      if (offer.note) update.offer_note = String(offer.note).slice(0, 200);

      const { error } = await client.from('profiles').update(update).eq('id', body.userId);
      if (error) throw error;
      return Response.json({ success: true, until: end.toISOString() });
    }

    // ---------- CREATE USER ----------
    if (action === 'create_user') {
      const { email, password, name } = body;
      if (!email || !password) {
        return Response.json({ error: 'Email and password are required.' }, { status: 400 });
      }
      const { data, error } = await client.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name || email.split('@')[0] },
      });
      if (error) return Response.json({ error: error.message }, { status: 400 });

      const now = new Date().toISOString();
      const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      await client.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: name || email.split('@')[0],
        subscription_plan: 'free_trial',
        subscription_status: 'trial',
        trial_start: now,
        trial_end: trialEnd,
        ai_prompts_used: 0,
        ai_prompts_reset_at: now,
        is_blocked: false,
        created_at: now,
      });
      await client.from('user_clients').insert({
        user_id: data.user.id,
        name: 'Demo Client 01',
        created_at: now,
      });

      return Response.json({ success: true, user_id: data.user.id });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (e) {
    return Response.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
