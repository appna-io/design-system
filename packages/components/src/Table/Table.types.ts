import type {
  CSSProperties,
  ForwardedRef,
  HTMLAttributes,
  ReactNode,
  Ref,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';
import type { Sx } from '@apx-ui/engine';

/** Visual chrome — sits in any container, wears a card border, or strips chrome entirely. */
export type TableVariant = 'default' | 'card' | 'minimal';

/** Vertical density of cells. Drives padding + font-size for the cell recipe. */
export type TableDensity = 'sm' | 'md' | 'lg';

/** Cell horizontal alignment. Logical (`start`/`end` flip in RTL). */
export type TableCellAlign = 'start' | 'center' | 'end';

/** Sort direction. */
export type TableSortDirection = 'asc' | 'desc';

/** Selection mode for the auto-injected checkbox column. */
export type TableSelectionMode = 'none' | 'single' | 'multiple';

/** Built-in `sortFn` strategies. Custom comparator accepted for the long tail. */
export type TableSortFn<T> =
  | 'string'
  | 'number'
  | 'date'
  | ((a: T, b: T) => number);

export interface TableColumn<T = unknown> {
  /** Stable column identifier. Required — `sort.id` and DOM IDs key off this. */
  id: string;
  /** Header label. Strings get the default styling; arbitrary `ReactNode` flows through. */
  header: ReactNode;
  /** Pull a sortable / cell-rendered value out of the row. Required when `sortable` or no `cell`. */
  accessor?: (row: T) => unknown;
  /** Cell renderer. Defaults to `accessor(row)` if defined, else `''`. */
  cell?: (row: T, index: number) => ReactNode;
  /** Logical horizontal alignment. @default 'start' */
  align?: TableCellAlign;
  /** CSS width — accepts pixel numbers or any valid CSS width string. */
  width?: string | number;
  /** Minimum width — keeps narrow columns legible when the parent is fluid. */
  minWidth?: string | number;
  /** Mark this column as sortable — clicking the header cycles direction. */
  sortable?: boolean;
  /** Comparator strategy when sortable. @default 'string' */
  sortFn?: TableSortFn<T>;
  /** Apply `text-overflow: ellipsis` to the cell content. */
  truncate?: boolean;
  /** Extra classes appended to both header and body cells in this column. */
  className?: string;
  /** Hide the column. Boolean today; responsive support is a documented follow-up. */
  hidden?: boolean;
}

export interface TableSortState {
  id: string;
  direction: TableSortDirection;
}

export interface TableProps<T = unknown> extends Omit<HTMLAttributes<HTMLTableElement>, 'onSelect'> {
  /** Declarative column descriptors. Ignored when compound `Table.Head/Body` children are present. */
  columns?: TableColumn<T>[];
  /** Row data array. Ignored in compound mode. */
  data?: T[];
  /** Stable row identity. Defaults to row index. */
  getRowId?: (row: T, index: number) => string;

  /** Controlled sort state. */
  sort?: TableSortState | undefined;
  /** Uncontrolled initial sort. */
  defaultSort?: TableSortState | undefined;
  /** Fired when a sortable header is clicked. */
  onSortChange?: (sort: TableSortState | undefined) => void;

  /** @default 'none' */
  selectionMode?: TableSelectionMode;
  /** Controlled selection. `string` for `single`, `string[]` for `multiple`. */
  selected?: string | string[] | undefined;
  /** Uncontrolled initial selection. */
  defaultSelected?: string | string[] | undefined;
  /** Fires when the selection set changes. Receives the new selected id(s). */
  onSelectedChange?: (selected: string | string[]) => void;
  /** Per-row gate. Returning `false` disables the row's checkbox. */
  isRowSelectable?: (row: T, index: number) => boolean;

  /** Trailing slot rendered as a sticky right-aligned column (typically a `<Menu>`). */
  rowActions?: (row: T, index: number) => ReactNode;

  /** Click handler for the row body (not the row actions). */
  onRowClick?: (row: T, index: number) => void;

  /** When `true`, renders `loadingRowCount` skeleton rows in the body. */
  loading?: boolean;
  /** @default 5 */
  loadingRowCount?: number;
  /** Slot rendered when `data.length === 0` (and not loading). */
  empty?: ReactNode;
  /** Slot rendered in place of the body when an error needs reporting. */
  error?: ReactNode;

  /** @default 'default' */
  variant?: TableVariant;
  /** @default 'md' */
  density?: TableDensity;
  /** Zebra striping. @default false */
  striped?: boolean;
  /** Cell row borders. @default true */
  bordered?: boolean;
  /** Hover row highlighting. @default true */
  hoverable?: boolean;
  /** When `true`, the header row sticks at the top of any scrolling ancestor. @default false */
  stickyHeader?: boolean;
  /**
   * Accessible name for the table. **Required for unambiguous identification** — supply either
   * `ariaLabel` or a `<Table.Caption>` child.
   */
  ariaLabel?: string;

  sx?: Sx;
  ref?: Ref<HTMLTableElement>;
  children?: ReactNode;
}

/** Props for `<Table.Row>` — also accepts a callback for click handling. */
export interface TableRowProps extends Omit<HTMLAttributes<HTMLTableRowElement>, 'onSelect'> {
  /** Row-level selected indicator. Sets `aria-selected` and toggles the selected styling. */
  selected?: boolean;
  /** Row-level disabled indicator — dims the row and skips hover styling. */
  disabled?: boolean;
  /** Sets `aria-current="row"` on the row when truthy. */
  current?: boolean;
  sx?: Sx;
}

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** Logical text alignment. @default 'start' */
  align?: TableCellAlign;
  /** Truncate overflowing text with an ellipsis. */
  truncate?: boolean;
  sx?: Sx;
}

export interface TableHeaderCellProps
  extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align' | 'scope'> {
  /** Logical text alignment. @default 'start' */
  align?: TableCellAlign;
  /** Mark this header as sortable — auto-wraps the label in a `<button>`. */
  sortable?: boolean;
  /** Active sort direction (`'asc'` / `'desc'`) — drives the arrow glyph + `aria-sort`. */
  sortDirection?: TableSortDirection | undefined;
  /** Fires when the consumer clicks the sort button. */
  onSortClick?: () => void;
  /** Override the implicit `scope="col"`. Use `"row"` for first-column row headers. */
  scope?: 'col' | 'row' | 'colgroup' | 'rowgroup';
  sx?: Sx;
}

export interface TableSubcomponentProps
  extends Omit<HTMLAttributes<HTMLTableSectionElement>, 'children'> {
  children?: ReactNode;
  sx?: Sx;
}

export interface TableCaptionProps extends HTMLAttributes<HTMLTableCaptionElement> {
  /** Visually hide the caption while keeping it announced. @default false */
  visuallyHidden?: boolean;
  sx?: Sx;
}

/** Internal context shared from `<Table>` to its compound subparts. */
export interface TableContextValue {
  density: TableDensity;
  bordered: boolean;
  striped: boolean;
  hoverable: boolean;
  stickyHeader: boolean;
  variant: TableVariant;
}

export type TableComponentRef = ForwardedRef<HTMLTableElement>;
export type TableStyle = CSSProperties;
