import { CrudPage, type CrudColumn, type CrudField } from '@/components/admin/CrudPage';
const statuses = ['present', 'absent', 'late', 'leave'].map(value => ({ value, label: value[0].toUpperCase() + value.slice(1) }));
const columns: CrudColumn[] = [
  { key: 'date', label: 'Date' }, { key: 'students.full_name', label: 'Student' },
  { key: 'classes.name', label: 'Class' }, { key: 'status', label: 'Status' }, { key: 'remarks', label: 'Remarks' },
];
const fields: CrudField[] = [
  { key: 'student_id', label: 'Student', type: 'select', required: true, relation: { table: 'students', label: 'full_name' } },
  { key: 'class_id', label: 'Class', type: 'select', relation: { table: 'classes', label: 'name' } },
  { key: 'date', label: 'Date', type: 'date', required: true },
  { key: 'status', label: 'Status', type: 'select', required: true, options: statuses, defaultValue: 'present' },
  { key: 'remarks', label: 'Remarks' },
];
export function AdminAttendance() { return <CrudPage title="Attendance" description="Mark or correct student attendance." table="attendance" select="*, students(full_name), classes(name)" columns={columns} fields={fields} orderBy="date" />; }
