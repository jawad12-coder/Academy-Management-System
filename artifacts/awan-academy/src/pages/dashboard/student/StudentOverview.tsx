import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2, XCircle, Clock, BookOpen,
  Award, Calendar, TrendingUp, Bell,
} from 'lucide-react';

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  total: number;
}

interface HomeworkItem {
  id: string;
  title: string;
  due_date: string | null;
  subjects: { name: string } | null;
}

interface ResultItem {
  id: string;
  obtained_marks: number | null;
  grade: string | null;
  exams: { title: string; total_marks: number | null; exam_date: string | null } | null;
}

interface Notice {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

export function StudentOverview() {
  const { user } = useAuth();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [className, setClassName] = useState('');
  const [attendance, setAttendance] = useState<AttendanceStats>({ present: 0, absent: 0, late: 0, total: 0 });
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        // 1. Student record
        const { data: studentRow } = await supabase
          .from('students')
          .select('id, class_id, classes(name)')
          .eq('profile_id', user!.id)
          .single();

        if (!studentRow) { setLoading(false); return; }

        const sid = studentRow.id;
        const cid = studentRow.class_id;
        setStudentId(sid);
        setClassId(cid);
        setClassName((studentRow as any).classes?.name ?? '');

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const fromDate = thirtyDaysAgo.toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];

        // 2. Attendance (last 30 days)
        const { data: attRows } = await supabase
          .from('attendance')
          .select('status')
          .eq('student_id', sid)
          .gte('date', fromDate);

        const rows = attRows ?? [];
        setAttendance({
          present: rows.filter((r: any) => r.status === 'present').length,
          absent: rows.filter((r: any) => r.status === 'absent').length,
          late: rows.filter((r: any) => r.status === 'late').length,
          total: rows.length,
        });

        // 3. Upcoming / active homework for this class
        if (cid) {
          const { data: hwRows } = await supabase
            .from('homework')
            .select('id, title, due_date, subjects(name)')
            .eq('class_id', cid)
            .eq('is_published', true)
            .gte('due_date', today)
            .order('due_date', { ascending: true })
            .limit(5);
          setHomework((hwRows ?? []) as unknown as HomeworkItem[]);
        }

        // 4. Latest results
        const { data: resultRows } = await supabase
          .from('results')
          .select('id, obtained_marks, grade, exams(title, total_marks, exam_date)')
          .eq('student_id', sid)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(5);
        setResults((resultRows ?? []) as unknown as ResultItem[]);

        // 5. Recent notices for everyone, students, or this student's class.
        let noticeQuery = supabase
          .from('notices')
          .select('id, title, body, created_at')
          .eq('is_published', true);
        noticeQuery = cid
          ? noticeQuery.or(`audience.in.(all,students),and(audience.eq.class,class_id.eq.${cid})`)
          : noticeQuery.in('audience', ['all', 'students']);
        const { data: noticeRows } = await noticeQuery
          .order('created_at', { ascending: false })
          .limit(4);
        setNotices(noticeRows ?? []);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground animate-pulse">Loading your dashboard…</div>
      </div>
    );
  }

  if (!studentId) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Student Portal</h1>
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <BookOpen className="mx-auto mb-3 opacity-40" size={40} />
            <p className="font-medium">Student profile not linked yet.</p>
            <p className="text-sm mt-1">Please contact your admin to set up your student account.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { present, absent, late, total } = attendance;
  const attendancePct = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Student Portal</h1>
        <p className="text-muted-foreground mt-1">
          Welcome, <span className="font-medium text-foreground">{user?.full_name}</span>
          {className && <> · <span className="font-medium">{className}</span></>}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-600 shrink-0" size={22} />
              <div>
                <p className="text-xs text-muted-foreground">Present (30d)</p>
                <p className="text-2xl font-bold">{present}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <XCircle className="text-destructive shrink-0" size={22} />
              <div>
                <p className="text-xs text-muted-foreground">Absent (30d)</p>
                <p className="text-2xl font-bold">{absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <Clock className="text-yellow-500 shrink-0" size={22} />
              <div>
                <p className="text-xs text-muted-foreground">Late (30d)</p>
                <p className="text-2xl font-bold">{late}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="text-primary shrink-0" size={22} />
              <div>
                <p className="text-xs text-muted-foreground">Homework Due</p>
                <p className="text-2xl font-bold">{homework.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar size={18} className="text-primary" /> Attendance Rate (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={attendancePct} className="flex-1 h-3" />
            <Badge variant={attendancePct >= 75 ? 'default' : 'destructive'} className="shrink-0">
              <TrendingUp size={13} className="mr-1" /> {attendancePct}%
            </Badge>
          </div>
          {attendancePct < 75 && (
            <p className="text-xs text-destructive mt-2">
              ⚠ Attendance below 75%. Please ensure regular attendance.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Homework */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen size={18} className="text-primary" /> Upcoming Homework
            </CardTitle>
          </CardHeader>
          <CardContent>
            {homework.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No pending homework 🎉</p>
            ) : (
              <ul className="space-y-3">
                {homework.map((hw) => (
                  <li key={hw.id} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium leading-tight">{hw.title}</p>
                      {hw.subjects && (
                        <p className="text-xs text-muted-foreground mt-0.5">{hw.subjects.name}</p>
                      )}
                    </div>
                    {hw.due_date && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        Due: {new Date(hw.due_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Award size={18} className="text-primary" /> Recent Exam Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No results published yet.</p>
            ) : (
              <ul className="space-y-3">
                {results.map((r) => {
                  const pct =
                    r.obtained_marks != null && r.exams?.total_marks
                      ? Math.round((r.obtained_marks / r.exams.total_marks) * 100)
                      : null;
                  return (
                    <li key={r.id} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{r.exams?.title ?? 'Exam'}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.obtained_marks ?? '—'} / {r.exams?.total_marks ?? '—'} marks
                          {pct != null && <> · {pct}%</>}
                        </p>
                      </div>
                      {r.grade && (
                        <Badge
                          variant={
                            ['A+', 'A', 'A1'].includes(r.grade ?? '')
                              ? 'default'
                              : r.grade?.startsWith('F')
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {r.grade}
                        </Badge>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notices */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell size={18} className="text-primary" /> Notices for Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No notices yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {notices.map((n) => (
                <li key={n.id} className="py-3">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {new Date(n.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
