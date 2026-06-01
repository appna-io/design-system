import type { ColumnId, ColumnPinningState } from '../../DataGrid.types';

export type ColumnPinningAction =
  | { type: 'set'; pinning: ColumnPinningState }
  | { type: 'pin'; columnId: ColumnId; side: 'start' | 'end' | null }
  | { type: 'reset' };

export const initialColumnPinningState: ColumnPinningState = { start: [], end: [] };

/**
 * Pinning reducer.
 *
 * `pin(columnId, side)` is canonical — it removes the column from any side it currently
 * sits on and re-adds it to the requested side (or leaves it unpinned if `side === null`).
 * This makes the toolbar's "Move to start / Move to end / Unpin" buttons safe to fire
 * without first reading current state.
 *
 * Pinning order within a side preserves insertion order; the grid renders pinned-start
 * columns left-to-right and pinned-end columns right-to-left of the body in LTR.
 */
export function columnPinningReducer(
  state: ColumnPinningState,
  action: ColumnPinningAction,
): ColumnPinningState {
  switch (action.type) {
    case 'set':
      return { start: [...action.pinning.start], end: [...action.pinning.end] };
    case 'reset':
      return { start: [], end: [] };
    case 'pin': {
      const start = state.start.filter((id) => id !== action.columnId);
      const end = state.end.filter((id) => id !== action.columnId);
      if (action.side === 'start') start.push(action.columnId);
      else if (action.side === 'end') end.unshift(action.columnId);
      // null → just remove
      if (
        start.length === state.start.length &&
        end.length === state.end.length &&
        start.every((id, i) => id === state.start[i]) &&
        end.every((id, i) => id === state.end[i])
      ) {
        return state;
      }
      return { start, end };
    }
  }
}