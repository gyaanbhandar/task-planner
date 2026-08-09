import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  const { email, password, name } = await req.json();
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!serviceRoleKey || !supabaseUrl) {
    return Response.json({ error: 'Server configuration missing. Set SUPABASE_SERVICE_ROLE_KEY in env.' }, { status: 500 });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // Create user via admin API
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name || email.split('@')[0] }
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    const now = new Date().toISOString();
    const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    // Insert into profiles table with subscription data
    await adminClient.from('profiles').insert({
      id: data.user.id,
      email: email,
      full_name: name || email.split('@')[0],
      subscription_plan: 'free_trial',
      subscription_status: 'trial',
      trial_start: now,
      trial_end: trialEnd,
      ai_prompts_used: 0,
      ai_prompts_reset_at: now,
      is_blocked: false,
      created_at: now
    });

    // Create default "Demo Client 01" for the new user
    await adminClient.from('user_clients').insert({
      user_id: data.user.id,
      name: 'Demo Client 01',
      created_at: now
    });

    console.log(`[Admin] User created: ${email} with trial plan + Demo Client 01`);

    return Response.json({ 
      success: true, 
      user_id: data.user.id,
      message: 'User created with 14-day trial + Demo Client 01' 
    });
  } catch (e) {
    return Response.json({ error: e.message || 'Failed to create user' }, { status: 500 });
  }
}
