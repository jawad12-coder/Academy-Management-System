import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth';
import { supabaseAdmin } from '../lib/supabase-admin';

const router = Router();

// GET /dashboard/overview
router.get('/overview', requireAuth, requireRole('owner', 'admin'), async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = now.getFullYear();
    const today = now.toISOString().split('T')[0];

    const [
      studentsResult,
      teachersResult,
      parentsResult,
      classesResult,
      pendingFeesResult,
      paidFeesResult,
      inquiriesResult,
      todayAttendanceResult,
      studentsByClassResult,
    ] = await Promise.all([
      supabaseAdmin.from('students').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('teachers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('parents').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('classes').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('fee_records').select('id', { count: 'exact', head: true }).eq('status', 'unpaid'),
      supabaseAdmin
        .from('fee_records')
        .select('paid_amount')
        .eq('year', currentYear)
        .eq('month', currentMonth)
        .eq('status', 'paid'),
      supabaseAdmin
        .from('admission_inquiries')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),
      supabaseAdmin
        .from('attendance')
        .select('id', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'present'),
      supabaseAdmin
        .from('students')
        .select('class_id, classes(name)')
        .eq('status', 'active'),
    ]);

    const paidAmount = (paidFeesResult.data ?? []).reduce(
      (sum: number, r: { paid_amount: number }) => sum + (r.paid_amount ?? 0),
      0
    );

    // Group students by class
    const classCountMap: Record<string, { className: string; count: number }> = {};
    for (const student of studentsByClassResult.data ?? []) {
      const c = student as unknown as { class_id: string; classes: { name: string } | null };
      if (!c.class_id || !c.classes) continue;
      if (!classCountMap[c.class_id]) {
        classCountMap[c.class_id] = { className: c.classes.name, count: 0 };
      }
      classCountMap[c.class_id].count++;
    }

    res.json({
      totalStudents: studentsResult.count ?? 0,
      totalTeachers: teachersResult.count ?? 0,
      totalParents: parentsResult.count ?? 0,
      totalClasses: classesResult.count ?? 0,
      pendingFees: pendingFeesResult.count ?? 0,
      paidFeesThisMonth: paidAmount,
      newInquiries: inquiriesResult.count ?? 0,
      todayAttendance: todayAttendanceResult.count ?? 0,
      studentsByClass: Object.values(classCountMap).sort((a, b) => a.className.localeCompare(b.className)),
    });
  } catch (err) {
    req.log.error({ err }, 'Error fetching dashboard overview');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /dashboard/attendance-summary
router.get('/attendance-summary', requireAuth, requireRole('owner', 'admin', 'teacher'), async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0];

    // Teachers: restrict to their assigned class IDs only
    let allowedClassIds: string[] | null = null;
    if (req.user?.role === 'teacher') {
      const { data: teacherRow } = await supabaseAdmin
        .from('teachers')
        .select('id')
        .eq('profile_id', req.user.userId)
        .single();

      if (!teacherRow) {
        res.json({ daily: [], totals: { present: 0, absent: 0, late: 0, leave: 0 } });
        return;
      }

      const { data: assignments } = await supabaseAdmin
        .from('teacher_assignments')
        .select('class_id')
        .eq('teacher_id', teacherRow.id);

      allowedClassIds = (assignments ?? []).map((a: { class_id: string }) => a.class_id);

      if (allowedClassIds.length === 0) {
        res.json({ daily: [], totals: { present: 0, absent: 0, late: 0, leave: 0 } });
        return;
      }
    }

    let query = supabaseAdmin
      .from('attendance')
      .select('date, status')
      .gte('date', fromDate)
      .order('date', { ascending: true });

    if (allowedClassIds !== null) {
      query = query.in('class_id', allowedClassIds);
    }

    const { data } = await query;

    // Aggregate by date
    const dayMap: Record<string, { present: number; absent: number; late: number; leave: number }> = {};
    const totals = { present: 0, absent: 0, late: 0, leave: 0 };

    for (const row of data ?? []) {
      const r = row as { date: string; status: string };
      if (!dayMap[r.date]) dayMap[r.date] = { present: 0, absent: 0, late: 0, leave: 0 };
      if (r.status in dayMap[r.date]) {
        (dayMap[r.date] as Record<string, number>)[r.status]++;
        (totals as Record<string, number>)[r.status]++;
      }
    }

    const daily = Object.entries(dayMap).map(([date, counts]) => ({ date, ...counts }));

    res.json({ daily, totals });
  } catch (err) {
    req.log.error({ err }, 'Error fetching attendance summary');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /dashboard/fee-summary
router.get('/fee-summary', requireAuth, requireRole('owner', 'admin'), async (req, res) => {
  try {
    const { data } = await supabaseAdmin
      .from('fee_records')
      .select('month, year, amount, paid_amount, status')
      .gte('year', new Date().getFullYear() - 1)
      .order('year', { ascending: true })
      .order('month', { ascending: true });

    // Aggregate by month-year
    const monthMap: Record<string, { collected: number; pending: number }> = {};
    let totalPending = 0;
    let currentMonthCollection = 0;

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    for (const row of data ?? []) {
      const r = row as { month: string; year: number; amount: number; paid_amount: number; status: string };
      const key = `${r.year}-${String(r.month).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { collected: 0, pending: 0 };

      if (r.status === 'paid') {
        monthMap[key].collected += r.paid_amount ?? 0;
        if (key === currentMonthKey) currentMonthCollection += r.paid_amount ?? 0;
      } else if (r.status === 'unpaid') {
        monthMap[key].pending += r.amount ?? 0;
        totalPending += r.amount ?? 0;
      } else if (r.status === 'partial') {
        monthMap[key].collected += r.paid_amount ?? 0;
        monthMap[key].pending += (r.amount ?? 0) - (r.paid_amount ?? 0);
        totalPending += (r.amount ?? 0) - (r.paid_amount ?? 0);
        if (key === currentMonthKey) currentMonthCollection += r.paid_amount ?? 0;
      }
    }

    const monthly = Object.entries(monthMap).map(([month, vals]) => ({ month, ...vals }));

    res.json({ monthly, currentMonthCollection, totalPending });
  } catch (err) {
    req.log.error({ err }, 'Error fetching fee summary');
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
