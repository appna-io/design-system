import type { ColumnId } from '../../DataGrid.types';

export type ColumnSizeAction =
  | { type: 'set'; sizes: Record<ColumnId, number> }
  | { type: 'setOne'; columnId: ColumnId; size: number }
  | { type: 'reset'; columnId?: ColumnId }
  | { type: 'resetAll' };

export const initialColumnSizeState: Record<ColumnId, number> = {};

const MIN_SIZE_PX = 24;

/**
 * Column-size override map. Sizes here win over `column.width` from the definition.
 *
 * `setOne` clamps to a small absolute minimum (24px) — column-specific min/max from
 * the column def are applied at render time (we don't have the column def here).
 */
export function columnSizeReducer(
  state: Record<ColumnId, number>,
  action: ColumnSizeAction,
): Record<ColumnId, number> {
  switch (action.type) {
    case 'set':
      return { ...action.sizes };
    case 'resetAll':
      return {};
    case 'reset': {
      if (!action.columnId) return {};
      if (state[action.columnId] === undefined) return state;
      const next = { ...state };
      delete next[action.columnId];
      return next;
    }
    case 'setOne': {
      const next = Math.max(MIN_SIZE_PX, Math.floor(action.size));
      if (state[action.columnId] === next) return state;
      return { ...state, [action.columnId]: next };
    }
  }
}