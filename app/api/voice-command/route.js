// app/api/voice-command/route.js
// ============================================
// Voice → structured task actions.
// Takes a Hinglish (or Hindi/English) voice transcript + the user's current
// task list and context, asks Claude to turn it into a structured action plan
// (create / update / delete / reorder / complete), and returns JSON that the
// client executes against the existing taskService.
//
// Mirrors the usage-limit + Claude-call pattern of app/api/ai-plan/route.js.
// Uses the SAME monthly AI-prompt quota (ai_prompts_used) so voice commands
// count toward the plan limit, just like the AI Planner.
// ============================================

import { createClient } from '@supabase/supabase-js';
import { getAiPromptLimit, PLANS } from '../../../config/plans.config';
import { getEffectivePlan } from '../../../services/entitlements';

const todayISO = () => new Date().toISOString().slice(0, 10);

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { transcript, tasks, categories, clients, userId } = body || {};

  if (!transcript || !transcript.trim()) {
    return Response.json({ error: 'No speech detected. Please try again.' }, { status: 400 });
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // =================== CHECK USAGE LIMITS ===================
  // Shares the AI Planner monthly quota (ai_prompts_used).
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
        const effectivePlan = getEffectivePlan(profile);

        // Trial expiry → block with upgrade message
        if (profile.subscription_plan === 'free_trial' && profile.trial_end) {
          if (new Date() > new Date(profile.trial_end)) {
            return Response.json({
              error: 'Your 14-day Pro trial has ended. Upgrade in Settings → Billing to keep using voice commands.',
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
          return Response.json({
            error: `You've reached your monthly AI limit (${currentUsage}/${limit}). Voice commands share the AI Planner quota. Upgrade in Settings → Billing for more.`,
            limit_reached: true,
          });
        }

        // Increment usage BEFORE the AI call
        await adminClient.from('profiles').update({
          ai_prompts_used: currentUsage + 1,
        }).eq('id', userId);
      }
    } catch (e) {
      console.error('Voice usage check error:', e);
      // Continue anyway — don't block voice if the usage check itself fails.
    }
  }

  // =================== BUILD CONTEXT ===================
  if (!apiKey) {
    return Response.json({
      error: 'Voice commands are not configured yet. Please set the CLAUDE_API_KEY environment variable.',
    });
  }

  // Compact task list the model can reference by id. We send only the fields
  // needed to identify and reorder tasks — not descriptions, to keep it small.
  const taskLines = (tasks || []).map((t, i) => {
    return `${i + 1}. id=${t.id} | "${t.title}" | status=${t.status || 'pending'} | priority=${t.priority || 'medium'} | time=${t.time || '—'} | date=${t.deadline || '—'} | category=${t.category || 'personal'}`;
  }).join('\n');

  const categoryList = (categories || [])
    .map((c) => `${c.id} (${c.name})`)
    .join(', ') || 'personal, work, professional, leadgen, clients';

  const clientList = (clients || []).map((c) => c.name).join(', ') || 'none';

  const systemPrompt = `You are a voice-command parser for a task manager app called AnuTask. The user speaks in Hinglish (mixed Hindi + English, often Roman script), sometimes pure Hindi or English. Convert their spoken command into a STRICT JSON action plan.

TODAY'S DATE: ${todayISO()}

AVAILABLE CATEGORIES (use the id): ${categoryList}
AVAILABLE CLIENTS: ${clientList}
VALID PRIORITIES: high, medium, low
VALID FREQUENCIES (type): one-time, daily, weekly, monthly

CURRENT TASKS (reference existing tasks by their id):
${taskLines || '(no tasks yet)'}

You must respond with ONLY a JSON object, no prose, no markdown fences. Shape:
{
  "actions": [ ...one or more action objects... ],
  "speak": "short friendly confirmation line in the SAME language/script the user used (Hinglish if they spoke Hinglish)"
}

ACTION TYPES:

1. CREATE a task:
{ "type": "create", "task": {
    "title": "string (required, clean it up, no filler words)",
    "description": "string (optional, '' if none)",
    "priority": "high|medium|low (default medium)",
    "time": "hh:mm AM/PM 12-hour (e.g. '03:00 PM'), default '09:00 AM'",
    "deadline": "YYYY-MM-DD (default today ${todayISO()}; resolve 'kal'=tomorrow, 'parso', weekday names relative to today)",
    "category": "one of the category ids above (default 'personal')",
    "subcategory": "client name if a client was named, else 'General'",
    "type": "one-time|daily|weekly|monthly (default one-time)"
} }

2. UPDATE an existing task (only include fields that change):
{ "type": "update", "id": "the exact id from the list above", "changes": { "priority": "...", "time": "...", "deadline": "...", "title": "...", "category": "...", "description": "..." } }

3. DELETE (move to trash) existing task(s):
{ "type": "delete", "ids": ["id1","id2", ...] }
- For "saare completed delete karo" → include ids of all status=done tasks.
- For "sab delete karo" / "clear all" → include ALL ids.
- Match tasks the user names by fuzzy-matching their words against titles.

4. COMPLETE / mark done (or un-done):
{ "type": "complete", "ids": ["id1", ...], "done": true }
(done:false to mark incomplete/pending again)

5. REORDER — provide the FULL new ordering of ALL current task ids, top-to-bottom:
{ "type": "reorder", "orderedIds": ["id","id", ...all ids...] }
- "X ko sabse upar karo" → move that id to front, keep the rest in current relative order.
- "X ko neeche karo" → move to end.

RULES:
- If you can't confidently match a named task to an id, DON'T guess destructively. Instead return an action { "type": "clarify", "message": "which task did you mean? ..." } and no delete/update.
- Multiple things in one sentence → multiple actions in the array, in the order they should run.
- Keep "speak" to one short line. Match the user's language.
- Resolve relative times: "3 baje"→03:00 PM (afternoon assumed for 1-7 baje unless 'subah'/'raat' said), "subah 9 baje"→09:00 AM, "raat 9 baje"→09:00 PM.
- Output valid JSON only.`;

  // =================== CALL CLAUDE ===================
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `Voice command: "${transcript}"` },
        ],
      }),
    });

    const data = await response.json();
    let text = data?.content?.[0]?.text || '';

    // Strip accidental markdown fences, then parse.
    text = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // Last resort: grab the first {...} block.
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        try { parsed = JSON.parse(m[0]); } catch (e2) { parsed = null; }
      }
    }

    if (!parsed || !Array.isArray(parsed.actions)) {
      return Response.json({
        error: "Samajh nahi aaya — thoda clear bolkar dobara try karein.",
        raw: text.slice(0, 300),
      });
    }

    return Response.json({
      actions: parsed.actions,
      speak: parsed.speak || 'Done.',
      transcript,
    });
  } catch (e) {
    console.error('Voice command error:', e);
    return Response.json({ error: 'Voice command failed. Please try again.' }, { status: 500 });
  }
}
