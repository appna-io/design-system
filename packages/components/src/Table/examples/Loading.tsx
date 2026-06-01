import { useState } from 'react';
import { Button, Div, Table } from '@apx-ui/ds';
import type { TableColumn } from '@apx-ui/ds';

interface Row {
  id: string;
  name: string;
  email: string;
}

const data: Row[] = [
  { id: '1', name: 'Maya', email: 'maya@example.com' },
  { id: '2', name: 'Liam', email: 'liam@example.com' },
  { id: '3', name: 'Ava', email: 'ava@example.com' },
];

const columns: TableColumn<Row>[] = [
  { id: 'name', header: 'Name', accessor: (r) => r.name },
  { id: 'email', header: 'Email', accessor: (r) => r.email },
];

export default function Loading() {
  const [loading, setLoading] = useState(true);
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <Button size="sm" onClick={() => setLoading((value) => !value)}>
        {loading ? 'Stop loading' : 'Start loading'}
      </Button>
      <Table
        ariaLabel="Loading example"
        columns={columns}
        data={data}
        getRowId={(r) => r.id}
        loading={loading}
        loadingRowCount={4}
      />
    </Div>
  );
}