// PUT /api/supplement
// Worker tra cứu bằng số CCCD rồi cập nhật thông tin ngân hàng vào đúng dòng cũ
export async function onRequestPut({ request, env }) {
  try {
    const { cccd, bankName, bankAccount, bankPhoto } = await request.json();

    if (!cccd || cccd.trim().length < 9)
      return Response.json({ ok: false, error: 'invalid_cccd' }, { status: 400 });
    if (!bankName || !bankAccount)
      return Response.json({ ok: false, error: 'missing_bank' }, { status: 400 });

    const row = await env.DB.prepare(
      'SELECT id, fullname FROM submissions WHERE cccd = ?'
    ).bind(cccd.trim()).first();

    if (!row)
      return Response.json({ ok: false, error: 'not_found' }, { status: 404 });

    await env.DB.prepare(
      'UPDATE submissions SET bank_name = ?, bank_account = ?, bank_photo = ? WHERE cccd = ?'
    ).bind(bankName, bankAccount.trim(), bankPhoto || '', cccd.trim()).run();

    return Response.json({ ok: true, fullname: row.fullname, id: row.id });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// GET /api/supplement?cccd=xxx — kiểm tra CCCD tồn tại không (để preview trước khi submit)
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const cccd = (url.searchParams.get('cccd') || '').trim();

  if (!cccd || cccd.length < 9)
    return Response.json({ ok: false, error: 'invalid_cccd' }, { status: 400 });

  const row = await env.DB.prepare(
    'SELECT id, fullname, bank_name, bank_account FROM submissions WHERE cccd = ?'
  ).bind(cccd).first();

  if (!row) return Response.json({ ok: false, error: 'not_found' }, { status: 404 });

  return Response.json({
    ok: true,
    fullname: row.fullname,
    hasBankInfo: !!(row.bank_name && row.bank_account),
    bankName: row.bank_name || '',
    bankAccount: row.bank_account || '',
  });
}
