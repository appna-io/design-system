import type { CSSProperties, ReactNode } from 'react';

import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/* -------------------------------------------------------------------------- */
/*  Identifiers + primitive enums                                              */
/* -------------------------------------------------------------------------- */

export type RowId = string | number;
export type ColumnId = string;

export type SortDirection = 'asc' | 'desc';
export interface SortDescriptor {
  id: ColumnId;
  direction: SortDirection;
}

export type SelectionMode = 'none' | 'single' | 'multiple';

/**
 * The seven canonical accent roles. Mirrors `ButtonColor` / `MenuColor` etc. so the
 * variant × color matrix stays consistent across the DS.
 */
export type DataGridColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export type DataGridVariant = 'solid' | 'outline' | 'striped' | 'minimal';

/**
 * DataGrid density vocabulary deliberately diverges from the rest of the DS
 * (`'sm' | 'md' | 'lg'`) per the plan: a data grid's three densities are
 * conceptually different from a button's three sizes (rows per viewport vs. tap target).
 * Mapping for any future shared tooling: `compact ↔ sm`, `standard ↔ md`, `comfortable ↔ lg`.
 */
export type DataGridDensity = 'compact' | 'standard' | 'comfortable';

export type DataGridRoundedCorners = 'none' | 'sm' | 'md' | 'lg';
export type DataGridElevation = 'none' | 'sm' | 'md' | 'lg';

/* -------------------------------------------------------------------------- */
/*  Column type axis + filter operator surface                                 */
/* -------------------------------------------------------------------------- */

/**
 * Column behaviour discriminant. Drives:
 *  - the filter operator menu in the column header,
 *  - the default cell renderer when no `cell` slot is provided,
 *  - and (for `rowSelect` / `actions` / `expand`) special rendering paths in PR 3+.
 *
 * Note: `'select'` is a filter type (column whose filter UI is a select-from-options),
 * `'rowSelect'` is the structural row-selection checkbox column. The plan overloads
 * `'select'` for both; we disambiguate by introducing the dedicated `'rowSelect'` type.
 */
export type ColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'boolean'
  | 'custom'
  | 'actions'
  | 'expand'
  | 'rowSelect';

/** All built-in filter operators. Each column type advertises a subset (see `FILTER_OPERATORS`). */
export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'before'
  | 'after'
  | 'in'
  | 'notIn'
  | 'isTrue'
  | 'isFalse'
  | 'isEmpty'
  | 'isNotEmpty';

/**
 * The value passed into a column's filter predicate. Shape varies by operator; the
 * `filterEngine` uses runtime checks rather than per-operator generics to keep the
 * public surface small.
 *
 *  - `between`               → tuple `[from, to]` (numbers or dates)
 *  - `in` / `notIn`          → `unknown[]`
 *  - `isEmpty` / `isNotEmpty`/ `isTrue` / `isFalse` → ignored (operator alone is the predicate)
 *  - everything else         → scalar (`string | number | Date | boolean`)
 */
export type FilterValue = unknown;

/** Per-column filter state — `{ operator, value }` pair stored under the column id. */
export interface ColumnFilter {
  operator: FilterOperator;
  value: FilterValue;
}

/** Map of `columnId → filter` for the whole grid. */
export type ColumnFiltersState = Record<ColumnId, ColumnFilter | undefined>;

/* -------------------------------------------------------------------------- */
/*  Column definition                                                          */
/* -------------------------------------------------------------------------- */

export interface CellContext<T> {
  /** The raw cell value resolved via `accessor`. */
  value: unknown;
  row: T;
  rowId: RowId;
  rowIndex: number;
  column: ColumnDef<T>;
}

export interface HeaderContext<T> {
  column: ColumnDef<T>;
}

export interface CellEditorContext<T> {
  value: unknown;
  row: T;
  rowId: RowId;
  column: ColumnDef<T>;
  onCommit: (next: unknown) => void;
  onCancel: () => void;
}

export interface FilterContext<T> {
  value: FilterValue | undefined;
  operator: FilterOperator;
  onChange: (next: FilterValue | undefined) => void;
  onOperatorChange: (next: FilterOperator) => void;
  column: ColumnDef<T>;
  close: () => void;
}

/** Built-in + custom aggregation specs for `<DataGrid.Footer />`. */
export type AggregationId =
  | 'sum'
  | 'avg'
  | 'min'
  | 'max'
  | 'count'
  | 'countDistinct'
  | 'median';

export interface CustomAggregation<T = unknown> {
  id: string;
  label?: ReactNode;
  fn: (rows: T[]) => unknown;
}

export type ColumnAggregation<T> = AggregationId | CustomAggregation<T>;

/** Responsive column hiding flag. Below this breakpoint the column is auto-hidden. */
export type ResponsiveBreakpointKey = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface ColumnDefBase<T> {
  /** Stable id — used as React `key`, state-store key, and DOM `data-column-id`. */
  id: ColumnId;
  /** Header content. String, ReactNode, or a function for dynamic headers. */
  header?: ReactNode | ((ctx: HeaderContext<T>) => ReactNode);
  /**
   * How to pull the raw value out of a row:
   *  - `keyof T` (e.g. `'name'`) for shallow property access,
   *  - or a function for derived values.
   */
  accessor?: keyof T | ((row: T) => unknown);
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  align?: 'start' | 'center' | 'end';
  /** Initial pin side. Runtime state lives in `state.columnPinning`. */
  pinned?: 'start' | 'end';
  sortable?: boolean;
  /** If `false`, the sort can only toggle asc ↔ desc (no "no sort" state). */
  sortRemovable?: boolean;
  filterable?: boolean;
  /** Whether this column appears in the visibility toggle popover. Default `true`. */
  hideable?: boolean;
  resizable?: boolean;
  editable?: boolean;
  /** Inline editor renderer when `editable: true`. */
  editor?: (ctx: CellEditorContext<T>) => ReactNode;
  /** Called after the editor commits a value (consumer typically persists to a server). */
  onCellEdit?: (row: T, value: unknown) => void;
  /** Override the default cell rendering. */
  cell?: (ctx: CellContext<T>) => ReactNode;
  /**
   * Free-form metadata bag. Useful for consumers to attach app-specific flags read by
   * their own `cell` renderers. Not interpreted by the grid itself.
   */
  meta?: Record<string, unknown>;
  /** Aggregations rendered in `<DataGrid.Footer />`. Operates on filtered (not paginated) rows. */
  aggregations?: ColumnAggregation<T>[];
  /** Class applied to the header `<th>` for this column. */
  headerClassName?: string;
  /** Class applied to every body `<td>` for this column. */
  cellClassName?: string;
  /** Hide below this breakpoint. Drives `state.columnVisibility` via a media-query bridge. */
  responsive?: { hideBelow?: ResponsiveBreakpointKey };
}

/**
 * Discriminated union of column definitions by `type`. Forces consumers to supply
 * type-specific extras (e.g. `options` for select columns, `precision` for numeric) and
 * lets the filter engine dispatch on `column.type` at runtime with full type-safety.
 */
export type ColumnDef<T> = ColumnDefBase<T> &
  (
    | { type?: 'text' }
    | { type: 'number'; precision?: number }
    | { type: 'date'; dateFormat?: Intl.DateTimeFormatOptions }
    | { type: 'select'; options: { value: string; label: ReactNode }[] }
    | { type: 'boolean' }
    | {
        type: 'custom';
        /** Predicate run against every row when this column has a filter. */
        filterFn?: (row: T, value: FilterValue) => boolean;
        /** Custom filter UI inside the per-column Popover. */
        renderFilter?: (ctx: FilterContext<T>) => ReactNode;
      }
    | { type: 'actions' }
    | { type: 'expand' }
    | { type: 'rowSelect' }
  );

/* -------------------------------------------------------------------------- */
/*  Selection signal                                                           */
/* -------------------------------------------------------------------------- */

/** The shape of `state.selection.ids`. Discriminated by `state.selection.mode`. */
export type SelectionIds = Set<RowId> | RowId | null;

export interface SelectionState {
  mode: SelectionMode;
  ids: SelectionIds;
  /** Anchor row used for shift-click range selection. `null` until first click. */
  anchorId: RowId | null;
}

/* -------------------------------------------------------------------------- */
/*  Pagination + cursor mode                                                   */
/* -------------------------------------------------------------------------- */

/** Offset-based pagination (the default). */
export interface OffsetPagination {
  pageIndex: number;
  pageSize: number;
}

/**
 * Cursor-based pagination. When the grid sees `cursor` set it switches the pagination
 * subpart to prev/next only and skips the "page X of Y" label (the server doesn't know
 * the total).
 */
export interface CursorPagination {
  cursor: string | null;
  pageSize: number;
}

export type PaginationState = OffsetPagination | CursorPagination;

/* -------------------------------------------------------------------------- */
/*  Column pinning                                                             */
/* -------------------------------------------------------------------------- */

export interface ColumnPinningState {
  start: ColumnId[];
  end: ColumnId[];
}

/* -------------------------------------------------------------------------- */
/*  The top-level grid state                                                   */
/* -------------------------------------------------------------------------- */

export interface DataGridState {
  sort: SortDescriptor[];
  filters: ColumnFiltersState;
  globalSearch: string;
  pagination: PaginationState;
  selection: SelectionState;
  columnVisibility: Record<ColumnId, boolean>;
  columnOrder: ColumnId[];
  columnSizes: Record<ColumnId, number>;
  columnPinning: ColumnPinningState;
  density: DataGridDensity;
  expanded: Set<RowId>;
  editingCell: { rowId: RowId; columnId: ColumnId } | null;
}

/* -------------------------------------------------------------------------- */
/*  Storage adapter                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Minimal storage contract — consumers can plug in localStorage, sessionStorage, URL
 * query params, IndexedDB, etc. The persisted shape is a JSON-serializable subset of
 * `DataGridState` (selection + pageIndex deliberately excluded).
 */
export interface StorageAdapter {
  read(key: string): string | null;
  write(key: string, value: string): void;
  remove(key: string): void;
}

export type StorageKind = 'local' | 'session' | StorageAdapter;

/** The slice of state that gets persisted via `storage`. */
export interface PersistedDataGridState {
  sort?: SortDescriptor[];
  filters?: ColumnFiltersState;
  columnVisibility?: Record<ColumnId, boolean>;
  columnOrder?: ColumnId[];
  columnSizes?: Record<ColumnId, number>;
  columnPinning?: ColumnPinningState;
  density?: DataGridDensity;
  pageSize?: number;
}

/* -------------------------------------------------------------------------- */
/*  Row projection (post-pipeline)                                             */
/* -------------------------------------------------------------------------- */

/** A row after filter+sort+paginate, with its derived id and original index attached. */
export interface Row<T> {
  id: RowId;
  index: number;
  original: T;
}

/* -------------------------------------------------------------------------- */
/*  Hook options + return                                                      */
/* -------------------------------------------------------------------------- */

export interface UseDataGridOptions<T> {
  data: readonly T[];
  columns: ColumnDef<T>[];
  /**
   * When set, the grid switches to server-driven mode: `data` is treated as the current
   * page only, and `manualSort` / `manualFiltering` / `manualPagination` default to true.
   */
  rowCount?: number;
  /** Derive a stable id for a row. Defaults to `String(index)`. */
  getRowId?: (row: T, index: number) => RowId;

  /** Controlled state slice (partial — un-supplied slices stay uncontrolled). */
  state?: Partial<DataGridState>;
  onStateChange?: (state: DataGridState) => void;

  /* Uncontrolled defaults */
  defaultSort?: SortDescriptor[];
  defaultFilters?: ColumnFiltersState;
  defaultGlobalSearch?: string;
  defaultPagination?: PaginationState;
  defaultSelectionMode?: SelectionMode;
  defaultSelectedRowIds?: SelectionIds;
  defaultColumnVisibility?: Record<ColumnId, boolean>;
  defaultColumnOrder?: ColumnId[];
  defaultColumnSizes?: Record<ColumnId, number>;
  defaultColumnPinning?: ColumnPinningState;
  defaultDensity?: DataGridDensity;
  defaultExpandedIds?: RowId[];

  /** Choices in the page-size `<Select>`. Default `[10, 25, 50, 100]`. */
  pageSizeOptions?: number[];

  /** Persistence — see `StorageAdapter`. `storageKey` should be bumped on schema changes. */
  storage?: StorageKind;
  storageKey?: string;

  /** Skip the client-side sort / filter / paginate steps (consumer supplies pre-processed data). */
  manualSort?: boolean;
  manualFiltering?: boolean;
  manualPagination?: boolean;

  /** Per-instance translation overrides. Highest-precedence layer. */
  translations?: Partial<DataGridTranslations>;
}

/**
 * The hook's return — single source of truth for both the high-level `<DataGrid />`
 * entry component and the headless escape hatch.
 *
 * The DOM-bridge prop-getters (`rootProps`, `tableProps`, `getHeaderProps`, `getCellProps`)
 * are intentionally stubbed in PR 2 — they are populated in PR 3 once the keyboard /
 * ARIA module ships. Headless consumers can still drive selection / sort / filter via the
 * action methods today.
 */
export interface UseDataGridReturn<T> {
  state: DataGridState;
  /** Post-filter+sort+paginate rows (projected). In server-driven mode, mirrors `data`. */
  rows: ReadonlyArray<Row<T>>;
  /** Columns after visibility / order / pinning. */
  visibleColumns: ReadonlyArray<ColumnDef<T>>;
  /**
   * The full, un-filtered column list as the consumer declared it. Useful for tools
   * (`<DataGrid.ColumnVisibility>`, custom column managers) that need to enumerate
   * every column, including ones currently hidden via `state.columnVisibility`.
   */
  columns: ReadonlyArray<ColumnDef<T>>;
  /**
   * Visible columns split into pinning groups. `start` renders first, `middle` in the
   * natural order, `end` last. Driven by `state.columnPinning` + `column.pinned`.
   */
  pinnedGroups: {
    start: ColumnDef<T>[];
    middle: ColumnDef<T>[];
    end: ColumnDef<T>[];
  };
  /**
   * Post-filter, post-global-search rows — before pagination. Footer aggregations
   * consume this so totals reflect "currently visible data" regardless of which page
   * is showing.
   */
  filteredRows: ReadonlyArray<Row<T>>;
  /**
   * Post-filter, post-sort, pre-paginate row set. Consumed by virtualization
   * (`<DataGrid.VirtualBody>`) so the windowed view honours the user's chosen sort.
   * In server mode this mirrors the rows the server returned, in their declared order.
   */
  sortedRows: ReadonlyArray<Row<T>>;
  /** Total row count — `rowCount` in server mode, post-filter length in client mode. */
  totalRowCount: number;
  /** True when `rowCount` is set or any `manual*` flag is `true`. */
  isServerSide: boolean;

  /* Actions — every setter is idempotent and re-fires `onStateChange`. */
  setSort: (sort: SortDescriptor[]) => void;
  cycleSort: (id: ColumnId, options?: { multi?: boolean }) => void;
  setFilter: (columnId: ColumnId, value: ColumnFilter | undefined) => void;
  clearFilters: () => void;
  setGlobalSearch: (q: string) => void;
  setPagination: (p: PaginationState) => void;
  setPageIndex: (i: number) => void;
  setPageSize: (size: number) => void;
  setSelection: (ids: SelectionIds) => void;
  toggleRowSelection: (id: RowId, options?: { range?: boolean; toggle?: boolean }) => void;
  toggleAllSelection: () => void;
  setColumnVisibility: (visibility: Record<ColumnId, boolean>) => void;
  setColumnOrder: (order: ColumnId[]) => void;
  /** Swap a column with its neighbour. Hydrates from the natural order on first call. */
  moveColumn: (columnId: ColumnId, direction: 'left' | 'right') => void;
  setColumnSize: (columnId: ColumnId, size: number) => void;
  /** Clear a column's size override so it falls back to `column.width` (or auto). */
  resetColumnSize: (columnId: ColumnId) => void;
  pinColumn: (columnId: ColumnId, side: 'start' | 'end' | null) => void;
  setDensity: (density: DataGridDensity) => void;
  toggleRowExpanded: (id: RowId) => void;
  startEditing: (rowId: RowId, columnId: ColumnId) => void;
  commitEditing: (value: unknown) => void;
  cancelEditing: () => void;
  resetState: () => void;
  exportCsv: () => string;
  exportJson: () => string;

  /* Translations resolved with full precedence (props > provider > English defaults). */
  t: DataGridTranslations;

  /**
   * Props for the outer wrapper `<div>` that holds the toolbar, scroller, table,
   * pagination, and live region. Today empty; PR 5 may add `aria-busy` when loading.
   */
  rootProps: Record<string, unknown>;
  /**
   * ARIA Grid props for the `<table>` itself: `role="grid"`, `aria-rowcount`,
   * `aria-colcount`, `aria-multiselectable` (when in `'multiple'` selection mode).
   */
  tableProps: Record<string, unknown>;
  /**
   * Per-header props: `role="columnheader"`, `aria-colindex` (1-based), `aria-sort`
   * derived from the current sort stack (`'ascending'` / `'descending'` / `'none'`).
   */
  getHeaderProps: (columnId: ColumnId) => Record<string, unknown>;
  /**
   * Per-cell props: `role="gridcell"`, `aria-colindex`, `aria-readonly` derived from
   * `column.editable`, and `aria-current="true"` for the cell that's currently being
   * edited.
   */
  getCellProps: (rowId: RowId, columnId: ColumnId) => Record<string, unknown>;
  /**
   * Per-row props: `role="row"`, `aria-rowindex` (1-based, header counts as row 1),
   * `aria-selected` when a selection mode is active, and a `data-state` attribute the
   * recipe can hook into for the selected-row tint.
   */
  getRowProps: (rowId: RowId) => Record<string, unknown>;
  /**
   * Effective pagination snapshot — derived from the current state, clamped to valid
   * bounds. Includes `pageIndex` / `pageSize` / `pageCount` / `fromRow` / `toRow`
   * (1-based) so the `<DataGrid.Pagination>` part (PR 4) can render labels directly.
   */
  paginationInfo: {
    rows: ReadonlyArray<Row<T>>;
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    fromRow: number;
    toRow: number;
  };
}

/* -------------------------------------------------------------------------- */
/*  High-level `<DataGrid />` props (re-used by PR 3+ entry component)         */
/* -------------------------------------------------------------------------- */

export type DataGridRowAction = {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  color?: 'neutral' | 'danger';
  onSelect: () => void;
  disabled?: boolean;
};

export interface DataGridProps<T> extends UseDataGridOptions<T> {
  /* Selection controlled-pair convenience props (mirrors Table) */
  selectionMode?: SelectionMode;
  selectedRowIds?: SelectionIds;
  onSelectionChange?: (ids: SelectionIds) => void;

  /* Expansion controlled-pair convenience props */
  expandable?: boolean;
  isRowExpandable?: (row: T) => boolean;
  renderExpandedRow?: (row: T) => ReactNode;
  expandedIds?: RowId[];
  onExpandedChange?: (ids: RowId[]) => void;

  /* Row event handlers */
  rowActions?: (row: T) => DataGridRowAction[];
  onRowClick?: (row: T, event: React.MouseEvent) => void;
  onRowDoubleClick?: (row: T, event: React.MouseEvent) => void;

  /* Visual */
  variant?: ResponsiveValue<DataGridVariant>;
  size?: ResponsiveValue<DataGridDensity>;
  color?: ResponsiveValue<DataGridColor>;
  stickyHeader?: boolean;
  bordered?: boolean;
  roundedCorners?: DataGridRoundedCorners;
  elevation?: DataGridElevation;

  /* States */
  loading?: boolean;
  emptyState?: ReactNode;
  errorState?: ReactNode;

  /* Virtualization */
  virtualization?: false | 'rows' | { rows?: boolean };
  estimateRowHeight?: number;
  /**
   * Inline style forwarded to the internal scroll container (`data-datagrid-scroller`).
   * Use this to cap the grid's height (`{ maxHeight: 480 }`) — the scroller becomes
   * the viewport that virtualization windows against.
   */
  scrollerStyle?: CSSProperties;

  /* Toolbar toggles */
  globalSearch?: boolean;
  columnVisibilityToggle?: boolean;
  densityToggle?: boolean;
  exportable?: boolean | { csv?: boolean; json?: boolean };
  aggregations?: boolean;

  /* Misc passthrough */
  className?: string;
  sx?: Sx;
  style?: CSSProperties;
  /**
   * Optional consumer-supplied action buttons rendered inside the auto-mounted
   * `<DataGrid.SelectionBar>` (alongside the default count + Clear). Only visible when
   * `selectionMode !== 'none'` AND ≥ 1 row is selected. Composed (headless) consumers
   * can ignore this and render `<DataGrid.SelectionBar>` themselves.
   */
  children?: ReactNode;
}

/* -------------------------------------------------------------------------- */
/*  Translations                                                               */
/* -------------------------------------------------------------------------- */

export interface DataGridOperatorTranslations {
  equals: string;
  notEquals: string;
  contains: string;
  notContains: string;
  startsWith: string;
  endsWith: string;
  gt: string;
  gte: string;
  lt: string;
  lte: string;
  between: string;
  before: string;
  after: string;
  isEmpty: string;
  isNotEmpty: string;
  in: string;
  notIn: string;
  isTrue: string;
  isFalse: string;
}

export interface DataGridTranslations {
  /* Headers */
  selectAllRows: string;
  selectRow: string;
  expandRow: string;
  collapseRow: string;
  sortAscending: string;
  sortDescending: string;
  sortRemove: string;
  sortIndex: (index: number) => string;

  /* Filters */
  filterColumn: (column: string) => string;
  filterApply: string;
  filterClear: string;
  filterClearAll: string;
  filterActiveCount: (n: number) => string;
  filterPlaceholder: string;
  operators: DataGridOperatorTranslations;

  /* Global search */
  globalSearchPlaceholder: string;
  globalSearchAriaLabel: string;

  /* Pagination */
  paginationRowsPerPage: string;
  paginationOfTotal: (start: number, end: number, total: number) => string;
  paginationFirstPage: string;
  paginationPreviousPage: string;
  paginationNextPage: string;
  paginationLastPage: string;
  paginationPageOfPages: (current: number, total: number) => string;

  /* Column management */
  columnsManage: string;
  columnsShow: string;
  columnsHide: string;
  columnsReset: string;
  columnsPinStart: string;
  columnsPinEnd: string;
  columnsUnpin: string;
  columnsMoveLeft: string;
  columnsMoveRight: string;
  columnsAutoSize: string;

  /* Density */
  densityLabel: string;
  densityCompact: string;
  densityStandard: string;
  densityComfortable: string;

  /* States */
  loading: string;
  empty: string;
  emptyDescription: string;
  error: string;
  errorRetry: string;

  /* Selection */
  selectionSummary: (selected: number, total: number) => string;
  selectionClear: string;

  /* Export */
  exportLabel: string;
  exportCsv: string;
  exportJson: string;

  /* Row actions */
  rowActions: string;
}

/**
 * @deprecated since PR 4 — imported from `./i18n/locales/en` for back-compat. New
 * code should import `enDataGridTranslations` from `apx-ds` (or directly from
 * `@apx-ui/components/DataGrid/i18n/locales/en`) which is the canonical name and
 * matches the future `heDataGridTranslations` / `arDataGridTranslations` bundles
 * shipped in PR 7. The old `DEFAULT_DATAGRID_TRANSLATIONS` alias is preserved so
 * existing imports keep working.
 */
export { enDataGridTranslations as DEFAULT_DATAGRID_TRANSLATIONS } from './i18n/locales/en';

/* -------------------------------------------------------------------------- */
/*  Operator catalogue per column type — used by the filter UI                 */
/* -------------------------------------------------------------------------- */

/**
 * Operator availability per column `type`, in display order. The first entry is the
 * default operator selected when a filter is first opened.
 */
export const FILTER_OPERATORS: Record<
  Exclude<ColumnType, 'actions' | 'expand' | 'custom' | 'rowSelect'>,
  FilterOperator[]
> = {
  text: ['contains', 'equals', 'notEquals', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'],
  number: ['equals', 'notEquals', 'gt', 'gte', 'lt', 'lte', 'between', 'isEmpty', 'isNotEmpty'],
  date: ['equals', 'before', 'after', 'between', 'isEmpty', 'isNotEmpty'],
  select: ['in', 'notIn', 'equals', 'isEmpty'],
  boolean: ['isTrue', 'isFalse', 'isEmpty'],
};

/** Operators that ignore the filter value (predicate is the operator alone). */
export const VALUELESS_OPERATORS: ReadonlySet<FilterOperator> = new Set([
  'isEmpty',
  'isNotEmpty',
  'isTrue',
  'isFalse',
]);
