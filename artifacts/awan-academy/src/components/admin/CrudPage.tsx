import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Edit2, Plus, RefreshCw, Trash2 } from 'lucide-react';

export type CrudOption = { value: string; label: string };

export type CrudField = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'boolean';
  required?: boolean;
  placeholder?: string;
  options?: CrudOption[];
  relation?: { table: string; value?: string; label: string };
  defaultValue?: unknown;
};

export type CrudColumn = {
  key: string;
  label: string;
  render?: (row: Record<string, any>) => React.ReactNode;
};

interface CrudPageProps {
  title: string;
  description?: string;
  table: string;
  select?: string;
  columns: CrudColumn[];
  fields: CrudField[];
  orderBy?: string;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  emptyText?: string;
  normalize?: (values: Record<string, any>, editing: Record<string, any> | null) => Record<string, any>;
}

function initialValues(fields: CrudField[]) {
  return Object.fromEntries(fields.map((field) => [field.key, field.defaultValue ?? (field.type === 'boolean' ? false : '')]));
}

function nestedValue(row: Record<string, any>, path: string): unknown {
  return path.split('.').reduce((value: any, key) => value?.[key], row);
}

export function CrudPage({
  title,
  description,
  table,
  select = '*',
  columns,
  fields,
  orderBy = 'created_at',
  canCreate = true,
  canEdit = true,
  canDelete = true,
  emptyText = 'No records found.',
  normalize,
}: CrudPageProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [values, setValues] = useState<Record<string, any>>(() => initialValues(fields));
  const [relationOptions, setRelationOptions] = useState<Record<string, CrudOption[]>>({});

  const relationFields = useMemo(() => fields.filter((field) => field.relation), [fields]);

  async function load() {
    setLoading(true);
    let query = supabase.from(table).select(select);
    if (orderBy) query = query.order(orderBy, { ascending: false });
    const { data, error } = await query;
    if (error) toast({ variant: 'destructive', title: `Could not load ${title}`, description: error.message });
    else setRows((data ?? []) as Record<string, any>[]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, [table]);

  useEffect(() => {
    async function loadRelations() {
      const loaded: Record<string, CrudOption[]> = {};
      await Promise.all(relationFields.map(async (field) => {
        const relation = field.relation!;
        const valueKey = relation.value ?? 'id';
        const { data } = await supabase.from(relation.table).select(`${valueKey},${relation.label}`).order(relation.label);
        loaded[field.key] = (data ?? []).map((row: any) => ({
          value: String(row[valueKey]),
          label: String(row[relation.label]),
        }));
      }));
      setRelationOptions(loaded);
    }
    void loadRelations();
  }, [relationFields]);

  function openCreate() {
    setEditing(null);
    setValues(initialValues(fields));
    setDialogOpen(true);
  }

  function openEdit(row: Record<string, any>) {
    setEditing(row);
    setValues(Object.fromEntries(fields.map((field) => [field.key, row[field.key] ?? field.defaultValue ?? ''])));
    setDialogOpen(true);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    for (const field of fields) {
      if (field.required && (values[field.key] === '' || values[field.key] == null)) {
        toast({ variant: 'destructive', title: `${field.label} is required` });
        return;
      }
    }

    setSaving(true);
    let payload = Object.fromEntries(fields.map((field) => {
      let value = values[field.key];
      if (value === '') value = null;
      if (field.type === 'number' && value != null) value = Number(value);
      return [field.key, value];
    }));
    if (normalize) payload = normalize(payload, editing);

    const result = editing
      ? await supabase.from(table).update(payload).eq('id', editing.id)
      : await supabase.from(table).insert(payload);
    setSaving(false);
    if (result.error) {
      toast({ variant: 'destructive', title: 'Save failed', description: result.error.message });
      return;
    }
    toast({ title: editing ? 'Record updated' : 'Record created' });
    setDialogOpen(false);
    await load();
  }

  async function remove(row: Record<string, any>) {
    if (!window.confirm('Delete this record permanently?')) return;
    const { error } = await supabase.from(table).delete().eq('id', row.id);
    if (error) toast({ variant: 'destructive', title: 'Delete failed', description: error.message });
    else {
      toast({ title: 'Record deleted' });
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void load()}><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button>
          {canCreate && <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add</Button>}
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            {columns.map((column) => <TableHead key={column.key}>{column.label}</TableHead>)}
            {(canEdit || canDelete) && <TableHead className="text-right">Actions</TableHead>}
          </TableRow></TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={columns.length + 1} className="text-center py-10">Loading…</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length + 1} className="text-center py-10 text-muted-foreground">{emptyText}</TableCell></TableRow>
            ) : rows.map((row) => (
              <TableRow key={row.id}>
                {columns.map((column) => <TableCell key={column.key}>
                  {column.render ? column.render(row) : String(nestedValue(row, column.key) ?? '—')}
                </TableCell>)}
                {(canEdit || canDelete) && <TableCell className="text-right whitespace-nowrap">
                  {canEdit && <Button variant="ghost" size="icon" onClick={() => openEdit(row)}><Edit2 className="h-4 w-4" /></Button>}
                  {canDelete && <Button variant="ghost" size="icon" onClick={() => void remove(row)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                </TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? `Edit ${title}` : `Add ${title}`}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
            {fields.map((field) => {
              const options = field.options ?? relationOptions[field.key] ?? [];
              return <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2 space-y-2' : 'space-y-2'}>
                <Label htmlFor={`${table}-${field.key}`}>{field.label}{field.required ? ' *' : ''}</Label>
                {field.type === 'textarea' ? (
                  <Textarea id={`${table}-${field.key}`} value={values[field.key] ?? ''} onChange={(e) => setValues({ ...values, [field.key]: e.target.value })} placeholder={field.placeholder} />
                ) : field.type === 'select' ? (
                  <Select value={String(values[field.key] ?? '')} onValueChange={(value) => setValues({ ...values, [field.key]: value })}>
                    <SelectTrigger><SelectValue placeholder={`Select ${field.label.toLowerCase()}`} /></SelectTrigger>
                    <SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                  </Select>
                ) : field.type === 'boolean' ? (
                  <label className="h-10 flex items-center gap-2 border rounded-md px-3">
                    <input type="checkbox" checked={Boolean(values[field.key])} onChange={(e) => setValues({ ...values, [field.key]: e.target.checked })} />
                    <Badge variant={values[field.key] ? 'default' : 'secondary'}>{values[field.key] ? 'Yes' : 'No'}</Badge>
                  </label>
                ) : (
                  <Input id={`${table}-${field.key}`} type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} value={values[field.key] ?? ''} onChange={(e) => setValues({ ...values, [field.key]: e.target.value })} placeholder={field.placeholder} />
                )}
              </div>;
            })}
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
