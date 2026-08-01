import { CrudPage, type CrudColumn, type CrudField } from '@/components/admin/CrudPage';
const columns: CrudColumn[] = [{ key: 'name', label: 'Subject' }, { key: 'classes.name', label: 'Class' }];
const fields: CrudField[] = [
  { key: 'name', label: 'Subject name', required: true },
  { key: 'class_id', label: 'Class', type: 'select', relation: { table: 'classes', label: 'name' } },
];
export function AdminSubjects() { return <CrudPage title="Subjects" description="Create subjects and attach them to classes." table="subjects" select="*, classes(name)" columns={columns} fields={fields} />; }
