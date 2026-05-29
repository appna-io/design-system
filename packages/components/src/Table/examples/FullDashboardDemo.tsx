import { useState } from 'react';
import { Avatar, Badge, Button, Table } from 'apx-ds';
import type { TableColumn, TableSortState } from 'apx-ds';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  plan: 'Pro' | 'Free';
  joined: string;
  active: boolean;
}

const seed: Member[] = [
  { id: '1', name: 'Maya Singh', email: 'maya@example.com', role: 'Admin', plan: 'Pro', joined: '2024-06-12', active: true },
  { id: '2', name: 'Liam Cohen', email: 'liam@example.com', role: 'Editor', plan: 'Free', joined: '2023-11-03', active: true },
  { id: '3', name: 'Ava Goldberg', email: 'ava@example.com', role: 'Viewer', plan: 'Pro', joined: '2025-02-19', active: false },
  { id: '4', name: 'Noah Adler', email: 'noah@example.com', role: 'Editor', plan: 'Pro', joined: '2022-08-30', active: true },
  { id: '5', name: 'Tal Bar', email: 'tal@example.com', role: 'Admin', plan: 'Free', joined: '2024-01-15', active: true },
];

const columns: TableColumn<Member>[] = [
  {
    id: 'name',
    header: 'Member',
    accessor: (m) => m.name,
    sortable: true,
    cell: (m) => (
      <div className="flex items-center gap-2">
        <Avatar size="sm" name={m.name} />
        <div className="flex flex-col">
          <span className="font-medium">{m.name}</span>
          <span className="text-fg-muted text-xs">{m.email}</span>
        </div>
      </div>
    ),
  },
  { id: 'role', header: 'Role', accessor: (m) => m.role, sortable: true },
  {
    id: 'plan',
    header: 'Plan',
    accessor: (m) => m.plan,
    cell: (m) => <Badge color={m.plan === 'Pro' ? 'success' : 'neutral'}>{m.plan}</Badge>,
    sortable: true,
  },
  { id: 'joined', header: 'Joined', accessor: (m) => m.joined, sortable: true, sortFn: 'date', align: 'end' },
];

export default function FullDashboardDemo() {
  const [sort, setSort] = useState<TableSortState | undefined>({ id: 'name', direction: 'asc' });
  const [selected, setSelected] = useState<string[]>([]);
  const [members, setMembers] = useState(seed);
  const [lastAction, setLastAction] = useState<string>('none');

  return (
    <div className="flex flex-col gap-3">
      <div className="text-fg-muted flex items-center justify-between text-sm">
        <span>
          Selected: <code>{selected.length}</code>
        </span>
        <span>
          Last action: <code>{lastAction}</code>
        </span>
      </div>
      <Table
        ariaLabel="Team members dashboard"
        variant="card"
        columns={columns}
        data={members}
        getRowId={(m) => m.id}
        sort={sort}
        onSortChange={setSort}
        selectionMode="multiple"
        selected={selected}
        onSelectedChange={(next) => setSelected(next as string[])}
        isRowSelectable={(m) => m.active}
        rowActions={(m) => (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => setLastAction(`Edit ${m.name}`)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              color="danger"
              onClick={() => {
                setMembers((prev) => prev.filter((row) => row.id !== m.id));
                setLastAction(`Removed ${m.name}`);
              }}
            >
              Remove
            </Button>
          </div>
        )}
      />
    </div>
  );
}
