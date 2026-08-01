import { CrudPage, type CrudColumn, type CrudField } from '@/components/admin/CrudPage';
const columns: CrudColumn[] = [
  { key: 'image_url', label: 'Image', render: row => <img src={row.image_url} alt={row.title || 'Gallery'} className="h-14 w-20 rounded object-cover" /> },
  { key: 'title', label: 'Title' }, { key: 'category', label: 'Category' }, { key: 'is_public', label: 'Public', render: row => row.is_public ? 'Yes' : 'No' },
];
const fields: CrudField[] = [
  { key: 'title', label: 'Title' }, { key: 'image_url', label: 'Image URL', required: true },
  { key: 'category', label: 'Category', required: true }, { key: 'is_public', label: 'Public', type: 'boolean', defaultValue: true },
];
export function AdminGallery() { return <CrudPage title="Gallery" description="Manage database-backed public gallery images." table="gallery" columns={columns} fields={fields} />; }
