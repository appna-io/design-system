import { DataGrid, Div, Typography } from '@apx-ui/ds';
import type { DataGridColumnDef } from '@apx-ui/ds';

interface Row {
  id: number;
  name: string;
  email: string;
  team: string;
  signups: number;
  lastSeen: string;
  notes: string;
}

const data: Row[] = [
  {
    id: 1,
    name: 'Maya',
    email: 'maya@example.com',
    team: 'platform',
    signups: 124,
    lastSeen: '2 hours ago',
    notes: 'Quarterly review pending',
  },
  {
    id: 2,
    name: 'Liam',
    email: 'liam@example.com',
    team: 'growth',
    signups: 42,
    lastSeen: 'yesterday',
    notes: 'Promoted last sprint',
  },
  {
    id: 3,
    name: 'Ava',
    email: 'ava@example.com',
    team: 'design',
    signups: 218,
    lastSeen: '5 minutes ago',
    notes: 'Leads the redesign',
  },
  {
    id: 4,
    name: 'Noam',
    email: 'noam@example.com',
    team: 'data',
    signups: 81,
    lastSeen: '3 days ago',
    notes: 'On parental leave',
  },
];

const columns: DataGridColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, type: 'text' },
  { id: 'email', header: 'Email', accessor: 'email', type: 'text' },
  {
    id: 'team',
    header: 'Team',
    accessor: 'team',
    sortable: true,
    type: 'text',
    responsive: { hideBelow: 'sm' },
  },
  {
    id: 'signups',
    header: 'Signups',
    accessor: 'signups',
    sortable: true,
    type: 'number',
    align: 'end',
    responsive: { hideBelow: 'md' },
  },
  {
    id: 'lastSeen',
    header: 'Last seen',
    accessor: 'lastSeen',
    type: 'text',
    responsive: { hideBelow: 'lg' },
  },
  {
    id: 'notes',
    header: 'Notes',
    accessor: 'notes',
    type: 'text',
    responsive: { hideBelow: 'xl' },
  },
];

export default function Responsive() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        Each column declares a <code>responsive.hideBelow</code> breakpoint. The grid
        subscribes to the matching media queries and hides columns whose breakpoint is no
        longer matched — try shrinking the browser window or opening DevTools&apos; device
        mode. Identity columns (<code>Name</code>, <code>Email</code>) opt out and stay
        visible at every width.
      </Typography>
      <Typography variant="caption" color="fg.muted">
        Breakpoints follow Tailwind&apos;s defaults (<code>sm</code> 640px, <code>md</code>{' '}
        768px, <code>lg</code> 1024px, <code>xl</code> 1280px).
      </Typography>
      <DataGrid<Row> data={data} columns={columns} getRowId={(r) => r.id} />
    </Div>
  );
}