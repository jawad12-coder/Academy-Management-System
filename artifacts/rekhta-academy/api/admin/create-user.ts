import { createClient } from '@supabase/supabase-js';

type Request = {
  method?: string;
  headers: { authorization?: string | string[] };
  body?: Record<string, unknown>;
};

type Response = {
  status: (code: number) => Response;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

function getAuthorizationHeader(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    res.status(500).json({ error: 'Server Supabase configuration is missing' });
    return;
  }

  const token = getAuthorizationHeader(req.headers.authorization)?.replace(/^Bearer\s+/i, '');
  if (!token) {
    res.status(401).json({ error: 'Authentication is required' });
    return;
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) {
    res.status(401).json({ error: 'Invalid session' });
    return;
  }

  const { data: caller } = await admin
    .from('profiles')
    .select('role, status')
    .eq('id', authData.user.id)
    .maybeSingle();
  if (!caller || caller.status !== 'active' || !['owner', 'admin'].includes(caller.role)) {
    res.status(403).json({ error: 'Administrator access is required' });
    return;
  }

  const body = req.body ?? {};
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const role = typeof body.role === 'string' ? body.role : '';
  if (!email || !fullName || password.length < 8 || !['admin', 'teacher', 'parent', 'student'].includes(role)) {
    res.status(400).json({ error: 'Valid email, full name, role, and an 8-character password are required' });
    return;
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError || !created.user) {
    res.status(400).json({ error: createError?.message ?? 'Unable to create user' });
    return;
  }

  const userId = created.user.id;
  const phone = typeof body.phone === 'string' ? body.phone : null;
  const fail = async (message: string) => {
    await admin.auth.admin.deleteUser(userId);
    res.status(400).json({ error: message });
  };

  const { error: profileError } = await admin.from('profiles').insert({
    id: userId, email, full_name: fullName, role, phone, status: 'active',
  });
  if (profileError) {
    await fail(profileError.message);
    return;
  }

  if (role === 'student') {
    const student = body.student as Record<string, unknown> | undefined;
    const admissionNo = typeof student?.admissionNo === 'string' ? student.admissionNo.trim() : '';
    const classId = typeof student?.classId === 'string' ? student.classId : '';
    if (!admissionNo || !classId) {
      await admin.from('profiles').delete().eq('id', userId);
      await fail('Admission number and class are required for a student');
      return;
    }
    const { error } = await admin.from('students').insert({
      profile_id: userId, admission_no: admissionNo, full_name: fullName, class_id: classId,
      father_name: typeof student?.fatherName === 'string' ? student.fatherName || null : null,
      gender: typeof student?.gender === 'string' ? student.gender : null,
      guardian_phone: phone, status: 'active',
    });
    if (error) {
      await admin.from('profiles').delete().eq('id', userId);
      await fail(error.message);
      return;
    }
  }

  if (role === 'parent') {
    const { error } = await admin.from('parents').insert({ profile_id: userId, full_name: fullName, email, phone });
    if (error) {
      await admin.from('profiles').delete().eq('id', userId);
      await fail(error.message);
      return;
    }
  }

  if (role === 'teacher') {
    const subjects = Array.isArray(body.subjects) ? body.subjects.map(String).map(value => value.trim()).filter(Boolean) : [];
    const { error } = await admin.from('teachers').insert({
      profile_id: userId, full_name: fullName, email, phone, subjects, status: 'active',
      qualification: typeof body.qualification === 'string' ? body.qualification || null : null,
      bio: typeof body.bio === 'string' ? body.bio || null : null,
      photo_url: typeof body.photoUrl === 'string' ? body.photoUrl || null : null,
    });
    if (error) {
      await admin.from('profiles').delete().eq('id', userId);
      await fail(error.message);
      return;
    }
  }

  res.status(201).json({ userId, email, role });
}
