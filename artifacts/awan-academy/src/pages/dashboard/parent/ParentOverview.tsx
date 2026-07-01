import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Users, Bell, BookOpen, Calendar,
  CheckCircle2, XCircle, Clock, TrendingUp,
} from 'lucide-react';

interface ChildData {
  id: string;
  full_name: string;
  admission_no: string;
  className: string;
  attendanceSummary: { present: number; absent: number; late: number; total: number };
  pendingHomework: number;
  recentResults: {
    id: string;
    obtained_marks: number | null;
    grade: string | null;
    exams: { title: string; total_marks: number | null; exam_date: string | null } | null;
  }[];
}

interface Notice {
  id: string;
  title: string;
  body: string;
  audience: string;
  created_at: string;
}

export function ParentOverview() {
  const { user } = useAuth();
  const [children, setChildren] = useState<ChildData[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const linkedClassIds: string[] = [];
      try {
        // 1. Get parent record
        const { data: parentRow } = await supabase
          .from('parents')
          .select('id')
          .eq('profile_id', user!.id)
          .single();

        if (parentRow) {
          // 2. Get linked students
          const { data: links } = await supabase
            .from('student_parents')
            .select('student_id')
            .eq('parent_id', parentRow.id);

          const studentIds = (links ?? []).map((l: { student_id: string }) => l.student_id);

          if (studentIds.length > 0) {
            const { data: students } = await supabase
              .from('students')
              .select('id, full_name, admission_no, class_id, classes(name)')
              .in('id', studentIds);

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const fromDate = thirtyDaysAgo.toISOString().split('T')[0];

            const enriched: ChildData[] = await Promise.all(
              (students ?? []).map(async (s: any) => {
                // Attendance summary
                const { data: att } = await supabase
                  .from('attendance')
                  .select('status')
                  .eq('student_id', s.id)
                  .gte('date', fromDate);

                const attRows = att ?? [];
                const present = attRows.filter((r: any) => r.status === 'present').length;
                const absent = attRows.filter((r: any) => r.status === 'absent').length;
                const late = attRows.filter((r: any) => r.status === 'late').length;

                // Pending homework
                const today = new Date().toISOString().split('T')[0];
                const { count: hwCount } = await supabase
                  .from('homework')
                  .select('id', { count: 'exact', head: true })
                  .eq('class_id', s.class_id)
                  .eq('is_published', true)
                  .gte('due_date', today);

                // Latest published results for this child. RLS restricts a
                // parent to students connected through student_parents.
                const { data: resultRows } = await supabase
                  .from('results')
                  .select('id, obtained_marks, grade, exams(title, total_marks, exam_date)')
                  .eq('student_id', s.id)
                  .eq('is_published', true)
                  .order('created_at', { ascending: false })
                  .limit(5);

                return {
                  id: s.id,
                  full_name: s.full_name,
                  admission_no: s.admission_no,
                  className: s.classes?.name ?? 'N/A',
                  attendanceSummary: {
                    present,
                    absent,
                    late,
                    total: attRows.length,
                  },
                  pendingHomework: hwCount ?? 0,
                  recentResults: (resultRows ?? []) as unknown as ChildData['recentResults'],
                };
              })
            );

            linkedClassIds.push(...new Set((students ?? []).map((student: any) => student.class_id).filter(Boolean)) as unknown as string[]);

            setChildren(enriched);
          }
        }

        // 3. Notices for parents
        let noticeQuery = supabase
          .from('notices')
          .select('id, title, body, audience, created_at')
          .eq('is_published', true);
        noticeQuery = linkedClassIds.length
          ? noticeQuery.or(`audience.in.(all,parents),and(audience.eq.class,class_id.in.(${linkedClassIds.join(',')}))`)
          : noticeQuery.in('audience', ['all', 'parents']);
        const { data: noticeData } = await noticeQuery.order('created_at', { ascending: false }).limit(6);

        setNotices(noticeData ?? []);
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Parent Portal</h1>
        <p className="text-muted-foreground mt-1">
          Welcome, <span className="font-medium text-foreground">{user?.full_name}</span>. Here is an overview of your children's progress.
        </p>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Users className="mx-auto mb-3 opacity-40" size={40} />
            <p className="font-medium">No children linked to your account yet.</p>
            <p className="text-sm mt-1">Please contact the admin to link your children.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users size={20} className="text-primary" /> Your Children
          </h2>

          {children.map((child) => {
            const { present, absent, late, total } = child.attendanceSummary;
            const attendancePct = total > 0 ? Math.round((present / total) * 100) : 0;

            return (
              <Card key={child.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <CardTitle className="text-xl">{child.full_name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Admission No: <span className="font-mono">{child.admission_no}</span>
                        {' · '}Class: <span className="font-medium">{child.className}</span>
                      </p>
                    </div>
                    <Badge
                      variant={attendancePct >= 75 ? 'default' : 'destructive'}
                      className="text-sm px-3 py-1"
                    >
                      <TrendingUp size={14} className="mr-1" />
                      {attendancePct}% Attendance
                    </Badge>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Present</p>
                        <p className="font-bold text-lg">{present}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle size={16} className="text-destructive shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Absent</p>
                        <p className="font-bold text-lg">{absent}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-yellow-500 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Late</p>
                        <p className="font-bold text-lg">{late}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Pending HW</p>
                        <p className="font-bold text-lg">{child.pendingHomework}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">* Attendance based on last 30 days</p>

                  <Separator className="my-5" />
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-3">
                      <BookOpen size={16} className="text-primary" /> Published Results
                    </h4>
                    {child.recentResults.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No published results yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {child.recentResults.map((result) => {
                          const total = result.exams?.total_marks;
                          const percentage = result.obtained_marks != null && total
                            ? Math.round((result.obtained_marks / total) * 100)
                            : null;
                          return (
                            <div key={result.id} className="flex items-center justify-between gap-3 border rounded-md p-3">
                              <div>
                                <p className="text-sm font-medium">{result.exams?.title ?? 'Exam'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {result.obtained_marks ?? '—'} / {total ?? '—'} marks
                                  {percentage != null ? ` · ${percentage}%` : ''}
                                </p>
                              </div>
                              {result.grade && <Badge>{result.grade}</Badge>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Notices */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Bell size={20} className="text-primary" /> Recent Notices
        </h2>

        {notices.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No notices published yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notices.map((n) => (
              <Card key={n.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1">
                      <p className="font-semibold">{n.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{n.body}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline" className="text-xs capitalize">{n.audience}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(n.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
