import { DataGrid } from '@apx-ui/ds';
import type { DataGridColumnDef } from '@apx-ui/ds';

interface Server {
  id: string;
  hostname: string;
  region: string;
  cpu: number;
  memory: number;
  uptime: string;
}

const servers: Server[] = [
  { id: 's-1', hostname: 'web-prod-01', region: 'us-east-1', cpu: 32, memory: 64, uptime: '12d' },
  { id: 's-2', hostname: 'web-prod-02', region: 'us-east-1', cpu: 8, memory: 16, uptime: '3d' },
  { id: 's-3', hostname: 'db-prod-01', region: 'us-west-2', cpu: 16, memory: 128, uptime: '47d' },
  { id: 's-4', hostname: 'cache-prod-01', region: 'eu-west-1', cpu: 4, memory: 32, uptime: '8d' },
];

const columns: DataGridColumnDef<Server>[] = [
  { id: 'hostname', header: 'Hostname', accessor: 'hostname', type: 'text', sortable: true, hideable: false },
  { id: 'region', header: 'Region', accessor: 'region', type: 'text' },
  { id: 'cpu', header: 'CPU cores', accessor: 'cpu', type: 'number', align: 'end' },
  { id: 'memory', header: 'Memory (GB)', accessor: 'memory', type: 'number', align: 'end' },
  { id: 'uptime', header: 'Uptime', accessor: 'uptime', type: 'text' },
];

/**
 * The toolbar's "Columns" popover lists every column with `hideable !== false`. Toggle
 * a checkbox to flip the column visibility; the body re-renders without that column.
 * "Reset columns" wipes the runtime overrides and restores the column set declared on
 * the component.
 *
 * Columns marked `hideable: false` (here: `hostname`) stay in the rendered grid but
 * never appear in the popover.
 */
export default function ColumnVisibility() {
  return <DataGrid<Server> data={servers} columns={columns} getRowId={(s) => s.id} />;
}