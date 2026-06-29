import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase-admin.js';

const router = Router();

// POST /public/inquiries – admission inquiry form (no auth required)
router.post('/inquiries', async (req, res) => {
  const { studentName, guardianName, phone, desiredClass, currentSchool, message } = req.body;

  if (!studentName || !guardianName || !phone || !desiredClass) {
    res.status(400).json({ error: 'studentName, guardianName, phone, and desiredClass are required' });
    return;
  }

  const { error } = await supabaseAdmin.from('admission_inquiries').insert({
    student_name: studentName,
    guardian_name: guardianName,
    phone,
    desired_class: desiredClass,
    current_school: currentSchool ?? null,
    message: message ?? null,
    status: 'new',
  });

  if (error) {
    req.log.error({ error }, 'Failed to save admission inquiry');
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(201).json({ success: true, message: 'Inquiry submitted successfully' });
});

// POST /public/contact – contact form (no auth required)
router.post('/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).json({ error: 'name, email, and message are required' });
    return;
  }

  // Store as a message from a non-auth user via a system inbox entry
  const { error } = await supabaseAdmin.from('admission_inquiries').insert({
    student_name: name,
    guardian_name: name,
    phone: phone ?? '',
    desired_class: subject ?? 'General Inquiry',
    message: `[Contact Form] Email: ${email}\n${message}`,
    status: 'new',
  });

  if (error) {
    req.log.error({ error }, 'Failed to save contact form');
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(201).json({ success: true, message: 'Message sent successfully' });
});

export default router;
