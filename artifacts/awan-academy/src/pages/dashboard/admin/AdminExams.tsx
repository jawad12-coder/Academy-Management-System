import { CrudPage, type CrudColumn, type CrudField } from '@/components/admin/CrudPage';
const columns: CrudColumn[] = [
  { key: 'title', label: 'Exam' }, { key: 'classes.name', label: 'Class' }, { key: 'subjects.name', label: 'Subject' },
  { key: 'total_marks', label: 'Marks' }, { key: 'exam_date', label: 'Date' }, { key: 'is_published', label: 'Published', render: row => row.is_published ? 'Yes' : 'No' },
];
const fields: CrudField[] = [
  { key: 'title', label: 'Exam title', required: true }, { key: 'class_id', label: 'Class', type: 'select', required: true, relation: { table: 'classes', label: 'name' } },
  { key: 'subject_id', label: 'Subject', type: 'select', relation: { table: 'subjects', label: 'name' } }, { key: 'total_marks', label: 'Total marks', type: 'number', required: true },
  { key: 'exam_date', label: 'Exam date', type: 'date' }, { key: 'is_published', label: 'Published', type: 'boolean', defaultValue: false },
];
export function AdminExams() { return <CrudPage title="Exams" description="Schedule exams and control publication." table="exams" select="*, classes(name), subjects(name)" columns={columns} fields={fields} />; }
