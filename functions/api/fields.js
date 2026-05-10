// GET /api/fields?supplement=1 — public, returns fields for forms
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const supplementOnly = url.searchParams.get('supplement') === '1';

  let query = 'SELECT * FROM custom_fields';
  if (supplementOnly) query += ' WHERE show_in_supplement = 1';
  query += ' ORDER BY position ASC';

  const { results } = await env.DB.prepare(query).all();
  return Response.json(results || []);
}

// POST /api/fields — admin auth, create field
export async function onRequestPost({ request, env }) {
  if (request.headers.get('X-Admin-Key') !== env.ADMIN_KEY)
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const b = await request.json();
  if (!b.label || !b.label.trim())
    return Response.json({ error: 'missing_label' }, { status: 400 });

  const id = 'field-' + Date.now();
  await env.DB.prepare(`
    INSERT INTO custom_fields
      (id, label, type, options, required, show_in_form, show_in_supplement, position, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    b.label.trim(),
    b.type || 'text',
    b.options || '',
    b.required ? 1 : 0,
    b.showInForm !== false ? 1 : 0,
    b.showInSupplement ? 1 : 0,
    b.position ?? 999,
    new Date().toISOString()
  ).run();

  return Response.json({ ok: true, id });
}
