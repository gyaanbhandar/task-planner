import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  const { email, password, name } = await req.json();
  
  // Use service_role key for admin operations
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

    // Insert into profiles table
    await adminClient.from('profiles').insert({
      id: data.user.id,
      email: email,
      full_name: name || email.split('@')[0],
      subscription_status: 'trial',
      is_blocked: false
    });

    // In production, send email with credentials here (e.g., via Resend, SendGrid)
    console.log(`[Admin] User created: ${email} with password. Email credentials in production.`);

    return Response.json({ 
      success: true, 
      user_id: data.user.id,
      message: 'User created successfully. Credentials should be emailed.' 
    });
  } catch (e) {
    return Response.json({ error: e.message || 'Failed to create user' }, { status: 500 });
  }
}
