// PUT /api/fields/:id — admin auth, update field
export async function onRequestPut({ request, env, params }) {
  if (request.headers.get('X-Admin-Key') !== env.ADMIN_KEY)
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const b = await request.json();
  const { id } = params;

  await env.DB.prepare(`
    UPDATE custom_fields
    SET label = ?, type = ?, options = ?, required = ?,
        show_in_form = ?, show_in_supplement = ?, position = ?
    WHERE id = ?
  `).bind(
    b.label.trim(),
    b.type || 'text',
    b.options || '',
    b.required ? 1 : 0,
    b.showInForm !== false ? 1 : 0,
    b.showInSupplement ? 1 : 0,
    b.position ?? 999,
    id
  ).run();

  return Response.json({ ok: true });
}

// DELETE /api/fields/:id — admin auth, delete field
export async function onRequestDelete({ request, env, params }) {
  if (request.headers.get('X-Admin-Key') !== env.ADMIN_KEY)
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  await env.DB.prepare('DELETE FROM custom_fields WHERE id = ?')
    .bind(params.id).run();

  return Response.json({ ok: true });
}
