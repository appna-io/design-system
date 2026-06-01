import { Div, Table } from '@apx-ui/ds';
import type { TableColumn } from '@apx-ui/ds';

interface Row {
  id: string;
  name: string;
  email: string;
  role: string;
}

const data: Row[] = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  name: `Member ${i + 1}`,
  email: `member-${i + 1}@example.com`,
  role: i % 3 === 0 ? 'Admin' : i % 3 === 1 ? 'Editor' : 'Viewer',
}));

const columns: TableColumn<Row>[] = [
  { id: 'name', header: 'Name', accessor: (r) => r.name },
  { id: 'email', header: 'Email', accessor: (r) => r.email },
  { id: 'role', header: 'Role', accessor: (r) => r.role, align: 'end' },
];

export default function StickyHeader() {
  return (
    <Div className="rounded-md border border-border-subtle" maxHeight={280} overflow="auto">
      <Table
        ariaLabel="Sticky header table"
        columns={columns}
        data={data}
        getRowId={(r) => r.id}
        stickyHeader
        striped
      />
    </Div>
  );
}