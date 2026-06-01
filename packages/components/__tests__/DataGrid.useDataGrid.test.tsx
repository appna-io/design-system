/**
 * `useDataGrid()` hook lifecycle tests — React-side behaviour.
 *
 * Covers controlled / uncontrolled handoff, onStateChange firing, i18n precedence,
 * storage persistence round-trip, and the server-driven (`rowCount` / `manual*`) paths.
 */

import { I18nProvider } from '@apx-ui/engine';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ColumnDef, DataGridState, StorageAdapter } from '../src/DataGrid';
import { useDataGrid } from '../src/DataGrid';

interface User {
  id: string;
  name: string;
  age: number;
}

const data: User[] = [
  { id: 'a', name: 'Alice', age: 30 },
  { id: 'b', name: 'Bob', age: 22 },
  { id: 'c', name: 'Charlie', age: 35 },
];

const columns: ColumnDef<User>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, filterable: true, type: 'text' },
  { id: 'age', header: 'Age', accessor: 'age', sortable: true, filterable: true, type: 'number' },
];

const getRowId = (u: User) => u.id;

describe('useDataGrid — initialization', () => {
  it('seeds initial state from `default*` props', () => {
    const { result } = renderHook(() =>
      useDataGrid({
        data,
        columns,
        getRowId,
        defaultSort: [{ id: 'name', direction: 'desc' }],
        defaultDensity: 'compact',
        defaultGlobalSearch: 'foo',
      }),
    );

    expect(result.current.state.sort).toEqual([{ id: 'name', direction: 'desc' }]);
    expect(result.current.state.density).toBe('compact');
    expect(result.current.state.globalSearch).toBe('foo');
  });

  it('seeds pinning from `column.pinned` markers when no defaultColumnPinning is supplied', () => {
    const cols: ColumnDef<User>[] = [
      { id: 'name', accessor: 'name', type: 'text', pinned: 'start' },
      { id: 'age', accessor: 'age', type: 'number' },
    ];
    const { result } = renderHook(() => useDataGrid({ data, columns: cols, getRowId }));
    expect(result.current.state.columnPinning.start).toEqual(['name']);
  });

  it('derives rows through the filter→sort→paginate pipeline', () => {
    const { result } = renderHook(() =>
      useDataGrid({
        data,
        columns,
        getRowId,
        defaultSort: [{ id: 'age', direction: 'asc' }],
        defaultPagination: { pageIndex: 0, pageSize: 2 },
      }),
    );
    expect(result.current.rows.map((r) => r.id)).toEqual(['b', 'a']);
    expect(result.current.totalRowCount).toBe(3);
  });
});

describe('useDataGrid — actions update state', () => {
  it('cycleSort moves through asc → desc → none', () => {
    const { result } = renderHook(() => useDataGrid({ data, columns, getRowId }));
    act(() => result.current.cycleSort('name'));
    expect(result.current.state.sort).toEqual([{ id: 'name', direction: 'asc' }]);
    act(() => result.current.cycleSort('name'));
    expect(result.current.state.sort).toEqual([{ id: 'name', direction: 'desc' }]);
    act(() => result.current.cycleSort('name'));
    expect(result.current.state.sort).toEqual([]);
  });

  it('setFilter narrows the visible rows', () => {
    const { result } = renderHook(() => useDataGrid({ data, columns, getRowId }));
    act(() => result.current.setFilter('name', { operator: 'contains', value: 'ali' }));
    expect(result.current.rows.map((r) => r.id)).toEqual(['a']);
    act(() => result.current.clearFilters());
    expect(result.current.rows).toHaveLength(3);
  });

  it('setGlobalSearch composes with column filters', () => {
    const { result } = renderHook(() =>
      useDataGrid({
        data,
        columns,
        getRowId,
        defaultFilters: { age: { operator: 'gt', value: 25 } },
      }),
    );
    act(() => result.current.setGlobalSearch('bob'));
    expect(result.current.rows).toHaveLength(0); // bob is 22, filter rejects
    act(() => result.current.setGlobalSearch('charlie'));
    expect(result.current.rows.map((r) => r.id)).toEqual(['c']);
  });

  it('selection: toggleRow + toggleAll', () => {
    const { result } = renderHook(() =>
      useDataGrid({ data, columns, getRowId, defaultSelectionMode: 'multiple' }),
    );
    act(() => result.current.toggleRowSelection('a'));
    expect(idsArray(result.current.state.selection.ids)).toEqual(['a']);
    act(() => result.current.toggleAllSelection());
    expect(new Set(idsArray(result.current.state.selection.ids))).toEqual(new Set(['a', 'b', 'c']));
    act(() => result.current.toggleAllSelection());
    expect(idsArray(result.current.state.selection.ids)).toEqual([]);
  });
});

describe('useDataGrid — controlled / uncontrolled', () => {
  it('props.state overrides the corresponding internal slice', () => {
    const initialSort: DataGridState['sort'] = [{ id: 'age', direction: 'asc' }];
    const { result, rerender } = renderHook(
      ({ sortControlled }: { sortControlled: DataGridState['sort'] }) =>
        useDataGrid({ data, columns, getRowId, state: { sort: sortControlled } }),
      { initialProps: { sortControlled: initialSort } },
    );
    expect(result.current.state.sort).toEqual([{ id: 'age', direction: 'asc' }]);
    const nextSort: DataGridState['sort'] = [{ id: 'name', direction: 'desc' }];
    rerender({ sortControlled: nextSort });
    expect(result.current.state.sort).toEqual([{ id: 'name', direction: 'desc' }]);
  });

  it('onStateChange fires after a mutation', async () => {
    const onStateChange = vi.fn();
    const { result } = renderHook(() =>
      useDataGrid({ data, columns, getRowId, onStateChange }),
    );
    act(() => result.current.setGlobalSearch('hello'));
    expect(onStateChange).toHaveBeenCalled();
    const lastCall = onStateChange.mock.calls.at(-1);
    expect(lastCall?.[0].globalSearch).toBe('hello');
  });
});

describe('useDataGrid — server-driven mode', () => {
  it('isServerSide flips when rowCount is set', () => {
    const { result } = renderHook(() =>
      useDataGrid({ data, columns, getRowId, rowCount: 1000 }),
    );
    expect(result.current.isServerSide).toBe(true);
    expect(result.current.totalRowCount).toBe(1000);
  });

  it('manualSort skips the client sort even when state.sort is set', () => {
    const { result } = renderHook(() =>
      useDataGrid({
        data,
        columns,
        getRowId,
        manualSort: true,
        defaultSort: [{ id: 'name', direction: 'desc' }],
      }),
    );
    // No client-side sort applied — order matches input data
    expect(result.current.rows.map((r) => r.id)).toEqual(['a', 'b', 'c']);
  });

  it('manualFiltering skips the filter step', () => {
    const { result } = renderHook(() =>
      useDataGrid({
        data,
        columns,
        getRowId,
        manualFiltering: true,
        defaultFilters: { name: { operator: 'contains', value: 'zzz' } },
      }),
    );
    expect(result.current.rows).toHaveLength(3);
  });
});

describe('useDataGrid — translations precedence', () => {
  it('English defaults when no provider + no props.translations', () => {
    const { result } = renderHook(() => useDataGrid({ data, columns, getRowId }));
    expect(result.current.t.empty).toBe('No data');
    expect(result.current.t.operators.contains).toBe('contains');
  });

  it('I18nProvider get("DataGrid") wins over defaults', () => {
    const { result } = renderHook(() => useDataGrid({ data, columns, getRowId }), {
      wrapper: ({ children }) => (
        <I18nProvider locale="he" messages={{ DataGrid: { empty: 'אין נתונים' } }}>
          {children}
        </I18nProvider>
      ),
    });
    expect(result.current.t.empty).toBe('אין נתונים');
    // Untouched key falls back to English default
    expect(result.current.t.loading).toBe('Loading…');
  });

  it('props.translations beats provider beats defaults', () => {
    const { result } = renderHook(
      () =>
        useDataGrid({
          data,
          columns,
          getRowId,
          translations: { empty: 'PROP_EMPTY' },
        }),
      {
        wrapper: ({ children }) => (
          <I18nProvider locale="en" messages={{ DataGrid: { empty: 'PROVIDER_EMPTY', loading: 'PROVIDER_LOADING' } }}>
            {children}
          </I18nProvider>
        ),
      },
    );
    expect(result.current.t.empty).toBe('PROP_EMPTY');
    expect(result.current.t.loading).toBe('PROVIDER_LOADING');
  });
});

describe('useDataGrid — exporters', () => {
  it('exportCsv emits header + rows for the filtered set', () => {
    const { result } = renderHook(() =>
      useDataGrid({
        data,
        columns,
        getRowId,
        defaultFilters: { age: { operator: 'gt', value: 25 } },
      }),
    );
    const csv = result.current.exportCsv();
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe('Name,Age');
    expect(lines).toHaveLength(3); // header + 2 rows (alice + charlie)
  });

  it('exportJson returns serialised filtered rows', () => {
    const { result } = renderHook(() => useDataGrid({ data, columns, getRowId }));
    const parsed = JSON.parse(result.current.exportJson());
    expect(parsed).toHaveLength(3);
    expect(parsed[0]).toEqual({ name: 'Alice', age: 30 });
  });
});

describe('useDataGrid — storage round-trip', () => {
  let memory: Record<string, string>;
  const adapter: StorageAdapter = {
    read: (key) => memory[key] ?? null,
    write: (key, value) => {
      memory[key] = value;
    },
    remove: (key) => {
      delete memory[key];
    },
  };

  beforeEach(() => {
    memory = {};
  });

  afterEach(() => {
    memory = {};
  });

  it('writes persisted slices when state changes', async () => {
    const { result } = renderHook(() =>
      useDataGrid({ data, columns, getRowId, storage: adapter, storageKey: 'grid-v1' }),
    );
    act(() => result.current.setDensity('compact'));
    // useEffect commits to storage on the next microtask
    await Promise.resolve();
    const persisted = JSON.parse(memory['grid-v1'] ?? '{}');
    expect(persisted.density).toBe('compact');
  });

  it('rehydrates persisted slices on a fresh mount', () => {
    memory['grid-v1'] = JSON.stringify({
      sort: [{ id: 'age', direction: 'desc' }],
      density: 'comfortable',
      pageSize: 5,
    });
    const { result } = renderHook(() =>
      useDataGrid({ data, columns, getRowId, storage: adapter, storageKey: 'grid-v1' }),
    );
    expect(result.current.state.sort).toEqual([{ id: 'age', direction: 'desc' }]);
    expect(result.current.state.density).toBe('comfortable');
    if ('pageSize' in result.current.state.pagination) {
      expect(result.current.state.pagination.pageSize).toBe(5);
    }
  });

  it('ignores malformed persisted payloads gracefully', () => {
    memory['grid-v1'] = '{not json';
    const { result } = renderHook(() =>
      useDataGrid({
        data,
        columns,
        getRowId,
        storage: adapter,
        storageKey: 'grid-v1',
        defaultDensity: 'standard',
      }),
    );
    expect(result.current.state.density).toBe('standard');
  });
});

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function idsArray(ids: unknown): string[] {
  if (ids instanceof Set) return [...ids].map(String);
  if (ids === null || ids === undefined) return [];
  return [String(ids)];
}