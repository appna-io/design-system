import { Table } from '@apx-ui/ds';

const items = [
  { id: '1', label: 'Foundation', qty: 2, total: 58 },
  { id: '2', label: 'Mascara', qty: 1, total: 18 },
  { id: '3', label: 'Lip tint', qty: 3, total: 66 },
];

const subtotal = items.reduce((acc, item) => acc + item.total, 0);

export default function WithFooter() {
  return (
    <Table ariaLabel="Order summary">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Item</Table.HeaderCell>
          <Table.HeaderCell align="end">Qty</Table.HeaderCell>
          <Table.HeaderCell align="end">Total</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {items.map((item) => (
          <Table.Row key={item.id}>
            <Table.Cell>{item.label}</Table.Cell>
            <Table.Cell align="end">{item.qty}</Table.Cell>
            <Table.Cell align="end">${item.total}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      <Table.Foot>
        <Table.Row>
          <Table.Cell colSpan={2}>
            <strong>Subtotal</strong>
          </Table.Cell>
          <Table.Cell align="end">
            <strong>${subtotal}</strong>
          </Table.Cell>
        </Table.Row>
      </Table.Foot>
    </Table>
  );
}
