import { Table } from '@apx-ui/ds';
import type { TableColumn } from '@apx-ui/ds';

interface Row {
  id: string;
  product: string;
  price: string;
  stock: number;
}

const data: Row[] = [
  { id: '1', product: 'Foundation', price: '$29', stock: 42 },
  { id: '2', product: 'Mascara', price: '$18', stock: 17 },
  { id: '3', product: 'Lip tint', price: '$22', stock: 0 },
];

const columns: TableColumn<Row>[] = [
  { id: 'product', header: 'Product', accessor: (r) => r.product },
  { id: 'price', header: 'Price', accessor: (r) => r.price, align: 'end' },
  { id: 'stock', header: 'Stock', accessor: (r) => r.stock, align: 'end' },
];

export default function CardVariant() {
  return (
    <Table ariaLabel="Card-style table" columns={columns} data={data} getRowId={(r) => r.id} variant="card" />
  );
}