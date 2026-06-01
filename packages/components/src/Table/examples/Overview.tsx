import { Badge, Table } from '@apx-ui/ds';
import type { TableColumn } from '@apx-ui/ds';

interface Product {
  id: string;
  name: string;
  category: string;
  status: 'In stock' | 'Low stock' | 'Out of stock';
  price: number;
}

const products: Product[] = [
  { id: '1', name: 'Wireless Keyboard', category: 'Accessories', status: 'In stock', price: 79 },
  { id: '2', name: 'USB-C Hub', category: 'Accessories', status: 'In stock', price: 49 },
  { id: '3', name: '27″ Monitor', category: 'Displays', status: 'Low stock', price: 329 },
  { id: '4', name: 'Ergo Chair', category: 'Furniture', status: 'In stock', price: 549 },
  { id: '5', name: 'Standing Desk', category: 'Furniture', status: 'Out of stock', price: 699 },
  { id: '6', name: 'Webcam HD', category: 'Accessories', status: 'In stock', price: 89 },
];

const statusColor: Record<Product['status'], 'success' | 'warning' | 'danger'> = {
  'In stock': 'success',
  'Low stock': 'warning',
  'Out of stock': 'danger',
};

const columns: TableColumn<Product>[] = [
  { id: 'name', header: 'Product', accessor: (p) => p.name, sortable: true },
  { id: 'category', header: 'Category', accessor: (p) => p.category, sortable: true },
  {
    id: 'status',
    header: 'Status',
    accessor: (p) => p.status,
    sortable: true,
    cell: (p) => (
      <Badge color={statusColor[p.status]} variant="soft">
        {p.status}
      </Badge>
    ),
  },
  {
    id: 'price',
    header: 'Price',
    accessor: (p) => p.price,
    sortable: true,
    sortFn: 'number',
    align: 'end',
    cell: (p) => `$${p.price.toLocaleString()}`,
  },
];

export default function Overview() {
  return (
    <Table
      ariaLabel="Product inventory"
      columns={columns}
      data={products}
      getRowId={(p) => p.id}
      defaultSort={{ id: 'name', direction: 'asc' }}
      striped
      hoverable
    />
  );
}