import { CrudPage, type CrudColumn, type CrudField } from '@/components/admin/CrudPage';
const columns: CrudColumn[] = [
  { key: 'name', label: 'Class' }, { key: 'level', label: 'Level' }, { key: 'monthly_fee', label: 'Monthly Fee (PKR)' },
];
const fields: CrudField[] = [
  { key: 'name', label: 'Class name', required: true }, { key: 'level', label: 'Level' },
  { key: 'monthly_fee', label: 'Monthly fee', type: 'number' },
];
export function AdminClasses() { return <CrudPage title="Classes" description="Create classes and maintain their monthly fees." table="classes" columns={columns} fields={fields} orderBy="name" />; }
