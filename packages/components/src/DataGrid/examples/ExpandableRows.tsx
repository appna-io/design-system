import { DataGrid } from '@apx-ui/ds';
import type { DataGridColumnDef } from '@apx-ui/ds';

interface Order {
  id: string;
  customer: string;
  total: number;
  status: 'pending' | 'fulfilled' | 'returned';
  items: { sku: string; name: string; qty: number }[];
  shippingAddress: string;
}

const data: Order[] = [
  {
    id: '1',
    customer: 'Maya Aoki',
    total: 248.5,
    status: 'fulfilled',
    items: [
      { sku: 'SKU-001', name: 'Linen shirt', qty: 1 },
      { sku: 'SKU-014', name: 'Walking shorts', qty: 2 },
    ],
    shippingAddress: '14 Hosier Lane, Melbourne VIC 3000',
  },
  {
    id: '2',
    customer: 'Liam Patel',
    total: 89,
    status: 'pending',
    items: [{ sku: 'SKU-042', name: 'Espresso cup set', qty: 1 }],
    shippingAddress: '12 Pier Rd, Cape Town 8000',
  },
  {
    id: '3',
    customer: 'Ava Smith',
    total: 412,
    status: 'returned',
    items: [
      { sku: 'SKU-001', name: 'Linen shirt', qty: 2 },
      { sku: 'SKU-099', name: 'Travel duffel', qty: 1 },
    ],
    shippingAddress: '88 Riverside Dr, Brooklyn NY 11211',
  },
];

const columns: DataGridColumnDef<Order>[] = [
  { id: 'customer', header: 'Customer', accessor: 'customer', type: 'text' },
  { id: 'total', header: 'Total', accessor: 'total', type: 'number', align: 'end' },
  { id: 'status', header: 'Status', accessor: 'status', type: 'text' },
];

export default function ExpandableRows() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-fg-muted text-sm">
        Click the chevron in any row to reveal the order&apos;s items and shipping address.
        The expansion row is composed by the consumer, so you can render whatever
        detail JSX makes sense — a sub-table, a chart, a form, anything.
      </p>
      <DataGrid<Order>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        renderExpandedRow={(row) => (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-fg-default text-sm font-semibold">Items</h4>
              <ul className="text-fg-muted mt-1 text-sm">
                {row.items.map((item) => (
                  <li key={item.sku}>
                    {item.qty} × {item.name}{' '}
                    <span className="text-fg-muted/70 text-xs">({item.sku})</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-fg-default text-sm font-semibold">Ship to</h4>
              <p className="text-fg-muted mt-1 text-sm">{row.shippingAddress}</p>
            </div>
          </div>
        )}
      />
    </div>
  );
}
