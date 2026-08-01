import { CrudPage, type CrudColumn, type CrudField } from '@/components/admin/CrudPage';
const columns: CrudColumn[] = [{ key: 'name', label: 'Batch' }, { key: 'classes.name', label: 'Class' }, { key: 'timing', label: 'Timing' }];
const fields: CrudField[] = [
  { key: 'name', label: 'Batch name', required: true },
  { key: 'class_id', label: 'Class', type: 'select', required: true, relation: { table: 'classes', label: 'name' } },
  { key: 'timing', label: 'Timing', placeholder: '4:00 PM - 5:00 PM' },
];
export function AdminBatches() { return <CrudPage title="Batches" description="Manage class groups and timings." table="batches" select="*, classes(name)" columns={columns} fields={fields} orderBy="name" />; }
