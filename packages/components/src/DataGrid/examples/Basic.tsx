import { DataGrid } from 'apx-ds';
import type { DataGridColumnDef } from 'apx-ds';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  signups: number;
}

const users: User[] = [
  { id: '1', name: 'Maya Singh', email: 'maya@example.com', role: 'admin', signups: 128 },
  { id: '2', name: 'Liam Cohen', email: 'liam@example.com', role: 'editor', signups: 42 },
  { id: '3', name: 'Ava Goldberg', email: 'ava@example.com', role: 'viewer', signups: 18 },
  { id: '4', name: 'Noah Park', email: 'noah@example.com', role: 'editor', signups: 64 },
  { id: '5', name: 'Sara Bloom', email: 'sara@example.com', role: 'viewer', signups: 7 },
];

const columns: DataGridColumnDef<User>[] = [
  { id: 'name', header: 'Name', accessor: 'name', type: 'text' },
  { id: 'email', header: 'Email', accessor: 'email', type: 'text' },
  { id: 'role', header: 'Role', accessor: 'role', type: 'text' },
  { id: 'signups', header: 'Signups', accessor: 'signups', type: 'number', align: 'end' },
];

export default function Basic() {
  return <DataGrid<User> data={users} columns={columns} getRowId={(u) => u.id} />;
}
