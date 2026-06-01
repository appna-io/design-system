import type { ColumnId, SortDescriptor } from '../../DataGrid.types';

export type SortAction =
  | { type: 'set'; sort: SortDescriptor[] }
  | { type: 'cycle'; id: ColumnId; multi: boolean; removable: boolean }
  | { type: 'clear' };

export const initialSortState: SortDescriptor[] = [];

/**
 * Sort reducer.
 *
 * `cycle` advances a single column through `none → asc → desc → none` (or `asc ↔ desc`
 * when `removable: false`). When `multi: true`, the column joins the existing sort stack
 * in its current position; otherwise the stack collapses to just this column.
 */
export function sortReducer(state: SortDescriptor[], action: SortAction): SortDescriptor[] {
  switch (action.type) {
    case 'set':
      return action.sort;
    case 'clear':
      return [];
    case 'cycle': {
      const existing = state.find((s) => s.id === action.id);
      const nextDirection = nextSortDirection(existing?.direction, action.removable);

      if (action.multi) {
        if (nextDirection === null) return state.filter((s) => s.id !== action.id);
        if (existing) {
          return state.map((s) =>
            s.id === action.id ? { id: action.id, direction: nextDirection } : s,
          );
        }
        return [...state, { id: action.id, direction: nextDirection }];
      }

      if (nextDirection === null) return [];
      return [{ id: action.id, direction: nextDirection }];
    }
  }
}

function nextSortDirection(
  current: 'asc' | 'desc' | undefined,
  removable: boolean,
): 'asc' | 'desc' | null {
  if (current === undefined) return 'asc';
  if (current === 'asc') return 'desc';
  // current === 'desc'
  return removable ? null : 'asc';
}