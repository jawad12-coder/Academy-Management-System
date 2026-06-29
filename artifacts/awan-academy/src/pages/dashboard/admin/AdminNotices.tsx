import { CrudPage, type CrudColumn, type CrudField } from '@/components/admin/CrudPage';
const audiences = ['all','admins','teachers','parents','students','class'].map(value => ({ value, label: value[0].toUpperCase() + value.slice(1) }));
const columns: CrudColumn[] = [
  { key: 'title', label: 'Title' }, { key: 'audience', label: 'Audience' }, { key: 'classes.name', label: 'Class' },
  { key: 'is_published', label: 'Published', render: row => row.is_published ? 'Yes' : 'No' }, { key: 'created_at', label: 'Created' },
];
const fields: CrudField[] = [
  { key: 'title', label: 'Title', required: true }, { key: 'body', label: 'Notice', type: 'textarea', required: true },
  { key: 'audience', label: 'Audience', type: 'select', required: true, options: audiences, defaultValue: 'all' },
  { key: 'class_id', label: 'Class (when audience is class)', type: 'select', relation: { table: 'classes', label: 'name' } },
  { key: 'is_published', label: 'Published', type: 'boolean', defaultValue: true },
];
export function AdminNotices() { return <CrudPage title="Notices" description="Publish announcements to selected portal roles." table="notices" select="*, classes(name)" columns={columns} fields={fields} />; }
