import { Button } from '@apx-ui/ds';
import { DataGrid } from '@apx-ui/ds';
import type { DataGridColumnDef } from '@apx-ui/ds';

interface Row {
  id: string;
  name: string;
  email: string;
}

const columns: DataGridColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', type: 'text' },
  { id: 'email', header: 'Email', accessor: 'email', type: 'text' },
];

export default function Empty() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-fg-muted text-sm">
        With zero rows, the grid mounts the canonical empty state below the header.
        Pass a string to <code>emptyState</code> for a quick copy override, or render
        <code>&lt;DataGrid.Empty&gt;</code> yourself with a CTA for the full
        compound surface.
      </p>
      <DataGrid<Row>
        data={[]}
        columns={columns}
        getRowId={(r) => r.id}
        emptyState={
          <DataGrid.Empty
            title="No customers yet"
            description="Once a customer signs up, they'll appear here."
            action={<Button>Invite a customer</Button>}
          />
        }
      />
    </div>
  );
}
