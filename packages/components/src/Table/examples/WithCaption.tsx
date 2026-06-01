import { Table } from '@apx-ui/ds';

const rows = [
  { id: '1', name: 'Maya', score: 92 },
  { id: '2', name: 'Liam', score: 88 },
  { id: '3', name: 'Ava', score: 95 },
];

export default function WithCaption() {
  return (
    <Table>
      <Table.Caption>Quarter 1 leaderboard \u2014 top performers by score.</Table.Caption>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell align="end">Score</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {rows.map((row) => (
          <Table.Row key={row.id}>
            <Table.Cell>{row.name}</Table.Cell>
            <Table.Cell align="end">{row.score}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}