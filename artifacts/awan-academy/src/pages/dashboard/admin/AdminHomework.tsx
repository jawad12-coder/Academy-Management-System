import { CrudPage, type CrudColumn, type CrudField } from '@/components/admin/CrudPage';
const columns: CrudColumn[] = [
  { key: 'title', label: 'Homework' }, { key: 'classes.name', label: 'Class' }, { key: 'subjects.name', label: 'Subject' },
  { key: 'due_date', label: 'Due' }, { key: 'is_published', label: 'Published', render: row => row.is_published ? 'Yes' : 'No' },
];
const fields: CrudField[] = [
  { key: 'title', label: 'Title', required: true }, { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'class_id', label: 'Class', type: 'select', required: true, relation: { table: 'classes', label: 'name' } },
  { key: 'subject_id', label: 'Subject', type: 'select', relation: { table: 'subjects', label: 'name' } },
  { key: 'teacher_id', label: 'Teacher', type: 'select', relation: { table: 'teachers', label: 'full_name' } },
  { key: 'due_date', label: 'Due date', type: 'date' }, { key: 'is_published', label: 'Published', type: 'boolean' },
];
export function AdminHomework() { return <CrudPage title="Homework" description="Create assignments for any class." table="homework" select="*, classes(name), subjects(name)" columns={columns} fields={fields} />; }
