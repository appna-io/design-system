import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Table } from '../src/Table';
import type { TableColumn, TableSortState } from '../src/Table';
import { renderWithTheme as render } from './utils';

interface User {
  id: string;
  name: string;
  age: number;
  joined: string;
  active: boolean;
}

const fixture: User[] = [
  { id: '1', name: 'Maya', age: 28, joined: '2024-06-12', active: true },
  { id: '2', name: 'Liam', age: 34, joined: '2023-11-03', active: true },
  { id: '3', name: 'Ava', age: 22, joined: '2025-02-19', active: false },
];

const baseColumns: TableColumn<User>[] = [
  { id: 'name', header: 'Name', accessor: (u) => u.name },
  { id: 'age', header: 'Age', accessor: (u) => u.age, align: 'end' },
];

describe('Table — declarative API', () => {
  it('renders a header for each column', () => {
    render(<Table ariaLabel="t" columns={baseColumns} data={fixture} getRowId={(u) => u.id} />);
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Age' })).toBeInTheDocument();
  });

  it('renders one row per data entry', () => {
    render(<Table ariaLabel="t" columns={baseColumns} data={fixture} getRowId={(u) => u.id} />);
    const rows = screen.getAllByRole('row');
    // 1 header row + 3 body rows
    expect(rows).toHaveLength(4);
  });

  it('uses accessor + cell renderer correctly', () => {
    const cols: TableColumn<User>[] = [
      { id: 'name', header: 'Name', accessor: (u) => u.name },
      { id: 'badge', header: 'Active', cell: (u) => (u.active ? 'yes' : 'no') },
    ];
    render(<Table ariaLabel="t" columns={cols} data={fixture} getRowId={(u) => u.id} />);
    expect(screen.getAllByText('yes')).toHaveLength(2);
    expect(screen.getByText('no')).toBeInTheDocument();
  });

  it('skips hidden columns', () => {
    const cols: TableColumn<User>[] = [
      { id: 'name', header: 'Name', accessor: (u) => u.name },
      { id: 'age', header: 'Age', accessor: (u) => u.age, hidden: true },
    ];
    render(<Table ariaLabel="t" columns={cols} data={fixture} getRowId={(u) => u.id} />);
    expect(screen.queryByRole('columnheader', { name: 'Age' })).not.toBeInTheDocument();
  });

  it('forwards ariaLabel to the <table>', () => {
    render(<Table ariaLabel="Members" columns={baseColumns} data={fixture} getRowId={(u) => u.id} />);
    const table = screen.getByRole('table', { name: 'Members' });
    expect(table).toBeInTheDocument();
  });
});

describe('Table — compound API', () => {
  it('wins over declarative when both children and columns are present', () => {
    render(
      <Table ariaLabel="t" columns={baseColumns} data={fixture} getRowId={(u) => u.id}>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Compound</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Just one</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(screen.getByText('Compound')).toBeInTheDocument();
    expect(screen.getByText('Just one')).toBeInTheDocument();
    // Declarative header should not render
    expect(screen.queryByRole('columnheader', { name: 'Name' })).not.toBeInTheDocument();
  });

  it('renders <caption> via Table.Caption', () => {
    render(
      <Table>
        <Table.Caption>Quarter 1 results</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>X</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
      </Table>,
    );
    expect(screen.getByText('Quarter 1 results')).toBeInTheDocument();
  });

  it('renders <tfoot> via Table.Foot', () => {
    const { container } = render(
      <Table ariaLabel="t">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>X</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Foot>
          <Table.Row>
            <Table.Cell>Totals</Table.Cell>
          </Table.Row>
        </Table.Foot>
      </Table>,
    );
    expect(container.querySelector('tfoot')).not.toBeNull();
    expect(screen.getByText('Totals')).toBeInTheDocument();
  });

  it('Table.Row honours selected + disabled attributes', () => {
    const { container } = render(
      <Table ariaLabel="t">
        <Table.Body>
          <Table.Row selected>
            <Table.Cell>A</Table.Cell>
          </Table.Row>
          <Table.Row disabled>
            <Table.Cell>B</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    const rows = container.querySelectorAll('tr[data-table-row]');
    expect(rows[0]).toHaveAttribute('data-selected', 'true');
    expect(rows[0]).toHaveAttribute('aria-selected', 'true');
    expect(rows[1]).toHaveAttribute('data-disabled', 'true');
  });
});

describe('Table — sort', () => {
  it('shows the neutral indicator for sortable columns without active sort', () => {
    const cols: TableColumn<User>[] = [
      { id: 'name', header: 'Name', accessor: (u) => u.name, sortable: true },
    ];
    render(<Table ariaLabel="t" columns={cols} data={fixture} getRowId={(u) => u.id} />);
    const header = screen.getByRole('columnheader', { name: /Name/i });
    expect(header).toHaveAttribute('aria-sort', 'none');
  });

  it('uses aria-sort=ascending/descending when sort matches', () => {
    const cols: TableColumn<User>[] = [
      { id: 'name', header: 'Name', accessor: (u) => u.name, sortable: true },
    ];
    const { rerender } = render(
      <Table
        ariaLabel="t"
        columns={cols}
        data={fixture}
        getRowId={(u) => u.id}
        sort={{ id: 'name', direction: 'asc' }}
      />,
    );
    expect(screen.getByRole('columnheader', { name: /Name/i })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    rerender(
      <Table
        ariaLabel="t"
        columns={cols}
        data={fixture}
        getRowId={(u) => u.id}
        sort={{ id: 'name', direction: 'desc' }}
      />,
    );
    expect(screen.getByRole('columnheader', { name: /Name/i })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
  });

  it('cycles asc → desc → undefined when header is clicked', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const cols: TableColumn<User>[] = [
      { id: 'name', header: 'Name', accessor: (u) => u.name, sortable: true },
    ];
    function Wrapper() {
      const [sort, setSort] = useState<TableSortState | undefined>(undefined);
      return (
        <Table
          ariaLabel="t"
          columns={cols}
          data={fixture}
          getRowId={(u) => u.id}
          sort={sort}
          onSortChange={(next) => {
            onSortChange(next);
            setSort(next);
          }}
        />
      );
    }
    render(<Wrapper />);
    const btn = screen.getByRole('button', { name: /Name/i });
    await user.click(btn);
    expect(onSortChange).toHaveBeenLastCalledWith({ id: 'name', direction: 'asc' });
    await user.click(btn);
    expect(onSortChange).toHaveBeenLastCalledWith({ id: 'name', direction: 'desc' });
    await user.click(btn);
    expect(onSortChange).toHaveBeenLastCalledWith(undefined);
  });

  it('sorts the rendered rows when sort is set', () => {
    const cols: TableColumn<User>[] = [
      { id: 'age', header: 'Age', accessor: (u) => u.age, sortable: true, sortFn: 'number' },
    ];
    render(
      <Table
        ariaLabel="t"
        columns={cols}
        data={fixture}
        getRowId={(u) => u.id}
        sort={{ id: 'age', direction: 'asc' }}
      />,
    );
    const cells = screen
      .getAllByRole('cell')
      .map((cell) => cell.textContent?.trim() ?? '')
      .filter((value) => value.length > 0);
    expect(cells).toEqual(['22', '28', '34']);
  });
});

describe('Table — selection', () => {
  it('injects a leading checkbox column when selectionMode is multiple', () => {
    render(
      <Table
        ariaLabel="t"
        columns={baseColumns}
        data={fixture}
        getRowId={(u) => u.id}
        selectionMode="multiple"
        selected={[]}
        onSelectedChange={() => {}}
      />,
    );
    // header master checkbox + one per row = 4
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
  });

  it('master checkbox toggles all selectable rows', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Table
        ariaLabel="t"
        columns={baseColumns}
        data={fixture}
        getRowId={(u) => u.id}
        selectionMode="multiple"
        selected={[]}
        onSelectedChange={onChange}
      />,
    );
    const master = screen.getByRole('checkbox', { name: /Select all rows/i });
    await user.click(master);
    expect(onChange).toHaveBeenCalledWith(['1', '2', '3']);
  });

  it('isRowSelectable=false disables that row checkbox', () => {
    render(
      <Table
        ariaLabel="t"
        columns={baseColumns}
        data={fixture}
        getRowId={(u) => u.id}
        selectionMode="multiple"
        selected={[]}
        onSelectedChange={() => {}}
        isRowSelectable={(row) => row.active}
      />,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    // master is at index 0; checkbox for inactive Ava (id=3) is the 4th
    expect(checkboxes[3]).toBeDisabled();
  });

  it('single-mode picks exactly one row at a time', async () => {
    const user = userEvent.setup();
    function Wrapper() {
      const [selected, setSelected] = useState<string>('');
      return (
        <>
          <output data-testid="signal">{selected}</output>
          <Table
            ariaLabel="t"
            columns={baseColumns}
            data={fixture}
            getRowId={(u) => u.id}
            selectionMode="single"
            selected={selected}
            onSelectedChange={(next) => setSelected(next as string)}
          />
        </>
      );
    }
    render(<Wrapper />);
    const rowCheckboxes = screen.getAllByRole('checkbox', { name: /Select row/i });
    await user.click(rowCheckboxes[0]!);
    expect(screen.getByTestId('signal')).toHaveTextContent('1');
    await user.click(rowCheckboxes[1]!);
    expect(screen.getByTestId('signal')).toHaveTextContent('2');
  });

  it('multi-mode toggles individual rows independently', async () => {
    const user = userEvent.setup();
    function Wrapper() {
      const [selected, setSelected] = useState<string[]>([]);
      return (
        <>
          <output data-testid="signal">{selected.join(',')}</output>
          <Table
            ariaLabel="t"
            columns={baseColumns}
            data={fixture}
            getRowId={(u) => u.id}
            selectionMode="multiple"
            selected={selected}
            onSelectedChange={(next) => setSelected(next as string[])}
          />
        </>
      );
    }
    render(<Wrapper />);
    const rowCheckboxes = screen.getAllByRole('checkbox', { name: /Select row/i });
    await user.click(rowCheckboxes[0]!);
    await user.click(rowCheckboxes[1]!);
    expect(screen.getByTestId('signal')).toHaveTextContent('1,2');
    await user.click(rowCheckboxes[0]!);
    expect(screen.getByTestId('signal')).toHaveTextContent('2');
  });
});

describe('Table — row actions + onRowClick', () => {
  it('renders the rowActions slot into a trailing column', () => {
    render(
      <Table
        ariaLabel="t"
        columns={baseColumns}
        data={fixture}
        getRowId={(u) => u.id}
        rowActions={(u) => <button type="button">Edit {u.name}</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Edit Maya' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Liam' })).toBeInTheDocument();
  });

  it('onRowClick fires on body row click', () => {
    const onRowClick = vi.fn();
    render(
      <Table
        ariaLabel="t"
        columns={baseColumns}
        data={fixture}
        getRowId={(u) => u.id}
        onRowClick={onRowClick}
      />,
    );
    const rows = screen.getAllByRole('row').slice(1); // skip header
    fireEvent.click(rows[0]!);
    expect(onRowClick).toHaveBeenCalledWith(fixture[0], 0);
  });

  it('onRowClick does NOT fire when clicking inside row actions', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    const onAction = vi.fn();
    render(
      <Table
        ariaLabel="t"
        columns={baseColumns}
        data={fixture}
        getRowId={(u) => u.id}
        onRowClick={onRowClick}
        rowActions={(u) => (
          <button type="button" onClick={onAction}>
            Edit {u.name}
          </button>
        )}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Edit Maya' }));
    expect(onAction).toHaveBeenCalled();
    expect(onRowClick).not.toHaveBeenCalled();
  });
});

describe('Table — loading / empty / error', () => {
  it('renders loadingRowCount skeleton rows + sets aria-busy', () => {
    const { container } = render(
      <Table
        ariaLabel="t"
        columns={baseColumns}
        data={fixture}
        getRowId={(u) => u.id}
        loading
        loadingRowCount={3}
      />,
    );
    const tbody = container.querySelector('tbody');
    expect(tbody).toHaveAttribute('aria-busy', 'true');
    const skeletonRows = container.querySelectorAll('tr[data-table-state="loading"]');
    expect(skeletonRows).toHaveLength(3);
  });

  it('renders the empty slot when data is empty', () => {
    render(
      <Table
        ariaLabel="t"
        columns={baseColumns}
        data={[]}
        empty={<span>Nothing here</span>}
      />,
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders the default empty message when no slot is provided', () => {
    render(<Table ariaLabel="t" columns={baseColumns} data={[]} />);
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('renders the error slot in preference to data', () => {
    render(
      <Table
        ariaLabel="t"
        columns={baseColumns}
        data={fixture}
        getRowId={(u) => u.id}
        error={<span>Something failed</span>}
      />,
    );
    expect(screen.getByText('Something failed')).toBeInTheDocument();
    expect(screen.queryByText('Maya')).not.toBeInTheDocument();
  });
});

describe('Table — visual axes', () => {
  it('exposes data-variant + data-density on the root', () => {
    const { container } = render(
      <Table ariaLabel="t" variant="card" density="lg" columns={baseColumns} data={fixture} getRowId={(u) => u.id} />,
    );
    const table = container.querySelector('table');
    expect(table).toHaveAttribute('data-variant', 'card');
    expect(table).toHaveAttribute('data-density', 'lg');
  });

  it('header cell uses scope="col" by default', () => {
    const { container } = render(
      <Table ariaLabel="t" columns={baseColumns} data={fixture} getRowId={(u) => u.id} />,
    );
    const ths = container.querySelectorAll('thead th');
    ths.forEach((th) => expect(th).toHaveAttribute('scope', 'col'));
  });

  it('forwards align to cell data attribute', () => {
    const cols: TableColumn<User>[] = [
      { id: 'name', header: 'Name', accessor: (u) => u.name, align: 'center' },
    ];
    const { container } = render(
      <Table ariaLabel="t" columns={cols} data={fixture} getRowId={(u) => u.id} />,
    );
    const td = within(container.querySelector('tbody')!).getAllByRole('cell')[0]!;
    expect(td).toHaveAttribute('data-align', 'center');
  });
});