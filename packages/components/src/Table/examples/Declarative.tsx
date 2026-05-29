import { Badge, Table } from '@apx-ui/ds';
import type { TableColumn } from '@apx-ui/ds';

interface User {
  id: string;
  name: string;
  email: string;
  plan: 'Pro' | 'Free';
  signups: number;
}

const users: User[] = [
  { id: '1', name: 'Maya Singh', email: 'maya@example.com', plan: 'Pro', signups: 12 },
  { id: '2', name: 'Liam Cohen', email: 'liam@example.com', plan: 'Free', signups: 4 },
  { id: '3', name: 'Ava Goldberg', email: 'ava@example.com', plan: 'Pro', signups: 18 },
];

const columns: TableColumn<User>[] = [
  { id: 'name', header: 'Name', accessor: (u) => u.name },
  { id: 'email', header: 'Email', accessor: (u) => u.email },
  {
    id: 'plan',
    header: 'Plan',
    align: 'end',
    cell: (u) => <Badge color={u.plan === 'Pro' ? 'success' : 'neutral'}>{u.plan}</Badge>,
  },
  { id: 'signups', header: 'Signups', align: 'end', accessor: (u) => u.signups },
];

export default function Declarative() {
  return (
    <Table ariaLabel="Declarative users table" columns={columns} data={users} getRowId={(u) => u.id} />
  );
}
