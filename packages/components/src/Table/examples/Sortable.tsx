import { useState } from 'react';
import { Table } from 'apx-ds';
import type { TableColumn, TableSortState } from 'apx-ds';

interface Row {
  id: string;
  name: string;
  age: number;
  joined: string;
}

const data: Row[] = [
  { id: '1', name: 'Maya', age: 28, joined: '2024-06-12' },
  { id: '2', name: 'Liam', age: 34, joined: '2023-11-03' },
  { id: '3', name: 'Ava', age: 22, joined: '2025-02-19' },
  { id: '4', name: 'Noah', age: 41, joined: '2022-08-30' },
];

const columns: TableColumn<Row>[] = [
  { id: 'name', header: 'Name', accessor: (r) => r.name, sortable: true },
  { id: 'age', header: 'Age', accessor: (r) => r.age, sortable: true, sortFn: 'number', align: 'end' },
  { id: 'joined', header: 'Joined', accessor: (r) => r.joined, sortable: true, sortFn: 'date' },
];

export default function Sortable() {
  const [sort, setSort] = useState<TableSortState | undefined>({ id: 'name', direction: 'asc' });
  return (
    <div className="flex flex-col gap-2">
      <p className="text-fg-muted text-sm">
        Click any header to cycle sort: <code>asc</code> \u2192 <code>desc</code> \u2192 unsorted. Current:{' '}
        <code>{sort ? `${sort.id} (${sort.direction})` : 'none'}</code>
      </p>
      <Table
        ariaLabel="Sortable users"
        columns={columns}
        data={data}
        getRowId={(r) => r.id}
        sort={sort}
        onSortChange={setSort}
      />
    </div>
  );
}
