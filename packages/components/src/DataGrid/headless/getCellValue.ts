import type { ColumnDef } from '../DataGrid.types';

/**
 * Pull the raw cell value out of a row for a given column.
 *
 * `accessor` can be:
 *  - `undefined` — falls back to `row[column.id]` if it exists, else `undefined`,
 *  - `keyof T`   — direct property access,
 *  - `function`  — derived value (called with the row).
 *
 * Pure: no React, no side effects. Used by the filter engine, the sort comparator, the
 * CSV/JSON exporters, and the default cell renderer (PR 3).
 */
export function getCellValue<T>(row: T, column: ColumnDef<T>): unknown {
  const { accessor } = column;
  if (accessor === undefined) {
    if (typeof row === 'object' && row !== null && column.id in (row as Record<string, unknown>)) {
      return (row as Record<string, unknown>)[column.id];
    }
    return undefined;
  }
  if (typeof accessor === 'function') {
    return accessor(row);
  }
  return (row as Record<string, unknown>)[accessor as string];
}