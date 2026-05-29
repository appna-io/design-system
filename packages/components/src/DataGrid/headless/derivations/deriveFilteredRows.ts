import type {
  ColumnDef,
  ColumnFiltersState,
  Row,
} from '../../DataGrid.types';
import { applyOperator } from '../filterEngine';
import { getCellValue } from '../getCellValue';

export interface DeriveFilteredRowsOptions<T> {
  rows: ReadonlyArray<Row<T>>;
  columns: ColumnDef<T>[];
  filters: ColumnFiltersState;
  globalSearch: string;
}

/**
 * Apply per-column filters + global text search to a row set.
 *
 * Filters compose by intersection (AND). Global search matches when *any* `filterable`
 * column's stringified value contains the query (case-insensitive, locale-folded by
 * `String.prototype.toLowerCase` — full locale folding via `Intl.Collator` is too
 * expensive per-row; consumers wanting smart-search can swap in their own predicate).
 *
 * Returns a new array even when nothing matches so callers can compare by reference to
 * detect changes.
 */
export function deriveFilteredRows<T>(options: DeriveFilteredRowsOptions<T>): Row<T>[] {
  const { rows, columns, filters, globalSearch } = options;

  const columnsById = new Map(columns.map((c) => [c.id, c]));
  const activeFilters = Object.entries(filters).filter(
    (entry): entry is [string, NonNullable<(typeof entry)[1]>] => entry[1] !== undefined,
  );
  const search = globalSearch.trim().toLowerCase();
  const searchableColumns = search
    ? columns.filter((c) => c.filterable !== false && !isStructuralColumn(c))
    : [];

  if (activeFilters.length === 0 && search === '') return [...rows];

  const result: Row<T>[] = [];
  for (const row of rows) {
    if (!matchesAllFilters(row, activeFilters, columnsById)) continue;
    if (search !== '' && !matchesGlobalSearch(row, searchableColumns, search)) continue;
    result.push(row);
  }
  return result;
}

function matchesAllFilters<T>(
  row: Row<T>,
  activeFilters: Array<[string, NonNullable<ColumnFiltersState[string]>]>,
  columnsById: Map<string, ColumnDef<T>>,
): boolean {
  for (const [columnId, filter] of activeFilters) {
    const column = columnsById.get(columnId);
    if (!column) continue;
    if (column.type === 'custom') {
      const fn = column.filterFn;
      if (fn && !fn(row.original, filter.value)) return false;
      continue;
    }
    const cellValue = getCellValue(row.original, column);
    // `column.type` defaults to `'text'` per the discriminated-union default branch.
    const typeForOperator = column.type ?? 'text';
    if (!applyOperator(filter.operator, cellValue, filter.value, typeForOperator)) return false;
  }
  return true;
}

function matchesGlobalSearch<T>(
  row: Row<T>,
  searchableColumns: ColumnDef<T>[],
  search: string,
): boolean {
  for (const column of searchableColumns) {
    const value = getCellValue(row.original, column);
    if (value === undefined || value === null) continue;
    const text = stringifyForSearch(value);
    if (text.toLowerCase().includes(search)) return true;
  }
  return false;
}

function isStructuralColumn<T>(column: ColumnDef<T>): boolean {
  return (
    column.type === 'actions' || column.type === 'expand' || column.type === 'rowSelect'
  );
}

function stringifyForSearch(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  return String(value);
}
