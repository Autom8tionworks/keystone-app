// Vercel serverless function: POST /api/analyze
// Reads a Scope of Work and asks Claude to extract milestones/deliverables.
// The Anthropic API key stays server-side (set ANTHROPIC_API_KEY in Vercel env vars).

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(503).json({
      error: 'AI is not configured yet. In Vercel: Settings → Environment Variables → add ANTHROPIC_API_KEY, then redeploy.'
    });
    return;
  }

  // Vercel parses JSON bodies automatically; guard anyway.
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const sow = (body && body.sow) || '';
  if (typeof sow !== 'string' || sow.trim().length < 10) {
    res.status(400).json({ error: 'Please paste a longer scope-of-work text (at least a sentence or two).' });
    return;
  }

  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

  const system =
    'You are a project-planning assistant. Read a Scope of Work (SOW) and extract its key milestones and deliverables.\n' +
    'Return ONLY valid JSON — no markdown, no commentary — in exactly this shape:\n' +
    '{"milestones":[{"name":"<=80 chars","type":"milestone|task","start":"YYYY-MM-DD or empty string","finish":"YYYY-MM-DD or empty string","owner":"short initials or empty string","note":"why extracted, <=120 chars"}]}\n' +
    'Rules:\n' +
    '- "milestone" = a key checkpoint / deliverable / sign-off (a point in time). "task" = a work activity with a duration.\n' +
    '- Only set dates that the SOW states or strongly implies (explicit dates, or clear anchors). If unknown, use "".\n' +
    '- Order items chronologically when possible. Extract between 3 and 15 items.\n' +
    '- Do NOT invent work that is not present in the SOW.';

  const userMsg =
    'Scope of Work:\n\n"""\n' + sow.slice(0, 20000) + '\n"""\n\nExtract the milestones and deliverables as specified.';

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        system,
        messages: [{ role: 'user', content: userMsg }]
      })
    });

    if (!r.ok) {
      const t = await r.text();
      res.status(502).json({ error: 'Claude request failed (HTTP ' + r.status + '). ' + t.slice(0, 300) });
      return;
    }

    const data = await r.json();
    let text = (data && data.content && data.content[0] && data.content[0].text) || '';

    // Be tolerant: strip code fences and isolate the JSON object.
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const a = text.indexOf('{');
    const b = text.lastIndexOf('}');
    if (a >= 0 && b > a) text = text.slice(a, b + 1);

    let parsed;
    try { parsed = JSON.parse(text); }
    catch (e) {
      res.status(502).json({ error: 'Could not parse the AI response as JSON. Try again or simplify the SOW.' });
      return;
    }

    const milestones = Array.isArray(parsed.milestones) ? parsed.milestones.slice(0, 30) : [];
    res.status(200).json({ milestones, model });
  } catch (e) {
    res.status(500).json({ error: 'Server error: ' + (e && e.message ? e.message : String(e)) });
  }
};
