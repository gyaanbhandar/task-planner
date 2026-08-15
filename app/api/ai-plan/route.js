// app/api/ai-plan/route.js
// ============================================
// UPDATED: Uses central config for AI limits
// ============================================

import { createClient } from '@supabase/supabase-js';
import { getAiPromptLimit, PLANS } from '../../../config/plans.config';
import { getEffectivePlan } from '../../../services/entitlements';

export async function POST(req) {
  const { tasks, userId } = await req.json();
  const apiKey = process.env.CLAUDE_API_KEY;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // =================== CHECK USAGE LIMITS ===================
  if (supabaseUrl && serviceKey && userId) {
    try {
      const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: profile } = await adminClient
        .from('profiles')
        .select('subscription_plan, subscription_status, ai_prompts_used, ai_prompts_reset_at, trial_end')
        .eq('id', userId)
        .single();

      if (profile) {
        // Get effective plan (handles trial expiry, etc.)
        const effectivePlan = getEffectivePlan(profile);
        const planConfig = PLANS[effectivePlan] || PLANS.free;

        // Check trial expiry → show upgrade message
        if (profile.subscription_plan === 'free_trial' && profile.trial_end) {
          if (new Date() > new Date(profile.trial_end)) {
            return Response.json({
              plan: `Your 14-day Pro trial has ended.\n\nYour account is now on the Free plan with 10 AI Planner prompts/month.\n\nUpgrade to continue using advanced AI planning:\n• Starter (₹199/mo) — 50 prompts\n• Pro (₹499/mo) — 150 prompts\n\nGo to Settings → Billing to upgrade.`,
              limit_reached: true,
            });
          }
        }

        // Monthly reset check
        const resetAt = profile.ai_prompts_reset_at ? new Date(profile.ai_prompts_reset_at) : new Date(0);
        const now = new Date();
        const monthDiff = (now.getFullYear() - resetAt.getFullYear()) * 12 + (now.getMonth() - resetAt.getMonth());

        let currentUsage = profile.ai_prompts_used || 0;

        if (monthDiff >= 1) {
          await adminClient.from('profiles').update({
            ai_prompts_used: 0,
            ai_prompts_reset_at: now.toISOString(),
          }).eq('id', userId);
          currentUsage = 0;
        }

        const limit = getAiPromptLimit(effectivePlan);

        if (currentUsage >= limit) {
          // Build contextual upgrade message
          const upgradeOptions = [];
          if (effectivePlan === 'free') {
            upgradeOptions.push('Starter (₹199/mo) — 50 prompts/month');
            upgradeOptions.push('Pro (₹499/mo) — 150 prompts/month');
          } else if (effectivePlan === 'starter') {
            upgradeOptions.push('Pro (₹499/mo) — 150 prompts/month');
          }

          const upgradeText = upgradeOptions.length > 0
            ? `\n\nUpgrade for more AI planning:\n${upgradeOptions.map(o => `• ${o}`).join('\n')}\n\nGo to Settings → Billing to upgrade.`
            : '\n\nYour prompts will reset at the start of your next billing period.';

          return Response.json({
            plan: `You've reached your monthly AI Planner limit (${currentUsage}/${limit} prompts used).${upgradeText}`,
            limit_reached: true,
          });
        }

        // Increment usage BEFORE making the AI call
        await adminClient.from('profiles').update({
          ai_prompts_used: currentUsage + 1,
        }).eq('id', userId);
      }
    } catch (e) {
      console.error('Usage check error:', e);
      // Continue anyway — don't block AI if usage check fails
    }
  }

  // =================== CALL AI ===================
  if (!apiKey) {
    return Response.json({
      plan: 'AI Planner is not configured yet. Please set the CLAUDE_API_KEY environment variable.',
    });
  }

  try {
    const taskList = (tasks || [])
      .filter((t) => t.status === 'pending')
      .map((t) => `- ${t.title} (${t.priority || 'medium'} priority, ${t.time || 'no time'}, ${t.subcategory || 'General'})`)
      .join('\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are a smart daily planner AI. Analyze these pending tasks and create an optimized daily schedule. Consider priorities, deadlines, and logical task ordering.

Tasks:
${taskList}

Provide a clear, structured schedule with time slots. Be practical and efficient. Reply in the same language the task titles are in (Hindi or English). Keep it concise.`,
          },
        ],
      }),
    });

    const data = await response.json();
    const plan = data?.content?.[0]?.text || 'Could not generate plan. Please try again.';

    return Response.json({ plan });
  } catch (e) {
    return Response.json({
      plan: 'Error generating AI plan. Please try again later.',
    });
  }
}
