import { DataGrid, Div, Typography } from '@apx-ui/ds';
import type { DataGridColumnDef } from '@apx-ui/ds';

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
  { id: '5', name: 'Sara', age: 19, joined: '2025-09-04' },
];

const columns: DataGridColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, type: 'text' },
  {
    id: 'age',
    header: 'Age',
    accessor: 'age',
    sortable: true,
    type: 'number',
    align: 'end',
  },
  {
    id: 'joined',
    header: 'Joined',
    accessor: 'joined',
    sortable: true,
    type: 'text',
  },
];

export default function Sorting() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        Click a header to cycle <code>asc</code> → <code>desc</code> → unsorted. Hold{' '}
        <kbd>Shift</kbd> while clicking another header to add it to a multi-column sort
        stack — small numbered pills appear so you can read the order at a glance.
      </Typography>
      <DataGrid<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        defaultSort={[{ id: 'joined', direction: 'desc' }]}
      />
    </Div>
  );
}