import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  const { tasks, userId } = await req.json();
  const apiKey = process.env.CLAUDE_API_KEY;

  // Create admin client for profile checks
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Plan limits for AI prompts
  const AI_LIMITS = {
    free_trial: 10,
    starter: 15,
    pro: 75
  };

  // Check usage if we have DB access
  if (supabaseUrl && serviceKey && userId) {
    try {
      const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      const { data: profile } = await adminClient
        .from('profiles')
        .select('subscription_plan, subscription_status, ai_prompts_used, ai_prompts_reset_at, trial_end')
        .eq('id', userId)
        .single();

      if (profile) {
        // Check trial expiry
        if (profile.subscription_plan === 'free_trial' && profile.trial_end) {
          if (new Date() > new Date(profile.trial_end)) {
            return Response.json({
              plan: '⚠️ Aapka 14-day free trial khatam ho gaya hai.\n\nAI Planner use karne ke liye Starter (₹99/mo) ya Pro (₹249/mo) plan activate karo.\n\nSettings → Billing mein jaake plan choose karo.',
              limit_reached: true
            });
          }
        }

        // Check monthly reset
        const resetAt = profile.ai_prompts_reset_at ? new Date(profile.ai_prompts_reset_at) : new Date(0);
        const now = new Date();
        const monthDiff = (now.getFullYear() - resetAt.getFullYear()) * 12 + (now.getMonth() - resetAt.getMonth());
        
        let currentUsage = profile.ai_prompts_used || 0;
        
        if (monthDiff >= 1) {
          // Reset counter for new month
          await adminClient.from('profiles').update({
            ai_prompts_used: 0,
            ai_prompts_reset_at: now.toISOString()
          }).eq('id', userId);
          currentUsage = 0;
        }

        const limit = AI_LIMITS[profile.subscription_plan] || AI_LIMITS.free_trial;

        if (currentUsage >= limit) {
          return Response.json({
            plan: `⚠️ Aapke AI prompts khatam ho gaye! (${currentUsage}/${limit} used)\n\n${profile.subscription_plan === 'pro' ? 'Next month reset hoga.' : 'Zyada prompts ke liye Pro plan (₹249/mo = 75 prompts) upgrade karo.\n\nSettings → Billing mein jaake upgrade karo.'}`,
            limit_reached: true,
            used: currentUsage,
            limit: limit
          });
        }

        // Increment usage
        await adminClient.from('profiles').update({
          ai_prompts_used: currentUsage + 1
        }).eq('id', userId);
      }
    } catch (e) {
      console.error('Usage check error:', e);
      // Continue anyway — don't block AI if usage check fails
    }
  }

  if (!apiKey) {
    return Response.json({
      plan: 'AI Plan ke liye Claude API key chahiye. Vercel mein CLAUDE_API_KEY set karo.\n\nAbhi manually prioritize karo:\n1. High priority + deadline wale pehle\n2. Daily tasks uske baad\n3. Low priority skip karo aaj',
    });
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: 'You are a smart task planner AI. Today is ' + new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + '.\n\nPending tasks:\n' + (tasks || 'No tasks.') + '\n\nGive today priority plan in Hinglish:\n1. Top 3-5 tasks for TODAY with short reason\n2. One line on what to skip\n\nKeep short, direct. Plain text, no markdown.',
        }],
      }),
    });
    const data = await res.json();
    const plan = data.content?.map(c => c.text || '').join('') || 'Response nahi aaya.';
    return Response.json({ plan });
  } catch (e) {
    return Response.json({ plan: 'AI connect nahi hua. Khud prioritize karo.' });
  }
}
