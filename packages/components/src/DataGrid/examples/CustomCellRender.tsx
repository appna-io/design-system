import { Avatar, Badge, DataGrid, Div, Typography } from '@apx-ui/ds';
import type { DataGridColumnDef } from '@apx-ui/ds';

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
      <Div display="flex" alignItems="center" gap="3">
        <Avatar src={row.avatarUrl} alt={row.name} size="sm" />
        <Div display="flex" flexDirection="column">
          <Typography as="span" variant="body" weight="medium" color="fg.default">
            {row.name}
          </Typography>
          <Typography as="span" variant="caption" color="fg.muted">
            {row.email}
          </Typography>
        </Div>
      </Div>
    ),
  },
  {
    id: 'role',
    header: 'Role',
    accessor: 'role',
    type: 'text',
    cell: ({ value }) => (
      <Typography as="span" variant="bodySmall" color="fg.default" transform="capitalize">
        {String(value)}
      </Typography>
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
    <Div display="flex" flexDirection="column" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        Columns can opt out of the default text renderer with a <code>cell</code> function
        that receives <code>{'{ value, row, column, rowIndex, columnIndex }'}</code> and returns
        any React tree.
      </Typography>
      <DataGrid<Member> data={members} columns={columns} getRowId={(m) => m.id} />
    </Div>
  );
}