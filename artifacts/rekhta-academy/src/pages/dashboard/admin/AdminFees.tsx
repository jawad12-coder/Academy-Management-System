import { CrudPage, type CrudColumn, type CrudField } from '@/components/admin/CrudPage';
const columns: CrudColumn[] = [
  { key: 'students.full_name', label: 'Student' }, { key: 'month', label: 'Month' }, { key: 'year', label: 'Year' },
  { key: 'amount', label: 'Amount' }, { key: 'paid_amount', label: 'Paid' }, { key: 'status', label: 'Status' },
];
const fields: CrudField[] = [
  { key: 'student_id', label: 'Student', type: 'select', required: true, relation: { table: 'students', label: 'full_name' } },
  { key: 'month', label: 'Month (01–12)', required: true, placeholder: '06' },
  { key: 'year', label: 'Year', type: 'number', required: true, defaultValue: new Date().getFullYear() },
  { key: 'amount', label: 'Amount', type: 'number', required: true }, { key: 'paid_amount', label: 'Paid amount', type: 'number', defaultValue: 0 },
  { key: 'status', label: 'Status', type: 'select', required: true, defaultValue: 'unpaid', options: [
    { value: 'unpaid', label: 'Unpaid' }, { value: 'partial', label: 'Partial' }, { value: 'paid', label: 'Paid' },
  ] },
  { key: 'due_date', label: 'Due date', type: 'date' }, { key: 'payment_method', label: 'Payment method' },
  { key: 'receipt_no', label: 'Receipt number' }, { key: 'notes', label: 'Notes', type: 'textarea' },
];
export function AdminFees() { return <CrudPage title="Fees" description="Create fee records and record payments." table="fee_records" select="*, students(full_name)" columns={columns} fields={fields} />; }
