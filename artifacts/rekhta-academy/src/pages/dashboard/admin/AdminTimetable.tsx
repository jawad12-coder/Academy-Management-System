import { CrudPage, type CrudColumn, type CrudField } from '@/components/admin/CrudPage';
const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(value => ({ value, label: value }));
const columns: CrudColumn[] = [{ key: 'day_of_week', label: 'Day' }, { key: 'classes.name', label: 'Class' }, { key: 'subjects.name', label: 'Subject' }, { key: 'teachers.full_name', label: 'Teacher' }, { key: 'start_time', label: 'Starts' }, { key: 'end_time', label: 'Ends' }];
const fields: CrudField[] = [
  { key: 'day_of_week', label: 'Day', type: 'select', required: true, options: days },
  { key: 'class_id', label: 'Class', type: 'select', required: true, relation: { table: 'classes', label: 'name' } },
  { key: 'subject_id', label: 'Subject', type: 'select', relation: { table: 'subjects', label: 'name' } },
  { key: 'teacher_id', label: 'Teacher', type: 'select', relation: { table: 'teachers', label: 'full_name' } },
  { key: 'batch_id', label: 'Batch', type: 'select', relation: { table: 'batches', label: 'name' } },
  { key: 'start_time', label: 'Start time (HH:MM)', required: true, placeholder: '16:00' },
  { key: 'end_time', label: 'End time (HH:MM)', required: true, placeholder: '17:00' },
];
export function AdminTimetable() { return <CrudPage title="Timetable" description="Schedule teacher lectures for each class." table="timetable" select="*, classes(name), subjects(name), teachers(full_name), batches(name)" columns={columns} fields={fields} orderBy="day_of_week" />; }
