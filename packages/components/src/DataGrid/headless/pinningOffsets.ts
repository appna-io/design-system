import type { ColumnDef, ColumnId } from '../DataGrid.types';
import type { PinnedColumnGroups } from './derivations/derivePinnedColumns';

/**
 * Compute the cumulative inline-start / inline-end offset for every pinned column.
 *
 * Sticky pinning needs each pinned column to know how many pixels of pinned siblings
 * sit between it and the table edge — that's the value passed to
 * `inset-inline-start` (or `-end`). We can't infer the offset from the DOM without a
 * pre-paint measure pass, so the consumer supplies column widths (either explicit
 * `column.width` or a `state.columnSizes` override) and we return a deterministic
 * map: `{ [columnId]: offsetPx }`.
 *
 * Returns `null` for any pinned column without a known width — the caller should fall
 * back to `inset-inline-start: 0` (i.e. stick to the edge with no offset). This is
 * graceful: missing widths just mean overlapping stickies, never a layout crash.
 *
 * Naming: `start` returns offsets accumulating from the start edge; `end` returns
 * offsets accumulating from the end edge. Both are positive pixel values.
 */
export function computePinningOffsets<T>(
  groups: PinnedColumnGroups<T>,
  columnSizes: Record<ColumnId, number>,
  fallbackWidth: number,
): {
  start: Record<ColumnId, number>;
  end: Record<ColumnId, number>;
} {
  const start: Record<ColumnId, number> = {};
  const end: Record<ColumnId, number> = {};

  let cursor = 0;
  for (const col of groups.start) {
    start[col.id] = cursor;
    cursor += resolveWidth(col, columnSizes, fallbackWidth);
  }

  cursor = 0;
  // Walk the end group in reverse so the right-most column sits at offset 0 and
  // each predecessor stacks rightward — matches how the sticky edge accumulates.
  for (let i = groups.end.length - 1; i >= 0; i -= 1) {
    const col = groups.end[i];
    if (!col) continue;
    end[col.id] = cursor;
    cursor += resolveWidth(col, columnSizes, fallbackWidth);
  }

  return { start, end };
}

function resolveWidth<T>(
  column: ColumnDef<T>,
  columnSizes: Record<ColumnId, number>,
  fallbackWidth: number,
): number {
  const override = columnSizes[column.id];
  if (override !== undefined) return override;
  if (column.width !== undefined) return column.width;
  return fallbackWidth;
}
