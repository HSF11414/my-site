export async function onRequestPost(context) {
  const { request, env } = context;
  const key = request.headers.get('X-Owner-Key');
  if (key !== env.OWNER_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }
  const { id, reply } = await request.json();
  if (!id || typeof reply !== 'string' || reply.length > 1000) {
    return new Response('Bad request', { status: 400 });
  }
  await env.DB.prepare('UPDATE questions SET reply = ? WHERE id = ?')
    .bind(reply, id).run();
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}