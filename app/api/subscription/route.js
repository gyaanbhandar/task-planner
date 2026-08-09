import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  const { userId, planId, action } = await req.json();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return Response.json({ error: 'Server configuration missing.' }, { status: 500 });
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    if (action === 'activate') {
      // Activate a plan (called after payment gateway confirms payment)
      const validPlans = ['free_trial', 'starter', 'pro'];
      if (!validPlans.includes(planId)) {
        return Response.json({ error: 'Invalid plan ID' }, { status: 400 });
      }

      const now = new Date().toISOString();
      const updates = {
        subscription_plan: planId,
        subscription_status: planId === 'free_trial' ? 'trial' : 'active',
        plan_activated_at: now,
        ai_prompts_used: 0,
        ai_prompts_reset_at: now
      };

      if (planId === 'free_trial') {
        updates.trial_start = now;
        updates.trial_end = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      }

      const { error } = await adminClient
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      return Response.json({ success: true, plan: planId, message: `${planId} plan activated!` });
    }

    if (action === 'check_status') {
      const { data: profile, error } = await adminClient
        .from('profiles')
        .select('subscription_plan, subscription_status, trial_end, ai_prompts_used, ai_prompts_reset_at, plan_activated_at')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Check if trial expired
      let effectiveStatus = profile.subscription_status;
      if (profile.subscription_plan === 'free_trial' && profile.trial_end) {
        if (new Date() > new Date(profile.trial_end)) {
          effectiveStatus = 'expired';
          // Update in DB too
          await adminClient.from('profiles').update({ subscription_status: 'expired' }).eq('id', userId);
        }
      }

      return Response.json({
        ...profile,
        subscription_status: effectiveStatus
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return Response.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
