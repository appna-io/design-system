import type { TableColumn, TableSortDirection, TableSortFn } from './Table.types';

export interface SortRowsArgs<T> {
  rows: T[];
  column: TableColumn<T> | undefined;
  direction: TableSortDirection;
}

/**
 * Pure, deterministic single-column sort. Returns a **new array** (callers can safely mutate
 * the source). When `column` is `undefined` or has no `accessor`, returns the input untouched
 * — the sort is a no-op rather than a runtime throw, so the declarative `<Table>` can render
 * an unsorted column without per-call guards.
 *
 * Stability: the result is stable up to the comparator's reflexivity — JS's `Array.prototype.sort`
 * has been stable since ES2019, and we don't shuffle equal entries.
 */
export function sortRows<T>({ rows, column, direction }: SortRowsArgs<T>): T[] {
  if (!column || typeof column.accessor !== 'function') return rows;

  const dir = direction === 'asc' ? 1 : -1;
  const cmp = makeComparator<T>(column.sortFn);
  const accessor = column.accessor;

  return [...rows].sort((a, b) => {
    const va = accessor(a);
    const vb = accessor(b);
    return cmp(va, vb, a, b) * dir;
  });
}

/**
 * Build a comparator from a `sortFn` strategy. Custom function comparators run untouched
 * (consumers own the comparison rules); strategy strings expand into common cases:
 *
 *   - `'number'` — numeric coercion; `NaN`s sink to the bottom.
 *   - `'date'`   — `Date` / ISO-string → milliseconds; invalid values sink to the bottom.
 *   - `'string'` — locale-aware via `localeCompare` (good default for human-readable data).
 *
 * The comparator receives both the accessor values **and** the original rows so custom fns
 * can dip back into the row when the accessor strips context.
 */
function makeComparator<T>(
  sortFn: TableSortFn<T> | undefined,
): (a: unknown, b: unknown, rowA: T, rowB: T) => number {
  if (typeof sortFn === 'function') {
    return (_a, _b, rowA, rowB) => sortFn(rowA, rowB);
  }

  if (sortFn === 'number') {
    return (a, b) => {
      const na = toNumber(a);
      const nb = toNumber(b);
      if (Number.isNaN(na) && Number.isNaN(nb)) return 0;
      if (Number.isNaN(na)) return 1;
      if (Number.isNaN(nb)) return -1;
      return na - nb;
    };
  }

  if (sortFn === 'date') {
    return (a, b) => {
      const ta = toMillis(a);
      const tb = toMillis(b);
      if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
      if (Number.isNaN(ta)) return 1;
      if (Number.isNaN(tb)) return -1;
      return ta - tb;
    };
  }

  // Default — string with locale collation. Null / undefined sink to the bottom.
  return (a, b) => {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    return String(a).localeCompare(String(b));
  };
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return Number.NaN;
}

function toMillis(value: unknown): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return new Date(value).getTime();
  return Number.NaN;
}

/**
 * Cycle the sort state on a header click: `undefined` → `asc` → `desc` → `undefined`. The
 * unsorted "undefined" leg keeps the declarative API symmetric — three clicks lands the
 * consumer back at the original data order without forcing them to track a separate flag.
 */
export function cycleSort(
  current: { id: string; direction: TableSortDirection } | undefined,
  columnId: string,
): { id: string; direction: TableSortDirection } | undefined {
  if (!current || current.id !== columnId) {
    return { id: columnId, direction: 'asc' };
  }
  if (current.direction === 'asc') return { id: columnId, direction: 'desc' };
  return undefined;
}
