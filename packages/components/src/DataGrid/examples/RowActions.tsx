import { Edit3, Trash2 } from 'lucide-react';
import { DataGrid } from 'apx-ds';
import type { DataGridColumnDef, DataGridRowAction } from 'apx-ds';

interface Document {
  id: string;
  title: string;
  owner: string;
  updatedAt: string;
}

const docs: Document[] = [
  { id: 'd-1', title: 'Quarterly review', owner: 'Maya Singh', updatedAt: '2 hours ago' },
  { id: 'd-2', title: 'Onboarding deck', owner: 'Liam Cohen', updatedAt: 'yesterday' },
  { id: 'd-3', title: 'Architecture notes', owner: 'Ava Goldberg', updatedAt: '3 days ago' },
];

const columns: DataGridColumnDef<Document>[] = [
  { id: 'title', header: 'Title', accessor: 'title', type: 'text', sortable: true },
  { id: 'owner', header: 'Owner', accessor: 'owner', type: 'text' },
  { id: 'updatedAt', header: 'Updated', accessor: 'updatedAt', type: 'text' },
];

/**
 * Passing a `rowActions` factory auto-appends a trailing actions column. Each row
 * renders a `<Menu>` trigger button; the menu items come from the factory's return
 * value. Items support `disabled`, `color: 'danger'`, and `leftIcon` for visual
 * emphasis.
 */
export default function RowActions() {
  const actions = (doc: Document): DataGridRowAction[] => [
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit3 aria-hidden className="size-4" />,
      onSelect: () => console.info('edit', doc.id),
    },
    {
      id: 'delete',
      label: 'Delete',
      color: 'danger',
      icon: <Trash2 aria-hidden className="size-4" />,
      onSelect: () => console.info('delete', doc.id),
    },
  ];

  return (
    <DataGrid<Document>
      data={docs}
      columns={columns}
      getRowId={(d) => d.id}
      rowActions={actions}
    />
  );
}
