import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Teacher } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { customFetch } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link2, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const teacherSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  qualification: z.string().optional(),
  subjects: z.string().min(2, "Enter subjects separated by commas"),
  bio: z.string().optional(),
  photoUrl: z.string().url('Enter a valid image URL').or(z.literal('')).optional(),
});

export function AdminTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [assigning, setAssigning] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string; class_id: string | null }[]>([]);
  const [assignments, setAssignments] = useState<Record<string, any[]>>({});
  const [assignment, setAssignment] = useState({ classId: '', subjectId: '' });
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof teacherSchema>>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { fullName: "", email: "", password: "", phone: "", qualification: "", subjects: "", bio: "", photoUrl: "" },
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    const [{ data, error }, classResult, subjectResult, assignmentResult] = await Promise.all([
      supabase.from('teachers').select('*').order('full_name'),
      supabase.from('classes').select('id,name').order('name'),
      supabase.from('subjects').select('id,name,class_id').order('name'),
      supabase.from('teacher_assignments').select('id,teacher_id,class_id,subject_id,classes(name),subjects(name)'),
    ]);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      setTeachers(data || []);
    }
    setClasses(classResult.data ?? []);
    setSubjects(subjectResult.data ?? []);
    const grouped: Record<string, any[]> = {};
    for (const item of assignmentResult.data ?? []) (grouped[item.teacher_id] ??= []).push(item);
    setAssignments(grouped);
    setLoading(false);
  };

  const addAssignment = async () => {
    if (!assigning || !assignment.classId) return;
    const duplicate = (assignments[assigning.id] ?? []).some(item => item.class_id === assignment.classId && (item.subject_id ?? '') === assignment.subjectId);
    if (duplicate) { toast({ variant: 'destructive', title: 'This assignment already exists.' }); return; }
    const { error } = await supabase.from('teacher_assignments').insert({ teacher_id: assigning.id, class_id: assignment.classId, subject_id: assignment.subjectId || null });
    if (error) toast({ variant: 'destructive', title: 'Assignment failed', description: error.message });
    else { toast({ title: 'Teacher assigned' }); setAssignment({ classId: '', subjectId: '' }); await fetchTeachers(); }
  };

  const removeAssignment = async (id: string) => {
    const { error } = await supabase.from('teacher_assignments').delete().eq('id', id);
    if (error) toast({ variant: 'destructive', title: 'Could not remove assignment', description: error.message });
    else await fetchTeachers();
  };

  const onSubmit = async (values: z.infer<typeof teacherSchema>) => {
    setCreating(true);
    try {
      await customFetch('/api/admin/create-user', {
        method: 'POST',
        responseType: 'json',
        body: JSON.stringify({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        role: 'teacher',
        phone: values.phone || null,
          qualification: values.qualification || null,
          subjects: values.subjects.split(',').map(s => s.trim()).filter(Boolean),
          bio: values.bio || null,
          photoUrl: values.photoUrl || null,
        }),
      });
      toast({ title: 'Success', description: 'Teacher and login account created.' });
      setIsDialogOpen(false);
      form.reset();
      await fetchTeachers();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Could not create teacher', description: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setCreating(false);
    }
  };

  const deleteTeacher = async (teacher: Teacher) => {
    if (!window.confirm(`Delete ${teacher.full_name} and their login account permanently?`)) return;
    setDeletingId(teacher.id);
    try {
      await customFetch(`/api/admin/teachers/${teacher.id}`, { method: 'DELETE', responseType: 'json' });
      toast({ title: 'Teacher account deleted' });
      await fetchTeachers();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Could not delete teacher', description: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Teachers</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Teacher</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Teacher Account</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email *</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Password *</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="qualification" render={({ field }) => (
                  <FormItem><FormLabel>Qualification</FormLabel><FormControl><Input placeholder="e.g. MSc Chemistry" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="subjects" render={({ field }) => (
                  <FormItem><FormLabel>Subjects *</FormLabel><FormControl><Input placeholder="Comma separated, e.g. English, Urdu" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="photoUrl" render={({ field }) => (
                  <FormItem><FormLabel>Photo URL</FormLabel><FormControl><Input type="url" placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem><FormLabel>Public Bio</FormLabel><FormControl><Input placeholder="Short teacher introduction" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={creating}>
                    {creating ? "Creating..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Assigned Classes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading teachers...</TableCell></TableRow>
            ) : teachers.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No teachers found.</TableCell></TableRow>
            ) : (
              teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-semibold text-accent">{teacher.full_name}</TableCell>
                  <TableCell>{teacher.phone || '-'}</TableCell>
                  <TableCell>{teacher.qualification || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects?.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell><div className="flex flex-wrap gap-1">{(assignments[teacher.id] ?? []).map(item => <Badge key={item.id} variant="outline">{item.classes?.name}{item.subjects?.name ? ` · ${item.subjects.name}` : ''}</Badge>)}</div></TableCell>
                  <TableCell>
                    <Badge variant={teacher.status === 'active' ? 'default' : 'outline'}>{teacher.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="outline" size="sm" onClick={() => setAssigning(teacher)}><Link2 className="h-4 w-4 mr-2" /> Assign</Button>
                    <Button variant="ghost" size="icon" className="ml-1" disabled={deletingId === teacher.id} onClick={() => void deleteTeacher(teacher)} aria-label={`Delete ${teacher.full_name}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={Boolean(assigning)} onOpenChange={open => !open && setAssigning(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>Assignments for {assigning?.full_name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {(assigning ? assignments[assigning.id] ?? [] : []).map(item => <div key={item.id} className="flex items-center justify-between border rounded-md p-3"><span>{item.classes?.name}{item.subjects?.name ? ` — ${item.subjects.name}` : ''}</span><Button variant="ghost" size="icon" onClick={() => void removeAssignment(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>)}
            <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t">
              <Select value={assignment.classId} onValueChange={classId => setAssignment({ classId, subjectId: '' })}><SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger><SelectContent>{classes.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select>
              <Select value={assignment.subjectId} onValueChange={subjectId => setAssignment({ ...assignment, subjectId })}><SelectTrigger><SelectValue placeholder="Subject (optional)" /></SelectTrigger><SelectContent>{subjects.filter(item => !assignment.classId || item.class_id === assignment.classId).map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="flex justify-end"><Button onClick={() => void addAssignment()} disabled={!assignment.classId}>Add Assignment</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
