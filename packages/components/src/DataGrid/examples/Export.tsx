import { DataGrid } from '@apx-ui/ds';
import type { DataGridColumnDef } from '@apx-ui/ds';

interface Invoice {
  id: string;
  customer: string;
  amount: number;
  status: 'paid' | 'open' | 'void';
}

const invoices: Invoice[] = [
  { id: 'inv-001', customer: 'Maya Singh', amount: 128.5, status: 'paid' },
  { id: 'inv-002', customer: 'Liam Cohen', amount: 42, status: 'open' },
  { id: 'inv-003', customer: 'Ava Goldberg', amount: 318, status: 'paid' },
  { id: 'inv-004', customer: 'Noah Park', amount: 64, status: 'void' },
];

const columns: DataGridColumnDef<Invoice>[] = [
  { id: 'id', header: 'Invoice #', accessor: 'id', type: 'text' },
  { id: 'customer', header: 'Customer', accessor: 'customer', type: 'text' },
  { id: 'amount', header: 'Amount', accessor: 'amount', type: 'number', align: 'end' },
  { id: 'status', header: 'Status', accessor: 'status', type: 'text' },
];

/**
 * The toolbar's "Export" menu serialises the currently-filtered rows. CSV uses RFC
 * 4180 quoting; JSON is pretty-printed. Default behaviour triggers a browser
 * download — consumers can intercept by composing the headless variant and passing
 * `onCsvExport` / `onJsonExport` to `<DataGrid.Export>`.
 */
export default function Export() {
  return <DataGrid<Invoice> data={invoices} columns={columns} getRowId={(i) => i.id} />;
}