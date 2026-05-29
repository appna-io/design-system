import { DataGrid } from 'apx-ds';
import type { DataGridColumnDef, DataGridVariant } from 'apx-ds';

interface Row {
  id: number;
  name: string;
  team: string;
  signups: number;
}

const data: Row[] = [
  { id: 1, name: 'Maya', team: 'Platform', signups: 124 },
  { id: 2, name: 'Liam', team: 'Growth', signups: 42 },
  { id: 3, name: 'Ava', team: 'Design', signups: 218 },
  { id: 4, name: 'Noah', team: 'Data', signups: 81 },
];

const columns: DataGridColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', type: 'text' },
  { id: 'team', header: 'Team', accessor: 'team', type: 'text' },
  { id: 'signups', header: 'Signups', accessor: 'signups', type: 'number', align: 'end' },
];

const VARIANTS: DataGridVariant[] = ['solid', 'outline', 'striped', 'minimal'];

/**
 * Side-by-side comparison of the four chrome variants. The same data + columns are
 * rendered four times so the consumer can read the visual difference at a glance.
 */
export default function Variants() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-2">
          <h3 className="text-fg-default text-sm font-semibold capitalize">{variant}</h3>
          <DataGrid<Row>
            data={data}
            columns={columns}
            getRowId={(r) => r.id}
            variant={variant}
            densityToggle={false}
            columnVisibilityToggle={false}
            exportable={false}
            globalSearch={false}
            defaultPagination={{ pageIndex: 0, pageSize: 0 }}
          />
        </div>
      ))}
    </div>
  );
}
