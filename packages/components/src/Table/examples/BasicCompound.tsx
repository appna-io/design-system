import { Badge, Table } from 'apx-ds';

const users = [
  { id: '1', name: 'Maya Singh', email: 'maya@example.com', plan: 'Pro' },
  { id: '2', name: 'Liam Cohen', email: 'liam@example.com', plan: 'Free' },
  { id: '3', name: 'Ava Goldberg', email: 'ava@example.com', plan: 'Pro' },
];

export default function BasicCompound() {
  return (
    <Table ariaLabel="Compound users table">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Email</Table.HeaderCell>
          <Table.HeaderCell align="end">Plan</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {users.map((u) => (
          <Table.Row key={u.id}>
            <Table.Cell>{u.name}</Table.Cell>
            <Table.Cell>{u.email}</Table.Cell>
            <Table.Cell align="end">
              <Badge color={u.plan === 'Pro' ? 'success' : 'neutral'}>{u.plan}</Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
