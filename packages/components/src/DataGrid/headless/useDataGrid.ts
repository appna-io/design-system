'use client';

import { useI18n } from '@apx-ui/engine';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import { enDataGridTranslations } from '../i18n/locales/en';
import { mergeTranslations } from '../i18n/useDataGridTranslations';
import {
  type ColumnDef,
  type ColumnFilter,
  type ColumnId,
  type DataGridDensity,
  type DataGridState,
  type DataGridTranslations,
  type PaginationState,
  type PersistedDataGridState,
  type Row,
  type RowId,
  type SelectionIds,
  type SortDescriptor,
  type UseDataGridOptions,
  type UseDataGridReturn,
} from '../DataGrid.types';
import { deriveColumnOrder } from './derivations/deriveColumnOrder';
import { deriveFilteredRows } from './derivations/deriveFilteredRows';
import { derivePaginatedRows } from './derivations/derivePaginatedRows';
import { derivePinnedColumns } from './derivations/derivePinnedColumns';
import { deriveSortedRows } from './derivations/deriveSortedRows';
import { deriveVisibleColumns } from './derivations/deriveVisibleColumns';
import { exportCsv } from './exportCsv';
import { exportJson } from './exportJson';
import { gridReducer, type GridAction } from './gridReducer';
import { initialColumnPinningState } from './reducers/columnPinning';
import { initialColumnSizeState } from './reducers/columnSize';
import { initialColumnVisibilityState } from './reducers/columnVisibility';
import { initialDensityState } from './reducers/density';
import { initialEditingState } from './reducers/editing';
import { initialExpansionState } from './reducers/expansion';
import { initialFilterState } from './reducers/filter';
import { initialGlobalSearchState } from './reducers/globalSearch';
import { initialPaginationState, isCursorPagination } from './reducers/pagination';
import { initialSelectionState } from './reducers/selection';
import { initialSortState } from './reducers/sort';
import { resolveStorageAdapter, safeParse } from './storage';

/**
 * The headless DataGrid state machine.
 *
 * Composes 12 pure slice reducers + 6 derivations into a single hook that drives both
 * the high-level `<DataGrid />` component (PR 3) and headless consumers who want to
 * render their own DOM. The return shape mirrors the spec in
 * `plans/pending/components/27-data-grid.md` §"Headless State Machine".
 *
 * ## Controlled / uncontrolled
 *
 * Every state slice supports a `default*` initial value. The umbrella `state` prop can
 * partially control any subset of slices: keys present in `state` win over internal
 * state on every render; absent keys remain uncontrolled. `onStateChange` fires after
 * every state mutation with the merged would-be next state.
 *
 * ## Server-driven mode
 *
 * Setting any of `rowCount`, `manualSort`, `manualFiltering`, `manualPagination`
 * disables the corresponding client-side step. The hook still tracks the sort / filter
 * / page state so the toolbar UI works; the consumer is expected to refetch and pass
 * pre-sliced `data` back in.
 *
 * ## DOM bridge
 *
 * `rootProps`, `tableProps`, `getHeaderProps`, `getCellProps` return `{}` today —
 * they're populated in PR 3 once the ARIA + keyboard module ships. Headless consumers
 * can ignore them for now and roll their own DOM.
 */
export function useDataGrid<T>(options: UseDataGridOptions<T>): UseDataGridReturn<T> {
  const {
    data,
    columns,
    rowCount,
    getRowId,
    state: controlledState,
    onStateChange,
    defaultSort,
    defaultFilters,
    defaultGlobalSearch,
    defaultPagination,
    defaultSelectionMode = 'none',
    defaultSelectedRowIds,
    defaultColumnVisibility,
    defaultColumnOrder,
    defaultColumnSizes,
    defaultColumnPinning,
    defaultDensity,
    defaultExpandedIds,
    pageSizeOptions,
    storage,
    storageKey,
    manualSort,
    manualFiltering,
    manualPagination,
    translations: translationsProp,
  } = options;

  /* ---------------------------------------------------------------------- */
  /*  i18n resolution                                                        */
  /* ---------------------------------------------------------------------- */

  const i18n = useI18n();
  const locale = i18n?.locale ?? 'en';
  const providerTranslations = i18n?.get<Partial<DataGridTranslations>>('DataGrid');

  const t = useMemo<DataGridTranslations>(
    () => mergeTranslations(enDataGridTranslations, providerTranslations, translationsProp),
    [providerTranslations, translationsProp],
  );

  const collator = useMemo(
    () => new Intl.Collator(locale, { numeric: true, sensitivity: 'base' }),
    [locale],
  );

  /* ---------------------------------------------------------------------- */
  /*  Initial state — defaults + column-def-derived seeds                    */
  /* ---------------------------------------------------------------------- */

  // Seed pinning from `column.pinned` markers when the consumer didn't supply an explicit
  // default. This is the one place column metadata leaks into state shape; doing it once
  // at init keeps `column.pinned` declarative.
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  const storageAdapter = useMemo(() => resolveStorageAdapter(storage), [storage]);

  const initialState = useMemo<DataGridState>(() => {
    const seededPinning =
      defaultColumnPinning ??
      seedPinningFromColumnDefs(columns) ??
      initialColumnPinningState;

    let base: DataGridState = {
      sort: defaultSort ?? initialSortState,
      filters: defaultFilters ?? initialFilterState,
      globalSearch: defaultGlobalSearch ?? initialGlobalSearchState,
      pagination: defaultPagination ?? initialPaginationState,
      selection: {
        ...initialSelectionState,
        mode: defaultSelectionMode,
        ids: defaultSelectedRowIds ?? initialSelectionIdsForMode(defaultSelectionMode),
      },
      columnVisibility: defaultColumnVisibility ?? initialColumnVisibilityState,
      columnOrder: defaultColumnOrder ?? [],
      columnSizes: defaultColumnSizes ?? initialColumnSizeState,
      columnPinning: seededPinning,
      density: defaultDensity ?? initialDensityState,
      expanded: defaultExpandedIds ? new Set(defaultExpandedIds) : initialExpansionState,
      editingCell: initialEditingState,
    };

    if (storageAdapter && storageKey) {
      const raw = storageAdapter.read(storageKey);
      const persisted = safeParse<PersistedDataGridState>(raw);
      if (persisted) base = applyPersisted(base, persisted);
    }

    return base;
    // We intentionally only re-seed when the storage identity changes, not on every
    // column change — the reducer + actions are the right path for runtime updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageAdapter, storageKey]);

  const [internalState, dispatch] = useReducer(gridReducer, initialState);

  /* ---------------------------------------------------------------------- */
  /*  Controlled merge — props.state wins per-slice                          */
  /* ---------------------------------------------------------------------- */

  const state = useMemo<DataGridState>(() => {
    if (!controlledState) return internalState;
    return { ...internalState, ...controlledState };
  }, [internalState, controlledState]);

  /* ---------------------------------------------------------------------- */
  /*  onStateChange — fire whenever the merged state changes                 */
  /* ---------------------------------------------------------------------- */

  const onStateChangeRef = useRef(onStateChange);
  onStateChangeRef.current = onStateChange;
  const previousStateRef = useRef<DataGridState>(state);
  useEffect(() => {
    if (previousStateRef.current === state) return;
    previousStateRef.current = state;
    onStateChangeRef.current?.(state);
  }, [state]);

  /* ---------------------------------------------------------------------- */
  /*  Persistence — write the snapshot back to the adapter                   */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!storageAdapter || !storageKey) return;
    const snapshot = pickPersisted(state);
    try {
      storageAdapter.write(storageKey, JSON.stringify(snapshot));
    } catch {
      // No-op — `storage.write` already swallows; this guards JSON serialisation.
    }
  }, [storageAdapter, storageKey, state]);

  /* ---------------------------------------------------------------------- */
  /*  Row identity + raw-row projection                                      */
  /* ---------------------------------------------------------------------- */

  const allRows = useMemo<Row<T>[]>(
    () =>
      data.map((original, index) => ({
        id: getRowId ? getRowId(original, index) : index,
        index,
        original,
      })),
    [data, getRowId],
  );

  /* ---------------------------------------------------------------------- */
  /*  Pipeline                                                               */
  /* ---------------------------------------------------------------------- */

  const isServerSide =
    rowCount !== undefined ||
    manualSort === true ||
    manualFiltering === true ||
    manualPagination === true;

  const filteredRows = useMemo(() => {
    if (manualFiltering || rowCount !== undefined) return allRows;
    return deriveFilteredRows({
      rows: allRows,
      columns,
      filters: state.filters,
      globalSearch: state.globalSearch,
    });
  }, [allRows, columns, state.filters, state.globalSearch, manualFiltering, rowCount]);

  const sortedRows = useMemo(() => {
    if (manualSort || rowCount !== undefined) return filteredRows;
    return deriveSortedRows({
      rows: filteredRows,
      columns,
      sort: state.sort,
      collator,
    });
  }, [filteredRows, columns, state.sort, collator, manualSort, rowCount]);

  const paginated = useMemo(() => {
    if (manualPagination || rowCount !== undefined) {
      // Server mode: data already pre-sliced; we still return the same shape so the
      // consumer can read `pageIndex` / `pageCount` from the hook for UI labels.
      return derivePaginatedRows({ rows: sortedRows, pagination: state.pagination });
    }
    return derivePaginatedRows({ rows: sortedRows, pagination: state.pagination });
  }, [sortedRows, state.pagination, manualPagination, rowCount]);

  const totalRowCount = rowCount ?? filteredRows.length;

  /* ---------------------------------------------------------------------- */
  /*  Column pipeline                                                        */
  /* ---------------------------------------------------------------------- */

  const orderedColumns = useMemo(
    () => deriveColumnOrder(columns, state.columnOrder),
    [columns, state.columnOrder],
  );

  const visibleColumns = useMemo(
    () => deriveVisibleColumns(orderedColumns, state.columnVisibility),
    [orderedColumns, state.columnVisibility],
  );

  // PR 5 surfaces this on the return so `<DataGrid.HeaderCell>` / `<DataGrid.Cell>`
  // can render pinned columns with sticky CSS and the right inset offset.
  const pinnedGroups = useMemo(
    () => derivePinnedColumns(visibleColumns as ColumnDef<T>[], state.columnPinning),
    [visibleColumns, state.columnPinning],
  );

  /* ---------------------------------------------------------------------- */
  /*  Actions                                                                */
  /* ---------------------------------------------------------------------- */

  const orderedVisibleIds = useMemo(() => paginated.rows.map((r) => r.id), [paginated.rows]);

  const dispatchAction = useCallback((action: GridAction) => {
    dispatch(action);
  }, []);

  const setSort = useCallback(
    (sort: SortDescriptor[]) => dispatchAction({ type: 'sort', payload: { type: 'set', sort } }),
    [dispatchAction],
  );

  const cycleSortAction = useCallback(
    (id: ColumnId, { multi = false }: { multi?: boolean } = {}) => {
      const col = columnsRef.current.find((c) => c.id === id);
      const removable = col?.sortRemovable !== false;
      dispatchAction({ type: 'sort', payload: { type: 'cycle', id, multi, removable } });
    },
    [dispatchAction],
  );

  const setFilter = useCallback(
    (columnId: ColumnId, filter: ColumnFilter | undefined) =>
      dispatchAction({ type: 'filter', payload: { type: 'set', columnId, filter } }),
    [dispatchAction],
  );

  const clearFilters = useCallback(
    () => dispatchAction({ type: 'filter', payload: { type: 'clear' } }),
    [dispatchAction],
  );

  const setGlobalSearch = useCallback(
    (value: string) =>
      dispatchAction({ type: 'globalSearch', payload: { type: 'set', value } }),
    [dispatchAction],
  );

  const setPagination = useCallback(
    (pagination: PaginationState) =>
      dispatchAction({ type: 'pagination', payload: { type: 'set', pagination } }),
    [dispatchAction],
  );

  const setPageIndex = useCallback(
    (pageIndex: number) =>
      dispatchAction({ type: 'pagination', payload: { type: 'setPageIndex', pageIndex } }),
    [dispatchAction],
  );

  const setPageSize = useCallback(
    (pageSize: number) =>
      dispatchAction({ type: 'pagination', payload: { type: 'setPageSize', pageSize } }),
    [dispatchAction],
  );

  const setSelection = useCallback(
    (ids: SelectionIds) =>
      dispatchAction({ type: 'selection', payload: { type: 'set', ids } }),
    [dispatchAction],
  );

  const toggleRowSelection = useCallback(
    (id: RowId, { range = false }: { range?: boolean; toggle?: boolean } = {}) =>
      dispatchAction({
        type: 'selection',
        payload: { type: 'toggleRow', id, orderedIds: orderedVisibleIds, range },
      }),
    [dispatchAction, orderedVisibleIds],
  );

  const toggleAllSelection = useCallback(
    () =>
      dispatchAction({
        type: 'selection',
        payload: { type: 'toggleAll', orderedIds: orderedVisibleIds },
      }),
    [dispatchAction, orderedVisibleIds],
  );

  const setColumnVisibility = useCallback(
    (visibility: Record<ColumnId, boolean>) =>
      dispatchAction({
        type: 'columnVisibility',
        payload: { type: 'set', visibility },
      }),
    [dispatchAction],
  );

  const setColumnOrder = useCallback(
    (order: ColumnId[]) =>
      dispatchAction({ type: 'columnOrder', payload: { type: 'set', order } }),
    [dispatchAction],
  );

  const moveColumn = useCallback(
    (columnId: ColumnId, direction: 'left' | 'right') => {
      // The reducer's `move` action only acts on ids already in the override list
      // (`state.columnOrder`). Real consumers haven't seeded the override yet — they
      // just want "swap two visible columns" — so we hydrate from the *natural* order
      // first, then dispatch a `set` that contains the swap. Keeps the reducer pure.
      const naturalOrder = orderedColumns.map((c) => c.id);
      const idx = naturalOrder.indexOf(columnId);
      if (idx === -1) return;
      const target = direction === 'left' ? idx - 1 : idx + 1;
      if (target < 0 || target >= naturalOrder.length) return;
      const next = [...naturalOrder];
      const tmp = next[idx]!;
      next[idx] = next[target]!;
      next[target] = tmp;
      dispatchAction({ type: 'columnOrder', payload: { type: 'set', order: next } });
    },
    [dispatchAction, orderedColumns],
  );

  const setColumnSize = useCallback(
    (columnId: ColumnId, size: number) =>
      dispatchAction({ type: 'columnSize', payload: { type: 'setOne', columnId, size } }),
    [dispatchAction],
  );

  const resetColumnSize = useCallback(
    (columnId: ColumnId) =>
      dispatchAction({ type: 'columnSize', payload: { type: 'reset', columnId } }),
    [dispatchAction],
  );

  const pinColumn = useCallback(
    (columnId: ColumnId, side: 'start' | 'end' | null) =>
      dispatchAction({ type: 'columnPinning', payload: { type: 'pin', columnId, side } }),
    [dispatchAction],
  );

  const setDensity = useCallback(
    (density: DataGridDensity) =>
      dispatchAction({ type: 'density', payload: { type: 'set', density } }),
    [dispatchAction],
  );

  const toggleRowExpanded = useCallback(
    (id: RowId) =>
      dispatchAction({ type: 'expansion', payload: { type: 'toggle', id } }),
    [dispatchAction],
  );

  const startEditing = useCallback(
    (rowId: RowId, columnId: ColumnId) =>
      dispatchAction({ type: 'editing', payload: { type: 'start', rowId, columnId } }),
    [dispatchAction],
  );

  const cancelEditing = useCallback(
    () => dispatchAction({ type: 'editing', payload: { type: 'cancel' } }),
    [dispatchAction],
  );

  const commitEditing = useCallback(
    (value: unknown) => {
      const editing = internalState.editingCell;
      if (!editing) return;
      const column = columnsRef.current.find((c) => c.id === editing.columnId);
      if (column?.onCellEdit) {
        const row = allRows.find((r) => r.id === editing.rowId);
        if (row) column.onCellEdit(row.original, value);
      }
      dispatchAction({ type: 'editing', payload: { type: 'cancel' } });
    },
    [internalState.editingCell, allRows, dispatchAction],
  );

  const resetState = useCallback(() => {
    dispatchAction({ type: 'reset', payload: initialState });
  }, [dispatchAction, initialState]);

  const exportCsvFn = useCallback(
    () => exportCsv({ rows: filteredRows, columns: visibleColumns as ColumnDef<T>[] }),
    [filteredRows, visibleColumns],
  );

  const exportJsonFn = useCallback(
    () => exportJson({ rows: filteredRows, columns: visibleColumns as ColumnDef<T>[] }),
    [filteredRows, visibleColumns],
  );

  /* ---------------------------------------------------------------------- */
  /*  DOM bridge — ARIA Grid attribute getters                               */
  /*  PR 3: roving-tabindex is owned by the React part; this hook supplies   */
  /*  the static ARIA attrs (role, indices, sort, selection signals).        */
  /* ---------------------------------------------------------------------- */

  const rootProps = useMemo<Record<string, unknown>>(() => ({}), []);

  const tableProps = useMemo<Record<string, unknown>>(
    () => ({
      role: 'grid',
      // +1 for the header row, per ARIA Grid convention.
      'aria-rowcount': totalRowCount + 1,
      'aria-colcount': visibleColumns.length,
      ...(state.selection.mode === 'multiple' ? { 'aria-multiselectable': true } : {}),
    }),
    [totalRowCount, visibleColumns.length, state.selection.mode],
  );

  const sortByColumn = useMemo(() => {
    const map = new Map<ColumnId, { direction: 'asc' | 'desc'; index: number }>();
    state.sort.forEach((s, i) => map.set(s.id, { direction: s.direction, index: i }));
    return map;
  }, [state.sort]);

  const columnIndexById = useMemo(() => {
    const map = new Map<ColumnId, number>();
    visibleColumns.forEach((c, i) => map.set(c.id, i));
    return map;
  }, [visibleColumns]);

  const rowIndexById = useMemo(() => {
    const map = new Map<RowId, number>();
    paginated.rows.forEach((r, i) => map.set(r.id, i));
    return map;
  }, [paginated.rows]);

  const getHeaderProps = useCallback(
    (columnId: ColumnId): Record<string, unknown> => {
      const colIndex = columnIndexById.get(columnId);
      const sortEntry = sortByColumn.get(columnId);
      const ariaSort: 'ascending' | 'descending' | 'none' | undefined = sortEntry
        ? sortEntry.direction === 'asc'
          ? 'ascending'
          : 'descending'
        : 'none';
      return {
        role: 'columnheader',
        // +1 because ARIA `aria-colindex` is 1-based.
        ...(colIndex !== undefined ? { 'aria-colindex': colIndex + 1 } : {}),
        'aria-sort': ariaSort,
      };
    },
    [columnIndexById, sortByColumn],
  );

  const selectedIdsSet = useMemo<Set<RowId>>(() => {
    const ids = state.selection.ids;
    if (ids instanceof Set) return ids;
    if (ids === null || ids === undefined) return new Set();
    return new Set([ids]);
  }, [state.selection.ids]);

  const getCellProps = useCallback(
    (rowId: RowId, columnId: ColumnId): Record<string, unknown> => {
      const colIndex = columnIndexById.get(columnId);
      const column = columnsRef.current.find((c) => c.id === columnId);
      const isEditing =
        state.editingCell?.rowId === rowId && state.editingCell?.columnId === columnId;
      return {
        role: 'gridcell',
        ...(colIndex !== undefined ? { 'aria-colindex': colIndex + 1 } : {}),
        'aria-readonly': !column?.editable,
        ...(isEditing ? { 'aria-current': true } : {}),
      };
    },
    [columnIndexById, state.editingCell],
  );

  /**
   * Per-row props consumed by `<DataGrid.Row>` (PR 3). Not in the planned return surface,
   * but the body part needs `aria-rowindex` + `aria-selected` + `data-state` and computing
   * them here keeps the row component a thin renderer with stable references.
   */
  const getRowProps = useCallback(
    (rowId: RowId): Record<string, unknown> => {
      const rowIndex = rowIndexById.get(rowId);
      const isSelected = selectedIdsSet.has(rowId);
      return {
        role: 'row',
        // +2: header row is 1, body rows start at 2.
        ...(rowIndex !== undefined ? { 'aria-rowindex': rowIndex + 2 } : {}),
        ...(state.selection.mode !== 'none' ? { 'aria-selected': isSelected } : {}),
        'data-state': isSelected ? 'selected' : 'default',
      };
    },
    [rowIndexById, selectedIdsSet, state.selection.mode],
  );

  /* ---------------------------------------------------------------------- */
  /*  Surface advanced derived bits via state shape — paginated info etc.    */
  /*  Quietly used by PR 3 wiring. Page-aware state is exposed below.        */
  /* ---------------------------------------------------------------------- */

  // Touch `pageSizeOptions` so it lives in the closure for the persistence layer (PR 7);
  // not part of the return shape today.
  void pageSizeOptions;

  return {
    state,
    rows: paginated.rows,
    visibleColumns,
    /**
     * The full, un-filtered column list as the consumer declared it. Surfaces here so
     * the `<DataGrid.ColumnVisibility>` toggle list (PR 4) can show every column
     * (including currently hidden ones) and so consumers can build bespoke column
     * managers without re-threading the original array.
     */
    columns: columnsRef.current as ReadonlyArray<ColumnDef<T>>,
    /**
     * PR 5 — visible columns split into `{ start, middle, end }` pinning groups.
     * Pinned columns get sticky CSS in `<DataGrid.HeaderCell>` / `<DataGrid.Cell>`;
     * headless consumers can render the groups themselves for bespoke layouts.
     */
    pinnedGroups,
    /**
     * PR 5 — the post-filter (but pre-paginate) row set, used by `<DataGrid.Footer>`
     * for aggregations. Per spec, footer totals reflect "currently visible data"
     * before pagination so flipping pages doesn't change the displayed sum.
     */
    filteredRows,
    /**
     * PR 6 — the post-filter, post-sort, pre-paginate row set used by virtualization
     * (`<DataGrid.VirtualBody>`). The virtual body windows over this array so the
     * user's chosen sort order is preserved while every row stays addressable.
     */
    sortedRows,
    totalRowCount,
    isServerSide,
    setSort,
    cycleSort: cycleSortAction,
    setFilter,
    clearFilters,
    setGlobalSearch,
    setPagination,
    setPageIndex,
    setPageSize,
    setSelection,
    toggleRowSelection,
    toggleAllSelection,
    setColumnVisibility,
    setColumnOrder,
    moveColumn,
    setColumnSize,
    resetColumnSize,
    pinColumn,
    setDensity,
    toggleRowExpanded,
    startEditing,
    commitEditing,
    cancelEditing,
    resetState,
    exportCsv: exportCsvFn,
    exportJson: exportJsonFn,
    t,
    rootProps,
    tableProps,
    getHeaderProps,
    getCellProps,
    getRowProps,
    paginationInfo: paginated,
  };
}

/* -------------------------------------------------------------------------- */
/*  Helpers — pure, exported only for testing                                  */
/* -------------------------------------------------------------------------- */

function initialSelectionIdsForMode(mode: 'none' | 'single' | 'multiple'): SelectionIds {
  if (mode === 'multiple') return new Set();
  return null;
}

/**
 * Walk the supplied columns and synthesise an initial pinning state from any
 * `column.pinned` markers. Returns `null` when no column declares a pin so the caller
 * can fall through to the engine default.
 */
function seedPinningFromColumnDefs<T>(
  columns: ColumnDef<T>[],
): { start: ColumnId[]; end: ColumnId[] } | null {
  let any = false;
  const start: ColumnId[] = [];
  const end: ColumnId[] = [];
  for (const col of columns) {
    if (col.pinned === 'start') {
      start.push(col.id);
      any = true;
    } else if (col.pinned === 'end') {
      end.unshift(col.id);
      any = true;
    }
  }
  return any ? { start, end } : null;
}

function pickPersisted(state: DataGridState): PersistedDataGridState {
  const pageSize = isCursorPagination(state.pagination)
    ? state.pagination.pageSize
    : state.pagination.pageSize;
  return {
    sort: state.sort,
    filters: state.filters,
    columnVisibility: state.columnVisibility,
    columnOrder: state.columnOrder,
    columnSizes: state.columnSizes,
    columnPinning: state.columnPinning,
    density: state.density,
    pageSize,
  };
}

function applyPersisted(state: DataGridState, persisted: PersistedDataGridState): DataGridState {
  const next: DataGridState = { ...state };
  if (persisted.sort) next.sort = persisted.sort;
  if (persisted.filters) next.filters = persisted.filters;
  if (persisted.columnVisibility) next.columnVisibility = persisted.columnVisibility;
  if (persisted.columnOrder) next.columnOrder = persisted.columnOrder;
  if (persisted.columnSizes) next.columnSizes = persisted.columnSizes;
  if (persisted.columnPinning) next.columnPinning = persisted.columnPinning;
  if (persisted.density) next.density = persisted.density;
  if (typeof persisted.pageSize === 'number') {
    next.pagination = isCursorPagination(state.pagination)
      ? { cursor: state.pagination.cursor, pageSize: persisted.pageSize }
      : { pageIndex: 0, pageSize: persisted.pageSize };
  }
  return next;
}