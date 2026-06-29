import { CrudPage, type CrudColumn, type CrudField } from '@/components/admin/CrudPage';
const columns: CrudColumn[] = [
  { key: 'students.full_name', label: 'Student' }, { key: 'exams.title', label: 'Exam' }, { key: 'obtained_marks', label: 'Marks' },
  { key: 'grade', label: 'Grade' }, { key: 'is_published', label: 'Published', render: row => row.is_published ? 'Yes' : 'No' },
];
const fields: CrudField[] = [
  { key: 'exam_id', label: 'Exam', type: 'select', required: true, relation: { table: 'exams', label: 'title' } },
  { key: 'student_id', label: 'Student', type: 'select', required: true, relation: { table: 'students', label: 'full_name' } },
  { key: 'obtained_marks', label: 'Obtained marks', type: 'number', required: true }, { key: 'grade', label: 'Grade' }, { key: 'remarks', label: 'Remarks' },
  { key: 'is_published', label: 'Published', type: 'boolean', defaultValue: false },
];
export function AdminResults() { return <CrudPage title="Results" description="Enter, correct, and publish student results." table="results" select="*, students(full_name), exams(title)" columns={columns} fields={fields} />; }
