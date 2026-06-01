import { DirectionProvider } from '@apx-ui/engine';
import { fireEvent, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { DataGrid } from '../src/DataGrid';
import type {
  ColumnDef,
  DataGridColor,
  DataGridDensity,
  DataGridVariant,
} from '../src/DataGrid';
import {
  clampCoord,
  coordEquals,
  nextFocusCoord,
} from '../src/DataGrid/DataGrid.keyboard';
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

const cols: ColumnDef<User>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, type: 'text' },
  { id: 'email', header: 'Email', accessor: 'email', type: 'text' },
  { id: 'age', header: 'Age', accessor: 'age', sortable: true, type: 'number', align: 'end' },
];

describe('DataGrid — a11y (axe)', () => {
  it('default LTR grid has no violations', async () => {
    const { container } = render(
      <DataGrid<User> data={fixture} columns={cols} getRowId={(u) => u.id} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('multi-select grid has no violations', async () => {
    const { container } = render(
      <DataGrid<User>
        data={fixture}
        columns={cols}
        getRowId={(u) => u.id}
        selectionMode="multiple"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('RTL grid has no violations', async () => {
    const { container } = render(
      <DirectionProvider dir="rtl">
        <DataGrid<User> data={fixture} columns={cols} getRowId={(u) => u.id} />
      </DirectionProvider>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('DataGrid — ARIA Grid roles', () => {
  it('header row has aria-rowindex=1', () => {
    render(<DataGrid<User> data={fixture} columns={cols} getRowId={(u) => u.id} />);
    const rows = screen.getAllByRole('row');
    expect(rows[0]).toHaveAttribute('aria-rowindex', '1');
  });

  it('body rows have aria-rowindex starting at 2', () => {
    render(<DataGrid<User> data={fixture} columns={cols} getRowId={(u) => u.id} />);
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveAttribute('aria-rowindex', '2');
    expect(rows[2]).toHaveAttribute('aria-rowindex', '3');
    expect(rows[3]).toHaveAttribute('aria-rowindex', '4');
  });

  it('every cell exposes role="gridcell"', () => {
    render(<DataGrid<User> data={fixture} columns={cols} getRowId={(u) => u.id} />);
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(9);
  });

  it('exactly one cell is the tabstop on first render (roving tabindex)', () => {
    render(<DataGrid<User> data={fixture} columns={cols} getRowId={(u) => u.id} />);
    const headers = screen.getAllByRole('columnheader');
    const cells = screen.getAllByRole('gridcell');
    const all = [...headers, ...cells];
    const tabstops = all.filter((el) => el.getAttribute('tabindex') === '0');
    expect(tabstops).toHaveLength(1);
    // Default focus is the first header.
    expect(tabstops[0]).toBe(headers[0]);
  });

  it('focusing a body cell moves the tabstop to that cell', () => {
    render(<DataGrid<User> data={fixture} columns={cols} getRowId={(u) => u.id} />);
    const cells = screen.getAllByRole('gridcell');
    const target = cells[4];
    if (!target) throw new Error('expected at least 5 gridcells');
    fireEvent.focus(target);
    const tabstops = [
      ...screen.getAllByRole('columnheader'),
      ...screen.getAllByRole('gridcell'),
    ].filter((el) => el.getAttribute('tabindex') === '0');
    expect(tabstops).toHaveLength(1);
    expect(tabstops[0]).toBe(target);
  });
});

describe('DataGrid — keyboard navigation (pure)', () => {
  const opts = { rowCount: 3, columnCount: 3, pageSize: 10, direction: 'ltr' as const };

  it('ArrowDown moves from header row to first body row', () => {
    const next = nextFocusCoord(
      { row: -1, col: 0 },
      { key: 'ArrowDown', ctrlKey: false, metaKey: false, shiftKey: false },
      opts,
    );
    expect(next).toEqual({ row: 0, col: 0 });
  });

  it('ArrowDown clamps at the last row', () => {
    const start = { row: 2, col: 0 };
    const next = nextFocusCoord(
      start,
      { key: 'ArrowDown', ctrlKey: false, metaKey: false, shiftKey: false },
      opts,
    );
    expect(next).toBe(start);
  });

  it('ArrowUp from row 0 moves to the header row', () => {
    const next = nextFocusCoord(
      { row: 0, col: 1 },
      { key: 'ArrowUp', ctrlKey: false, metaKey: false, shiftKey: false },
      opts,
    );
    expect(next).toEqual({ row: -1, col: 1 });
  });

  it('ArrowRight advances col index in LTR, ArrowLeft in RTL', () => {
    const ltrRight = nextFocusCoord(
      { row: 0, col: 0 },
      { key: 'ArrowRight', ctrlKey: false, metaKey: false, shiftKey: false },
      opts,
    );
    expect(ltrRight).toEqual({ row: 0, col: 1 });

    const rtlRight = nextFocusCoord(
      { row: 0, col: 1 },
      { key: 'ArrowRight', ctrlKey: false, metaKey: false, shiftKey: false },
      { ...opts, direction: 'rtl' },
    );
    expect(rtlRight).toEqual({ row: 0, col: 0 });
  });

  it('Home goes to the first cell in the current row', () => {
    const next = nextFocusCoord(
      { row: 1, col: 2 },
      { key: 'Home', ctrlKey: false, metaKey: false, shiftKey: false },
      opts,
    );
    expect(next).toEqual({ row: 1, col: 0 });
  });

  it('Ctrl+Home goes to the header row first cell', () => {
    const next = nextFocusCoord(
      { row: 2, col: 2 },
      { key: 'Home', ctrlKey: true, metaKey: false, shiftKey: false },
      opts,
    );
    expect(next).toEqual({ row: -1, col: 0 });
  });

  it('Ctrl+End goes to the last cell of the last row', () => {
    const next = nextFocusCoord(
      { row: 0, col: 0 },
      { key: 'End', ctrlKey: true, metaKey: false, shiftKey: false },
      opts,
    );
    expect(next).toEqual({ row: 2, col: 2 });
  });

  it('PageDown jumps by pageSize rows clamped at the last row', () => {
    const small = nextFocusCoord(
      { row: 0, col: 0 },
      { key: 'PageDown', ctrlKey: false, metaKey: false, shiftKey: false },
      { ...opts, pageSize: 5 },
    );
    expect(small).toEqual({ row: 2, col: 0 });
  });

  it('returns null for non-navigation keys', () => {
    const next = nextFocusCoord(
      { row: 0, col: 0 },
      { key: 'a', ctrlKey: false, metaKey: false, shiftKey: false },
      opts,
    );
    expect(next).toBeNull();
  });

  it('coordEquals identifies identical coords', () => {
    expect(coordEquals({ row: 1, col: 2 }, { row: 1, col: 2 })).toBe(true);
    expect(coordEquals({ row: 1, col: 2 }, { row: 1, col: 3 })).toBe(false);
  });

  it('clampCoord pulls out-of-bounds coords into range', () => {
    const clamped = clampCoord({ row: 99, col: 99 }, opts);
    expect(clamped).toEqual({ row: 2, col: 2 });
  });

  it('clampCoord returns the same reference when in-range (memo-friendly)', () => {
    const coord = { row: 1, col: 1 };
    expect(clampCoord(coord, opts)).toBe(coord);
  });
});

/* --------------------------------------------------------------------------
 *  PR 8 — Full a11y matrix sweep
 *
 *  Per the plan's "axe-core passes for all 84 variant cells, both LTR and
 *  RTL" acceptance criterion: 4 variants × 7 colors × 3 densities × 2
 *  directions = 168 axe runs. The matrix doesn't generate visual snapshots
 *  (that's a follow-up Playwright pass once the renderer wires it), but
 *  every cell exercises the recipe + the rendered tree under the matching
 *  CSS class set, so any axe regression introduced by a variant-specific
 *  class would surface here.
 *
 *  We use a tiny fixture (3 rows × 3 cols) for each cell — the matrix size
 *  is the cost, not the per-cell row count. With selection on we also cover
 *  the auto-injected select column and the selection bar.
 * -------------------------------------------------------------------------- */

const VARIANTS: ReadonlyArray<DataGridVariant> = ['solid', 'outline', 'striped', 'minimal'];
const COLORS: ReadonlyArray<DataGridColor> = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];
const DENSITIES: ReadonlyArray<DataGridDensity> = ['compact', 'standard', 'comfortable'];
const DIRECTIONS = ['ltr', 'rtl'] as const;

describe('DataGrid — a11y matrix (variant × color × density × direction)', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      for (const density of DENSITIES) {
        for (const direction of DIRECTIONS) {
          // Naming pattern is verbose so a single failing cell is easy to find
          // in the report — e.g. `striped/danger/comfortable/rtl axe-clean`.
          it(`${variant}/${color}/${density}/${direction} axe-clean`, async () => {
            const { container } = render(
              <DirectionProvider dir={direction}>
                <DataGrid<User>
                  data={fixture}
                  columns={cols}
                  getRowId={(u) => u.id}
                  variant={variant}
                  color={color}
                  size={density}
                  selectionMode="multiple"
                />
              </DirectionProvider>,
            );
            const results = await axe(container);
            expect(results).toHaveNoViolations();
          });
        }
      }
    }
  }
});

describe('DataGrid — keyboard navigation (integration)', () => {
  it('ArrowDown on header moves focus to the first body cell in the same column', () => {
    render(<DataGrid<User> data={fixture} columns={cols} getRowId={(u) => u.id} />);
    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    // After RAF resolves, exactly one cell should be the tabstop and it should be the
    // first body cell of column 0. Because requestAnimationFrame is async, we instead
    // verify the tabindex moved by checking the DOM state.
    const cells = screen.getAllByRole('gridcell');
    const tabstops = [
      ...screen.getAllByRole('columnheader'),
      ...cells,
    ].filter((el) => el.getAttribute('tabindex') === '0');
    expect(tabstops).toHaveLength(1);
    expect(tabstops[0]).toBe(cells[0]);
  });
});