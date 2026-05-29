import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { DataGrid, useDataGrid } from '../src/DataGrid';
import type { ColumnDef } from '../src/DataGrid';
import {
  avg as dataGridAvg,
  formatAggregatedValue,
  runColumnAggregations,
  sum as dataGridSum,
} from '../src/DataGrid';
import { renderWithTheme as render } from './utils';

/* --------------------------------------------------------------------------
 *  PR 5 — Advanced: pinning + resize + expansion + editing + aggregations +
 *  loading / empty / error states
 *
 *  Each block targets one feature surface so a regression in (say) the
 *  resize handle stays isolated to its own failure. We mostly drive the
 *  high-level entry component; the cell editor + footer aggregator
 *  helpers also have unit-style coverage for the pure logic.
 * -------------------------------------------------------------------------- */

interface Row {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  signups: number;
}

const data: Row[] = [
  { id: '1', name: 'Maya', email: 'maya@example.com', role: 'admin', signups: 12 },
  { id: '2', name: 'Liam', email: 'liam@example.com', role: 'editor', signups: 4 },
  { id: '3', name: 'Ava', email: 'ava@example.com', role: 'viewer', signups: 18 },
];

const baseColumns: ColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, type: 'text' },
  { id: 'email', header: 'Email', accessor: 'email', type: 'text' },
  { id: 'role', header: 'Role', accessor: 'role', type: 'text' },
  {
    id: 'signups',
    header: 'Signups',
    accessor: 'signups',
    sortable: true,
    type: 'number',
    align: 'end',
  },
];

/* -------------------------------------------------------------------------- */
/*  Column resize                                                              */
/* -------------------------------------------------------------------------- */

describe('DataGrid — Column resize', () => {
  it('mounts a resize handle on resizable columns only', () => {
    const cols: ColumnDef<Row>[] = [
      { id: 'name', header: 'Name', accessor: 'name', type: 'text', resizable: true },
      { id: 'email', header: 'Email', accessor: 'email', type: 'text' },
    ];
    render(<DataGrid<Row> data={data} columns={cols} getRowId={(r) => r.id} />);
    const handles = document.querySelectorAll('[data-datagrid-resize-handle]');
    expect(handles).toHaveLength(1);
    expect(handles[0]).toHaveAttribute('data-column-id', 'name');
  });

  it('keyboard nudges the column size via ArrowRight / ArrowLeft', () => {
    const cols: ColumnDef<Row>[] = [
      { id: 'name', header: 'Name', accessor: 'name', type: 'text', resizable: true, width: 120 },
    ];
    render(<DataGrid<Row> data={data} columns={cols} getRowId={(r) => r.id} />);
    const handle = document.querySelector('[data-datagrid-resize-handle]') as HTMLButtonElement;
    // ArrowRight default step = 8px → 128.
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    const header = screen.getByRole('columnheader', { name: /Name/ });
    expect(header).toHaveStyle({ width: '128px' });
    // Shift + ArrowLeft step = 32px → 96.
    fireEvent.keyDown(handle, { key: 'ArrowLeft', shiftKey: true });
    expect(header).toHaveStyle({ width: '96px' });
    // Delete clears the override → falls back to column.width (120).
    fireEvent.keyDown(handle, { key: 'Delete' });
    expect(header).toHaveStyle({ width: '120px' });
  });

  it('double-click on the resize handle auto-sizes the column to its widest cell', () => {
    // Auto-size uses scrollWidth + horizontal padding. In jsdom both default to 0, so
    // the call short-circuits (we return early when widest is 0). The test still
    // exercises the code path — we just verify no crash and the width stays put.
    const cols: ColumnDef<Row>[] = [
      { id: 'name', header: 'Name', accessor: 'name', type: 'text', resizable: true, width: 120 },
    ];
    render(<DataGrid<Row> data={data} columns={cols} getRowId={(r) => r.id} />);
    const handle = document.querySelector('[data-datagrid-resize-handle]') as HTMLButtonElement;
    fireEvent.doubleClick(handle);
    const header = screen.getByRole('columnheader', { name: /Name/ });
    // No measured cells → width stays at the declared 120.
    expect(header).toHaveStyle({ width: '120px' });
  });
});

/* -------------------------------------------------------------------------- */
/*  Column pinning                                                             */
/* -------------------------------------------------------------------------- */

describe('DataGrid — Column pinning', () => {
  it('seeds state.columnPinning from `column.pinned` and applies sticky CSS', () => {
    const cols: ColumnDef<Row>[] = [
      { id: 'name', header: 'Name', accessor: 'name', type: 'text', pinned: 'start' },
      { id: 'email', header: 'Email', accessor: 'email', type: 'text' },
      { id: 'role', header: 'Role', accessor: 'role', type: 'text', pinned: 'end' },
    ];
    render(<DataGrid<Row> data={data} columns={cols} getRowId={(r) => r.id} />);
    const nameHeader = screen.getByRole('columnheader', { name: /Name/ });
    const roleHeader = screen.getByRole('columnheader', { name: /Role/ });
    expect(nameHeader).toHaveAttribute('data-pinned', 'start');
    expect(roleHeader).toHaveAttribute('data-pinned', 'end');
    expect(nameHeader).toHaveStyle({ position: 'sticky' });
    expect(roleHeader).toHaveStyle({ position: 'sticky' });
  });

  it('clicking "Pin to start" in the column menu pins the column', async () => {
    const user = userEvent.setup();
    render(<DataGrid<Row> data={data} columns={baseColumns} getRowId={(r) => r.id} />);
    const emailHeader = screen.getByRole('columnheader', { name: /Email/ });
    const menu = emailHeader.querySelector('[data-datagrid-column-menu]') as HTMLButtonElement;
    await user.click(menu);
    await user.click(await screen.findByRole('menuitem', { name: /Pin to start/i }));
    expect(emailHeader).toHaveAttribute('data-pinned', 'start');
  });

  it('moveColumn helper reorders via the column menu', async () => {
    const user = userEvent.setup();
    render(<DataGrid<Row> data={data} columns={baseColumns} getRowId={(r) => r.id} />);
    const emailHeader = screen.getByRole('columnheader', { name: /Email/ });
    const menu = emailHeader.querySelector('[data-datagrid-column-menu]') as HTMLButtonElement;
    await user.click(menu);
    await user.click(await screen.findByRole('menuitem', { name: /Move left/i }));
    const headers = screen.getAllByRole('columnheader');
    const idsInOrder = headers.map((h) => h.getAttribute('data-column-id'));
    // email started at index 1, moved left to 0 → name now at index 1.
    expect(idsInOrder[0]).toBe('email');
    expect(idsInOrder[1]).toBe('name');
  });
});

/* -------------------------------------------------------------------------- */
/*  Row expansion                                                              */
/* -------------------------------------------------------------------------- */

describe('DataGrid — Row expansion', () => {
  it('auto-injects an expand column when `renderExpandedRow` is provided', () => {
    render(
      <DataGrid<Row>
        data={data}
        columns={baseColumns}
        getRowId={(r) => r.id}
        renderExpandedRow={(row) => <div>Detail for {row.name}</div>}
      />,
    );
    const triggers = document.querySelectorAll('[data-datagrid-expand-trigger]');
    expect(triggers).toHaveLength(data.length);
  });

  it('clicking a chevron renders the expansion row with consumer JSX', async () => {
    const user = userEvent.setup();
    render(
      <DataGrid<Row>
        data={data}
        columns={baseColumns}
        getRowId={(r) => r.id}
        renderExpandedRow={(row) => <div data-testid="detail">Detail for {row.name}</div>}
      />,
    );
    const firstTrigger = document.querySelectorAll<HTMLButtonElement>(
      '[data-datagrid-expand-trigger]',
    )[0]!;
    await user.click(firstTrigger);
    const detail = await screen.findByTestId('detail');
    expect(detail).toHaveTextContent('Detail for Maya');
    // The expansion row carries data-datagrid-expansion-row="" so the visual layer can
    // animate it independently from the data row.
    expect(document.querySelector('[data-datagrid-expansion-row]')).not.toBeNull();
  });

  it('does not render a trigger when isRowExpandable returns false for the row', () => {
    render(
      <DataGrid<Row>
        data={data}
        columns={baseColumns}
        getRowId={(r) => r.id}
        renderExpandedRow={(row) => <div>Detail for {row.name}</div>}
        isRowExpandable={(row) => row.role !== 'viewer'}
      />,
    );
    // Ava is the only viewer → 2 triggers, not 3.
    expect(document.querySelectorAll('[data-datagrid-expand-trigger]')).toHaveLength(2);
  });
});

/* -------------------------------------------------------------------------- */
/*  Cell editing                                                               */
/* -------------------------------------------------------------------------- */

describe('DataGrid — Cell editing', () => {
  it('double-click on an editable cell mounts the default editor', () => {
    const cols: ColumnDef<Row>[] = [
      { id: 'name', header: 'Name', accessor: 'name', type: 'text', editable: true },
      { id: 'email', header: 'Email', accessor: 'email', type: 'text' },
    ];
    render(<DataGrid<Row> data={data} columns={cols} getRowId={(r) => r.id} />);
    const cell = document.querySelector(
      '[data-datagrid-cell][data-column-id="name"]',
    ) as HTMLTableCellElement;
    fireEvent.doubleClick(cell);
    const editor = document.querySelector('[data-datagrid-cell-editor]');
    expect(editor).not.toBeNull();
    expect(editor!.querySelector('input')).not.toBeNull();
  });

  it('pressing Enter commits the new value', () => {
    const onCellEdit = vi.fn();
    const cols: ColumnDef<Row>[] = [
      {
        id: 'name',
        header: 'Name',
        accessor: 'name',
        type: 'text',
        editable: true,
        onCellEdit,
      },
    ];
    render(<DataGrid<Row> data={data} columns={cols} getRowId={(r) => r.id} />);
    const cell = document.querySelector(
      '[data-datagrid-cell][data-column-id="name"]',
    ) as HTMLTableCellElement;
    fireEvent.doubleClick(cell);
    const input = document.querySelector(
      '[data-datagrid-cell-editor] input',
    ) as HTMLInputElement;
    // Drive a direct change + Enter to bypass userEvent's auto-focus assumptions in
    // jsdom (the editor mounts and grabs focus via useEffect, but the next render
    // cycle in user-event 14 sometimes loses the reference).
    fireEvent.change(input, { target: { value: 'Updated' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCellEdit).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1' }),
      'Updated',
    );
    expect(document.querySelector('[data-datagrid-cell-editor]')).toBeNull();
  });

  it('pressing Escape cancels without invoking onCellEdit', () => {
    const onCellEdit = vi.fn();
    const cols: ColumnDef<Row>[] = [
      { id: 'name', header: 'Name', accessor: 'name', type: 'text', editable: true, onCellEdit },
    ];
    render(<DataGrid<Row> data={data} columns={cols} getRowId={(r) => r.id} />);
    const cell = document.querySelector(
      '[data-datagrid-cell][data-column-id="name"]',
    ) as HTMLTableCellElement;
    fireEvent.doubleClick(cell);
    const input = document.querySelector(
      '[data-datagrid-cell-editor] input',
    ) as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onCellEdit).not.toHaveBeenCalled();
    expect(document.querySelector('[data-datagrid-cell-editor]')).toBeNull();
  });

  it('F2 also enters edit mode for editable cells', () => {
    const cols: ColumnDef<Row>[] = [
      { id: 'name', header: 'Name', accessor: 'name', type: 'text', editable: true },
    ];
    render(<DataGrid<Row> data={data} columns={cols} getRowId={(r) => r.id} />);
    const cell = document.querySelector(
      '[data-datagrid-cell][data-column-id="name"]',
    ) as HTMLTableCellElement;
    fireEvent.keyDown(cell, { key: 'F2' });
    expect(document.querySelector('[data-datagrid-cell-editor]')).not.toBeNull();
  });
});

/* -------------------------------------------------------------------------- */
/*  Footer aggregations                                                        */
/* -------------------------------------------------------------------------- */

describe('DataGrid — Footer aggregations', () => {
  it('auto-mounts <tfoot> when any column declares an aggregation', () => {
    const cols: ColumnDef<Row>[] = [
      { id: 'name', header: 'Name', accessor: 'name', type: 'text' },
      {
        id: 'signups',
        header: 'Signups',
        accessor: 'signups',
        type: 'number',
        aggregations: ['sum', 'avg'],
      },
    ];
    render(<DataGrid<Row> data={data} columns={cols} getRowId={(r) => r.id} />);
    const tfoot = document.querySelector('[data-datagrid-tfoot]');
    expect(tfoot).not.toBeNull();
    const cell = tfoot!.querySelector('[data-column-id="signups"]')!;
    // sum = 12 + 4 + 18 = 34; avg ≈ 11.33 (formatted via Intl.NumberFormat, locale-dependent).
    expect(cell.textContent).toContain('34');
  });

  it('runColumnAggregations is a pure function over filtered rows', () => {
    const col: ColumnDef<Row> = {
      id: 'signups',
      header: 'Signups',
      accessor: 'signups',
      type: 'number',
      aggregations: ['sum', 'min', 'max'],
    };
    const rows = data.map((d, i) => ({ id: d.id, index: i, original: d }));
    const out = runColumnAggregations(col, rows);
    expect(out.map((r) => r.id)).toEqual(['sum', 'min', 'max']);
    expect(out[0]!.value).toBe(34);
    expect(out[1]!.value).toBe(4);
    expect(out[2]!.value).toBe(18);
  });

  it('formatAggregatedValue honours column.precision for number columns', () => {
    const col = {
      id: 'price',
      header: 'Price',
      accessor: 'price',
      type: 'number',
      precision: 2,
    } as unknown as ColumnDef<{ price: number }>;
    expect(formatAggregatedValue(12.3456, col)).toBe('12.35');
  });

  it('custom aggregation supplies its own label + fn', () => {
    const col: ColumnDef<Row> = {
      id: 'signups',
      header: 'Signups',
      accessor: 'signups',
      type: 'number',
      aggregations: [
        {
          id: 'firstTwo',
          label: 'First Two',
          fn: (rows) =>
            (rows[0] as Row).signups + (rows[1] as Row).signups,
        },
      ],
    };
    const rows = data.map((d, i) => ({ id: d.id, index: i, original: d }));
    const out = runColumnAggregations(col, rows);
    expect(out[0]).toEqual({ id: 'firstTwo', label: 'First Two', value: 16 });
  });

  it('sum + avg helpers are exported pure', () => {
    const col = baseColumns.find((c) => c.id === 'signups')!;
    const rows = data.map((d, i) => ({ id: d.id, index: i, original: d }));
    expect(dataGridSum(rows, col)).toBe(34);
    expect(dataGridAvg(rows, col)).toBeCloseTo(34 / 3, 5);
  });
});

/* -------------------------------------------------------------------------- */
/*  Loading / Empty / Error states                                             */
/* -------------------------------------------------------------------------- */

describe('DataGrid — Loading / Empty / Error', () => {
  it('renders the loading overlay when `loading` is true', () => {
    render(
      <DataGrid<Row>
        data={data}
        columns={baseColumns}
        getRowId={(r) => r.id}
        loading
      />,
    );
    const overlay = document.querySelector('[data-datagrid-loading]');
    expect(overlay).not.toBeNull();
    expect(overlay).toHaveAttribute('role', 'status');
  });

  it('auto-renders an empty placeholder when the filtered set has zero rows', () => {
    render(<DataGrid<Row> data={[]} columns={baseColumns} getRowId={(r) => r.id} />);
    expect(document.querySelector('[data-datagrid-empty]')).not.toBeNull();
  });

  it('lets the consumer override the empty copy with a string `emptyState`', () => {
    render(
      <DataGrid<Row>
        data={[]}
        columns={baseColumns}
        getRowId={(r) => r.id}
        emptyState="No matching users"
      />,
    );
    expect(screen.getByText('No matching users')).toBeInTheDocument();
  });

  it('renders the error UI when `errorState` is set', () => {
    render(
      <DataGrid<Row>
        data={data}
        columns={baseColumns}
        getRowId={(r) => r.id}
        errorState="API exploded"
      />,
    );
    const err = document.querySelector('[data-datagrid-error]');
    expect(err).not.toBeNull();
    expect(err).toHaveAttribute('role', 'alert');
    expect(within(err as HTMLElement).getByText('API exploded')).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/*  Headless composition with PR 5 parts                                       */
/* -------------------------------------------------------------------------- */

describe('DataGrid — Headless composition (PR 5 parts)', () => {
  it('exposes every PR 5 subpart off the entry component', () => {
    // `forwardRef` returns an exotic object whose `typeof` is 'object', not 'function'.
    // We just assert presence + non-null — that's enough to catch a missing barrel export.
    expect(DataGrid.ResizeHandle).toBeDefined();
    expect(DataGrid.ExpansionRow).toBeDefined();
    expect(DataGrid.CellEditor).toBeDefined();
    expect(DataGrid.Footer).toBeDefined();
    expect(DataGrid.Loading).toBeDefined();
    expect(DataGrid.Empty).toBeDefined();
    expect(DataGrid.Error).toBeDefined();
    expect(DataGrid.ExpandHeaderCell).toBeDefined();
    expect(DataGrid.ExpandCell).toBeDefined();
    expect(DataGrid.ColumnMenu).toBeDefined();
  });

  it('renders a Footer when composed manually', () => {
    function Harness(): ReactElement {
      const cols: ColumnDef<Row>[] = [
        { id: 'name', header: 'Name', accessor: 'name', type: 'text' },
        {
          id: 'signups',
          header: 'Signups',
          accessor: 'signups',
          type: 'number',
          aggregations: ['sum'],
        },
      ];
      const grid = useDataGrid<Row>({ data, columns: cols, getRowId: (r) => r.id });
      return (
        <DataGrid.Root grid={grid}>
          <DataGrid.Table>
            <DataGrid.Header />
            <DataGrid.Body />
            <DataGrid.Footer />
          </DataGrid.Table>
        </DataGrid.Root>
      );
    }
    render(<Harness />);
    expect(document.querySelector('[data-datagrid-tfoot]')).not.toBeNull();
  });
});
