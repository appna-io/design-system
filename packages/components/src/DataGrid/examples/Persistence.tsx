import { useState } from 'react';

import { Button, DataGrid } from '@apx-ui/ds';
import type { DataGridColumnDef } from '@apx-ui/ds';

interface Row {
  id: number;
  name: string;
  email: string;
  team: 'platform' | 'growth' | 'design' | 'data' | 'ops';
  signups: number;
}

const data: Row[] = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  name: `Person ${i.toString().padStart(2, '0')}`,
  email: `person${i}@example.com`,
  team: (['platform', 'growth', 'design', 'data', 'ops'] as const)[i % 5]!,
  signups: (i * 17) % 500,
}));

const columns: DataGridColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, type: 'text' },
  { id: 'email', header: 'Email', accessor: 'email', type: 'text' },
  { id: 'team', header: 'Team', accessor: 'team', sortable: true, type: 'text' },
  {
    id: 'signups',
    header: 'Signups',
    accessor: 'signups',
    sortable: true,
    type: 'number',
    align: 'end',
  },
];

const STORAGE_KEY = 'apx-ds-datagrid-persistence-example-v1';

export default function Persistence() {
  // Local nonce so we can force-remount the grid to demonstrate that the
  // persisted state is restored on a fresh mount (proxy for a real page
  // refresh — same effect from the headless hook's perspective).
  const [nonce, setNonce] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-fg-muted text-sm">
        Sort a column, hide one via the column-visibility menu, change the density, or
        re-arrange page size. Then click <strong>Remount grid</strong> — the persisted slices
        rehydrate from <code>localStorage</code> as if you had refreshed the page. Selection
        and the active page index are deliberately <em>not</em> persisted (selection should
        not survive a refresh; pageIndex is ephemeral).
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setNonce((n) => n + 1)}>
          Remount grid
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            window.localStorage.removeItem(STORAGE_KEY);
            setNonce((n) => n + 1);
          }}
        >
          Reset persisted state
        </Button>
      </div>
      <DataGrid<Row>
        key={nonce}
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        storage="local"
        storageKey={STORAGE_KEY}
        selectionMode="multiple"
        defaultPagination={{ pageIndex: 0, pageSize: 10 }}
      />
    </div>
  );
}
