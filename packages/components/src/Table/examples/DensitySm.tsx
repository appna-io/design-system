import { Table } from '@apx-ui/ds';
import type { TableColumn } from '@apx-ui/ds';

interface Row {
  id: string;
  ticker: string;
  price: number;
  change: number;
}

const data: Row[] = [
  { id: '1', ticker: 'AAPL', price: 192.4, change: 1.2 },
  { id: '2', ticker: 'MSFT', price: 412.6, change: -0.4 },
  { id: '3', ticker: 'GOOGL', price: 158.1, change: 0.8 },
  { id: '4', ticker: 'AMZN', price: 182.9, change: 2.1 },
  { id: '5', ticker: 'META', price: 504.2, change: -1.4 },
];

const columns: TableColumn<Row>[] = [
  { id: 'ticker', header: 'Ticker', accessor: (r) => r.ticker },
  { id: 'price', header: 'Price', accessor: (r) => `$${r.price.toFixed(2)}`, align: 'end' },
  {
    id: 'change',
    header: 'Change',
    align: 'end',
    cell: (r) => (
      <span className={r.change >= 0 ? 'text-success' : 'text-danger'}>
        {r.change >= 0 ? '+' : ''}
        {r.change.toFixed(2)}%
      </span>
    ),
  },
];

export default function DensitySm() {
  return (
    <Table
      ariaLabel="Compact density table"
      columns={columns}
      data={data}
      getRowId={(r) => r.id}
      density="sm"
      striped
    />
  );
}
