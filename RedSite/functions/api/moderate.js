export async function onRequestPost(context) {
  const { request, env } = context;
  const key = request.headers.get('X-Owner-Key');
  if (key !== env.OWNER_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }
  const { id, is_visible } = await request.json();
  if (!id) return new Response('Bad request', { status: 400 });
  await env.DB.prepare('UPDATE questions SET is_visible = ? WHERE id = ?')
    .bind(is_visible ? 1 : 0, id).run();
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}