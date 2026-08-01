import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Student } from '@/lib/supabase';
import { toast } from 'sonner';

type Assignment = { class_id: string; classes: { name: string } | null };
export function TeacherAttendance() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classId, setClassId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const statuses = ['present', 'absent', 'late', 'leave'] as const;

  useEffect(() => {
    if (!user) return;
    async function loadAssignments() {
      const { data: teacher } = await supabase.from('teachers').select('id').eq('profile_id', user!.id).single();
      if (!teacher) return;
      const { data, error } = await supabase.from('teacher_assignments').select('class_id,classes(name)').eq('teacher_id', teacher.id);
      if (error) { toast.error(error.message); return; }
      const unique = Array.from(new Map((data ?? []).map((item: any) => [item.class_id, item])).values()) as Assignment[];
      setAssignments(unique);
      if (unique.length === 1) setClassId(unique[0].class_id);
    }
    void loadAssignments();
  }, [user]);

  useEffect(() => {
    if (!classId) { setStudents([]); return; }
    async function loadStudentsAndAttendance() {
      const [{ data: studentRows, error }, { data: existing }] = await Promise.all([
        supabase.from('students').select('*').eq('class_id', classId).eq('status', 'active').order('full_name'),
        supabase.from('attendance').select('student_id,status').eq('class_id', classId).eq('date', date),
      ]);
      if (error) { toast.error(error.message); return; }
      setStudents(studentRows ?? []);
      const existingMap = Object.fromEntries((existing ?? []).map(row => [row.student_id, row.status]));
      setAttendance(Object.fromEntries((studentRows ?? []).map(student => [student.id, existingMap[student.id] ?? 'present'])));
    }
    void loadStudentsAndAttendance();
  }, [classId, date]);

  async function handleSave() {
    if (!user || !classId || students.length === 0) return;
    setSaving(true);
    const records = students.map(student => ({ student_id: student.id, class_id: classId, date, status: attendance[student.id] ?? 'present', marked_by: user.id }));
    const { error } = await supabase.from('attendance').upsert(records, { onConflict: 'student_id,date' });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success('Attendance saved');
  }

  return <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h1 className="text-3xl font-serif font-bold">Mark Attendance</h1><p className="text-muted-foreground">Only your assigned classes are available.</p></div><Button onClick={() => void handleSave()} disabled={saving || !classId || students.length === 0}>{saving ? 'Saving…' : 'Save Attendance'}</Button></div>
    <Card><CardHeader><CardTitle>Class and Date</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 gap-3">
      <Select value={classId} onValueChange={setClassId}><SelectTrigger><SelectValue placeholder="Select assigned class" /></SelectTrigger><SelectContent>{assignments.map(item => <SelectItem key={item.class_id} value={item.class_id}>{item.classes?.name ?? 'Class'}</SelectItem>)}</SelectContent></Select>
      <input type="date" value={date} onChange={event => setDate(event.target.value)} className="h-10 border rounded-md px-3 bg-background" />
    </CardContent></Card>
    <Card><CardContent className="pt-6">{!classId ? <p className="text-center py-10 text-muted-foreground">Select an assigned class.</p> : students.length === 0 ? <p className="text-center py-10 text-muted-foreground">No active students in this class.</p> : <div className="space-y-2">{students.map(student => <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border rounded"><span className="font-medium">{student.full_name}</span><div className="flex flex-wrap gap-2">{statuses.map(status => <Button key={status} type="button" size="sm" variant={attendance[student.id] === status ? 'default' : 'outline'} onClick={() => setAttendance(previous => ({ ...previous, [student.id]: status }))} className="capitalize">{status}</Button>)}</div></div>)}</div>}</CardContent></Card>
  </div>;
}
