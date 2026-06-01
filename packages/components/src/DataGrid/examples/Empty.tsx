import { Button } from '@apx-ui/ds';
import { DataGrid, Div, Typography } from '@apx-ui/ds';
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
    <Div display="flex" flexDirection="column" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        With zero rows, the grid mounts the canonical empty state below the header.
        Pass a string to <code>emptyState</code> for a quick copy override, or render
        <code>&lt;DataGrid.Empty&gt;</code> yourself with a CTA for the full
        compound surface.
      </Typography>
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
    </Div>
  );
}