import { Router, type Request, type Response } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { supabaseAdmin } from '../lib/supabase-admin.js';

const router = Router();

// POST /admin/create-user
router.post('/create-user', requireAuth, requireRole('owner', 'admin'), async (req: Request, res: Response) => {
  const { email, password, fullName, role, phone, qualification, subjects, bio, photoUrl, student, parent } = req.body;

  if (!email || !password || !fullName || !role) {
    res.status(400).json({ error: 'email, password, fullName, and role are required' });
    return;
  }

  const allowedRoles = ['admin', 'teacher', 'parent', 'student'];
  if (!allowedRoles.includes(role)) {
    res.status(400).json({ error: 'Invalid role. Must be: admin, teacher, parent, or student' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  // Create auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    req.log.error({ authError }, 'Failed to create auth user');
    res.status(400).json({ error: authError?.message ?? 'Failed to create user' });
    return;
  }

  const userId = authData.user.id;

  // Create profile row
  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: userId,
    email,
    full_name: fullName,
    role,
    phone: phone ?? null,
    status: 'active',
  });

  if (profileError) {
    // Clean up the auth user if profile insert fails
    await supabaseAdmin.auth.admin.deleteUser(userId);
    req.log.error({ profileError }, 'Failed to create profile');
    res.status(400).json({ error: profileError.message });
    return;
  }

  // A teacher must have a linked domain record as well as an Auth user/profile.
  // Keeping this server-side avoids leaving an unusable half-created account.
  if (role === 'teacher') {
    const normalizedSubjects = Array.isArray(subjects)
      ? subjects.map((subject: unknown) => String(subject).trim()).filter(Boolean)
      : [];
    const { error: teacherError } = await supabaseAdmin.from('teachers').insert({
      profile_id: userId,
      full_name: fullName,
      email,
      phone: phone ?? null,
      qualification: qualification ?? null,
      subjects: normalizedSubjects,
      bio: bio ?? null,
      photo_url: photoUrl ?? null,
      status: 'active',
    });

    if (teacherError) {
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      req.log.error({ teacherError }, 'Failed to create teacher record');
      res.status(400).json({ error: teacherError.message });
      return;
    }
  }

  if (role === 'student') {
    if (!student?.admissionNo || !student?.classId) {
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      res.status(400).json({ error: 'Admission number and class are required for a student' });
      return;
    }
    const { error: studentError } = await supabaseAdmin.from('students').insert({
      profile_id: userId, admission_no: student.admissionNo, full_name: fullName,
      father_name: student.fatherName ?? null, guardian_phone: phone ?? null,
      gender: student.gender ?? null, class_id: student.classId,
      batch_id: student.batchId ?? null, status: 'active',
    });
    if (studentError) {
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      res.status(400).json({ error: studentError.message });
      return;
    }
  }

  if (role === 'parent') {
    const { error: parentError } = await supabaseAdmin.from('parents').insert({
      profile_id: userId, full_name: fullName, email, phone: phone ?? null,
      address: parent?.address ?? null,
    });
    if (parentError) {
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      res.status(400).json({ error: parentError.message });
      return;
    }
  }

  res.status(201).json({ userId, email, role });
});

// DELETE /admin/teachers/:teacherId
// Removes the teacher's assignments/record and, when linked, their login too.
router.delete('/teachers/:teacherId', requireAuth, requireRole('owner', 'admin'), async (req: Request, res: Response) => {
  const { teacherId } = req.params;
  const { data: teacher, error: findError } = await supabaseAdmin
    .from('teachers')
    .select('id, profile_id')
    .eq('id', teacherId)
    .maybeSingle();

  if (findError) {
    res.status(400).json({ error: findError.message });
    return;
  }
  if (!teacher) {
    res.status(404).json({ error: 'Teacher not found' });
    return;
  }

  const { error: deleteError } = await supabaseAdmin.from('teachers').delete().eq('id', teacherId);
  if (deleteError) {
    res.status(400).json({ error: deleteError.message });
    return;
  }

  if (teacher.profile_id) {
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(teacher.profile_id);
    if (authError) {
      req.log.error({ authError, teacherId }, 'Teacher record deleted but Auth cleanup failed');
      res.status(500).json({ error: 'Teacher record deleted, but login cleanup failed' });
      return;
    }
  }

  res.json({ success: true, message: 'Teacher account deleted' });
});

// POST /admin/reset-password
router.post('/reset-password', requireAuth, requireRole('owner', 'admin'), async (req: Request, res: Response) => {
  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    res.status(400).json({ error: 'userId and newPassword are required' });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    req.log.error({ error }, 'Failed to reset password');
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ success: true, message: 'Password reset successfully' });
});

export default router;
