function auth(request, env) {
  return request.headers.get('X-Admin-Key') === env.ADMIN_KEY;
}

// GET /api/submissions — danh sách (không trả ảnh để nhẹ)
export async function onRequestGet({ request, env }) {
  if (!auth(request, env))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { results } = await env.DB.prepare(`
    SELECT id, timestamp, fullname, phone, email, age, gender, address,
           cccd, cccd_date, cccd_place, run_tay, can_thi, mo_hoi_tay,
           education, company, experience, salary, start_date,
           pandora_contact, pandora_interview, pandora_contractor, bank_account
    FROM submissions ORDER BY timestamp DESC
  `).all();

  return Response.json(results);
}

// DELETE /api/submissions — xóa tất cả
export async function onRequestDelete({ request, env }) {
  if (!auth(request, env))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });

  await env.DB.prepare('DELETE FROM submissions').run();
  return Response.json({ ok: true });
}
