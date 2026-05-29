import { EmptyState, Table } from 'apx-ds';
import type { TableColumn } from 'apx-ds';

interface Row {
  id: string;
  name: string;
}

const columns: TableColumn<Row>[] = [
  { id: 'name', header: 'Name', accessor: (r) => r.name },
];

export default function Empty() {
  return (
    <Table
      ariaLabel="Empty users"
      columns={columns}
      data={[]}
      empty={
        <EmptyState
          size="sm"
          title="No users yet"
          description="Invite a teammate to populate this table."
        />
      }
    />
  );
}
