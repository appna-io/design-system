import { Avatar, Badge, DataGrid } from 'apx-ds';
import type { DataGridColumnDef } from 'apx-ds';

interface Member {
  id: string;
  avatarUrl: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'invited' | 'suspended';
  plan: 'free' | 'pro' | 'enterprise';
}

const members: Member[] = [
  { id: '1', avatarUrl: 'https://i.pravatar.cc/64?img=12', name: 'Maya Singh', email: 'maya@example.com', role: 'admin', status: 'active', plan: 'enterprise' },
  { id: '2', avatarUrl: 'https://i.pravatar.cc/64?img=24', name: 'Liam Cohen', email: 'liam@example.com', role: 'editor', status: 'active', plan: 'pro' },
  { id: '3', avatarUrl: 'https://i.pravatar.cc/64?img=33', name: 'Ava Goldberg', email: 'ava@example.com', role: 'viewer', status: 'invited', plan: 'free' },
  { id: '4', avatarUrl: 'https://i.pravatar.cc/64?img=47', name: 'Noah Park', email: 'noah@example.com', role: 'editor', status: 'suspended', plan: 'pro' },
];

const statusColor: Record<Member['status'], 'success' | 'warning' | 'danger'> = {
  active: 'success',
  invited: 'warning',
  suspended: 'danger',
};

const planColor: Record<Member['plan'], 'neutral' | 'info' | 'primary'> = {
  free: 'neutral',
  pro: 'info',
  enterprise: 'primary',
};

const columns: DataGridColumnDef<Member>[] = [
  {
    id: 'identity',
    header: 'Member',
    accessor: 'name',
    sortable: true,
    type: 'text',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar src={row.avatarUrl} alt={row.name} size="sm" />
        <div className="flex flex-col">
          <span className="text-fg-default font-medium">{row.name}</span>
          <span className="text-fg-muted text-xs">{row.email}</span>
        </div>
      </div>
    ),
  },
  {
    id: 'role',
    header: 'Role',
    accessor: 'role',
    type: 'text',
    cell: ({ value }) => (
      <span className="text-fg-default text-sm capitalize">{String(value)}</span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    type: 'text',
    cell: ({ row }) => (
      <Badge color={statusColor[row.status]} variant="soft">
        {row.status}
      </Badge>
    ),
  },
  {
    id: 'plan',
    header: 'Plan',
    accessor: 'plan',
    type: 'text',
    cell: ({ row }) => (
      <Badge color={planColor[row.plan]} variant="outline">
        {row.plan}
      </Badge>
    ),
  },
];

/**
 * Demonstrates per-column `cell` renderers — each column can project the row into
 * any React tree. Sort + filter + selection still operate on the underlying
 * accessor value, so the custom render is purely cosmetic.
 */
export default function CustomCellRender() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-fg-muted text-sm">
        Columns can opt out of the default text renderer with a <code>cell</code> function
        that receives <code>{'{ value, row, column, rowIndex, columnIndex }'}</code> and returns
        any React tree.
      </p>
      <DataGrid<Member> data={members} columns={columns} getRowId={(m) => m.id} />
    </div>
  );
}
