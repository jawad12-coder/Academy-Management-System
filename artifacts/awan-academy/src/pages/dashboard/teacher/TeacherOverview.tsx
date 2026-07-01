import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Award, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type Schedule = { id: string; start_time: string; end_time: string; classes: { name: string } | null; subjects: { name: string } | null };
type Notice = { id: string; title: string; body: string };

export function TeacherOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ classes: 0, lectures: 0, exams: 0 });
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: teacher } = await supabase.from('teachers').select('id').eq('profile_id', user.id).single();
      if (!teacher) return;
      const day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
      const [assignmentResult, timetableResult, examResult, noticeResult] = await Promise.all([
        supabase.from('teacher_assignments').select('class_id').eq('teacher_id', teacher.id),
        supabase.from('timetable').select('id,start_time,end_time,classes(name),subjects(name)').eq('teacher_id', teacher.id).eq('day_of_week', day).order('start_time'),
        supabase.from('exams').select('id', { count: 'exact', head: true }).eq('is_published', false),
        supabase.from('notices').select('id,title,body').in('audience', ['all', 'teachers']).eq('is_published', true).order('created_at', { ascending: false }).limit(5),
      ]);
      const uniqueClasses = new Set((assignmentResult.data ?? []).map(item => item.class_id)).size;
      setStats({ classes: uniqueClasses, lectures: timetableResult.data?.length ?? 0, exams: examResult.count ?? 0 });
      setSchedule((timetableResult.data ?? []) as unknown as Schedule[]);
      setNotices(noticeResult.data ?? []);
    })();
  }, [user]);

  return <div className="space-y-6">
    <h1 className="text-3xl font-serif font-bold tracking-tight">Welcome, {user?.full_name}</h1>
    <div className="grid gap-4 md:grid-cols-3">{[
      ['Assigned Classes', stats.classes, BookOpen], ["Today's Lectures", stats.lectures, Clock], ['Pending Results', stats.exams, Award],
    ].map(([label, value, Icon]: any) => <Card key={label}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle><Icon className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">{value}</div></CardContent></Card>)}</div>
    <div className="grid gap-6 md:grid-cols-2">
      <Card><CardHeader><CardTitle>Today's Schedule</CardTitle></CardHeader><CardContent className="space-y-3">{schedule.length ? schedule.map(item => <div key={item.id} className="border rounded-md p-3"><p className="font-semibold">{item.classes?.name} {item.subjects?.name ? `— ${item.subjects.name}` : ''}</p><p className="text-sm text-muted-foreground">{item.start_time.slice(0,5)}–{item.end_time.slice(0,5)}</p></div>) : <p className="text-center py-8 text-muted-foreground">No lectures scheduled today.</p>}</CardContent></Card>
      <Card><CardHeader><CardTitle>Recent Announcements</CardTitle></CardHeader><CardContent className="space-y-3">{notices.length ? notices.map(item => <div key={item.id} className="border-b pb-3 last:border-0"><p className="font-semibold">{item.title}</p><p className="text-sm text-muted-foreground">{item.body}</p></div>) : <p className="text-center py-8 text-muted-foreground">No new announcements.</p>}</CardContent></Card>
    </div>
  </div>;
}
