import { DataGrid } from '@apx-ui/ds';
import type { DataGridColumnDef } from '@apx-ui/ds';

interface Person {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

const people: Person[] = [
  { id: '1', name: 'Maya Singh', email: 'maya@example.com', role: 'admin' },
  { id: '2', name: 'Liam Cohen', email: 'liam@example.com', role: 'editor' },
  { id: '3', name: 'Ava Goldberg', email: 'ava@example.com', role: 'viewer' },
  { id: '4', name: 'Noah Park', email: 'noah@example.com', role: 'editor' },
  { id: '5', name: 'Sara Bloom', email: 'sara@example.com', role: 'viewer' },
  { id: '6', name: 'Theo Vance', email: 'theo@example.com', role: 'admin' },
];

const columns: DataGridColumnDef<Person>[] = [
  { id: 'name', header: 'Name', accessor: 'name', type: 'text', filterable: true },
  { id: 'email', header: 'Email', accessor: 'email', type: 'text', filterable: true },
  { id: 'role', header: 'Role', accessor: 'role', type: 'text', filterable: true },
];

/**
 * The toolbar's global search input matches every `filterable` column. Type a name,
 * domain, or role to filter rows. Search debounces 200ms so it stays responsive on
 * larger datasets.
 */
export default function GlobalSearch() {
  return <DataGrid<Person> data={people} columns={columns} getRowId={(p) => p.id} />;
}