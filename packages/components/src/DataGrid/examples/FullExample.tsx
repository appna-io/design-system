import { useMemo, useState } from 'react';

import { Badge, Button, DataGrid } from 'apx-ds';
import type {
  DataGridColumnDef,
  DataGridRowAction,
  DataGridSelectionIds,
} from 'apx-ds';

interface Account {
  id: string;
  company: string;
  contact: string;
  arr: number;
  tier: 'starter' | 'team' | 'enterprise';
  status: 'active' | 'trial' | 'churned';
  health: number;
  csm: string;
  renewsAt: string;
  notes: string;
}

const TIERS: Account['tier'][] = ['starter', 'team', 'enterprise'];
const STATUSES: Account['status'][] = ['active', 'trial', 'churned'];
const CSMS = ['Maya', 'Liam', 'Ava', 'Noah', 'Sara', 'Eitan'];

function build(): Account[] {
  return Array.from({ length: 240 }, (_, i) => ({
    id: `acc-${i + 1}`,
    company: `Company ${String(i + 1).padStart(3, '0')}`,
    contact: `contact${i + 1}@example.com`,
    arr: 5_000 + ((i * 1_337) % 245_000),
    tier: TIERS[i % TIERS.length] as Account['tier'],
    status: STATUSES[i % STATUSES.length] as Account['status'],
    health: (i * 17) % 100,
    csm: CSMS[i % CSMS.length] as string,
    renewsAt: new Date(2026, (i % 12), 1 + (i % 28)).toISOString().slice(0, 10),
    notes: i % 5 === 0 ? `Renewal call scheduled for week ${1 + (i % 4)}.` : '',
  }));
}

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

/**
 * The kitchen-sink demo. Every feature DataGrid ships is exercised in one place:
 *
 *  - Variant + color + density tokens
 *  - Multi-column sort + per-column filters + global search
 *  - Column visibility / resize / pinning / responsive hiding
 *  - Multi-select with bulk-action bar
 *  - Row actions (Edit / Archive / Delete)
 *  - Inline cell editing on the "notes" column
 *  - Row expansion with a custom detail panel
 *  - Aggregations footer (sum + avg)
 *  - Loading toggle, CSV/JSON export, persistent state across reloads
 *  - Sticky header + bordered + medium-rounded chrome
 */
export default function FullExample() {
  const [accounts, setAccounts] = useState<Account[]>(() => build());
  const [selected, setSelected] = useState<DataGridSelectionIds>(new Set());
  const [loading, setLoading] = useState(false);

  const columns: DataGridColumnDef<Account>[] = useMemo(
    () => [
      {
        id: 'company',
        header: 'Company',
        accessor: 'company',
        sortable: true,
        filterable: true,
        type: 'text',
        pinned: 'start',
        minWidth: 200,
      },
      {
        id: 'contact',
        header: 'Contact',
        accessor: 'contact',
        type: 'text',
        responsive: { hideBelow: 'md' },
      },
      {
        id: 'tier',
        header: 'Tier',
        accessor: 'tier',
        sortable: true,
        filterable: true,
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
        filterable: true,
        type: 'text',
        cell: ({ row }) => (
          <Badge color={statusColor[row.status]} variant="outline">
            {row.status}
          </Badge>
        ),
      },
      {
        id: 'arr',
        header: 'ARR',
        accessor: 'arr',
        sortable: true,
        filterable: true,
        type: 'number',
        align: 'end',
        aggregations: ['sum', 'avg'],
        cell: ({ value }) => `$${(value as number).toLocaleString()}`,
      },
      {
        id: 'health',
        header: 'Health',
        accessor: 'health',
        sortable: true,
        type: 'number',
        align: 'end',
        responsive: { hideBelow: 'lg' },
        cell: ({ value }) => `${value as number}%`,
      },
      {
        id: 'csm',
        header: 'CSM',
        accessor: 'csm',
        sortable: true,
        filterable: true,
        type: 'text',
        responsive: { hideBelow: 'lg' },
      },
      {
        id: 'renewsAt',
        header: 'Renews',
        accessor: 'renewsAt',
        sortable: true,
        type: 'date',
        responsive: { hideBelow: 'xl' },
      },
      {
        id: 'notes',
        header: 'Notes',
        accessor: 'notes',
        type: 'text',
        editable: true,
        responsive: { hideBelow: 'xl' },
        onCellEdit: (row, value) => {
          setAccounts((prev) =>
            prev.map((a) => (a.id === row.id ? { ...a, notes: String(value) } : a)),
          );
        },
      },
    ],
    [],
  );

  const rowActions = (row: Account): DataGridRowAction[] => [
    { id: 'edit', label: 'Edit', onSelect: () => console.info('edit', row.id) },
    { id: 'archive', label: 'Archive', onSelect: () => console.info('archive', row.id) },
    {
      id: 'delete',
      label: 'Delete',
      color: 'danger',
      onSelect: () =>
        setAccounts((prev) => prev.filter((a) => a.id !== row.id)),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-fg-muted text-sm">
          Kitchen-sink demo. Every DataGrid feature is on. State persists across reloads.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 800);
          }}
        >
          Toggle loading (800 ms)
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
          Clear selection
        </Button>
      </div>

      <DataGrid<Account>
        data={accounts}
        columns={columns}
        getRowId={(a) => a.id}
        variant="striped"
        color="primary"
        size="standard"
        stickyHeader
        bordered
        roundedCorners="md"
        elevation="sm"
        loading={loading}
        selectionMode="multiple"
        selectedRowIds={selected}
        onSelectionChange={setSelected}
        rowActions={rowActions}
        renderExpandedRow={(row) => (
          <div className="text-fg-muted bg-surface-muted/40 flex flex-col gap-1 p-3 text-sm">
            <div>
              <strong>{row.company}</strong> · {row.tier} · {row.status} · ARR $
              {row.arr.toLocaleString()}
            </div>
            <div>
              CSM <strong>{row.csm}</strong> · renews{' '}
              <strong>{row.renewsAt}</strong>
            </div>
            {row.notes ? <div>Notes: {row.notes}</div> : null}
          </div>
        )}
        defaultSort={[{ id: 'arr', direction: 'desc' }]}
        defaultPagination={{ pageIndex: 0, pageSize: 25 }}
        storage="local"
        storageKey="datagrid-full-example"
        exportable
        exportFilename="accounts"
        scrollerStyle={{ maxHeight: 560 }}
      >
        <Button color="danger" size="sm">
          Delete {selected.size}
        </Button>
        <Button size="sm">Bulk email</Button>
      </DataGrid>
    </div>
  );
}
