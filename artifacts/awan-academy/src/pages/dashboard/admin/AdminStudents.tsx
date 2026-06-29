import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Class, Student } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAdminCreateUser } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, Plus, Search, UserX } from 'lucide-react';

type StudentForm = {
  fullName: string; email: string; password: string; admissionNo: string; fatherName: string;
  phone: string; gender: string; classId: string; status: string;
};
const emptyForm: StudentForm = { fullName: '', email: '', password: '', admissionNo: '', fatherName: '', phone: '', gender: 'male', classId: '', status: 'active' };

export function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const createUser = useAdminCreateUser();
  const { toast } = useToast();

  async function load() {
    setLoading(true);
    const [studentResult, classResult] = await Promise.all([
      supabase.from('students').select('*, classes(name), batches(name)').order('created_at', { ascending: false }),
      supabase.from('classes').select('*').order('name'),
    ]);
    if (studentResult.error) toast({ variant: 'destructive', title: 'Could not load students', description: studentResult.error.message });
    else setStudents(studentResult.data ?? []);
    setClasses(classResult.data ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  function openCreate() { setEditing(null); setForm(emptyForm); setDialogOpen(true); }
  function openEdit(student: Student) {
    setEditing(student);
    setForm({
      fullName: student.full_name, email: '', password: '', admissionNo: student.admission_no,
      fatherName: student.father_name ?? '', phone: student.guardian_phone ?? '', gender: student.gender ?? 'male',
      classId: student.class_id ?? '', status: student.status,
    });
    setDialogOpen(true);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!form.fullName || !form.admissionNo || !form.classId) {
      toast({ variant: 'destructive', title: 'Name, admission number, and class are required.' }); return;
    }
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from('students').update({
        full_name: form.fullName, admission_no: form.admissionNo, father_name: form.fatherName || null,
        guardian_phone: form.phone || null, gender: form.gender, class_id: form.classId, status: form.status,
      }).eq('id', editing.id);
      if (!error && editing.profile_id) await supabase.from('profiles').update({ full_name: form.fullName, status: form.status === 'active' ? 'active' : 'inactive' }).eq('id', editing.profile_id);
      setSaving(false);
      if (error) { toast({ variant: 'destructive', title: 'Update failed', description: error.message }); return; }
    } else {
      if (!form.email || form.password.length < 8) {
        setSaving(false); toast({ variant: 'destructive', title: 'Email and an 8-character password are required.' }); return;
      }
      try {
        const created = await createUser.mutateAsync({ data: { email: form.email, password: form.password, fullName: form.fullName, role: 'student', phone: form.phone || null } });
        const { error } = await supabase.from('students').insert({
          profile_id: created.userId, admission_no: form.admissionNo, full_name: form.fullName,
          father_name: form.fatherName || null, guardian_phone: form.phone || null, gender: form.gender,
          class_id: form.classId, status: 'active',
        });
        if (error) throw error;
      } catch (error: any) {
        setSaving(false); toast({ variant: 'destructive', title: 'Student creation failed', description: error.message }); return;
      }
      setSaving(false);
    }
    toast({ title: editing ? 'Student updated' : 'Student account created' });
    setDialogOpen(false); await load();
  }

  async function deactivate(student: Student) {
    if (!window.confirm(`Deactivate ${student.full_name}?`)) return;
    const { error } = await supabase.from('students').update({ status: 'inactive' }).eq('id', student.id);
    if (!error && student.profile_id) await supabase.from('profiles').update({ status: 'inactive' }).eq('id', student.profile_id);
    if (error) toast({ variant: 'destructive', title: 'Could not deactivate', description: error.message });
    else { toast({ title: 'Student deactivated' }); await load(); }
  }

  const visible = students.filter(student => `${student.full_name} ${student.admission_no}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between gap-3"><div><h1 className="text-3xl font-serif font-bold">Students</h1><p className="text-muted-foreground">Create portal accounts and assign students to classes.</p></div><Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Student</Button></div>
    <div className="bg-card border rounded-lg overflow-x-auto">
      <div className="p-4 border-b relative max-w-sm"><Search className="absolute left-7 top-7 h-4 w-4 text-muted-foreground" /><Input className="pl-9" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…" /></div>
      <Table><TableHeader><TableRow><TableHead>Admission</TableHead><TableHead>Name</TableHead><TableHead>Father</TableHead><TableHead>Class</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
      <TableBody>{loading ? <TableRow><TableCell colSpan={6} className="text-center py-10">Loading…</TableCell></TableRow> : visible.map(student => <TableRow key={student.id}>
        <TableCell className="font-mono">{student.admission_no}</TableCell><TableCell className="font-semibold">{student.full_name}</TableCell><TableCell>{student.father_name || '—'}</TableCell><TableCell>{student.classes?.name || 'Unassigned'}</TableCell><TableCell><Badge variant={student.status === 'active' ? 'default' : 'secondary'}>{student.status}</Badge></TableCell>
        <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => openEdit(student)}><Edit2 className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => void deactivate(student)}><UserX className="h-4 w-4 text-destructive" /></Button></TableCell>
      </TableRow>)}</TableBody></Table>
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing ? 'Edit Student' : 'Create Student Portal Account'}</DialogTitle></DialogHeader>
      <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name *"><Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></Field>
        <Field label="Admission number *"><Input value={form.admissionNo} onChange={e => setForm({ ...form, admissionNo: e.target.value })} /></Field>
        {!editing && <><Field label="Login email *"><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field><Field label="Temporary password *"><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></Field></>}
        <Field label="Father / guardian"><Input value={form.fatherName} onChange={e => setForm({ ...form, fatherName: e.target.value })} /></Field><Field label="Guardian phone"><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="Class *"><Picker value={form.classId} onChange={classId => setForm({ ...form, classId })} options={classes.map(item => ({ value: item.id, label: item.name }))} /></Field>
        <Field label="Gender"><Picker value={form.gender} onChange={gender => setForm({ ...form, gender })} options={[{value:'male',label:'Male'},{value:'female',label:'Female'},{value:'other',label:'Other'}]} /></Field>
        {editing && <Field label="Status"><Picker value={form.status} onChange={status => setForm({ ...form, status })} options={[{value:'active',label:'Active'},{value:'inactive',label:'Inactive'},{value:'graduated',label:'Graduated'}]} /></Field>}
        <div className="sm:col-span-2 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button disabled={saving || createUser.isPending}>{saving ? 'Saving…' : 'Save Student'}</Button></div>
      </form>
    </DialogContent></Dialog>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-2"><Label>{label}</Label>{children}</div>; }
function Picker({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: {value:string;label:string}[] }) { return <Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger><SelectContent>{options.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>; }
