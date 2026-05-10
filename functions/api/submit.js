export async function onRequestPost({ request, env }) {
  try {
    const b = await request.json();

    await env.DB.prepare(`
      INSERT INTO submissions
        (id, timestamp, fullname, phone, email, age, gender, address,
         cccd, cccd_date, cccd_place, run_tay, can_thi, mo_hoi_tay,
         education, company, experience, salary, start_date,
         pandora_contact, pandora_interview, pandora_contractor,
         bank_name, bank_account, cccd_photo, cccd_photo_back, bank_photo,
         custom_data)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      b.id, b.timestamp, b.fullname, b.phone, b.email,
      Number(b.age), b.gender, b.address,
      b.cccd, b.cccdDate, b.cccdPlace,
      b.runTay, b.can, b.moHoiTay,
      b.education, b.company, Number(b.experience),
      b.salary, b.startDate,
      b.pandoraContact, b.pandoraInterview, b.pandoraContractor,
      b.bankName || '', b.bankAccount,
      b.cccdPhoto || '', b.cccdPhotoBack || '', b.bankPhoto || '',
      JSON.stringify(b.customData || {})
    ).run();

    return Response.json({ ok: true, id: b.id });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
