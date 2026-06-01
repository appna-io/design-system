import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { DataGrid, useDataGrid } from '../src/DataGrid';
import type { ColumnDef, DataGridRowAction } from '../src/DataGrid';
import { renderWithTheme as render } from './utils';

/* --------------------------------------------------------------------------
 *  PR 4 — Toolbar + Pagination + Selection + Filter UX + Density toggle
 *
 *  Each block covers one major UX surface added in PR 4. Tests deliberately
 *  drive the high-level <DataGrid /> entry component (rather than headless
 *  composition) so they double as documentation of the default wiring.
 * -------------------------------------------------------------------------- */

interface Row {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  signups: number;
  active: boolean;
}

const data: Row[] = [
  { id: '1', name: 'Maya', email: 'maya@example.com', role: 'admin', signups: 12, active: true },
  { id: '2', name: 'Liam', email: 'liam@example.com', role: 'editor', signups: 4, active: false },
  { id: '3', name: 'Ava', email: 'ava@example.com', role: 'viewer', signups: 18, active: true },
  { id: '4', name: 'Noah', email: 'noah@example.com', role: 'admin', signups: 2, active: true },
  { id: '5', name: 'Mia', email: 'mia@example.com', role: 'editor', signups: 9, active: false },
];

const baseColumns: ColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, filterable: true, type: 'text' },
  { id: 'email', header: 'Email', accessor: 'email', type: 'text' },
  {
    id: 'role',
    header: 'Role',
    accessor: 'role',
    filterable: true,
    type: 'select',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'editor', label: 'Editor' },
      { value: 'viewer', label: 'Viewer' },
    ],
  },
  { id: 'signups', header: 'Signups', accessor: 'signups', sortable: true, filterable: true, type: 'number', align: 'end' },
];

/* -------------------------------------------------------------------------- */
/*  Toolbar                                                                    */
/* -------------------------------------------------------------------------- */

describe('DataGrid — Toolbar', () => {
  it('renders the default toolbar with global search, column visibility, density, export', () => {
    render(<DataGrid<Row> data={data} columns={baseColumns} getRowId={(r) => r.id} />);
    expect(screen.getByRole('toolbar', { name: /data grid toolbar/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /columns/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('omits the toolbar entirely when every toggle is disabled', () => {
    render(
      <DataGrid<Row>
        data={data}
        columns={baseColumns}
        getRowId={(r) => r.id}
        globalSearch={false}
        columnVisibilityToggle={false}
        densityToggle={false}
        exportable={false}
      />,
    );
    expect(screen.queryByRole('toolbar', { name: /data grid toolbar/i })).not.toBeInTheDocument();
  });

  it('global search input debounces and forwards to grid.setGlobalSearch', async () => {
    vi.useFakeTimers();
    try {
      render(<DataGrid<Row> data={data} columns={baseColumns} getRowId={(r) => r.id} />);
      const input = screen.getByPlaceholderText('Search…') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'maya' } });
      // Pre-debounce: rows still all there.
      expect(screen.getAllByText(/example\.com/)).toHaveLength(5);
      // Advance past the 200ms debounce window — wrap in act so React processes the
      // resulting state change before we assert.
      await act(async () => {
        vi.advanceTimersByTime(250);
      });
      // Post-debounce: only Maya remains.
      expect(screen.getAllByText(/example\.com/)).toHaveLength(1);
      expect(screen.getByText('maya@example.com')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});

/* -------------------------------------------------------------------------- */
/*  Column visibility toggle                                                   */
/* -------------------------------------------------------------------------- */

describe('DataGrid — ColumnVisibility', () => {
  it('opens a popover with one checkbox per toggleable column', async () => {
    const user = userEvent.setup();
    render(<DataGrid<Row> data={data} columns={baseColumns} getRowId={(r) => r.id} />);
    await user.click(screen.getByRole('button', { name: /columns/i }));
    // Each non-structural, hideable column shows up as a Checkbox row.
    // (lookup by aria-label which the popover surfaces).
    expect(await screen.findByRole('checkbox', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Role' })).toBeInTheDocument();
  });

  it('toggles a column off the rendered grid', async () => {
    const user = userEvent.setup();
    render(<DataGrid<Row> data={data} columns={baseColumns} getRowId={(r) => r.id} />);
    await user.click(screen.getByRole('button', { name: /columns/i }));
    const emailToggle = await screen.findByRole('checkbox', { name: 'Email' });
    await user.click(emailToggle);
    // Header for "Email" gone.
    expect(screen.queryByRole('columnheader', { name: /^Email/ })).not.toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/*  Density select                                                             */
/* -------------------------------------------------------------------------- */

describe('DataGrid — DensitySelect', () => {
  it('changes data-density on the root when a density is picked', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DataGrid<Row> data={data} columns={baseColumns} getRowId={(r) => r.id} />,
    );
    const root = container.querySelector('[data-datagrid]');
    expect(root).toHaveAttribute('data-density', 'standard');
    await user.click(screen.getByRole('combobox', { name: 'Density' }));
    await user.click(await screen.findByRole('option', { name: /compact/i }));
    expect(root).toHaveAttribute('data-density', 'compact');
  });
});

/* -------------------------------------------------------------------------- */
/*  Export menu                                                                */
/* -------------------------------------------------------------------------- */

describe('DataGrid — Export', () => {
  it('renders CSV + JSON menu items from the Export trigger', async () => {
    const user = userEvent.setup();
    render(<DataGrid<Row> data={data} columns={baseColumns} getRowId={(r) => r.id} />);
    await user.click(screen.getByRole('button', { name: /export/i }));
    expect(await screen.findByRole('menuitem', { name: /export as csv/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /export as json/i })).toBeInTheDocument();
  });

  it('invokes the consumer override instead of triggering a download', async () => {
    const user = userEvent.setup();
    const onCsv = vi.fn();
    // The high-level <DataGrid> renders its own default <Export>; for this test we
    // build a headless grid + compose only the toolbar bits so the override sticks.
    function Harness(): ReactElement {
      const grid = useDataGrid<Row>({
        data,
        columns: baseColumns,
        getRowId: (r) => r.id,
      });
      return (
        <DataGrid.Root grid={grid}>
          <DataGrid.Toolbar>
            <DataGrid.Export onCsvExport={onCsv} />
          </DataGrid.Toolbar>
          <DataGrid.Table>
            <DataGrid.Header />
            <DataGrid.Body />
          </DataGrid.Table>
        </DataGrid.Root>
      );
    }
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: /export/i }));
    await user.click(await screen.findByRole('menuitem', { name: /export as csv/i }));
    expect(onCsv).toHaveBeenCalledOnce();
    expect(onCsv.mock.calls[0]![0]).toContain('Name');
    expect(onCsv.mock.calls[0]![0]).toContain('maya@example.com');
  });
});

/* -------------------------------------------------------------------------- */
/*  Pagination                                                                 */
/* -------------------------------------------------------------------------- */

describe('DataGrid — Pagination', () => {
  it('renders a "X–Y of N" label and disables First/Prev on page 1', () => {
    render(
      <DataGrid<Row>
        data={data}
        columns={baseColumns}
        getRowId={(r) => r.id}
        defaultPagination={{ pageIndex: 0, pageSize: 2 }}
      />,
    );
    expect(screen.getByText('1–2 of 5')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /first page/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
  });

  it('advances pages via the Next button', async () => {
    const user = userEvent.setup();
    render(
      <DataGrid<Row>
        data={data}
        columns={baseColumns}
        getRowId={(r) => r.id}
        defaultPagination={{ pageIndex: 0, pageSize: 2 }}
      />,
    );
    await user.click(screen.getByRole('button', { name: /next page/i }));
    expect(screen.getByText('3–4 of 5')).toBeInTheDocument();
  });

  it('hides the pagination subpart when pageSize is 0 ("show all")', () => {
    render(
      <DataGrid<Row>
        data={data}
        columns={baseColumns}
        getRowId={(r) => r.id}
        defaultPagination={{ pageIndex: 0, pageSize: 0 }}
      />,
    );
    expect(screen.queryByRole('button', { name: /first page/i })).not.toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/*  Selection                                                                  */
/* -------------------------------------------------------------------------- */

describe('DataGrid — Selection', () => {
  it('auto-injects a leading rowSelect column when selectionMode="multiple"', () => {
    render(
      <DataGrid<Row>
        data={data}
        columns={baseColumns}
        getRowId={(r) => r.id}
        selectionMode="multiple"
      />,
    );
    // Header checkbox + 5 row checkboxes = 6
    expect(screen.getAllByRole('checkbox', { name: /select (all rows|row)/i })).toHaveLength(6);
  });

  it('header checkbox toggles all rows on the current page', async () => {
    const user = userEvent.setup();
    render(
      <DataGrid<Row>
        data={data}
        columns={baseColumns}
        getRowId={(r) => r.id}
        selectionMode="multiple"
      />,
    );
    const header = screen.getByRole('checkbox', { name: /select all rows/i });
    await user.click(header);
    const selectedRows = screen.getAllByRole('row').filter((r) => r.getAttribute('aria-selected') === 'true');
    expect(selectedRows).toHaveLength(5);
  });

  it('shows the selection bar with the live count and a clear button', async () => {
    const user = userEvent.setup();
    render(
      <DataGrid<Row>
        data={data}
        columns={baseColumns}
        getRowId={(r) => r.id}
        selectionMode="multiple"
      />,
    );
    // No selection → no bar.
    expect(screen.queryByRole('region', { name: /selected/i })).not.toBeInTheDocument();
    const [headerCheckbox, firstRowCheckbox] = screen.getAllByRole('checkbox');
    void headerCheckbox;
    await user.click(firstRowCheckbox!);
    expect(screen.getByRole('region', { name: /1 of 5 selected/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /clear selection/i }));
    expect(screen.queryByRole('region', { name: /selected/i })).not.toBeInTheDocument();
  });

  it('renders radio inputs in single-select mode', () => {
    render(
      <DataGrid<Row>
        data={data}
        columns={baseColumns}
        getRowId={(r) => r.id}
        selectionMode="single"
      />,
    );
    expect(screen.getAllByRole('radio', { name: /select row/i })).toHaveLength(5);
  });
});

/* -------------------------------------------------------------------------- */
/*  Row actions                                                                */
/* -------------------------------------------------------------------------- */

describe('DataGrid — RowActions', () => {
  it('auto-injects a trailing actions column and renders a Menu per row', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const actions = (row: Row): DataGridRowAction[] => [
      { id: 'edit', label: 'Edit', onSelect: () => onEdit(row.id) },
      { id: 'delete', label: 'Delete', color: 'danger', onSelect: () => onDelete(row.id) },
    ];
    render(
      <DataGrid<Row>
        data={data}
        columns={baseColumns}
        getRowId={(r) => r.id}
        rowActions={actions}
      />,
    );
    const triggers = screen.getAllByRole('button', { name: /row actions/i });
    expect(triggers).toHaveLength(5);
    await user.click(triggers[0]!);
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledWith('1');
  });
});

/* -------------------------------------------------------------------------- */
/*  Per-column filter UX                                                       */
/* -------------------------------------------------------------------------- */

describe('DataGrid — Filter UX', () => {
  it('renders a filter button on columns with `filterable: true`', () => {
    render(<DataGrid<Row> data={data} columns={baseColumns} getRowId={(r) => r.id} />);
    expect(screen.getByRole('button', { name: /filter name/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filter role/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /filter email/i })).not.toBeInTheDocument();
  });

  it('applying a text filter narrows the rendered rows', async () => {
    const user = userEvent.setup();
    render(<DataGrid<Row> data={data} columns={baseColumns} getRowId={(r) => r.id} />);
    await user.click(screen.getByRole('button', { name: /filter name/i }));
    const valueInput = await screen.findByPlaceholderText('Filter value…');
    await user.type(valueInput, 'maya');
    await user.click(screen.getByRole('button', { name: /^apply$/i }));
    // Wait for popover to close + filter to apply.
    expect(await screen.findByText('maya@example.com')).toBeInTheDocument();
    expect(screen.queryByText('liam@example.com')).not.toBeInTheDocument();
  });

  it('clearing a filter restores the rows', async () => {
    const user = userEvent.setup();
    render(<DataGrid<Row> data={data} columns={baseColumns} getRowId={(r) => r.id} />);
    await user.click(screen.getByRole('button', { name: /filter name/i }));
    await user.type(await screen.findByPlaceholderText('Filter value…'), 'ava');
    await user.click(screen.getByRole('button', { name: /^apply$/i }));
    expect(screen.queryByText('liam@example.com')).not.toBeInTheDocument();
    // Re-open + clear.
    await user.click(screen.getByRole('button', { name: /filter name/i }));
    await user.click(await screen.findByRole('button', { name: /^clear$/i }));
    expect(screen.getByText('liam@example.com')).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/*  Structural column dispatch                                                 */
/* -------------------------------------------------------------------------- */

describe('DataGrid — Structural columns', () => {
  it('skips auto-injection when an explicit rowSelect column is supplied', () => {
    const cols: ColumnDef<Row>[] = [
      { id: 'pick', header: '', type: 'rowSelect', sortable: false, filterable: false, hideable: false },
      ...baseColumns,
    ];
    render(
      <DataGrid<Row>
        data={data}
        columns={cols}
        getRowId={(r) => r.id}
        selectionMode="multiple"
      />,
    );
    // Total colcount = 5 (1 explicit rowSelect + 4 data cols), not 6.
    expect(screen.getByRole('grid')).toHaveAttribute('aria-colcount', '5');
  });

  it('marks structural columns with the right data-attribute on cells', () => {
    const { container } = render(
      <DataGrid<Row>
        data={data}
        columns={baseColumns}
        getRowId={(r) => r.id}
        selectionMode="multiple"
        rowActions={() => [{ id: 'noop', label: 'No-op', onSelect: () => {} }]}
      />,
    );
    expect(container.querySelectorAll('[data-datagrid-select-cell]').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[data-datagrid-actions-cell]').length).toBeGreaterThan(0);
  });
});

/* -------------------------------------------------------------------------- */
/*  i18n folder                                                                */
/* -------------------------------------------------------------------------- */

describe('DataGrid — i18n', () => {
  it('exposes enDataGridTranslations as the canonical English bundle', async () => {
    const { enDataGridTranslations, DEFAULT_DATAGRID_TRANSLATIONS } = await import('../src/DataGrid');
    expect(enDataGridTranslations).toBe(DEFAULT_DATAGRID_TRANSLATIONS);
    expect(enDataGridTranslations.selectAllRows).toBe('Select all rows');
  });

  it('honours an inline `translations` prop override', () => {
    render(
      <DataGrid<Row>
        data={data}
        columns={baseColumns}
        getRowId={(r) => r.id}
        translations={{ globalSearchPlaceholder: 'Find…' }}
      />,
    );
    expect(screen.getByPlaceholderText('Find…')).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/*  Smoke import — `<DataGrid.X />` compound members                            */
/* -------------------------------------------------------------------------- */

describe('DataGrid — compound members', () => {
  it('exposes every PR 4 subpart off the entry component', () => {
    expect(typeof DataGrid.Toolbar).toBe('object'); // forwardRef → object
    expect(typeof DataGrid.GlobalSearch).toBe('object');
    expect(typeof DataGrid.ColumnVisibility).toBe('object');
    expect(typeof DataGrid.DensitySelect).toBe('object');
    expect(typeof DataGrid.Export).toBe('object');
    expect(typeof DataGrid.FilterButton).toBe('object');
    expect(typeof DataGrid.FilterPanel).toBe('object');
    expect(typeof DataGrid.Pagination).toBe('object');
    expect(typeof DataGrid.SelectionBar).toBe('object');
    expect(typeof DataGrid.SelectHeaderCell).toBe('object');
    expect(typeof DataGrid.SelectCell).toBe('object');
    expect(typeof DataGrid.ActionsHeaderCell).toBe('object');
    expect(typeof DataGrid.ActionsCell).toBe('object');
  });
});

// Touch helpers so eslint doesn't flag unused imports if a test is trimmed.
void within;