import { useEffect, useState } from 'react';

import { DataGrid, Div, Typography } from '@apx-ui/ds';
import type { DataGridColumnDef } from '@apx-ui/ds';

interface Row {
  id: string;
  name: string;
  role: string;
  signups: number;
}

const data: Row[] = [
  { id: '1', name: 'Maya', role: 'admin', signups: 12 },
  { id: '2', name: 'Liam', role: 'editor', signups: 4 },
  { id: '3', name: 'Ava', role: 'viewer', signups: 18 },
];

const columns: DataGridColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', type: 'text' },
  { id: 'role', header: 'Role', accessor: 'role', type: 'text' },
  { id: 'signups', header: 'Signups', accessor: 'signups', type: 'number', align: 'end' },
];

export default function Loading() {
  // Fake "fetch" — flip loading on every 4 seconds so the example demonstrates the
  // overlay re-mount and the announce-once behaviour of the live region.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setLoading((l) => !l), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        The loading overlay dims the existing rows so users can still parse the chrome
        while a refresh is in flight. A polite live region announces &ldquo;Loading…&rdquo; once
        per mount. Toggles automatically every 4 seconds for this demo.
      </Typography>
      <DataGrid<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        loading={loading}
      />
    </Div>
  );
}