import { DataGrid } from '@apx-ui/ds';
import type { DataGridColumnDef } from '@apx-ui/ds';

interface Order {
  id: string;
  customer: string;
  total: number;
  status: 'paid' | 'pending' | 'refunded';
  placedAt: string;
}

const orders: Order[] = [
  { id: 'o-001', customer: 'Maya Singh', total: 128.5, status: 'paid', placedAt: '2026-04-12' },
  { id: 'o-002', customer: 'Liam Cohen', total: 42, status: 'pending', placedAt: '2026-04-14' },
  { id: 'o-003', customer: 'Ava Goldberg', total: 318, status: 'paid', placedAt: '2026-04-18' },
  { id: 'o-004', customer: 'Noah Park', total: 64, status: 'refunded', placedAt: '2026-04-20' },
  { id: 'o-005', customer: 'Sara Bloom', total: 7.5, status: 'pending', placedAt: '2026-04-21' },
  { id: 'o-006', customer: 'Theo Vance', total: 220, status: 'paid', placedAt: '2026-04-25' },
];

const columns: DataGridColumnDef<Order>[] = [
  { id: 'id', header: 'Order', accessor: 'id', type: 'text', filterable: true },
  { id: 'customer', header: 'Customer', accessor: 'customer', type: 'text', filterable: true, sortable: true },
  { id: 'total', header: 'Total', accessor: 'total', type: 'number', align: 'end', filterable: true, sortable: true },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    type: 'select',
    filterable: true,
    options: [
      { value: 'paid', label: 'Paid' },
      { value: 'pending', label: 'Pending' },
      { value: 'refunded', label: 'Refunded' },
    ],
  },
  { id: 'placedAt', header: 'Placed', accessor: 'placedAt', type: 'date', filterable: true },
];

/**
 * Per-column filter buttons live in the header. Each opens a popover whose form is
 * picked from the column's `type`:
 *
 *  - `text`     → contains / equals / starts-with / ends-with input
 *  - `number`   → comparison input (+ between range)
 *  - `date`     → date picker(s)
 *  - `select`   → multi-select checkboxes (in / notIn)
 *
 * The toolbar's "X active filters" label and global "Clear all" affordance arrive in
 * PR 7 alongside the empty / loading / error states.
 */
export default function Filtering() {
  return <DataGrid<Order> data={orders} columns={columns} getRowId={(o) => o.id} />;
}
