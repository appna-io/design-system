import { useState } from 'react';

import { DataGrid } from '@apx-ui/ds';
import type { DataGridColumnDef } from '@apx-ui/ds';

interface Row {
  id: string;
  name: string;
  email: string;
  signups: number;
}

const initial: Row[] = [
  { id: '1', name: 'Maya', email: 'maya@example.com', signups: 12 },
  { id: '2', name: 'Liam', email: 'liam@example.com', signups: 4 },
  { id: '3', name: 'Ava', email: 'ava@example.com', signups: 18 },
];

export default function CellEditing() {
  const [rows, setRows] = useState<Row[]>(initial);

  const commit = (id: string, key: keyof Row, value: unknown) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)),
    );
  };

  const columns: DataGridColumnDef<Row>[] = [
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      type: 'text',
      editable: true,
      onCellEdit: (row, value) => commit(row.id, 'name', value),
    },
    {
      id: 'email',
      header: 'Email',
      accessor: 'email',
      type: 'text',
      editable: true,
      onCellEdit: (row, value) => commit(row.id, 'email', value),
    },
    {
      id: 'signups',
      header: 'Signups',
      accessor: 'signups',
      type: 'number',
      align: 'end',
      editable: true,
      onCellEdit: (row, value) =>
        commit(row.id, 'signups', Number(value) || 0),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-fg-muted text-sm">
        Double-click any cell (or focus + press <kbd>F2</kbd> / <kbd>Enter</kbd>) to
        edit it in place. <kbd>Enter</kbd> commits, <kbd>Escape</kbd> cancels. The
        consumer&apos;s <code>onCellEdit</code> handler decides what to do with the value.
      </p>
      <DataGrid<Row> data={rows} columns={columns} getRowId={(r) => r.id} />
    </div>
  );
}
