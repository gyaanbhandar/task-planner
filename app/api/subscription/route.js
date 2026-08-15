// app/api/subscription/route.js
// ============================================
// UPDATED: New plan IDs, free downgrade logic, entitlements
// ============================================

import { createClient } from '@supabase/supabase-js';
import { PLANS, PURCHASABLE_PLANS, getAiPromptLimit } from '../../../config/plans.config';
import { getEffectivePlan } from '../../../services/entitlements';

export async function POST(req) {
  const { userId, planId, action, billingCycle, currency } = await req.json();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return Response.json({ error: 'Server configuration missing.' }, { status: 500 });
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // =================== ACTIVATE PLAN ===================
    if (action === 'activate') {
      const validPlans = ['free', 'free_trial', ...PURCHASABLE_PLANS];
      if (!validPlans.includes(planId)) {
        return Response.json({ error: 'Invalid plan ID' }, { status: 400 });
      }

      const now = new Date();
      const cycle = billingCycle || 'monthly';
      const cur = currency || 'INR';

      const periodEnd = cycle === 'yearly'
        ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const updates = {
        subscription_plan: planId,
        subscription_status: planId === 'free_trial' ? 'trialing' : planId === 'free' ? 'free' : 'active',
        billing_cycle: cycle,
        currency: cur,
        plan_activated_at: now.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        ai_prompts_used: 0,
        ai_prompts_reset_at: now.toISOString(),
        cancel_at_period_end: false,
      };

      if (planId === 'free_trial') {
        updates.trial_start = now.toISOString();
        updates.trial_end = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
      }

      const { error } = await adminClient
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      return Response.json({
        success: true,
        plan: planId,
        message: `${PLANS[planId]?.name || planId} plan activated!`,
      });
    }

    // =================== CHECK STATUS ===================
    if (action === 'check_status') {
      const { data: profile, error } = await adminClient
        .from('profiles')
        .select('subscription_plan, subscription_status, trial_start, trial_end, ai_prompts_used, ai_prompts_reset_at, plan_activated_at, billing_cycle, currency, current_period_start, current_period_end, cancel_at_period_end')
        .eq('id', userId)
        .single();

      if (error) throw error;

      let effectiveStatus = profile.subscription_status;

      // Auto-downgrade expired trials
      if (profile.subscription_plan === 'free_trial' && profile.trial_end) {
        if (new Date() > new Date(profile.trial_end)) {
          effectiveStatus = 'expired';
          await adminClient.from('profiles').update({
            subscription_status: 'expired',
          }).eq('id', userId);
        }
      }

      // Get effective plan for entitlements
      const effectivePlan = getEffectivePlan({
        ...profile,
        subscription_status: effectiveStatus,
      });

      const aiLimit = getAiPromptLimit(effectivePlan);

      return Response.json({
        ...profile,
        subscription_status: effectiveStatus,
        effective_plan: effectivePlan,
        ai_prompt_limit: aiLimit,
      });
    }

    // =================== CANCEL SUBSCRIPTION ===================
    if (action === 'cancel') {
      const { data: profile } = await adminClient
        .from('profiles')
        .select('subscription_plan, subscription_status, current_period_end')
        .eq('id', userId)
        .single();

      if (!profile || profile.subscription_status !== 'active') {
        return Response.json({ error: 'No active subscription to cancel.' }, { status: 400 });
      }

      await adminClient.from('profiles').update({
        subscription_status: 'canceling',
        cancel_at_period_end: true,
      }).eq('id', userId);

      return Response.json({
        success: true,
        message: `Your subscription will remain active until ${profile.current_period_end ? new Date(profile.current_period_end).toLocaleDateString() : 'end of billing period'}.`,
        cancel_date: profile.current_period_end,
      });
    }

    // =================== DOWNGRADE TO FREE ===================
    if (action === 'downgrade_to_free') {
      await adminClient.from('profiles').update({
        subscription_plan: 'free',
        subscription_status: 'free',
        cancel_at_period_end: false,
        billing_cycle: null,
        provider_subscription_id: null,
      }).eq('id', userId);

      return Response.json({
        success: true,
        message: 'You are now on the Free plan. Your data is safe.',
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return Response.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
