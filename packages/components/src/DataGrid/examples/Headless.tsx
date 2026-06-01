import { useMemo } from 'react';

import { DataGrid, Div, Typography, useDataGrid } from '@apx-ui/ds';
import type { DataGridColumnDef } from '@apx-ui/ds';

interface Row {
  id: number;
  name: string;
  team: string;
  signups: number;
}

function build(): Row[] {
  return Array.from({ length: 60 }, (_, i) => ({
    id: i + 1,
    name: `Person ${String(i + 1).padStart(2, '0')}`,
    team: ['Platform', 'Growth', 'Design', 'Data'][i % 4] as string,
    signups: (i * 13) % 200,
  }));
}

const columns: DataGridColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, type: 'text' },
  { id: 'team', header: 'Team', accessor: 'team', sortable: true, type: 'text' },
  { id: 'signups', header: 'Signups', accessor: 'signups', sortable: true, type: 'number', align: 'end' },
];

/**
 * Composed (headless) form. Drive everything through `useDataGrid()` and mount
 * only the subparts you need — here we keep the toolbar but skip the pagination
 * bar, the selection bar, and the column-visibility menu. The hook return is the
 * single source of truth; mutate state via its setters and the DOM re-renders.
 */
export default function Headless() {
  const data = useMemo(build, []);
  const grid = useDataGrid<Row>({
    data,
    columns,
    getRowId: (r) => r.id,
    defaultSort: [{ id: 'signups', direction: 'desc' }],
    defaultPagination: { pageIndex: 0, pageSize: 0 },
  });

  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        Composed form using <code>useDataGrid()</code> + the subparts directly. Mount
        any subset / re-order chrome / inject custom toolbars. Hook state stays in
        sync with the DOM.
      </Typography>
      <DataGrid.Root grid={grid}>
        <DataGrid.Toolbar>
          <DataGrid.GlobalSearch />
        </DataGrid.Toolbar>
        <DataGrid.Table>
          <DataGrid.Header />
          <DataGrid.Body />
        </DataGrid.Table>
      </DataGrid.Root>
      <Typography variant="caption" color="fg.muted">
        Sort state: {JSON.stringify(grid.state.sort)} · total visible:{' '}
        <strong>{grid.rows.length}</strong> rows
      </Typography>
    </Div>
  );
}