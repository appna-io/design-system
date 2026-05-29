import type { ColumnType, FilterOperator, FilterValue } from '../DataGrid.types';

/**
 * Built-in filter operator predicates.
 *
 * Each predicate is `(cellValue, filterValue) => boolean`. The shape of `filterValue`
 * depends on the operator — see `FilterValue` doc. `applyOperator` dispatches by
 * operator name; the column's `type` is used only to coerce the value into the right
 * comparable form before the predicate runs (e.g. parse a date string to a `Date`).
 */
export function applyOperator(
  operator: FilterOperator,
  cellValue: unknown,
  filterValue: FilterValue,
  columnType: ColumnType,
): boolean {
  // Value-less operators only look at the cell.
  switch (operator) {
    case 'isEmpty':
      return isEmpty(cellValue);
    case 'isNotEmpty':
      return !isEmpty(cellValue);
    case 'isTrue':
      return cellValue === true;
    case 'isFalse':
      return cellValue === false;
  }

  if (cellValue === null || cellValue === undefined) return false;

  if (columnType === 'date') {
    const cell = coerceDate(cellValue);
    if (cell === null) return false;
    return dateOperator(operator, cell, filterValue);
  }
  if (columnType === 'number') {
    const cell = coerceNumber(cellValue);
    if (cell === null) return false;
    return numberOperator(operator, cell, filterValue);
  }
  if (columnType === 'boolean') {
    return cellValue === Boolean(filterValue);
  }
  if (columnType === 'select') {
    return selectOperator(operator, cellValue, filterValue);
  }
  // text + fallback
  return textOperator(operator, String(cellValue), filterValue);
}

/* -------------------------------------------------------------------------- */
/*  Per-type operator implementations                                          */
/* -------------------------------------------------------------------------- */

function textOperator(operator: FilterOperator, cell: string, filterValue: FilterValue): boolean {
  const needle = filterValue === undefined || filterValue === null ? '' : String(filterValue);
  const cellLower = cell.toLowerCase();
  const needleLower = needle.toLowerCase();
  switch (operator) {
    case 'equals':
      return cellLower === needleLower;
    case 'notEquals':
      return cellLower !== needleLower;
    case 'contains':
      return needleLower === '' ? true : cellLower.includes(needleLower);
    case 'notContains':
      return needleLower === '' ? true : !cellLower.includes(needleLower);
    case 'startsWith':
      return cellLower.startsWith(needleLower);
    case 'endsWith':
      return cellLower.endsWith(needleLower);
    default:
      return false;
  }
}

function numberOperator(
  operator: FilterOperator,
  cell: number,
  filterValue: FilterValue,
): boolean {
  if (operator === 'between') {
    const tuple = filterValue as [unknown, unknown] | undefined;
    if (!Array.isArray(tuple) || tuple.length !== 2) return false;
    const lo = coerceNumber(tuple[0]);
    const hi = coerceNumber(tuple[1]);
    if (lo === null || hi === null) return false;
    const [low, high] = lo <= hi ? [lo, hi] : [hi, lo];
    return cell >= low && cell <= high;
  }
  const num = coerceNumber(filterValue);
  if (num === null) return false;
  switch (operator) {
    case 'equals':
      return cell === num;
    case 'notEquals':
      return cell !== num;
    case 'gt':
      return cell > num;
    case 'gte':
      return cell >= num;
    case 'lt':
      return cell < num;
    case 'lte':
      return cell <= num;
    default:
      return false;
  }
}

function dateOperator(
  operator: FilterOperator,
  cell: Date,
  filterValue: FilterValue,
): boolean {
  if (operator === 'between') {
    const tuple = filterValue as [unknown, unknown] | undefined;
    if (!Array.isArray(tuple) || tuple.length !== 2) return false;
    const lo = coerceDate(tuple[0]);
    const hi = coerceDate(tuple[1]);
    if (!lo || !hi) return false;
    const [low, high] = lo.getTime() <= hi.getTime() ? [lo, hi] : [hi, lo];
    const t = cell.getTime();
    return t >= low.getTime() && t <= high.getTime();
  }
  const date = coerceDate(filterValue);
  if (!date) return false;
  switch (operator) {
    case 'equals':
      return sameDay(cell, date);
    case 'before':
      return cell.getTime() < date.getTime();
    case 'after':
      return cell.getTime() > date.getTime();
    default:
      return false;
  }
}

function selectOperator(
  operator: FilterOperator,
  cell: unknown,
  filterValue: FilterValue,
): boolean {
  switch (operator) {
    case 'equals':
      return cell === filterValue;
    case 'in': {
      if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
      return filterValue.includes(cell);
    }
    case 'notIn': {
      if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
      return !filterValue.includes(cell);
    }
    default:
      return false;
  }
}

/* -------------------------------------------------------------------------- */
/*  Coercion helpers — tolerate strings + numbers + Date for date columns,     */
/*  strings + numbers for numeric columns. Filter UIs typically yield strings. */
/* -------------------------------------------------------------------------- */

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.length === 0) return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'number' && Number.isNaN(value)) return true;
  return false;
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  if (value instanceof Date) return value.getTime();
  return null;
}

function coerceDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value : null;
  if (typeof value === 'number' && Number.isFinite(value)) return new Date(value);
  if (typeof value === 'string' && value.trim() !== '') {
    const d = new Date(value);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  return null;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
