import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { DataGrid, useDataGrid } from '../src/DataGrid';
import type { ColumnDef } from '../src/DataGrid';
import { renderWithTheme as render } from './utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  signups: number;
}

const fixture: User[] = [
  { id: '1', name: 'Maya', email: 'maya@example.com', role: 'admin', signups: 12 },
  { id: '2', name: 'Liam', email: 'liam@example.com', role: 'editor', signups: 4 },
  { id: '3', name: 'Ava', email: 'ava@example.com', role: 'viewer', signups: 18 },
];

const baseColumns: ColumnDef<User>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, type: 'text' },
  { id: 'email', header: 'Email', accessor: 'email', type: 'text' },
  { id: 'signups', header: 'Signups', accessor: 'signups', sortable: true, type: 'number', align: 'end' },
];

describe('DataGrid — DOM scaffolding', () => {
  it('renders a semantic <table role="grid"> with aria-rowcount + aria-colcount', () => {
    render(<DataGrid<User> data={fixture} columns={baseColumns} getRowId={(u) => u.id} />);
    const grid = screen.getByRole('grid');
    expect(grid.tagName).toBe('TABLE');
    // 1 header + 3 body rows = 4 logical rows.
    expect(grid).toHaveAttribute('aria-rowcount', '4');
    expect(grid).toHaveAttribute('aria-colcount', '3');
  });

  it('renders one row per data entry', () => {
    render(<DataGrid<User> data={fixture} columns={baseColumns} getRowId={(u) => u.id} />);
    const rows = screen.getAllByRole('row');
    // header + 3 body rows
    expect(rows).toHaveLength(4);
  });

  it('renders a <th role="columnheader"> per visible column', () => {
    render(<DataGrid<User> data={fixture} columns={baseColumns} getRowId={(u) => u.id} />);
    expect(screen.getByRole('columnheader', { name: /Name/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Email/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Signups/ })).toBeInTheDocument();
  });

  it('renders accessor values into body cells', () => {
    render(<DataGrid<User> data={fixture} columns={baseColumns} getRowId={(u) => u.id} />);
    expect(screen.getByText('maya@example.com')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
  });

  it('applies aria-colindex (1-based) to cells in display order', () => {
    render(<DataGrid<User> data={fixture} columns={baseColumns} getRowId={(u) => u.id} />);
    const cells = screen.getAllByRole('gridcell');
    // 3 cols × 3 rows = 9 cells. First cell of first row should be aria-colindex="1".
    expect(cells[0]).toHaveAttribute('aria-colindex', '1');
    expect(cells[1]).toHaveAttribute('aria-colindex', '2');
    expect(cells[2]).toHaveAttribute('aria-colindex', '3');
  });

  it('marks read-only cells aria-readonly when column has no editor', () => {
    render(<DataGrid<User> data={fixture} columns={baseColumns} getRowId={(u) => u.id} />);
    const cells = screen.getAllByRole('gridcell');
    cells.forEach((cell) => expect(cell).toHaveAttribute('aria-readonly', 'true'));
  });

  it('forwards ref to the outer wrapper <div>', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <DataGrid<User>
        data={fixture}
        columns={baseColumns}
        getRowId={(u) => u.id}
        ref={ref}
      />,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('data-datagrid', '');
  });
});

describe('DataGrid — sorting (click + multi-sort)', () => {
  it('aria-sort starts as "none" on every sortable column', () => {
    render(<DataGrid<User> data={fixture} columns={baseColumns} getRowId={(u) => u.id} />);
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute(
      'aria-sort',
      'none',
    );
    expect(screen.getByRole('columnheader', { name: /Signups/ })).toHaveAttribute(
      'aria-sort',
      'none',
    );
  });

  it('clicking a sortable header cycles asc → desc → none', async () => {
    const user = userEvent.setup();
    render(<DataGrid<User> data={fixture} columns={baseColumns} getRowId={(u) => u.id} />);
    const header = screen.getByRole('columnheader', { name: /Name/ });
    const button = header.querySelector<HTMLButtonElement>('[data-datagrid-sort-button]');
    expect(button).not.toBeNull();

    await user.click(button!);
    expect(header).toHaveAttribute('aria-sort', 'ascending');

    await user.click(button!);
    expect(header).toHaveAttribute('aria-sort', 'descending');

    await user.click(button!);
    expect(header).toHaveAttribute('aria-sort', 'none');
  });

  it('shift-click adds a column to the sort stack (multi-sort)', () => {
    render(<DataGrid<User> data={fixture} columns={baseColumns} getRowId={(u) => u.id} />);
    const nameHeader = screen.getByRole('columnheader', { name: /Name/ });
    const signupsHeader = screen.getByRole('columnheader', { name: /Signups/ });

    fireEvent.click(nameHeader.querySelector('[data-datagrid-sort-button]')!);
    fireEvent.click(signupsHeader.querySelector('[data-datagrid-sort-button]')!, { shiftKey: true });

    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    expect(signupsHeader).toHaveAttribute('aria-sort', 'ascending');
    // Stack-index pills appear when there is more than one sorted column.
    expect(within(nameHeader).getByText('1')).toBeInTheDocument();
    expect(within(signupsHeader).getByText('2')).toBeInTheDocument();
  });

  it('does not attach a sort button to non-sortable headers', () => {
    render(<DataGrid<User> data={fixture} columns={baseColumns} getRowId={(u) => u.id} />);
    const emailHeader = screen.getByRole('columnheader', { name: /Email/ });
    // The PR 5 column menu (kebab) also lives in headers — it's not a sort affordance,
    // so we filter to the dedicated `data-datagrid-sort-button` selector.
    expect(emailHeader.querySelector('[data-datagrid-sort-button]')).toBeNull();
  });

  it('reorders rows by the sorted column value', async () => {
    const user = userEvent.setup();
    render(<DataGrid<User> data={fixture} columns={baseColumns} getRowId={(u) => u.id} />);
    const signupsHeader = screen.getByRole('columnheader', { name: /Signups/ });
    await user.click(signupsHeader.querySelector('[data-datagrid-sort-button]')!);
    const cells = screen.getAllByRole('gridcell');
    // After ascending sort by signups: 4, 12, 18. The signups column is colindex 3.
    const signupCells = cells.filter((c) => c.getAttribute('aria-colindex') === '3');
    expect(signupCells.map((c) => c.textContent)).toEqual(['4', '12', '18']);
  });
});

describe('DataGrid — headless composition', () => {
  it('renders via subparts when consumers compose Root → Table → Header + Body manually', () => {
    function Composed() {
      const grid = useDataGrid<User>({
        data: fixture,
        columns: baseColumns,
        getRowId: (u) => u.id,
      });
      return (
        <DataGrid.Root grid={grid}>
          <DataGrid.Table>
            <DataGrid.Header />
            <DataGrid.Body />
          </DataGrid.Table>
        </DataGrid.Root>
      );
    }
    render(<Composed />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(4);
  });
});

describe('DataGrid — controlled selection', () => {
  it('applies aria-selected to the rows in selectedRowIds', () => {
    render(
      <DataGrid<User>
        data={fixture}
        columns={baseColumns}
        getRowId={(u) => u.id}
        selectionMode="multiple"
        selectedRowIds={new Set(['2'])}
      />,
    );
    const rows = screen.getAllByRole('row');
    // header is rows[0]; body rows order matches fixture (no sort)
    expect(rows[1]).toHaveAttribute('aria-selected', 'false');
    expect(rows[2]).toHaveAttribute('aria-selected', 'true');
    expect(rows[3]).toHaveAttribute('aria-selected', 'false');
  });

  it('aria-multiselectable=true is set on the <table> when selectionMode is "multiple"', () => {
    render(
      <DataGrid<User>
        data={fixture}
        columns={baseColumns}
        getRowId={(u) => u.id}
        selectionMode="multiple"
      />,
    );
    expect(screen.getByRole('grid')).toHaveAttribute('aria-multiselectable', 'true');
  });
});

describe('DataGrid — custom cell render', () => {
  it('respects column.cell(({ value, row, … })) over the accessor', () => {
    const cols: ColumnDef<User>[] = [
      { id: 'name', header: 'Name', accessor: 'name', type: 'text' },
      {
        id: 'role',
        header: 'Role',
        accessor: 'role',
        type: 'text',
        cell: ({ value }: { value: unknown }) => (
          <span data-testid="role-pill">[{String(value)}]</span>
        ),
      },
    ];
    render(<DataGrid<User> data={fixture} columns={cols} getRowId={(u) => u.id} />);
    const pills = screen.getAllByTestId('role-pill');
    expect(pills).toHaveLength(3);
    expect(pills[0]).toHaveTextContent('[admin]');
  });
});

describe('DataGrid — onStateChange', () => {
  it('fires when the consumer cycles a sortable header', async () => {
    const user = userEvent.setup();
    const onStateChange = vi.fn();
    render(
      <DataGrid<User>
        data={fixture}
        columns={baseColumns}
        getRowId={(u) => u.id}
        onStateChange={onStateChange}
      />,
    );
    const header = screen.getByRole('columnheader', { name: /Name/ });
    await user.click(header.querySelector('[data-datagrid-sort-button]')!);
    expect(onStateChange).toHaveBeenCalled();
    const last = onStateChange.mock.calls.at(-1)?.[0];
    expect(last.sort).toEqual([{ id: 'name', direction: 'asc' }]);
  });
});
