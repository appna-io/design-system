import { useState } from 'react';
import { Div, Table, Typography } from '@apx-ui/ds';
import type { TableColumn, TableSortState } from '@apx-ui/ds';

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
    <Div display="flex" flexDirection="column" gap="2">
      <Typography variant="bodySmall" color="fg.muted">
        Click any header to cycle sort: <code>asc</code> → <code>desc</code> → unsorted. Current:{' '}
        <code>{sort ? `${sort.id} (${sort.direction})` : 'none'}</code>
      </Typography>
      <Table
        ariaLabel="Sortable users"
        columns={columns}
        data={data}
        getRowId={(r) => r.id}
        sort={sort}
        onSortChange={setSort}
      />
    </Div>
  );
}