import { useState } from 'react';

import { DataGrid } from '@apx-ui/ds';
import type { DataGridColumnDef } from '@apx-ui/ds';

interface Row {
  id: string;
  name: string;
  role: string;
}

const data: Row[] = [
  { id: '1', name: 'Maya', role: 'admin' },
  { id: '2', name: 'Liam', role: 'editor' },
];

const columns: DataGridColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', type: 'text' },
  { id: 'role', header: 'Role', accessor: 'role', type: 'text' },
];

export default function Error() {
  const [tries, setTries] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-fg-muted text-sm">
        Passing <code>errorState</code> swaps the body for the error UI and elevates
        the surrounding region&apos;s role to <code>alert</code> so screen readers
        announce it immediately.
      </p>
      <DataGrid<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        errorState={
          <DataGrid.Error
            title="We couldn't load your customers"
            description={`Retried ${tries} time${tries === 1 ? '' : 's'}. If this keeps happening, try again in a minute.`}
            onRetry={() => setTries((n) => n + 1)}
          />
        }
      />
    </div>
  );
}
