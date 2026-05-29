import { DataGrid } from '@apx-ui/ds';
import type { DataGridColumnDef } from '@apx-ui/ds';

interface Row {
  id: string;
  name: string;
  email: string;
  role: string;
  notes: string;
}

const data: Row[] = [
  { id: '1', name: 'Maya', email: 'maya@example.com', role: 'admin', notes: 'Owns the platform team rotation roster.' },
  { id: '2', name: 'Liam', email: 'liam@example.com', role: 'editor', notes: 'Working on the autumn re-launch.' },
  { id: '3', name: 'Ava', email: 'ava@example.com', role: 'viewer', notes: 'New hire — onboarding this week.' },
];

const columns: DataGridColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', type: 'text', resizable: true, width: 140, minWidth: 80 },
  { id: 'email', header: 'Email', accessor: 'email', type: 'text', resizable: true, width: 220, minWidth: 120 },
  { id: 'role', header: 'Role', accessor: 'role', type: 'text', resizable: true, width: 120, minWidth: 80 },
  { id: 'notes', header: 'Notes', accessor: 'notes', type: 'text', resizable: true, width: 280, minWidth: 160 },
];

export default function ColumnResizing() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-fg-muted text-sm">
        Drag the trailing edge of any header to resize its column. Double-click the
        handle to auto-size to the widest visible cell. Hold <kbd>Shift</kbd> while
        nudging via the keyboard for 32-px steps; <kbd>Delete</kbd> clears the override.
      </p>
      <DataGrid<Row> data={data} columns={columns} getRowId={(r) => r.id} />
    </div>
  );
}
