import { useState } from 'react';
import { Table } from 'apx-ds';
import type { TableColumn } from 'apx-ds';
interface User {
  id: string;
  name: string;
  role: string;
  active: boolean;
}

const data: User[] = [
  { id: '1', name: 'Maya', role: 'Admin', active: true },
  { id: '2', name: 'Liam', role: 'Editor', active: true },
  { id: '3', name: 'Ava', role: 'Viewer', active: false },
  { id: '4', name: 'Noah', role: 'Editor', active: true },
];

const columns: TableColumn<User>[] = [
  { id: 'name', header: 'Name', accessor: (u) => u.name },
  { id: 'role', header: 'Role', accessor: (u) => u.role },
  {
    id: 'active',
    header: 'Status',
    align: 'end',
    cell: (u) => (
      <span className={u.active ? 'text-success' : 'text-fg-muted'}>
        {u.active ? 'Active' : 'Inactive'}
      </span>
    ),
  },
];

export default function MultiSelect() {
  const [selected, setSelected] = useState<string[]>(['1']);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-fg-muted text-sm">
        Inactive rows can&apos;t be selected. Selected ids: <code>{selected.join(', ') || 'none'}</code>
      </p>
      <Table
        ariaLabel="Multi-select users"
        columns={columns}
        data={data}
        getRowId={(u) => u.id}
        selectionMode="multiple"
        selected={selected}
        onSelectedChange={(next) => setSelected(next as string[])}
        isRowSelectable={(u) => u.active}
      />
    </div>
  );
}
