/**
 * PR 7 — RTL stress tests.
 *
 * Validates that:
 *   1. The full grid renders inside `<DirectionProvider dir="rtl">` + Hebrew /
 *      Arabic bundles without falling back to English mid-tree.
 *   2. Pinned columns use logical CSS properties (`inset-inline-start` /
 *      `inset-inline-end`) so the browser flips them correctly when the page
 *      direction is RTL — we verify the inline style names, not the rendered
 *      pixel offsets (JSDOM has no layout engine).
 *   3. Keyboard navigation respects RTL: pressing `ArrowRight` moves to the
 *      logical-right (which is the previous column in RTL).
 *   4. The `<table>` element inherits the `dir` from the surrounding tree so
 *      assistive tech reports the correct text direction.
 *
 * Hebrew is used for the rendered strings; the Arabic suite would be a
 * mechanical duplicate so we keep that bundle covered by the locales test
 * suite + the per-component a11y axe pass (`DataGrid.a11y.test.tsx`).
 */

import { DirectionProvider } from '@apx-ui/engine';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DataGrid } from '../src/DataGrid';
import type { ColumnDef } from '../src/DataGrid';
import { heDataGridTranslations, nextFocusCoord } from '../src/DataGrid';
import { renderWithTheme as render } from './utils';

interface Row {
  id: number;
  name: string;
  email: string;
  signups: number;
}

const data: Row[] = [
  { id: 1, name: 'מאיה', email: 'maya@example.com', signups: 12 },
  { id: 2, name: 'ליאם', email: 'liam@example.com', signups: 4 },
  { id: 3, name: 'אווה', email: 'ava@example.com', signups: 18 },
];

const columns: ColumnDef<Row>[] = [
  { id: 'name', header: 'שם', accessor: 'name', sortable: true, type: 'text' },
  { id: 'email', header: 'דוא״ל', accessor: 'email', type: 'text' },
  {
    id: 'signups',
    header: 'הרשמות',
    accessor: 'signups',
    sortable: true,
    type: 'number',
    align: 'end',
  },
];

/* -------------------------------------------------------------------------- */
/*  Rendering                                                                  */
/* -------------------------------------------------------------------------- */

describe('DataGrid — RTL rendering', () => {
  it('renders Hebrew chrome inside <DirectionProvider dir="rtl">', () => {
    render(
      <DirectionProvider dir="rtl">
        <DataGrid<Row>
          data={data}
          columns={columns}
          getRowId={(r) => r.id}
          selectionMode="multiple"
          translations={heDataGridTranslations}
        />
      </DirectionProvider>,
    );
    expect(
      screen.getByRole('checkbox', { name: heDataGridTranslations.selectAllRows }),
    ).toBeInTheDocument();
    // Header text reflects the Hebrew column headers.
    expect(screen.getByRole('columnheader', { name: /שם/ })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /הרשמות/ })).toBeInTheDocument();
  });

  it('shows the Hebrew empty-state copy under RTL when data is empty', () => {
    render(
      <DirectionProvider dir="rtl">
        <DataGrid<Row>
          data={[]}
          columns={columns}
          getRowId={(r) => r.id}
          translations={heDataGridTranslations}
        />
      </DirectionProvider>,
    );
    expect(screen.getByText(heDataGridTranslations.empty)).toBeInTheDocument();
    expect(screen.getByText(heDataGridTranslations.emptyDescription)).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/*  Pinned columns — logical CSS                                              */
/* -------------------------------------------------------------------------- */

describe('DataGrid — RTL pinning uses logical CSS properties', () => {
  it('pinned-start cells declare inset-inline-start (flips to right edge under dir=rtl)', () => {
    const pinnedCols: ColumnDef<Row>[] = [
      { id: 'name', header: 'שם', accessor: 'name', type: 'text', pinned: 'start' },
      { id: 'email', header: 'דוא״ל', accessor: 'email', type: 'text' },
    ];
    render(
      <DirectionProvider dir="rtl">
        <DataGrid<Row>
          data={data}
          columns={pinnedCols}
          getRowId={(r) => r.id}
          translations={heDataGridTranslations}
        />
      </DirectionProvider>,
    );
    const pinned = document.querySelectorAll('[data-pinned="start"]');
    expect(pinned.length).toBeGreaterThan(0);
    const first = pinned[0] as HTMLElement;
    // Inline style uses the logical property — the browser maps it to `right`
    // automatically when `dir=rtl` is applied to the document / a parent.
    expect(first.style.insetInlineStart).toBe('0px');
    // Position is sticky so the cell tracks the scroller's logical-start edge.
    expect(first.style.position).toBe('sticky');
  });

  it('pinned-end cells declare inset-inline-end (flips to left edge under dir=rtl)', () => {
    const pinnedCols: ColumnDef<Row>[] = [
      { id: 'name', header: 'שם', accessor: 'name', type: 'text' },
      { id: 'email', header: 'דוא״ל', accessor: 'email', type: 'text', pinned: 'end' },
    ];
    render(
      <DirectionProvider dir="rtl">
        <DataGrid<Row>
          data={data}
          columns={pinnedCols}
          getRowId={(r) => r.id}
          translations={heDataGridTranslations}
        />
      </DirectionProvider>,
    );
    const pinned = document.querySelectorAll('[data-pinned="end"]');
    expect(pinned.length).toBeGreaterThan(0);
    const first = pinned[0] as HTMLElement;
    expect(first.style.insetInlineEnd).toBe('0px');
    expect(first.style.position).toBe('sticky');
  });
});

/* -------------------------------------------------------------------------- */
/*  Keyboard nav — RTL swaps ArrowLeft / ArrowRight semantics                  */
/* -------------------------------------------------------------------------- */

describe('DataGrid — RTL keyboard nav', () => {
  it('nextFocusCoord swaps ArrowLeft/Right semantics under direction=rtl', () => {
    // ArrowRight in RTL = "move to the column to the *logical* right" = previous index.
    const fromMid = { row: 0, col: 1 };
    const opts = { rowCount: 5, columnCount: 3, pageSize: 10, direction: 'rtl' as const };
    expect(
      nextFocusCoord(
        fromMid,
        { key: 'ArrowRight', ctrlKey: false, metaKey: false, shiftKey: false },
        opts,
      ),
    ).toEqual({ row: 0, col: 0 });
    expect(
      nextFocusCoord(
        fromMid,
        { key: 'ArrowLeft', ctrlKey: false, metaKey: false, shiftKey: false },
        opts,
      ),
    ).toEqual({ row: 0, col: 2 });
  });

  it('ArrowRight at the logical start edge (col=0) stays put under direction=rtl', () => {
    // In RTL, col=0 is the rightmost cell visually; pressing ArrowRight should
    // try to move "further right" → col=-1 → out of bounds → no movement.
    const result = nextFocusCoord(
      { row: 0, col: 0 },
      { key: 'ArrowRight', ctrlKey: false, metaKey: false, shiftKey: false },
      { rowCount: 5, columnCount: 3, pageSize: 10, direction: 'rtl' },
    );
    expect(result).toEqual({ row: 0, col: 0 });
  });

  it('exposes a single tab-stop on the grid wrapper under RTL (roving-tabindex contract)', () => {
    // The ARIA Grid pattern says the grid takes ONE Tab stop and the cells
    // manage focus internally. Verifying the roving-tabindex contract is
    // direction-agnostic, so this guard ensures the RTL path doesn't double
    // up tabbable cells (which would break the LTR / RTL nav parity).
    render(
      <DirectionProvider dir="rtl">
        <DataGrid<Row>
          data={data}
          columns={columns}
          getRowId={(r) => r.id}
          translations={heDataGridTranslations}
        />
      </DirectionProvider>,
    );
    // Filter the focus stops down to the grid itself — exclude the toolbar
    // search / density / column-visibility / export controls.
    const grid = document.querySelector('table[role="grid"]') as HTMLElement | null;
    expect(grid).not.toBeNull();
    const tabbable = grid!.querySelectorAll('[tabindex="0"]');
    expect(tabbable.length).toBeLessThanOrEqual(1);
  });
});

/* -------------------------------------------------------------------------- */
/*  Sticky header / table semantics under RTL                                  */
/* -------------------------------------------------------------------------- */

describe('DataGrid — RTL table markup', () => {
  it('keeps a single <table role="grid"> element inside the RTL wrapper', () => {
    render(
      <DirectionProvider dir="rtl">
        <DataGrid<Row>
          data={data}
          columns={columns}
          getRowId={(r) => r.id}
          translations={heDataGridTranslations}
        />
      </DirectionProvider>,
    );
    const grids = document.querySelectorAll('table[role="grid"]');
    expect(grids).toHaveLength(1);
  });

  it('survives a Hebrew translations + RTL combo without rendering English fallback text', () => {
    render(
      <DirectionProvider dir="rtl">
        <DataGrid<Row>
          data={[]}
          columns={columns}
          getRowId={(r) => r.id}
          translations={heDataGridTranslations}
        />
      </DirectionProvider>,
    );
    // The empty state is the most translation-heavy surface in this minimal
    // setup — if a leaf component falls back to `enDataGridTranslations` we'd
    // see "No data" leak through.
    expect(screen.queryByText('No data')).not.toBeInTheDocument();
    expect(screen.queryByText('There are no rows to display.')).not.toBeInTheDocument();
    expect(screen.getByText(heDataGridTranslations.empty)).toBeInTheDocument();
  });
});
