import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  const { userId, email, fullName } = await req.json();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return Response.json({ error: 'Server not configured' }, { status: 500 });
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    const now = new Date().toISOString();
    const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    // Check if profile already exists
    const { data: existing } = await adminClient
      .from('profiles')
      .select('id, subscription_plan')
      .eq('id', userId)
      .single();

    if (existing) {
      // Profile exists — just return current data
      return Response.json({ success: true, existing: true, plan: existing.subscription_plan });
    }

    // Create new profile with trial subscription
    await adminClient.from('profiles').insert({
      id: userId,
      email: email || '',
      full_name: fullName || '',
      subscription_plan: 'free_trial',
      subscription_status: 'trial',
      trial_start: now,
      trial_end: trialEnd,
      ai_prompts_used: 0,
      ai_prompts_reset_at: now,
      is_blocked: false,
      created_at: now
    });

    // Create default "Demo Client 01"
    await adminClient.from('user_clients').insert({
      user_id: userId,
      name: 'Demo Client 01',
      created_at: now
    });

    return Response.json({ 
      success: true, 
      existing: false,
      plan: 'free_trial',
      message: 'Profile created with 14-day trial + Demo Client 01'
    });
  } catch (e) {
    console.error('Setup profile error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
