import type { ColumnDef, ColumnId } from '../../DataGrid.types';

/**
 * Merge an override order list with the natural column order.
 *
 * Rules:
 *  - empty override → return columns in their natural order,
 *  - columns mentioned in the override appear first in override order,
 *  - any column missing from the override is appended in its natural order
 *    (so adding a new column to the schema never silently disappears even if the
 *    persisted state predates it).
 *
 * Unknown ids in the override are ignored — they could be left over from a column that
 * was removed from the schema.
 */
export function deriveColumnOrder<T>(
  columns: ColumnDef<T>[],
  order: ReadonlyArray<ColumnId>,
): ColumnDef<T>[] {
  if (order.length === 0) return [...columns];

  const byId = new Map(columns.map((c) => [c.id, c]));
  const result: ColumnDef<T>[] = [];
  const placed = new Set<ColumnId>();

  for (const id of order) {
    const column = byId.get(id);
    if (!column || placed.has(id)) continue;
    result.push(column);
    placed.add(id);
  }
  for (const column of columns) {
    if (placed.has(column.id)) continue;
    result.push(column);
    placed.add(column.id);
  }
  return result;
}
