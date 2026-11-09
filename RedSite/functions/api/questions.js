export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const showAll = url.searchParams.get('all') === '1';
  const key = request.headers.get('X-Owner-Key');
  const isOwner = showAll && key === env.OWNER_KEY;

  const query = isOwner
    ? 'SELECT * FROM questions ORDER BY created_at DESC LIMIT 200'
    : 'SELECT id, text, reply, created_at FROM questions WHERE is_visible = 1 ORDER BY created_at DESC LIMIT 100';

  const { results } = await env.DB.prepare(query).all();
  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { text } = await request.json();

  if (!text || typeof text !== 'string') {
    return new Response(JSON.stringify({ error: 'bad request' }), { status: 400 });
  }
  const t = text.trim();
  if (t.length < 3 || t.length > 500) {
    return new Response(JSON.stringify({ error: 'invalid length' }), { status: 400 });
  }

  await env.DB.prepare('INSERT INTO questions (text) VALUES (?)').bind(t).run();
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}