import { DataGrid } from '@apx-ui/ds';
import type { DataGridColor, DataGridColumnDef } from '@apx-ui/ds';

interface Row {
  id: number;
  name: string;
  delta: number;
}

const data: Row[] = [
  { id: 1, name: 'North America', delta: 12.4 },
  { id: 2, name: 'Europe', delta: -3.1 },
  { id: 3, name: 'APAC', delta: 28.9 },
  { id: 4, name: 'LATAM', delta: 5.2 },
];

const columns: DataGridColumnDef<Row>[] = [
  { id: 'name', header: 'Region', accessor: 'name', type: 'text' },
  { id: 'delta', header: 'Delta (%)', accessor: 'delta', type: 'number', align: 'end' },
];

const COLORS: DataGridColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

/**
 * All seven accent colors rendered with the same `striped` variant. `color`
 * controls the header tint, the row-hover tone, the sort indicator, and the
 * selected-row highlight. The variant is fixed to `striped` so the color signal
 * is unambiguous; switching `variant` would also work.
 */
export default function Colors() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {COLORS.map((color) => (
        <div key={color} className="flex flex-col gap-2">
          <h3 className="text-fg-default text-sm font-semibold capitalize">{color}</h3>
          <DataGrid<Row>
            data={data}
            columns={columns}
            getRowId={(r) => r.id}
            color={color}
            variant="striped"
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
