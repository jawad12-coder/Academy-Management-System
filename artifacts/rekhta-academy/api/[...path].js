import { createClient } from '@supabase/supabase-js';

function respond(res, status, body) {
  res.status(status).json(body);
}

function getAdminClient(res) {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    respond(res, 500, { error: 'Server Supabase configuration is missing' });
    return null;
  }
  return createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function requireUser(req, res, admin, roles) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) { respond(res, 401, { error: 'Authentication is required' }); return null; }
  const { data: auth, error } = await admin.auth.getUser(token);
  if (error || !auth.user) { respond(res, 401, { error: 'Invalid session' }); return null; }
  const { data: profile } = await admin.from('profiles').select('role,status').eq('id', auth.user.id).maybeSingle();
  if (!profile || profile.status !== 'active') { respond(res, 403, { error: 'Your account is inactive' }); return null; }
  if (roles && !roles.includes(profile.role)) { respond(res, 403, { error: 'You do not have permission for this action' }); return null; }
  return { id: auth.user.id, role: profile.role };
}

async function dashboard(req, res, admin, user, route) {
  if (!['owner', 'admin'].includes(user.role)) return respond(res, 403, { error: 'Administrator access is required' });

  if (route === 'overview') {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const today = now.toISOString().slice(0, 10);
    const [students, teachers, parents, classes, unpaid, paid, inquiries, present, byClass] = await Promise.all([
      admin.from('students').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      admin.from('teachers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      admin.from('parents').select('id', { count: 'exact', head: true }),
      admin.from('classes').select('id', { count: 'exact', head: true }),
      admin.from('fee_records').select('id', { count: 'exact', head: true }).eq('status', 'unpaid'),
      admin.from('fee_records').select('paid_amount').eq('year', year).eq('month', month).eq('status', 'paid'),
      admin.from('admission_inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      admin.from('attendance').select('id', { count: 'exact', head: true }).eq('date', today).eq('status', 'present'),
      admin.from('students').select('class_id,classes(name)').eq('status', 'active'),
    ]);
    const grouped = {};
    for (const row of byClass.data ?? []) {
      if (!row.class_id || !row.classes) continue;
      if (!grouped[row.class_id]) grouped[row.class_id] = { className: row.classes.name, count: 0 };
      grouped[row.class_id].count += 1;
    }
    return respond(res, 200, {
      totalStudents: students.count ?? 0, totalTeachers: teachers.count ?? 0, totalParents: parents.count ?? 0,
      totalClasses: classes.count ?? 0, pendingFees: unpaid.count ?? 0,
      paidFeesThisMonth: (paid.data ?? []).reduce((sum, row) => sum + Number(row.paid_amount ?? 0), 0),
      newInquiries: inquiries.count ?? 0, todayAttendance: present.count ?? 0,
      studentsByClass: Object.values(grouped).sort((a, b) => a.className.localeCompare(b.className)),
    });
  }

  if (route === 'attendance-summary') {
    const from = new Date(); from.setDate(from.getDate() - 30);
    const { data, error } = await admin.from('attendance').select('date,status').gte('date', from.toISOString().slice(0, 10)).order('date');
    if (error) return respond(res, 400, { error: error.message });
    const totals = { present: 0, absent: 0, late: 0, leave: 0 }; const days = {};
    for (const row of data ?? []) { if (!days[row.date]) days[row.date] = { present: 0, absent: 0, late: 0, leave: 0 }; if (row.status in totals) { days[row.date][row.status] += 1; totals[row.status] += 1; } }
    return respond(res, 200, { daily: Object.entries(days).map(([date, counts]) => ({ date, ...counts })), totals });
  }

  if (route === 'fee-summary') {
    const { data, error } = await admin.from('fee_records').select('month,year,amount,paid_amount,status').gte('year', new Date().getFullYear() - 1).order('year').order('month');
    if (error) return respond(res, 400, { error: error.message });
    const months = {}; let totalPending = 0; let currentMonthCollection = 0; const current = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    for (const row of data ?? []) { const key = `${row.year}-${String(row.month).padStart(2, '0')}`; months[key] ??= { collected: 0, pending: 0 }; const amount = Number(row.amount ?? 0); const paid = Number(row.paid_amount ?? 0); if (row.status === 'paid') { months[key].collected += paid; if (key === current) currentMonthCollection += paid; } else { const pending = row.status === 'partial' ? amount - paid : amount; months[key].pending += pending; totalPending += pending; if (row.status === 'partial') { months[key].collected += paid; if (key === current) currentMonthCollection += paid; } } }
    return respond(res, 200, { monthly: Object.entries(months).map(([month, values]) => ({ month, ...values })), currentMonthCollection, totalPending });
  }
  return respond(res, 404, { error: 'Dashboard route not found' });
}

async function messages(req, res, admin, user, parts) {
  if (req.method === 'GET' && parts.length === 1) {
    let query = admin.from('messages').select('*,sender:profiles!messages_sender_id_fkey(full_name,email,role),receiver:profiles!messages_receiver_id_fkey(full_name,email,role)').order('created_at', { ascending: false });
    if (!['owner', 'admin'].includes(user.role)) query = query.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
    const { data, error } = await query; return error ? respond(res, 400, { error: error.message }) : respond(res, 200, data ?? []);
  }
  if (req.method === 'POST' && parts.length === 1) {
    const body = req.body ?? {}; if (!body.body?.trim()) return respond(res, 400, { error: 'Message body is required' });
    let receiverId = body.receiverId;
    if (user.role === 'parent') { const { data } = await admin.from('profiles').select('id').in('role', ['owner', 'admin']).eq('status', 'active').order('created_at').limit(1).maybeSingle(); receiverId = data?.id; }
    if (!receiverId) return respond(res, 400, { error: 'No message recipient is available' });
    const { data, error } = await admin.from('messages').insert({ sender_id: user.id, receiver_id: receiverId, subject: body.subject?.trim() || null, body: body.body.trim(), type: body.type === 'reply' ? 'reply' : body.type === 'inquiry' ? 'inquiry' : 'complaint', status: 'unread' }).select().single();
    return error ? respond(res, 400, { error: error.message }) : respond(res, 201, data);
  }
  if (req.method === 'PATCH' && parts.length === 3 && parts[2] === 'read') {
    let query = admin.from('messages').update({ status: 'read' }).eq('id', parts[1]); if (!['owner', 'admin'].includes(user.role)) query = query.eq('receiver_id', user.id); const { error } = await query; return error ? respond(res, 400, { error: error.message }) : respond(res, 200, { success: true });
  }
  return respond(res, 405, { error: 'Unsupported messages request' });
}

export default async function handler(req, res) {
  const path = Array.isArray(req.query.path) ? req.query.path : String(req.query.path ?? '').split('/').filter(Boolean);
  const admin = getAdminClient(res); if (!admin) return;
  if (path[0] === 'public' && req.method === 'POST' && ['inquiries', 'contact'].includes(path[1])) {
    const b = req.body ?? {}; const inquiry = path[1] === 'inquiries'
      ? { student_name: b.studentName, guardian_name: b.guardianName, phone: b.phone, desired_class: b.desiredClass, current_school: b.currentSchool ?? null, message: b.message ?? null, status: 'new' }
      : { student_name: b.name, guardian_name: b.name, phone: b.phone ?? '', desired_class: b.subject ?? 'General Inquiry', message: `[Contact Form] Email: ${b.email}\n${b.message}`, status: 'new' };
    const valid = path[1] === 'inquiries'
      ? Boolean(inquiry.student_name && inquiry.guardian_name && inquiry.phone && inquiry.desired_class)
      : Boolean(b.name && b.email && b.message);
    if (!valid) return respond(res, 400, { error: 'Required form fields are missing' });
    const { error } = await admin.from('admission_inquiries').insert(inquiry); return error ? respond(res, 400, { error: error.message }) : respond(res, 201, { success: true });
  }
  const user = await requireUser(req, res, admin); if (!user) return;
  if (path[0] === 'dashboard') return dashboard(req, res, admin, user, path[1]);
  if (path[0] === 'messages') return messages(req, res, admin, user, path);
  return respond(res, 404, { error: 'API route not found' });
}
