import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Homework } from '@/lib/supabase';
import { toast } from 'sonner';

type Assignment = { class_id: string; subject_id: string | null; classes: { name: string } | null; subjects: { name: string } | null };
export function TeacherHomework() {
  const { user } = useAuth();
  const [teacherId, setTeacherId] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', classId: '', subjectId: '' });
  const [saving, setSaving] = useState(false);

  async function loadHomework(id: string) {
    const { data, error } = await supabase.from('homework').select('*').eq('teacher_id', id).order('created_at', { ascending: false });
    if (error) toast.error(error.message); else setHomework(data ?? []);
  }
  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: teacher } = await supabase.from('teachers').select('id').eq('profile_id', user!.id).single();
      if (!teacher) return;
      setTeacherId(teacher.id);
      const { data } = await supabase.from('teacher_assignments').select('class_id,subject_id,classes(name),subjects(name)').eq('teacher_id', teacher.id);
      setAssignments((data ?? []) as unknown as Assignment[]);
      await loadHomework(teacher.id);
    }
    void load();
  }, [user]);

  async function add() {
    if (!teacherId || !form.title.trim() || !form.classId) { toast.error('Title and assigned class are required'); return; }
    setSaving(true);
    const { error } = await supabase.from('homework').insert({
      title: form.title, description: form.description || null, due_date: form.dueDate || null,
      class_id: form.classId, subject_id: form.subjectId || null, teacher_id: teacherId, is_published: false,
    });
    setSaving(false);
    if (error) toast.error(error.message); else { toast.success('Homework created'); setForm({ title: '', description: '', dueDate: '', classId: '', subjectId: '' }); await loadHomework(teacherId); }
  }
  async function toggle(hw: Homework) {
    const { error } = await supabase.from('homework').update({ is_published: !hw.is_published }).eq('id', hw.id);
    if (error) toast.error(error.message); else await loadHomework(teacherId);
  }
  const classOptions = Array.from(new Map(assignments.map(item => [item.class_id, item])).values());
  const subjectOptions = assignments.filter(item => item.class_id === form.classId && item.subject_id);
  return <div className="space-y-6"><div><h1 className="text-3xl font-serif font-bold">Homework</h1><p className="text-muted-foreground">Create homework for assigned classes and publish it to students and parents.</p></div>
    <Card><CardHeader><CardTitle>New Homework</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 gap-3">
      <Input placeholder="Title" value={form.title} onChange={e => setForm({...form,title:e.target.value})} />
      <Input type="date" value={form.dueDate} onChange={e => setForm({...form,dueDate:e.target.value})} />
      <Select value={form.classId} onValueChange={classId => setForm({...form,classId,subjectId:''})}><SelectTrigger><SelectValue placeholder="Assigned class" /></SelectTrigger><SelectContent>{classOptions.map(item => <SelectItem key={item.class_id} value={item.class_id}>{item.classes?.name}</SelectItem>)}</SelectContent></Select>
      <Select value={form.subjectId} onValueChange={subjectId => setForm({...form,subjectId})}><SelectTrigger><SelectValue placeholder="Assigned subject (optional)" /></SelectTrigger><SelectContent>{subjectOptions.map(item => <SelectItem key={item.subject_id!} value={item.subject_id!}>{item.subjects?.name}</SelectItem>)}</SelectContent></Select>
      <Textarea className="sm:col-span-2" placeholder="Instructions" value={form.description} onChange={e => setForm({...form,description:e.target.value})} />
      <div className="sm:col-span-2"><Button onClick={() => void add()} disabled={saving}>{saving ? 'Saving…' : 'Create Homework'}</Button></div>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>My Homework</CardTitle></CardHeader><CardContent>{homework.length === 0 ? <p className="text-center py-8 text-muted-foreground">No homework created.</p> : <div className="space-y-2">{homework.map(hw => <div key={hw.id} className="flex items-center justify-between border rounded p-3"><div><p className="font-medium">{hw.title}</p><p className="text-sm text-muted-foreground">{hw.due_date ? `Due ${hw.due_date}` : 'No due date'}</p></div><Button size="sm" variant={hw.is_published ? 'default' : 'outline'} onClick={() => void toggle(hw)}>{hw.is_published ? 'Published' : 'Publish'}</Button></div>)}</div>}</CardContent></Card>
  </div>;
}
