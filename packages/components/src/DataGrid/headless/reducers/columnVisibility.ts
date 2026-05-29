import type { ColumnId } from '../../DataGrid.types';

export type ColumnVisibilityAction =
  | { type: 'set'; visibility: Record<ColumnId, boolean> }
  | { type: 'toggle'; columnId: ColumnId }
  | { type: 'show'; columnId: ColumnId }
  | { type: 'hide'; columnId: ColumnId }
  | { type: 'reset' };

export const initialColumnVisibilityState: Record<ColumnId, boolean> = {};

/**
 * `state[columnId] === false` hides; missing or `true` shows. We deliberately do **not**
 * pre-fill the map with every known column id so that adding a new column to the schema
 * doesn't require a default-visibility entry — absence = visible.
 */
export function columnVisibilityReducer(
  state: Record<ColumnId, boolean>,
  action: ColumnVisibilityAction,
): Record<ColumnId, boolean> {
  switch (action.type) {
    case 'set':
      return { ...action.visibility };
    case 'reset':
      return {};
    case 'show': {
      if (state[action.columnId] === true || state[action.columnId] === undefined) return state;
      const next = { ...state };
      delete next[action.columnId];
      return next;
    }
    case 'hide': {
      if (state[action.columnId] === false) return state;
      return { ...state, [action.columnId]: false };
    }
    case 'toggle': {
      const current = state[action.columnId];
      if (current === false) {
        const next = { ...state };
        delete next[action.columnId];
        return next;
      }
      return { ...state, [action.columnId]: false };
    }
  }
}
