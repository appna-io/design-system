import type { ColumnDef, ColumnPinningState } from '../../DataGrid.types';

export interface PinnedColumnGroups<T> {
  start: ColumnDef<T>[];
  middle: ColumnDef<T>[];
  end: ColumnDef<T>[];
}

/**
 * Split an already-ordered + already-visible column list into the three pinning groups.
 *
 * - `start` follows the pinning order from `pinning.start` (not the natural order).
 * - `end` follows the pinning order from `pinning.end`.
 * - `middle` keeps the natural order, minus columns claimed by either pinned side.
 *
 * Columns whose `column.pinned` definition declares an initial side but that aren't yet
 * in `pinning.start`/`end` are also routed correctly — the reducer seeds the pinning
 * state with `column.pinned` at mount.
 */
export function derivePinnedColumns<T>(
  columns: ColumnDef<T>[],
  pinning: ColumnPinningState,
): PinnedColumnGroups<T> {
  const byId = new Map(columns.map((c) => [c.id, c]));
  const startIds = new Set(pinning.start);
  const endIds = new Set(pinning.end);

  const start: ColumnDef<T>[] = [];
  for (const id of pinning.start) {
    const column = byId.get(id);
    if (column) start.push(column);
  }
  const end: ColumnDef<T>[] = [];
  for (const id of pinning.end) {
    const column = byId.get(id);
    if (column) end.push(column);
  }
  const middle = columns.filter((c) => !startIds.has(c.id) && !endIds.has(c.id));
  return { start, middle, end };
}
