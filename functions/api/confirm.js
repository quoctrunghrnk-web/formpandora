// GET /api/confirm?cccd=xxx — tra cứu CCCD, trả về tên + trạng thái xác nhận hiện tại (nếu có)
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const cccd = (url.searchParams.get('cccd') || '').trim();

  if (!cccd || cccd.length < 9)
    return Response.json({ ok: false, error: 'invalid_cccd' }, { status: 400 });

  const row = await env.DB.prepare(
    'SELECT id, fullname, confirmation_status, confirmation_reason FROM submissions WHERE cccd = ?'
  ).bind(cccd).first();

  if (!row) return Response.json({ ok: false, error: 'not_found' }, { status: 404 });

  return Response.json({
    ok: true,
    fullname: row.fullname,
    hasConfirmed: !!row.confirmation_status,
    confirmationStatus: row.confirmation_status || '',
    confirmationReason: row.confirmation_reason || '',
  });
}

// PUT /api/confirm — cập nhật trạng thái xác nhận tham dự (đè dữ liệu cũ)
export async function onRequestPut({ request, env }) {
  try {
    const { cccd, status, reason } = await request.json();

    if (!cccd || cccd.trim().length < 9)
      return Response.json({ ok: false, error: 'invalid_cccd' }, { status: 400 });
    if (!status)
      return Response.json({ ok: false, error: 'missing_status' }, { status: 400 });

    const row = await env.DB.prepare(
      'SELECT id, fullname FROM submissions WHERE cccd = ?'
    ).bind(cccd.trim()).first();

    if (!row)
      return Response.json({ ok: false, error: 'not_found' }, { status: 404 });

    const now = new Date().toISOString();

    await env.DB.prepare(
      'UPDATE submissions SET confirmation_status = ?, confirmation_reason = ?, confirmation_timestamp = ? WHERE cccd = ?'
    ).bind(status, reason || '', now, cccd.trim()).run();

    return Response.json({ ok: true, fullname: row.fullname, id: row.id });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
