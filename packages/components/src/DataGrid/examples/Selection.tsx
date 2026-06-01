import { useState } from 'react';
import { Button, DataGrid } from '@apx-ui/ds';
import type { DataGridColumnDef, DataGridSelectionIds } from '@apx-ui/ds';

interface Subscriber {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'team';
}

const subscribers: Subscriber[] = [
  { id: 's-1', name: 'Maya Singh', email: 'maya@example.com', plan: 'pro' },
  { id: 's-2', name: 'Liam Cohen', email: 'liam@example.com', plan: 'free' },
  { id: 's-3', name: 'Ava Goldberg', email: 'ava@example.com', plan: 'team' },
  { id: 's-4', name: 'Noah Park', email: 'noah@example.com', plan: 'pro' },
];

const columns: DataGridColumnDef<Subscriber>[] = [
  { id: 'name', header: 'Name', accessor: 'name', type: 'text', sortable: true },
  { id: 'email', header: 'Email', accessor: 'email', type: 'text' },
  { id: 'plan', header: 'Plan', accessor: 'plan', type: 'text' },
];

/**
 * `selectionMode="multiple"` auto-injects a leading checkbox column. The header's
 * tri-state checkbox toggles every visible row; shift-click a row checkbox to extend
 * the range; cmd/ctrl-click to add/remove individual rows.
 *
 * The sticky bottom `<SelectionBar>` appears whenever ≥ 1 row is selected and accepts
 * consumer-supplied actions as children. It's hidden again when the selection clears.
 */
export default function Selection() {
  const [selected, setSelected] = useState<DataGridSelectionIds>(new Set());

  return (
    <DataGrid<Subscriber>
      data={subscribers}
      columns={columns}
      getRowId={(s) => s.id}
      selectionMode="multiple"
      selectedRowIds={selected}
      onSelectionChange={setSelected}
    >
      <Button color="danger" size="sm">
        Delete selected
      </Button>
      <Button size="sm">Export</Button>
    </DataGrid>
  );
}