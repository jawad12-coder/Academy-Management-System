import { createClient } from '@supabase/supabase-js';

function fail(res, status, error) {
  res.status(status).json({ error });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return fail(res, 405, 'Method not allowed');
  }

  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return fail(res, 500, 'Server Supabase configuration is missing');

  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return fail(res, 401, 'Authentication is required');

  const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (authError || !auth.user) return fail(res, 401, 'Invalid session');

  const { data: caller } = await admin.from('profiles').select('role,status').eq('id', auth.user.id).maybeSingle();
  if (!caller || caller.status !== 'active' || !['owner', 'admin'].includes(caller.role)) {
    return fail(res, 403, 'Administrator access is required');
  }

  const body = req.body ?? {};
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const role = body.role;
  if (!email || !fullName || password.length < 8 || !['admin', 'teacher', 'parent', 'student'].includes(role)) {
    return fail(res, 400, 'Valid email, full name, role, and an 8-character password are required');
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (createError || !created.user) return fail(res, 400, createError?.message ?? 'Unable to create user');

  const userId = created.user.id;
  const phone = typeof body.phone === 'string' ? body.phone : null;
  const removeUser = async () => { await admin.auth.admin.deleteUser(userId); };
  const removeProfileAndUser = async () => { await admin.from('profiles').delete().eq('id', userId); await removeUser(); };

  const { error: profileError } = await admin.from('profiles').insert({
    id: userId, email, full_name: fullName, role, phone, status: 'active',
  });
  if (profileError) { await removeUser(); return fail(res, 400, profileError.message); }

  if (role === 'student') {
    const student = body.student ?? {};
    const admissionNo = typeof student.admissionNo === 'string' ? student.admissionNo.trim() : '';
    const classId = typeof student.classId === 'string' ? student.classId : '';
    if (!admissionNo || !classId) { await removeProfileAndUser(); return fail(res, 400, 'Admission number and class are required for a student'); }
    const { error } = await admin.from('students').insert({
      profile_id: userId, admission_no: admissionNo, full_name: fullName, class_id: classId,
      father_name: typeof student.fatherName === 'string' ? student.fatherName || null : null,
      gender: typeof student.gender === 'string' ? student.gender : null,
      guardian_phone: phone, status: 'active',
    });
    if (error) { await removeProfileAndUser(); return fail(res, 400, error.message); }
  }

  if (role === 'parent') {
    const { error } = await admin.from('parents').insert({ profile_id: userId, full_name: fullName, email, phone });
    if (error) { await removeProfileAndUser(); return fail(res, 400, error.message); }
  }

  if (role === 'teacher') {
    const subjects = Array.isArray(body.subjects) ? body.subjects.map(String).map(value => value.trim()).filter(Boolean) : [];
    const { error } = await admin.from('teachers').insert({
      profile_id: userId, full_name: fullName, email, phone, subjects, status: 'active',
      qualification: typeof body.qualification === 'string' ? body.qualification || null : null,
      bio: typeof body.bio === 'string' ? body.bio || null : null,
      photo_url: typeof body.photoUrl === 'string' ? body.photoUrl || null : null,
    });
    if (error) { await removeProfileAndUser(); return fail(res, 400, error.message); }
  }

  return res.status(201).json({ userId, email, role });
}
