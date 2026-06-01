import { axe, toHaveNoViolations } from 'jest-axe';
import { expect, describe, it } from 'vitest';

import { Table } from '../src/Table';
import type { TableColumn } from '../src/Table';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

const fixture: User[] = [
  { id: '1', name: 'Maya', email: 'maya@example.com', age: 28 },
  { id: '2', name: 'Liam', email: 'liam@example.com', age: 34 },
  { id: '3', name: 'Ava', email: 'ava@example.com', age: 22 },
];

const cols: TableColumn<User>[] = [
  { id: 'name', header: 'Name', accessor: (u) => u.name },
  { id: 'email', header: 'Email', accessor: (u) => u.email },
  { id: 'age', header: 'Age', accessor: (u) => u.age, align: 'end' },
];

const sortableCols: TableColumn<User>[] = cols.map((c) => ({ ...c, sortable: true }));

describe('Table — a11y', () => {
  it('declarative table has no violations', async () => {
    const { container } = render(
      <Table ariaLabel="Users" columns={cols} data={fixture} getRowId={(u) => u.id} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('sortable columns have no violations', async () => {
    const { container } = render(
      <Table
        ariaLabel="Sortable users"
        columns={sortableCols}
        data={fixture}
        getRowId={(u) => u.id}
        sort={{ id: 'name', direction: 'asc' }}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('multiple-selection mode has no violations', async () => {
    const { container } = render(
      <Table
        ariaLabel="Selectable users"
        columns={cols}
        data={fixture}
        getRowId={(u) => u.id}
        selectionMode="multiple"
        selected={['1']}
        onSelectedChange={() => {}}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('single-selection mode has no violations', async () => {
    const { container } = render(
      <Table
        ariaLabel="Single select"
        columns={cols}
        data={fixture}
        getRowId={(u) => u.id}
        selectionMode="single"
        selected="2"
        onSelectedChange={() => {}}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('loading state has no violations', async () => {
    const { container } = render(
      <Table
        ariaLabel="Loading users"
        columns={cols}
        data={[]}
        loading
        loadingRowCount={3}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('empty state has no violations', async () => {
    const { container } = render(
      <Table ariaLabel="Empty users" columns={cols} data={[]} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('error state has no violations', async () => {
    const { container } = render(
      <Table
        ariaLabel="Error users"
        columns={cols}
        data={fixture}
        getRowId={(u) => u.id}
        error={<span>Could not load</span>}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('card variant + striped + density=sm has no violations', async () => {
    const { container } = render(
      <Table
        ariaLabel="Styled"
        columns={cols}
        data={fixture}
        getRowId={(u) => u.id}
        variant="card"
        density="sm"
        striped
        bordered
        hoverable
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('sticky header has no violations', async () => {
    const { container } = render(
      <div style={{ maxHeight: 200, overflow: 'auto' }}>
        <Table
          ariaLabel="Sticky"
          columns={cols}
          data={fixture}
          getRowId={(u) => u.id}
          stickyHeader
        />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('compound API with caption has no violations', async () => {
    const { container } = render(
      <Table>
        <Table.Caption>Q1 leaderboard</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell align="end">Score</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Maya</Table.Cell>
            <Table.Cell align="end">92</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Liam</Table.Cell>
            <Table.Cell align="end">88</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('row actions slot has no violations', async () => {
    const { container } = render(
      <Table
        ariaLabel="With actions"
        columns={cols}
        data={fixture}
        getRowId={(u) => u.id}
        rowActions={(u) => (
          <button type="button" aria-label={`Edit ${u.name}`}>
            Edit
          </button>
        )}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('selectable + sortable + rowActions combined has no violations', async () => {
    const { container } = render(
      <Table
        ariaLabel="Combined"
        columns={sortableCols}
        data={fixture}
        getRowId={(u) => u.id}
        selectionMode="multiple"
        selected={['1']}
        onSelectedChange={() => {}}
        rowActions={(u) => (
          <button type="button" aria-label={`Edit ${u.name}`}>
            Edit
          </button>
        )}
        sort={{ id: 'name', direction: 'asc' }}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});