import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { supabaseAdmin } from '../lib/supabase-admin.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  let query = supabaseAdmin
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(full_name,email,role), receiver:profiles!messages_receiver_id_fkey(full_name,email,role)')
    .order('created_at', { ascending: false });
  if (!['owner', 'admin'].includes(req.user!.role)) {
    query = query.or(`sender_id.eq.${req.user!.userId},receiver_id.eq.${req.user!.userId}`);
  }
  const { data, error } = await query;
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json(data ?? []);
});

router.post('/', async (req, res) => {
  const { receiverId, subject, body, type } = req.body ?? {};
  if (!body?.trim()) { res.status(400).json({ error: 'Message body is required' }); return; }

  let targetId = receiverId as string | undefined;
  if (req.user!.role === 'parent') {
    const { data: owner } = await supabaseAdmin.from('profiles').select('id').in('role', ['owner', 'admin']).eq('status', 'active').order('created_at').limit(1).maybeSingle();
    targetId = owner?.id;
  } else if (!['owner', 'admin'].includes(req.user!.role)) {
    res.status(403).json({ error: 'Only parents and administrators can send portal messages' }); return;
  }
  if (!targetId) { res.status(400).json({ error: 'No message recipient is available' }); return; }

  const { data, error } = await supabaseAdmin.from('messages').insert({
    sender_id: req.user!.userId,
    receiver_id: targetId,
    subject: subject?.trim() || null,
    body: body.trim(),
    type: type === 'reply' ? 'reply' : type === 'inquiry' ? 'inquiry' : 'complaint',
    status: 'unread',
  }).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.status(201).json(data);
});

router.patch('/:id/read', async (req, res) => {
  let query = supabaseAdmin.from('messages').update({ status: 'read' }).eq('id', req.params.id);
  if (!['owner', 'admin'].includes(req.user!.role)) query = query.eq('receiver_id', req.user!.userId);
  const { error } = await query;
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ success: true });
});

export default router;
