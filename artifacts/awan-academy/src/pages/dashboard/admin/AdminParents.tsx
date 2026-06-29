import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminCreateUser } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2, Plus, Unlink } from 'lucide-react';

type ParentRow = { id: string; profile_id: string; full_name: string; email: string | null; phone: string | null; student_parents?: { id: string; students: { id: string; full_name: string; admission_no: string } | null }[] };
type StudentOption = { id: string; full_name: string; admission_no: string };

export function AdminParents() {
  const [parents, setParents] = useState<ParentRow[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [linkParent, setLinkParent] = useState<ParentRow | null>(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const createUser = useAdminCreateUser();
  const { toast } = useToast();

  async function load() {
    const [parentResult, studentResult] = await Promise.all([
      supabase.from('parents').select('*, student_parents(id, students(id, full_name, admission_no))').order('full_name'),
      supabase.from('students').select('id,full_name,admission_no').eq('status', 'active').order('full_name'),
    ]);
    if (parentResult.error) toast({ variant: 'destructive', title: 'Could not load parents', description: parentResult.error.message });
    else setParents((parentResult.data ?? []) as unknown as ParentRow[]);
    setStudents(studentResult.data ?? []);
  }
  useEffect(() => { void load(); }, []);

  async function createParent(event: React.FormEvent) {
    event.preventDefault();
    if (!form.fullName || !form.email || form.password.length < 8) { toast({ variant: 'destructive', title: 'Name, email, and an 8-character password are required.' }); return; }
    try {
      const created = await createUser.mutateAsync({ data: { email: form.email, password: form.password, fullName: form.fullName, role: 'parent', phone: form.phone || null } });
      const { error } = await supabase.from('parents').insert({ profile_id: created.userId, full_name: form.fullName, email: form.email, phone: form.phone || null });
      if (error) throw error;
      toast({ title: 'Parent account created' }); setCreateOpen(false); setForm({ fullName: '', email: '', password: '', phone: '' }); await load();
    } catch (error: any) { toast({ variant: 'destructive', title: 'Creation failed', description: error.message }); }
  }

  async function linkChild() {
    if (!linkParent || !selectedStudent) return;
    const { error } = await supabase.from('student_parents').upsert({ parent_id: linkParent.id, student_id: selectedStudent, relation: 'guardian', is_primary: true }, { onConflict: 'student_id,parent_id' });
    if (error) toast({ variant: 'destructive', title: 'Link failed', description: error.message });
    else { toast({ title: 'Child linked to parent' }); setLinkParent(null); setSelectedStudent(''); await load(); }
  }

  async function unlink(id: string) {
    if (!window.confirm('Remove this parent/student link?')) return;
    const { error } = await supabase.from('student_parents').delete().eq('id', id);
    if (error) toast({ variant: 'destructive', title: 'Unlink failed', description: error.message }); else await load();
  }

  return <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between gap-3"><div><h1 className="text-3xl font-serif font-bold">Parents</h1><p className="text-muted-foreground">Create parent logins and link children.</p></div><Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Parent</Button></div>
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{parents.map(parent => <Card key={parent.id}><CardHeader><CardTitle className="text-lg">{parent.full_name}</CardTitle><p className="text-sm text-muted-foreground">{parent.email || 'No email'} · {parent.phone || 'No phone'}</p></CardHeader><CardContent className="space-y-3">
      <div className="flex flex-wrap gap-2">{parent.student_parents?.length ? parent.student_parents.map(link => <Badge key={link.id} variant="secondary" className="gap-1">{link.students?.full_name || 'Student'} <button onClick={() => void unlink(link.id)} aria-label="Unlink"><Unlink className="h-3 w-3" /></button></Badge>) : <span className="text-sm text-muted-foreground">No children linked</span>}</div>
      <Button variant="outline" size="sm" onClick={() => setLinkParent(parent)}><Link2 className="h-4 w-4 mr-2" /> Link Child</Button>
    </CardContent></Card>)}</div>

    <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent><DialogHeader><DialogTitle>Create Parent Portal Account</DialogTitle></DialogHeader><form onSubmit={createParent} className="space-y-4">
      <Field label="Full name"><Input value={form.fullName} onChange={e => setForm({...form,fullName:e.target.value})} /></Field><Field label="Email"><Input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} /></Field><Field label="Temporary password"><Input type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} /></Field><Field label="Phone"><Input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} /></Field>
      <div className="flex justify-end"><Button disabled={createUser.isPending}>{createUser.isPending ? 'Creating…' : 'Create Parent'}</Button></div>
    </form></DialogContent></Dialog>

    <Dialog open={Boolean(linkParent)} onOpenChange={open => !open && setLinkParent(null)}><DialogContent><DialogHeader><DialogTitle>Link child to {linkParent?.full_name}</DialogTitle></DialogHeader>
      <Select value={selectedStudent} onValueChange={setSelectedStudent}><SelectTrigger><SelectValue placeholder="Choose student" /></SelectTrigger><SelectContent>{students.map(student => <SelectItem key={student.id} value={student.id}>{student.full_name} ({student.admission_no})</SelectItem>)}</SelectContent></Select><div className="flex justify-end"><Button onClick={() => void linkChild()} disabled={!selectedStudent}>Link Child</Button></div>
    </DialogContent></Dialog>
  </div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-2"><Label>{label}</Label>{children}</div>; }
