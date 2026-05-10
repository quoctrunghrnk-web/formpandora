function auth(request, env) {
  return request.headers.get('X-Admin-Key') === env.ADMIN_KEY;
}

// GET /api/submissions/:id — chi tiết kèm ảnh
export async function onRequestGet({ request, env, params }) {
  if (!auth(request, env))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const row = await env.DB.prepare(
    'SELECT * FROM submissions WHERE id = ?'
  ).bind(params.id).first();

  if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(row);
}

// DELETE /api/submissions/:id — xóa 1 hồ sơ
export async function onRequestDelete({ request, env, params }) {
  if (!auth(request, env))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  await env.DB.prepare('DELETE FROM submissions WHERE id = ?').bind(params.id).run();
  return Response.json({ ok: true });
}
