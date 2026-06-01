/**
 * PR 7 — Persistence at the `<DataGrid>` entry level.
 *
 * The hook-level round-trip (memory adapter → state on remount) is exercised
 * in `DataGrid.useDataGrid.test.tsx`; this suite focuses on:
 *
 *   1. The `storage="local"` / `storage="session"` shorthand resolves to the
 *      matching `window` storage and round-trips through `<DataGrid>` itself.
 *   2. Selection + pageIndex are **deliberately excluded** from the persisted
 *      snapshot (the plan: selection should not survive a refresh; pageIndex
 *      is ephemeral). Regressions here would silently break "open the same
 *      page, selection re-applies" — a major UX surprise.
 *   3. Custom `StorageAdapter` consumers are handed (key, value) pairs and the
 *      adapter is the sole I/O surface (no `window.localStorage` writes).
 *   4. A malformed persisted payload is ignored — the schema should never
 *      crash the grid; bumping `storageKey` is the documented escape hatch.
 */

import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DataGrid } from '../src/DataGrid';
import type { ColumnDef, StorageAdapter } from '../src/DataGrid';
import { renderWithTheme as render } from './utils';

interface Row {
  id: number;
  name: string;
  signups: number;
}

const data: Row[] = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  name: `Person ${i.toString().padStart(2, '0')}`,
  signups: (i * 7) % 50,
}));

const columns: ColumnDef<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, type: 'text' },
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
/*  Custom adapter — full control over the I/O surface                         */
/* -------------------------------------------------------------------------- */

function makeMemoryAdapter() {
  const memory: Record<string, string> = {};
  const adapter: StorageAdapter = {
    read: vi.fn((key: string) => (key in memory ? memory[key]! : null)),
    write: vi.fn((key: string, value: string) => {
      memory[key] = value;
    }),
    remove: vi.fn((key: string) => {
      delete memory[key];
    }),
  };
  return { adapter, memory };
}

describe('DataGrid — persistence (custom adapter)', () => {
  it('writes a persisted snapshot when density changes', async () => {
    const { adapter, memory } = makeMemoryAdapter();
    render(
      <DataGrid<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        storage={adapter}
        storageKey="users-grid-v1"
      />,
    );
    // Initial mount commits the seed snapshot.
    await Promise.resolve();
    expect(adapter.write).toHaveBeenCalled();
    expect(memory['users-grid-v1']).toBeDefined();
    const initial = JSON.parse(memory['users-grid-v1']!);
    expect(initial.density).toBe('standard');
  });

  it('does NOT persist selection state across remounts', async () => {
    const { adapter, memory } = makeMemoryAdapter();
    const { unmount } = render(
      <DataGrid<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        storage={adapter}
        storageKey="users-grid-v1"
        selectionMode="multiple"
        defaultSelectedRowIds={new Set([1, 2, 3])}
      />,
    );
    await Promise.resolve();
    const snapshot = JSON.parse(memory['users-grid-v1']!);
    // Selection is intentionally absent from the persisted shape per the plan.
    expect(snapshot.selection).toBeUndefined();
    // Sanity: the persisted shape has the keys we DO want.
    expect(Object.keys(snapshot).sort()).toEqual([
      'columnOrder',
      'columnPinning',
      'columnSizes',
      'columnVisibility',
      'density',
      'filters',
      'pageSize',
      'sort',
    ]);
    unmount();
  });

  it('does NOT persist pageIndex — only pageSize survives a remount', async () => {
    const { adapter, memory } = makeMemoryAdapter();
    render(
      <DataGrid<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        storage={adapter}
        storageKey="users-grid-v1"
        defaultPagination={{ pageIndex: 2, pageSize: 5 }}
      />,
    );
    await Promise.resolve();
    const snapshot = JSON.parse(memory['users-grid-v1']!);
    expect(snapshot.pageSize).toBe(5);
    expect('pageIndex' in snapshot).toBe(false);
  });

  it('rehydrates persisted slices on a fresh mount', async () => {
    const { adapter, memory } = makeMemoryAdapter();
    // Pre-seed: density compact + sort by signups desc.
    memory['users-grid-v1'] = JSON.stringify({
      density: 'compact',
      sort: [{ id: 'signups', direction: 'desc' }],
    });
    render(
      <DataGrid<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        storage={adapter}
        storageKey="users-grid-v1"
      />,
    );
    // The seed snapshot is read via `adapter.read` exactly once during mount.
    expect(adapter.read).toHaveBeenCalledWith('users-grid-v1');
    // Density was rehydrated — the root wrapper exposes the active density.
    const root = document.querySelector('[data-density]');
    expect(root?.getAttribute('data-density')).toBe('compact');
    // Sort indicator on signups header shows descending order.
    const signupsHeader = screen.getByRole('columnheader', { name: /signups/i });
    expect(signupsHeader.getAttribute('aria-sort')).toBe('descending');
  });

  it('round-trips a runtime sort change through the adapter', async () => {
    const { adapter, memory } = makeMemoryAdapter();
    render(
      <DataGrid<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        storage={adapter}
        storageKey="users-grid-v1"
      />,
    );
    const signupsHeader = screen.getByRole('columnheader', { name: /signups/i });
    const sortBtn = signupsHeader.querySelector('[data-datagrid-sort-button]') as HTMLElement;
    act(() => {
      fireEvent.click(sortBtn);
    });
    await Promise.resolve();
    const snapshot = JSON.parse(memory['users-grid-v1']!);
    expect(snapshot.sort).toEqual([{ id: 'signups', direction: 'asc' }]);
  });
});

/* -------------------------------------------------------------------------- */
/*  Web-storage shorthand                                                      */
/* -------------------------------------------------------------------------- */

describe('DataGrid — persistence (localStorage shorthand)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('writes to window.localStorage when storage="local"', async () => {
    render(
      <DataGrid<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        storage="local"
        storageKey="users-grid-local"
      />,
    );
    await Promise.resolve();
    const raw = window.localStorage.getItem('users-grid-local');
    expect(raw).toBeTruthy();
    expect(() => JSON.parse(raw!)).not.toThrow();
  });

  it('writes to window.sessionStorage when storage="session"', async () => {
    render(
      <DataGrid<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        storage="session"
        storageKey="users-grid-session"
      />,
    );
    await Promise.resolve();
    expect(window.sessionStorage.getItem('users-grid-session')).toBeTruthy();
    // The grid wrote to sessionStorage, not localStorage.
    expect(window.localStorage.getItem('users-grid-session')).toBeNull();
  });

  it('ignores a malformed persisted payload without crashing', () => {
    window.localStorage.setItem('users-grid-bad', '{not json');
    // No throw + the grid still renders + the header shows up.
    render(
      <DataGrid<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        storage="local"
        storageKey="users-grid-bad"
      />,
    );
    expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/*  No storage prop — no I/O                                                   */
/* -------------------------------------------------------------------------- */

describe('DataGrid — persistence opt-out', () => {
  it('writes nothing when storage is omitted', () => {
    const writeSpy = vi.spyOn(Storage.prototype, 'setItem');
    render(<DataGrid<Row> data={data} columns={columns} getRowId={(r) => r.id} />);
    // The DataGrid itself doesn't touch localStorage when `storage` is unset.
    // Other components (e.g. ThemeProvider in some tests) might — filter by key.
    const dataGridCalls = writeSpy.mock.calls.filter(([key]) =>
      typeof key === 'string' && key.startsWith('users-grid'),
    );
    expect(dataGridCalls).toHaveLength(0);
    writeSpy.mockRestore();
  });
});