import { DataGrid } from 'apx-ds';
import type { DataGridColumnDef } from 'apx-ds';

interface Row {
  id: string;
  channel: string;
  region: 'NA' | 'EU' | 'APAC';
  revenue: number;
  units: number;
}

const data: Row[] = [
  { id: '1', channel: 'Online', region: 'NA', revenue: 12400, units: 180 },
  { id: '2', channel: 'Retail', region: 'NA', revenue: 8600, units: 96 },
  { id: '3', channel: 'Online', region: 'EU', revenue: 7300, units: 102 },
  { id: '4', channel: 'Retail', region: 'EU', revenue: 5100, units: 70 },
  { id: '5', channel: 'Online', region: 'APAC', revenue: 9800, units: 134 },
  { id: '6', channel: 'Retail', region: 'APAC', revenue: 4200, units: 58 },
];

const columns: DataGridColumnDef<Row>[] = [
  { id: 'channel', header: 'Channel', accessor: 'channel', type: 'text' },
  { id: 'region', header: 'Region', accessor: 'region', type: 'text' },
  {
    id: 'revenue',
    header: 'Revenue',
    accessor: 'revenue',
    type: 'number',
    align: 'end',
    aggregations: ['sum', 'avg', 'max'],
  },
  {
    id: 'units',
    header: 'Units',
    accessor: 'units',
    type: 'number',
    align: 'end',
    aggregations: ['sum', 'avg'],
  },
];

export default function Aggregations() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-fg-muted text-sm">
        Columns declare their aggregations on the column definition. Totals run on the
        currently filtered rows (not just the visible page), so flipping pages doesn&apos;t
        change the displayed values.
      </p>
      <DataGrid<Row> data={data} columns={columns} getRowId={(r) => r.id} />
    </div>
  );
}
