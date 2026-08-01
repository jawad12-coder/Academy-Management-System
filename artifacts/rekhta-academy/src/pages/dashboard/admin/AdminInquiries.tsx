import { CrudPage, type CrudColumn, type CrudField } from '@/components/admin/CrudPage';
const columns: CrudColumn[] = [
  { key: 'student_name', label: 'Student' }, { key: 'guardian_name', label: 'Guardian' }, { key: 'phone', label: 'Phone' },
  { key: 'desired_class', label: 'Class' }, { key: 'status', label: 'Status' }, { key: 'created_at', label: 'Received' },
];
const fields: CrudField[] = [
  { key: 'student_name', label: 'Student', required: true }, { key: 'guardian_name', label: 'Guardian', required: true },
  { key: 'phone', label: 'Phone', required: true }, { key: 'desired_class', label: 'Desired class', required: true },
  { key: 'current_school', label: 'Current school' }, { key: 'message', label: 'Message', type: 'textarea' },
  { key: 'status', label: 'Status', type: 'select', required: true, options: [
    { value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' }, { value: 'admitted', label: 'Admitted' }, { value: 'rejected', label: 'Rejected' },
  ] }, { key: 'notes', label: 'Admin notes', type: 'textarea' },
];
export function AdminInquiries() { return <CrudPage title="Admission Inquiries" description="Track and update public admission requests." table="admission_inquiries" columns={columns} fields={fields} canCreate={false} />; }
