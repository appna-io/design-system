import { Table } from 'apx-ds';
import type { TableColumn } from 'apx-ds';

interface Row {
  id: string;
  region: string;
  revenue: string;
  orders: number;
}

const data: Row[] = [
  { id: '1', region: 'North America', revenue: '$1.2M', orders: 482 },
  { id: '2', region: 'Europe', revenue: '$0.9M', orders: 318 },
  { id: '3', region: 'APAC', revenue: '$0.7M', orders: 264 },
  { id: '4', region: 'LATAM', revenue: '$0.3M', orders: 121 },
];

const columns: TableColumn<Row>[] = [
  { id: 'region', header: 'Region', accessor: (r) => r.region },
  { id: 'revenue', header: 'Revenue', accessor: (r) => r.revenue, align: 'end' },
  { id: 'orders', header: 'Orders', accessor: (r) => r.orders, align: 'end' },
];

export default function Striped() {
  return (
    <Table ariaLabel="Striped table" columns={columns} data={data} getRowId={(r) => r.id} striped />
  );
}
