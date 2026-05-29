import { useState } from 'react';
import { Table } from 'apx-ds';
import type { TableColumn } from 'apx-ds';

interface User {
  id: string;
  name: string;
  email: string;
}

const data: User[] = [
  { id: '1', name: 'Maya Singh', email: 'maya@example.com' },
  { id: '2', name: 'Liam Cohen', email: 'liam@example.com' },
  { id: '3', name: 'Ava Goldberg', email: 'ava@example.com' },
];

const columns: TableColumn<User>[] = [
  { id: 'name', header: 'Name', accessor: (u) => u.name },
  { id: 'email', header: 'Email', accessor: (u) => u.email },
];

export default function SingleSelect() {
  const [selected, setSelected] = useState<string>('2');
  return (
    <div className="flex flex-col gap-2">
      <p className="text-fg-muted text-sm">
        Single-select mode. Active row: <code>{selected || 'none'}</code>
      </p>
      <Table
        ariaLabel="Single-select"
        columns={columns}
        data={data}
        getRowId={(u) => u.id}
        selectionMode="single"
        selected={selected}
        onSelectedChange={(next) => setSelected(next as string)}
      />
    </div>
  );
}
