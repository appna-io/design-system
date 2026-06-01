import { Badge, DataGrid } from '@apx-ui/ds';
import type { DataGridColumnDef } from '@apx-ui/ds';

interface Account {
  id: string;
  company: string;
  owner: string;
  tier: 'starter' | 'team' | 'enterprise';
  status: 'active' | 'trial' | 'churned';
  arr: number;
}

const accounts: Account[] = [
  { id: '1', company: 'Acme Corp', owner: 'Maya Singh', tier: 'enterprise', status: 'active', arr: 184_000 },
  { id: '2', company: 'Northwind', owner: 'Liam Cohen', tier: 'team', status: 'active', arr: 62_400 },
  { id: '3', company: 'Globex', owner: 'Ava Goldberg', tier: 'starter', status: 'trial', arr: 14_800 },
  { id: '4', company: 'Initech', owner: 'Noah Park', tier: 'team', status: 'active', arr: 48_900 },
  { id: '5', company: 'Umbrella', owner: 'Sara Bloom', tier: 'enterprise', status: 'churned', arr: 96_500 },
  { id: '6', company: 'Hooli', owner: 'Eitan Levi', tier: 'starter', status: 'trial', arr: 9_200 },
];

const tierColor: Record<Account['tier'], 'neutral' | 'info' | 'primary'> = {
  starter: 'neutral',
  team: 'info',
  enterprise: 'primary',
};

const statusColor: Record<Account['status'], 'success' | 'warning' | 'danger'> = {
  active: 'success',
  trial: 'warning',
  churned: 'danger',
};

const columns: DataGridColumnDef<Account>[] = [
  {
    id: 'company',
    header: 'Company',
    accessor: 'company',
    sortable: true,
    type: 'text',
    minWidth: 160,
  },
  {
    id: 'owner',
    header: 'Owner',
    accessor: 'owner',
    sortable: true,
    type: 'text',
  },
  {
    id: 'tier',
    header: 'Tier',
    accessor: 'tier',
    sortable: true,
    type: 'text',
    cell: ({ row }) => (
      <Badge color={tierColor[row.tier]} variant="soft">
        {row.tier}
      </Badge>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    sortable: true,
    type: 'text',
    cell: ({ row }) => (
      <Badge color={statusColor[row.status]} variant="outline" withDot>
        {row.status}
      </Badge>
    ),
  },
  {
    id: 'arr',
    header: 'ARR',
    accessor: 'arr',
    sortable: true,
    type: 'number',
    align: 'end',
    aggregations: ['sum', 'avg'],
    cell: ({ value }) => `$${(value as number).toLocaleString()}`,
  },
];

/**
 * Quick-review demo of `<DataGrid />`. Mounts the high-level component with a small,
 * realistic dataset so the value proposition is visible at a glance:
 *
 *  - Sortable headers (click "Company" / "ARR" to cycle)
 *  - Custom cell renderers — `tier` and `status` render `<Badge>`s
 *  - Number formatting + a sticky aggregations footer (sum, avg)
 *  - Built-in toolbar (global search + density + export) and pagination chrome
 *  - Multi-select column with a sticky bulk-action bar
 *
 * Every other example on this page drills into one of these axes.
 */
export default function Overview() {
  return (
    <DataGrid<Account>
      data={accounts}
      columns={columns}
      getRowId={(a) => a.id}
      variant="striped"
      color="primary"
      size="standard"
      bordered
      roundedCorners="md"
      stickyHeader
      selectionMode="multiple"
      defaultSort={[{ id: 'arr', direction: 'desc' }]}
    />
  );
}