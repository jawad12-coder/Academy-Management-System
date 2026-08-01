import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import type { Exam, Student } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export function TeacherResults() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('exams').select('*').eq('is_published', false).then(({ data }) => {
      if (data) setExams(data);
    });
  }, []);

  useEffect(() => {
    if (!selectedExam?.class_id) return;
    Promise.all([
      supabase.from('students').select('*').eq('class_id', selectedExam.class_id).eq('status', 'active').order('full_name'),
      supabase.from('results').select('student_id,obtained_marks').eq('exam_id', selectedExam.id),
    ]).then(([studentResult, resultResult]) => {
      if (studentResult.data) setStudents(studentResult.data);
      setMarks(Object.fromEntries((resultResult.data ?? []).map(result => [result.student_id, String(result.obtained_marks ?? '')])));
    });
  }, [selectedExam]);

  const handleSave = async () => {
    if (!selectedExam || !user) return;
    const invalid = Object.values(marks).some(mark => mark !== '' && (Number(mark) < 0 || Number(mark) > Number(selectedExam.total_marks ?? Infinity)));
    if (invalid) { toast.error(`Marks must be between 0 and ${selectedExam.total_marks}`); return; }
    setSaving(true);
    const records = Object.entries(marks)
      .filter(([, m]) => m.trim() !== '')
      .map(([student_id, obtained_marks]) => ({
        exam_id: selectedExam.id,
        student_id,
        obtained_marks: Number(obtained_marks),
        entered_by: user.id,
        is_published: false,
      }));
    if (records.length) {
      const { error } = await supabase.from('results').upsert(records, { onConflict: 'exam_id,student_id' });
      if (error) toast.error('Failed to save results');
      else toast.success('Results saved');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold tracking-tight">Enter Results</h1>

      <Card>
        <CardHeader><CardTitle>Select Exam</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {exams.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No pending exams.</div>
            ) : exams.map(exam => (
              <Button
                key={exam.id}
                variant={selectedExam?.id === exam.id ? 'default' : 'outline'}
                onClick={() => setSelectedExam(exam)}
              >
                {exam.title} — Total: {exam.total_marks}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedExam && (
        <Card>
          <CardHeader>
            <CardTitle>Enter Marks — {selectedExam.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {students.map(s => (
              <div key={s.id} className="flex items-center gap-4">
                <span className="flex-1 font-medium">{s.full_name}</span>
                <Input
                  type="number"
                  className="w-32"
                  placeholder={`/ ${selectedExam.total_marks}`}
                  value={marks[s.id] ?? ''}
                  onChange={e => setMarks(prev => ({ ...prev, [s.id]: e.target.value }))}
                />
              </div>
            ))}
            {students.length === 0 && <p className="text-center py-6 text-muted-foreground">No active students in this exam's class.</p>}
            <Button onClick={handleSave} disabled={saving} className="mt-4">
              {saving ? 'Saving...' : 'Save Results'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
