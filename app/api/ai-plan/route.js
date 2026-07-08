export async function POST(req) {
  const { tasks } = await req.json();
  const apiKey = process.env.CLAUDE_API_KEY;

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
