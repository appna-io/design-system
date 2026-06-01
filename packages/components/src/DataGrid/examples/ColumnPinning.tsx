import { DataGrid, Div, Typography } from '@apx-ui/ds';
import type { DataGridColumnDef } from '@apx-ui/ds';

interface Row {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  team: string;
  status: 'active' | 'invited' | 'disabled';
  signups: number;
  lastSeen: string;
}

const data: Row[] = [
  { id: '1', name: 'Maya', email: 'maya@example.com', role: 'admin', team: 'Platform', status: 'active', signups: 12, lastSeen: '2 min ago' },
  { id: '2', name: 'Liam', email: 'liam@example.com', role: 'editor', team: 'Growth', status: 'invited', signups: 4, lastSeen: '1 h ago' },
  { id: '3', name: 'Ava', email: 'ava@example.com', role: 'viewer', team: 'Design', status: 'active', signups: 18, lastSeen: 'just now' },
  { id: '4', name: 'Noah', email: 'noah@example.com', role: 'admin', team: 'Platform', status: 'disabled', signups: 0, lastSeen: '3 d ago' },
  { id: '5', name: 'Sara', email: 'sara@example.com', role: 'editor', team: 'Growth', status: 'active', signups: 9, lastSeen: 'yesterday' },
];

const columns: DataGridColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', type: 'text', pinned: 'start', width: 140 },
  { id: 'email', header: 'Email', accessor: 'email', type: 'text', width: 220 },
  { id: 'role', header: 'Role', accessor: 'role', type: 'text', width: 120 },
  { id: 'team', header: 'Team', accessor: 'team', type: 'text', width: 160 },
  { id: 'status', header: 'Status', accessor: 'status', type: 'text', width: 140 },
  { id: 'signups', header: 'Signups', accessor: 'signups', type: 'number', align: 'end', width: 120 },
  { id: 'lastSeen', header: 'Last seen', accessor: 'lastSeen', type: 'text', pinned: 'end', width: 140 },
];

export default function ColumnPinning() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        The first column is pinned to the start and the last to the end. As you scroll
        horizontally they stay glued to the grid edges. Open any column&apos;s kebab menu
        to pin or unpin it on the fly.
      </Typography>
      <Div maxWidth="640px">
        <DataGrid<Row> data={data} columns={columns} getRowId={(r) => r.id} />
      </Div>
    </Div>
  );
}