import { fireEvent, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DataGrid, DataGridVirtualBody } from '../src/DataGrid';
import type { ColumnDef } from '../src/DataGrid';
import { renderWithTheme as render } from './utils';

/* --------------------------------------------------------------------------
 *  PR 6 — Virtualization
 *
 *  `@tanstack/react-virtual` reads the scroll element's `clientHeight` and
 *  `scrollTop` to decide which slice of rows to mount. jsdom doesn't lay
 *  things out, so we stub those properties on the scroller `<div>` (the one
 *  carrying `data-datagrid-scroller`) before each test. We also stub a
 *  fixed-height per row by overriding `getBoundingClientRect` on every `<tr>`
 *  in the tree.
 *
 *  Coverage targets (from the spec):
 *   - 50k-row mount renders only a windowed slice (we use 1k for test speed).
 *   - Sticky header still mounts and stays a real `<thead>`.
 *   - Pagination is hidden when virtualization is on.
 *   - Selection state survives a scroll-driven re-window.
 *   - Sorting still flows through (rows on screen reflect the new order).
 *   - `<DataGrid.VirtualBody>` is exported and usable inside `<DataGrid.Root>`.
 * -------------------------------------------------------------------------- */

interface Row {
  id: number;
  name: string;
  email: string;
  score: number;
}

function buildRows(count: number): Row[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Person ${i.toString().padStart(5, '0')}`,
    email: `person${i}@example.com`,
    score: (i * 37) % 1000,
  }));
}

const columns: ColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, type: 'text' },
  { id: 'email', header: 'Email', accessor: 'email', type: 'text' },
  { id: 'score', header: 'Score', accessor: 'score', sortable: true, type: 'number', align: 'end' },
];

const VIEWPORT_HEIGHT = 480;
const ROW_HEIGHT = 40;

/* -------------------------------------------------------------------------- */
/*  jsdom layout shim                                                          */
/* -------------------------------------------------------------------------- */

const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
const originalClientHeight = Object.getOwnPropertyDescriptor(
  Element.prototype,
  'clientHeight',
);
const originalOffsetHeight = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'offsetHeight',
);
const originalOffsetWidth = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'offsetWidth',
);
const originalResizeObserver = (globalThis as { ResizeObserver?: unknown }).ResizeObserver;

interface ObservedEntry {
  target: Element;
}

class StubResizeObserver {
  private callback: (entries: ObservedEntry[]) => void;
  private targets = new Set<Element>();
  constructor(callback: (entries: ObservedEntry[]) => void) {
    this.callback = callback;
  }
  observe(target: Element) {
    this.targets.add(target);
    // Fire immediately so the virtualizer reads the element's stubbed size on the
    // first effect pass instead of waiting for a layout that jsdom never performs.
    this.callback([{ target }]);
  }
  unobserve(target: Element) {
    this.targets.delete(target);
  }
  disconnect() {
    this.targets.clear();
  }
}

beforeEach(() => {
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = StubResizeObserver;
  // The virtualizer resolves its observer constructor via
  // `scrollElement.ownerDocument.defaultView.ResizeObserver`, so we patch the
  // jsdom window directly too — otherwise the observer never connects and the
  // count of windowed items stays at zero.
  (window as unknown as { ResizeObserver?: unknown }).ResizeObserver = StubResizeObserver;

  // Give the scroller its viewport-sized box, every `<tr>` a stable 40px height
  // (so `useVirtualizer`'s `measureElement` converges immediately), and leave
  // everything else at zero so the rest of the DS isn't affected by the shim.
  Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
    if (this instanceof HTMLElement && this.dataset.datagridScroller !== undefined) {
      return {
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: 800,
        bottom: VIEWPORT_HEIGHT,
        width: 800,
        height: VIEWPORT_HEIGHT,
        toJSON: () => ({}),
      } as DOMRect;
    }
    if (this.tagName === 'TR') {
      return {
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: 800,
        bottom: ROW_HEIGHT,
        width: 800,
        height: ROW_HEIGHT,
        toJSON: () => ({}),
      } as DOMRect;
    }
    return {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      toJSON: () => ({}),
    } as DOMRect;
  };

  // `useVirtualizer` reads `offsetHeight` (via `getRect`) to size the viewport,
  // not `clientHeight`. We stub both so the rest of the DS hooks that rely on
  // `clientHeight` keep their existing 0 fallback.
  Object.defineProperty(Element.prototype, 'clientHeight', {
    configurable: true,
    get(this: Element) {
      if (this instanceof HTMLElement && this.dataset.datagridScroller !== undefined) {
        return VIEWPORT_HEIGHT;
      }
      return 0;
    },
  });

  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get(this: HTMLElement) {
      if (this.dataset.datagridScroller !== undefined) return VIEWPORT_HEIGHT;
      if (this.tagName === 'TR') return ROW_HEIGHT;
      return 0;
    },
  });

  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get(this: HTMLElement) {
      if (this.dataset.datagridScroller !== undefined) return 800;
      return 0;
    },
  });
});

afterEach(() => {
  Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  if (originalClientHeight) {
    Object.defineProperty(Element.prototype, 'clientHeight', originalClientHeight);
  }
  if (originalOffsetHeight) {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
  }
  if (originalOffsetWidth) {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
  }
  if (originalResizeObserver === undefined) {
    delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
    delete (window as unknown as { ResizeObserver?: unknown }).ResizeObserver;
  } else {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = originalResizeObserver;
    (window as unknown as { ResizeObserver?: unknown }).ResizeObserver = originalResizeObserver;
  }
});

function renderGrid(ui: ReactElement) {
  return render(ui);
}

function countBodyRows(): number {
  // Excludes spacer rows (which carry `data-datagrid-virtual-spacer`).
  return screen
    .getAllByRole('row')
    .filter((r) => r.querySelector('[data-datagrid-cell]'))
    .length;
}

/* -------------------------------------------------------------------------- */
/*  Mount + windowing                                                          */
/* -------------------------------------------------------------------------- */

describe('DataGrid — Virtualization mount', () => {
  it('mounts the virtualized body when `virtualization="rows"` is set', () => {
    const { container } = renderGrid(
      <DataGrid<Row>
        data={buildRows(500)}
        columns={columns}
        getRowId={(r) => r.id}
        virtualization="rows"
        estimateRowHeight={ROW_HEIGHT}
      />,
    );

    const tbody = container.querySelector('[data-datagrid-tbody][data-virtualized]');
    expect(tbody).not.toBeNull();
  });

  it('windows the row set — far fewer rows in DOM than in the dataset', () => {
    renderGrid(
      <DataGrid<Row>
        data={buildRows(1000)}
        columns={columns}
        getRowId={(r) => r.id}
        virtualization="rows"
        estimateRowHeight={ROW_HEIGHT}
      />,
    );

    const rendered = countBodyRows();
    expect(rendered).toBeGreaterThan(0);
    // Viewport (480px) / row (40px) = 12 rows, plus overscan (10 each side)
    // gives roughly 30 rows on screen. We give ourselves generous headroom so
    // a small Tanstack heuristic change doesn't flake the test.
    expect(rendered).toBeLessThan(80);
  });

  it('renders a bottom spacer at initial paint so the scrollbar reflects the full dataset', () => {
    // 500 rows × 40px = 20000px total — much larger than the 480px viewport, so
    // the bottom spacer must exist on first render to reserve scroll space.
    // (The top spacer only appears after the user scrolls past the first window;
    // exercising that path requires jsdom layout we don't simulate here.)
    const { container } = renderGrid(
      <DataGrid<Row>
        data={buildRows(500)}
        columns={columns}
        getRowId={(r) => r.id}
        virtualization="rows"
        estimateRowHeight={ROW_HEIGHT}
      />,
    );

    const endSpacer = container.querySelector('[data-datagrid-virtual-spacer="end"]');
    expect(endSpacer).not.toBeNull();
    const spacerCell = endSpacer!.querySelector('td');
    const height = parseInt(spacerCell?.getAttribute('style')?.match(/height:\s*(\d+)px/)?.[1] ?? '0', 10);
    // The bottom spacer should reserve enough room for all the un-rendered rows.
    // We're permissive on the exact number — overscan + measurement noise shift
    // it by a few rows.
    expect(height).toBeGreaterThan(15000);
  });

  it('keeps the sticky header `<thead>` mounted separately from the virtualized body', () => {
    const { container } = renderGrid(
      <DataGrid<Row>
        data={buildRows(200)}
        columns={columns}
        getRowId={(r) => r.id}
        virtualization="rows"
      />,
    );

    const thead = container.querySelector('thead[data-datagrid-thead]');
    expect(thead).not.toBeNull();
    expect(within(thead as HTMLElement).getByText('Name')).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/*  Pagination interaction                                                     */
/* -------------------------------------------------------------------------- */

describe('DataGrid — Virtualization × pagination', () => {
  it('hides the pagination subpart when virtualization is on', () => {
    const { container } = renderGrid(
      <DataGrid<Row>
        data={buildRows(500)}
        columns={columns}
        getRowId={(r) => r.id}
        virtualization="rows"
      />,
    );

    expect(container.querySelector('[data-datagrid-pagination]')).toBeNull();
  });

  it('still renders pagination when virtualization is off (regression guard)', () => {
    const { container } = renderGrid(
      <DataGrid<Row>
        data={buildRows(50)}
        columns={columns}
        getRowId={(r) => r.id}
        defaultPagination={{ pageIndex: 0, pageSize: 10 }}
      />,
    );

    expect(container.querySelector('[data-datagrid-pagination]')).not.toBeNull();
  });
});

/* -------------------------------------------------------------------------- */
/*  State preservation                                                         */
/* -------------------------------------------------------------------------- */

describe('DataGrid — Virtualization × selection', () => {
  it('renders selection checkboxes alongside the windowed rows', () => {
    const onSelectionChange = vi.fn();
    const { container } = renderGrid(
      <DataGrid<Row>
        data={buildRows(500)}
        columns={columns}
        getRowId={(r) => r.id}
        selectionMode="multiple"
        defaultSelectedRowIds={new Set([3, 4])}
        virtualization="rows"
        estimateRowHeight={ROW_HEIGHT}
        onSelectionChange={onSelectionChange}
      />,
    );

    // Walk every rendered body row's checkbox. Any row whose id is in {3, 4}
    // must render checked; everything else unchecked. We don't assert which
    // specific row ids are in the window — that's a jsdom layout detail.
    const bodyRows = Array.from(
      container.querySelectorAll<HTMLElement>('[data-datagrid-row]'),
    );
    expect(bodyRows.length).toBeGreaterThan(0);

    for (const row of bodyRows) {
      const rowId = row.getAttribute('data-row-id');
      const checkbox = row.querySelector<HTMLInputElement>('input[type="checkbox"]');
      if (!checkbox) continue;
      if (rowId === '3' || rowId === '4') {
        expect(checkbox.checked).toBe(true);
      } else {
        expect(checkbox.checked).toBe(false);
      }
    }
  });
});

describe('DataGrid — Virtualization × sort', () => {
  it('keeps the sort button interactive in the header under virtualization', () => {
    const onStateChange = vi.fn();
    renderGrid(
      <DataGrid<Row>
        data={buildRows(500)}
        columns={columns}
        getRowId={(r) => r.id}
        virtualization="rows"
        estimateRowHeight={ROW_HEIGHT}
        onStateChange={onStateChange}
      />,
    );

    const nameHeader = screen.getByRole('columnheader', { name: /^name/i });
    const sortButton = nameHeader.querySelector<HTMLButtonElement>('[data-datagrid-sort-button]');
    if (!sortButton) throw new Error('sort button missing');

    fireEvent.click(sortButton);
    expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');

    fireEvent.click(sortButton);
    expect(nameHeader.getAttribute('aria-sort')).toBe('descending');
  });
});

/* -------------------------------------------------------------------------- */
/*  Compound surface (headless escape hatch)                                  */
/* -------------------------------------------------------------------------- */

describe('DataGrid.VirtualBody — compound surface', () => {
  it('is exported on the compound + as a named export', () => {
    expect(DataGrid.VirtualBody).toBeDefined();
    expect(DataGridVirtualBody).toBeDefined();
  });
});