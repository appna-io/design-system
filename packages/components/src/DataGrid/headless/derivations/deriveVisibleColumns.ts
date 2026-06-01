import type { ColumnDef } from '../../DataGrid.types';

/**
 * Filter out columns whose visibility state is explicitly `false`. Missing entries =
 * visible (so adding a new column to the schema doesn't require pre-populating the
 * visibility map). Structural columns (`type: 'select' | 'actions' | 'expand'`) ignore
 * the visibility flag entirely — they're considered chrome, not data.
 */
export function deriveVisibleColumns<T>(
  columns: ColumnDef<T>[],
  visibility: Record<string, boolean>,
): ColumnDef<T>[] {
  return columns.filter((c) => {
    if (c.type === 'rowSelect' || c.type === 'actions' || c.type === 'expand') return true;
    return visibility[c.id] !== false;
  });
}