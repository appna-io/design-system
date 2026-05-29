import { useState } from 'react';
import { Button, Table } from '@apx-ui/ds';
import type { TableColumn } from '@apx-ui/ds';

interface Order {
  id: string;
  customer: string;
  total: string;
}

const initial: Order[] = [
  { id: 'A-1001', customer: 'Maya Singh', total: '$129.00' },
  { id: 'A-1002', customer: 'Liam Cohen', total: '$48.00' },
  { id: 'A-1003', customer: 'Ava Goldberg', total: '$310.00' },
];

const columns: TableColumn<Order>[] = [
  { id: 'id', header: 'Order ID', accessor: (o) => o.id },
  { id: 'customer', header: 'Customer', accessor: (o) => o.customer },
  { id: 'total', header: 'Total', accessor: (o) => o.total, align: 'end' },
];

export default function RowActions() {
  const [orders, setOrders] = useState(initial);
  const [lastAction, setLastAction] = useState<string>('none');

  return (
    <div className="flex flex-col gap-2">
      <p className="text-fg-muted text-sm">
        Last action: <code>{lastAction}</code>
      </p>
      <Table
        ariaLabel="Orders with row actions"
        columns={columns}
        data={orders}
        getRowId={(o) => o.id}
        rowActions={(o) => (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setLastAction(`Edit ${o.id}`)}
              aria-label={`Edit ${o.id}`}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              color="danger"
              onClick={() => {
                setLastAction(`Delete ${o.id}`);
                setOrders((prev) => prev.filter((row) => row.id !== o.id));
              }}
              aria-label={`Delete ${o.id}`}
            >
              Delete
            </Button>
          </div>
        )}
      />
    </div>
  );
}
