import { useState } from 'react';
import { Div, Table, Typography } from '@apx-ui/ds';
import type { TableColumn } from '@apx-ui/ds';

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
    <Div display="flex" flexDirection="column" gap="2">
      <Typography variant="bodySmall" color="fg.muted">
        Single-select mode. Active row: <code>{selected || 'none'}</code>
      </Typography>
      <Table
        ariaLabel="Single-select"
        columns={columns}
        data={data}
        getRowId={(u) => u.id}
        selectionMode="single"
        selected={selected}
        onSelectedChange={(next) => setSelected(next as string)}
      />
    </Div>
  );
}