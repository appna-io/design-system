import { useMemo } from 'react';

import { DataGrid } from '@apx-ui/ds';
import type { DataGridColumnDef } from '@apx-ui/ds';

interface Row {
  id: number;
  name: string;
  email: string;
  team: 'platform' | 'growth' | 'design' | 'data' | 'ops';
  signups: number;
  lastSeen: string;
}

const TEAMS = ['platform', 'growth', 'design', 'data', 'ops'] as const;

function buildRows(count: number): Row[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Person ${i.toString().padStart(5, '0')}`,
    email: `person${i}@example.com`,
    team: TEAMS[i % TEAMS.length]!,
    signups: (i * 37) % 1000,
    lastSeen: `${(i % 30) + 1} day${i % 30 === 0 ? '' : 's'} ago`,
  }));
}

const columns: DataGridColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, type: 'text', width: 200 },
  { id: 'email', header: 'Email', accessor: 'email', type: 'text', width: 260 },
  { id: 'team', header: 'Team', accessor: 'team', sortable: true, type: 'text', width: 140 },
  {
    id: 'signups',
    header: 'Signups',
    accessor: 'signups',
    sortable: true,
    type: 'number',
    align: 'end',
    width: 120,
  },
  { id: 'lastSeen', header: 'Last seen', accessor: 'lastSeen', type: 'text', width: 160 },
];

export default function Virtualized() {
  // 50,000 rows — a brute-force stress test that would freeze the un-virtualized
  // body. Built once and memoed so React doesn't re-create the dataset on every
  // toolbar interaction.
  const rows = useMemo(() => buildRows(50_000), []);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-fg-muted text-sm">
        50,000 rows windowed by <code>@tanstack/react-virtual</code>. Only the rows in
        the current scroll window live in the DOM — sort, search, and the column menu
        still operate on the full dataset. Pagination is hidden under virtualization
        because the whole filtered set is windowed directly.
      </p>
      <div style={{ height: 480 }}>
        <DataGrid<Row>
          data={rows}
          columns={columns}
          getRowId={(r) => r.id}
          virtualization="rows"
          estimateRowHeight={40}
          scrollerStyle={{ maxHeight: 480 }}
          stickyHeader
        />
      </div>
    </div>
  );
}
