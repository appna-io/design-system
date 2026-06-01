import { DataGrid, Div, Typography } from '@apx-ui/ds';
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
    <Div display="flex" flexDirection="column" gap="3">
      <Typography variant="bodySmall" color="fg.muted">
        Click the chevron in any row to reveal the order&apos;s items and shipping address.
        The expansion row is composed by the consumer, so you can render whatever
        detail JSX makes sense — a sub-table, a chart, a form, anything.
      </Typography>
      <DataGrid<Order>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        renderExpandedRow={(row) => (
          <Div display="grid" gridTemplateColumns="1fr 1fr" gap="6">
            <Div>
              <Typography as="h4" variant="bodySmall" weight="semibold" color="fg.default">
                Items
              </Typography>
              <Div as="ul" mt="1" display="flex" flexDirection="column">
                {row.items.map((item) => (
                  <Typography as="li" key={item.sku} variant="bodySmall" color="fg.muted">
                    {item.qty} × {item.name}{' '}
                    <Typography as="span" variant="caption" color="fg.muted" sx={{ opacity: 0.7 }}>
                      ({item.sku})
                    </Typography>
                  </Typography>
                ))}
              </Div>
            </Div>
            <Div>
              <Typography as="h4" variant="bodySmall" weight="semibold" color="fg.default">
                Ship to
              </Typography>
              <Typography variant="bodySmall" color="fg.muted" mt="1">
                {row.shippingAddress}
              </Typography>
            </Div>
          </Div>
        )}
      />
    </Div>
  );
}