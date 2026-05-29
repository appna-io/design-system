import type { ColumnId } from '../../DataGrid.types';

export type ColumnOrderAction =
  | { type: 'set'; order: ColumnId[] }
  | { type: 'move'; columnId: ColumnId; direction: 'left' | 'right' }
  | { type: 'moveTo'; columnId: ColumnId; toIndex: number }
  | { type: 'reset' };

export const initialColumnOrderState: ColumnId[] = [];

/**
 * Column-order reducer.
 *
 * `state` is **an override list** — when empty, the grid uses the natural order from
 * `columns`. When non-empty, the array fully defines order (any ids not in the array
 * are appended in their original order; that merge happens in `deriveColumnOrder`).
 *
 * `move` left/right is a no-op at the array boundaries; this lets toolbar buttons stay
 * enabled without spurious state churn.
 */
export function columnOrderReducer(state: ColumnId[], action: ColumnOrderAction): ColumnId[] {
  switch (action.type) {
    case 'set':
      return [...action.order];
    case 'reset':
      return [];
    case 'move': {
      const idx = state.indexOf(action.columnId);
      if (idx === -1) return state;
      const target = action.direction === 'left' ? idx - 1 : idx + 1;
      if (target < 0 || target >= state.length) return state;
      return swap(state, idx, target);
    }
    case 'moveTo': {
      const idx = state.indexOf(action.columnId);
      if (idx === -1) return state;
      const target = Math.max(0, Math.min(state.length - 1, action.toIndex));
      if (target === idx) return state;
      const next = [...state];
      const [removed] = next.splice(idx, 1);
      if (removed === undefined) return state;
      next.splice(target, 0, removed);
      return next;
    }
  }
}

function swap<T>(arr: T[], a: number, b: number): T[] {
  const next = [...arr];
  const tmp = next[a];
  const other = next[b];
  if (tmp === undefined || other === undefined) return arr;
  next[a] = other;
  next[b] = tmp;
  return next;
}
