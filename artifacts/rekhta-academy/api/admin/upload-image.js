import { createClient } from '@supabase/supabase-js';

const BUCKET = 'academy-media';
const MAX_BYTES = 4 * 1024 * 1024;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!url || !serviceRoleKey) return res.status(500).json({ error: 'Server Supabase configuration is missing' });
  if (!token) return res.status(401).json({ error: 'Authentication is required' });

  const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (authError || !auth.user) return res.status(401).json({ error: 'Invalid session' });
  const { data: profile } = await admin.from('profiles').select('role,status').eq('id', auth.user.id).maybeSingle();
  if (!profile || profile.status !== 'active' || !['owner', 'admin'].includes(profile.role)) return res.status(403).json({ error: 'Administrator access is required' });

  const { data, filename, contentType, folder } = req.body ?? {};
  if (typeof data !== 'string' || typeof filename !== 'string' || typeof contentType !== 'string') return res.status(400).json({ error: 'Image data is required' });
  if (!contentType.startsWith('image/')) return res.status(400).json({ error: 'Only image files are allowed' });
  const bytes = Buffer.from(data.replace(/^data:[^;]+;base64,/, ''), 'base64');
  if (!bytes.length || bytes.length > MAX_BYTES) return res.status(400).json({ error: 'Choose an image smaller than 4 MB' });

  const { data: bucket } = await admin.storage.getBucket(BUCKET);
  if (!bucket) {
    const { error } = await admin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: MAX_BYTES, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] });
    if (error && !/already exists/i.test(error.message)) return res.status(500).json({ error: error.message });
  }
  const safeName = filename.toLowerCase().replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-');
  const safeFolder = folder === 'students' ? 'students' : 'teachers';
  const path = `${safeFolder}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, bytes, { contentType, upsert: false });
  if (uploadError) return res.status(400).json({ error: uploadError.message });
  const { data: publicUrl } = admin.storage.from(BUCKET).getPublicUrl(path);
  return res.status(201).json({ url: publicUrl.publicUrl });
}
