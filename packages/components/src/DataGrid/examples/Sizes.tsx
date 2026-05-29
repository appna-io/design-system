import { DataGrid } from '@apx-ui/ds';
import type { DataGridColumnDef, DataGridDensity } from '@apx-ui/ds';

interface Row {
  id: number;
  name: string;
  team: string;
  signups: number;
}

const data: Row[] = [
  { id: 1, name: 'Maya Singh', team: 'Platform', signups: 124 },
  { id: 2, name: 'Liam Cohen', team: 'Growth', signups: 42 },
  { id: 3, name: 'Ava Goldberg', team: 'Design', signups: 218 },
  { id: 4, name: 'Noah Park', team: 'Data', signups: 81 },
];

const columns: DataGridColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', type: 'text' },
  { id: 'team', header: 'Team', accessor: 'team', type: 'text' },
  { id: 'signups', header: 'Signups', accessor: 'signups', type: 'number', align: 'end' },
];

const DENSITIES: { id: DataGridDensity; label: string; rowHeight: string }[] = [
  { id: 'compact', label: 'Compact', rowHeight: '32 px row height — data-dense screens' },
  { id: 'standard', label: 'Standard', rowHeight: '44 px row height — default for most surfaces' },
  { id: 'comfortable', label: 'Comfortable', rowHeight: '56 px row height — touch + content-rich rows' },
];

/**
 * Side-by-side comparison of the three density tokens. Density is a `size` prop
 * value (`compact` / `standard` / `comfortable`) and controls row height + padding
 * scale across every cell.
 */
export default function Sizes() {
  return (
    <div className="flex flex-col gap-6">
      {DENSITIES.map(({ id, label, rowHeight }) => (
        <div key={id} className="flex flex-col gap-2">
          <div className="flex items-baseline gap-3">
            <h3 className="text-fg-default text-sm font-semibold">{label}</h3>
            <span className="text-fg-muted text-xs">{rowHeight}</span>
          </div>
          <DataGrid<Row>
            data={data}
            columns={columns}
            getRowId={(r) => r.id}
            size={id}
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
