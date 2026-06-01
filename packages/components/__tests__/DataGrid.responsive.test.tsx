/**
 * PR 7 — `column.responsive.hideBelow` → media-query bridge.
 *
 * The `useResponsiveColumns` hook subscribes to one media query per Tailwind
 * breakpoint and dispatches `setColumnVisibility` when the active "below"
 * breakpoint flips. JSDOM doesn't support live viewport resizing, so we
 * follow the AppShell.responsive convention: stub `window.matchMedia` to
 * return a fixed truthy / falsy result for the *initial* mount and assert the
 * rendered column header set is correct.
 *
 * What we *don't* test here (covered by `useResponsiveColumns` itself, not by
 * the DataGrid entry):
 *   - Mid-session breakpoint flips with `addEventListener('change')` firing.
 *     JSDOM permits the listener to attach but never dispatches `change`
 *     events from a resize, so we'd be testing our own stub if we forced it.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { DataGrid } from '../src/DataGrid';
import type { ColumnDef, ResponsiveBreakpointKey } from '../src/DataGrid';
import {
  RESPONSIVE_BREAKPOINT_PX,
  useResponsiveColumns,
} from '../src/DataGrid';
import { renderWithTheme as render } from './utils';

type MediaListener = (event: { matches: boolean }) => void;

interface MediaStubOptions {
  /** Viewport width in pixels — drives every `(max-width: …)` query reply. */
  viewportWidth: number;
}

function stubMatchMediaForViewport({ viewportWidth }: MediaStubOptions) {
  // Parse `(max-width: 767.98px)` style queries and resolve against viewport.
  const matchQuery = (query: string): boolean => {
    const m = query.match(/max-width:\s*([\d.]+)px/);
    if (!m) return false;
    const max = Number.parseFloat(m[1]!);
    return viewportWidth <= max;
  };
  const factory = vi.fn().mockImplementation((query: string) => ({
    matches: matchQuery(query),
    media: query,
    onchange: null,
    addEventListener: (_evt: string, _cb: MediaListener) => {},
    removeEventListener: (_evt: string, _cb: MediaListener) => {},
    addListener: (_cb: MediaListener) => {},
    removeListener: (_cb: MediaListener) => {},
    dispatchEvent: () => false,
  }));
  vi.stubGlobal('matchMedia', factory);
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: factory,
  });
}

interface Row {
  id: number;
  name: string;
  email: string;
  team: string;
  notes: string;
}

const data: Row[] = [
  { id: 1, name: 'Maya', email: 'maya@example.com', team: 'platform', notes: '—' },
  { id: 2, name: 'Liam', email: 'liam@example.com', team: 'growth', notes: '—' },
];

function buildColumns(): ColumnDef<Row>[] {
  return [
    { id: 'name', header: 'Name', accessor: 'name', type: 'text' },
    { id: 'email', header: 'Email', accessor: 'email', type: 'text' },
    {
      id: 'team',
      header: 'Team',
      accessor: 'team',
      type: 'text',
      responsive: { hideBelow: 'md' },
    },
    {
      id: 'notes',
      header: 'Notes',
      accessor: 'notes',
      type: 'text',
      responsive: { hideBelow: 'lg' },
    },
  ];
}

describe('DataGrid — responsive column hiding', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('hides nothing on a wide viewport (above lg)', () => {
    stubMatchMediaForViewport({ viewportWidth: 1600 });
    const { container } = render(
      <DataGrid<Row> data={data} columns={buildColumns()} getRowId={(r) => r.id} />,
    );
    const headers = Array.from(container.querySelectorAll('th[role="columnheader"]')).map(
      (h) => h.textContent?.trim(),
    );
    expect(headers).toContain('Name');
    expect(headers).toContain('Email');
    expect(headers).toContain('Team');
    expect(headers).toContain('Notes');
  });

  it('hides the `notes` column (hideBelow=lg) when viewport drops below lg', async () => {
    // 800 px → below lg (1024) but above md (768)
    stubMatchMediaForViewport({ viewportWidth: 800 });
    const { container } = render(
      <DataGrid<Row> data={data} columns={buildColumns()} getRowId={(r) => r.id} />,
    );
    // Allow the breakpoint effect to run.
    await Promise.resolve();
    const headers = Array.from(container.querySelectorAll('th[role="columnheader"]')).map(
      (h) => h.textContent?.trim(),
    );
    expect(headers).toContain('Name');
    expect(headers).toContain('Email');
    expect(headers).toContain('Team');
    expect(headers).not.toContain('Notes');
  });

  it('hides both `team` (hideBelow=md) and `notes` (hideBelow=lg) on a phone viewport', async () => {
    stubMatchMediaForViewport({ viewportWidth: 400 });
    const { container } = render(
      <DataGrid<Row> data={data} columns={buildColumns()} getRowId={(r) => r.id} />,
    );
    await Promise.resolve();
    const headers = Array.from(container.querySelectorAll('th[role="columnheader"]')).map(
      (h) => h.textContent?.trim(),
    );
    expect(headers).toContain('Name');
    expect(headers).toContain('Email');
    expect(headers).not.toContain('Team');
    expect(headers).not.toContain('Notes');
  });

  it('does NOT touch columns without a `responsive` block', async () => {
    // Even on a tiny viewport, `name` + `email` (no hideBelow) stay visible.
    stubMatchMediaForViewport({ viewportWidth: 200 });
    const { container } = render(
      <DataGrid<Row> data={data} columns={buildColumns()} getRowId={(r) => r.id} />,
    );
    await Promise.resolve();
    const headers = Array.from(container.querySelectorAll('th[role="columnheader"]')).map(
      (h) => h.textContent?.trim(),
    );
    expect(headers).toContain('Name');
    expect(headers).toContain('Email');
  });

  it('preserves consumer-supplied `defaultColumnVisibility` for non-responsive columns', async () => {
    stubMatchMediaForViewport({ viewportWidth: 1600 });
    const { container } = render(
      <DataGrid<Row>
        data={data}
        columns={buildColumns()}
        getRowId={(r) => r.id}
        defaultColumnVisibility={{ email: false }}
      />,
    );
    await Promise.resolve();
    const headers = Array.from(container.querySelectorAll('th[role="columnheader"]')).map(
      (h) => h.textContent?.trim(),
    );
    // Email stays hidden because the consumer hid it; nothing else dropped.
    expect(headers).not.toContain('Email');
    expect(headers).toContain('Name');
    expect(headers).toContain('Team');
    expect(headers).toContain('Notes');
  });
});

/* -------------------------------------------------------------------------- */
/*  Helper sanity                                                              */
/* -------------------------------------------------------------------------- */

describe('RESPONSIVE_BREAKPOINT_PX', () => {
  it('exposes the Tailwind-native breakpoints in pixels', () => {
    expect(RESPONSIVE_BREAKPOINT_PX).toEqual({
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    });
  });

  it('is exported alongside the useResponsiveColumns hook', () => {
    expect(typeof useResponsiveColumns).toBe('function');
  });

  // Defensive — guards against typos / renames in the type union.
  it('covers every ResponsiveBreakpointKey in the type union', () => {
    const declared: ResponsiveBreakpointKey[] = ['sm', 'md', 'lg', 'xl', '2xl'];
    for (const bp of declared) {
      expect(RESPONSIVE_BREAKPOINT_PX[bp]).toBeGreaterThan(0);
    }
  });
});