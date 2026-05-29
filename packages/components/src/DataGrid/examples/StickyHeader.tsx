import { useMemo } from 'react';

import { DataGrid } from 'apx-ds';
import type { DataGridColumnDef } from 'apx-ds';

interface Player {
  id: number;
  name: string;
  team: string;
  goals: number;
  assists: number;
  minutes: number;
}

const TEAMS = ['Hapoel', 'Maccabi', 'Beitar', 'Ironi', 'Bnei'];

function build(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Player #${i + 1}`,
    team: TEAMS[i % TEAMS.length] as string,
    goals: (i * 7) % 24,
    assists: (i * 11) % 31,
    minutes: 600 + ((i * 53) % 2400),
  }));
}

const columns: DataGridColumnDef<Player>[] = [
  { id: 'name', header: 'Player', accessor: 'name', sortable: true, type: 'text' },
  { id: 'team', header: 'Team', accessor: 'team', sortable: true, type: 'text' },
  { id: 'goals', header: 'Goals', accessor: 'goals', sortable: true, type: 'number', align: 'end' },
  { id: 'assists', header: 'Assists', accessor: 'assists', sortable: true, type: 'number', align: 'end' },
  { id: 'minutes', header: 'Minutes', accessor: 'minutes', sortable: true, type: 'number', align: 'end' },
];

/**
 * The header row sticks to the top of the scroll container while the body scrolls
 * underneath. We cap the scroller at 320 px via `scrollerStyle` so the demo fits in
 * a single viewport — in a real app the container would be the page's main scroller.
 */
export default function StickyHeader() {
  const data = useMemo(() => build(120), []);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-fg-muted text-sm">
        <code>stickyHeader</code> pins the column headers to the top of the scroll viewport.
        Combine with a bounded <code>scrollerStyle</code> to create a self-contained scrollable grid.
      </p>
      <DataGrid<Player>
        data={data}
        columns={columns}
        getRowId={(p) => p.id}
        stickyHeader
        scrollerStyle={{ maxHeight: 320 }}
        defaultPagination={{ pageIndex: 0, pageSize: 0 }}
      />
    </div>
  );
}
