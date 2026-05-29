import type { Direction } from '@apx-ui/engine';

/**
 * The cell coordinate the keyboard controller tracks. `row === -1` is the header row;
 * `row >= 0` indexes into the body's currently visible (paginated) row set; `col` always
 * indexes into the visible-columns array.
 *
 * Pure data — the controller hands these off to the React layer to translate into a
 * focus(es) on the matching `<th>` / `<td>` element.
 */
export interface CellCoord {
  row: number;
  col: number;
}

export interface KeyboardNavOptions {
  /** Number of body rows currently rendered (post-pagination). */
  rowCount: number;
  /** Number of visible columns. */
  columnCount: number;
  /** Current page size (for PageDown / PageUp jump distance). */
  pageSize: number;
  /** Logical direction — `'rtl'` swaps the meaning of ArrowLeft / ArrowRight. */
  direction: Direction;
}

/**
 * Compute the next focused cell given a key event.
 *
 * Returns the same coord (referentially!) when the key has no effect at the current
 * position — the controller can compare for `===` to decide whether to call
 * `event.preventDefault()` and move focus. Returns `null` when the key isn't a
 * navigation key (the controller leaves it for the browser / consumer to handle).
 *
 * Navigation map:
 *  - **ArrowDown / ArrowUp**: move cell focus down / up by 1, clamped at edges.
 *  - **ArrowLeft / ArrowRight**: move along the column axis. RTL swaps direction.
 *  - **Home**: first cell of current row.
 *  - **End**: last cell of current row.
 *  - **Ctrl/Cmd + Home**: first cell of header row.
 *  - **Ctrl/Cmd + End**: last cell of last row.
 *  - **PageDown / PageUp**: jump by `pageSize` rows (capped at the body).
 *
 * Header row (`row === -1`) is reachable from `ArrowUp` at `row === 0`, and from
 * `Ctrl/Cmd + Home`. Tab / Shift+Tab are *not* handled here — they take the user out
 * of the grid entirely per the ARIA Grid pattern.
 */
export function nextFocusCoord(
  current: CellCoord,
  event: { key: string; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean },
  options: KeyboardNavOptions,
): CellCoord | null {
  const { rowCount, columnCount, pageSize, direction } = options;
  const isCmd = event.ctrlKey || event.metaKey;
  const maxRow = rowCount - 1;
  const maxCol = columnCount - 1;

  switch (event.key) {
    case 'ArrowDown': {
      if (current.row === maxRow) return current;
      const nextRow = current.row + 1;
      return { row: nextRow, col: Math.min(current.col, maxCol) };
    }
    case 'ArrowUp': {
      if (current.row === -1) return current;
      const nextRow = current.row - 1;
      return { row: nextRow, col: Math.min(current.col, maxCol) };
    }
    case 'ArrowRight': {
      const delta = direction === 'rtl' ? -1 : 1;
      const next = current.col + delta;
      if (next < 0 || next > maxCol) return current;
      return { row: current.row, col: next };
    }
    case 'ArrowLeft': {
      const delta = direction === 'rtl' ? 1 : -1;
      const next = current.col + delta;
      if (next < 0 || next > maxCol) return current;
      return { row: current.row, col: next };
    }
    case 'Home': {
      if (isCmd) return { row: -1, col: 0 };
      return { row: current.row, col: 0 };
    }
    case 'End': {
      if (isCmd) return { row: maxRow, col: maxCol };
      return { row: current.row, col: maxCol };
    }
    case 'PageDown': {
      if (current.row === maxRow) return current;
      const nextRow = Math.min(current.row + Math.max(1, pageSize), maxRow);
      return { row: nextRow, col: current.col };
    }
    case 'PageUp': {
      if (current.row === -1) return current;
      const nextRow = Math.max(current.row - Math.max(1, pageSize), -1);
      return { row: nextRow, col: current.col };
    }
    default:
      return null;
  }
}

/**
 * Coord equality — used by the controller to decide whether to fire `setFocused` (and
 * to skip `preventDefault` for boundary keys that are a no-op).
 */
export function coordEquals(a: CellCoord, b: CellCoord): boolean {
  return a.row === b.row && a.col === b.col;
}

/**
 * Clamp a coord into the valid range — used after sort/filter/page changes shrink the
 * body and the previously-focused cell would otherwise point out of bounds.
 */
export function clampCoord(coord: CellCoord, options: KeyboardNavOptions): CellCoord {
  const maxRow = options.rowCount - 1;
  const maxCol = options.columnCount - 1;
  const row = Math.max(-1, Math.min(coord.row, maxRow));
  const col = Math.max(0, Math.min(coord.col, Math.max(0, maxCol)));
  if (row === coord.row && col === coord.col) return coord;
  return { row, col };
}
