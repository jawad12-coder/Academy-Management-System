import { Router, type Request, type Response } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { supabaseAdmin } from '../lib/supabase-admin.js';

const router = Router();

// POST /admin/create-user
router.post('/create-user', requireAuth, requireRole('owner', 'admin'), async (req: Request, res: Response) => {
  const { email, password, fullName, role, phone } = req.body;

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

  res.status(201).json({ userId, email, role });
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
