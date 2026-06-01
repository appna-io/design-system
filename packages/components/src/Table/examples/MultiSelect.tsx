import { useState } from 'react';
import { Div, Table, Typography } from '@apx-ui/ds';
import type { TableColumn } from '@apx-ui/ds';
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
      <Typography as="span" variant="bodySmall" className={u.active ? 'text-success' : 'text-fg-muted'}>
        {u.active ? 'Active' : 'Inactive'}
      </Typography>
    ),
  },
];

export default function MultiSelect() {
  const [selected, setSelected] = useState<string[]>(['1']);
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <Typography variant="bodySmall" color="fg.muted">
        Inactive rows can&apos;t be selected. Selected ids: <code>{selected.join(', ') || 'none'}</code>
      </Typography>
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
    </Div>
  );
}