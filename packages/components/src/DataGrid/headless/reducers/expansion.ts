import type { RowId } from '../../DataGrid.types';

export type ExpansionAction =
  | { type: 'set'; ids: ReadonlyArray<RowId> | Set<RowId> }
  | { type: 'toggle'; id: RowId }
  | { type: 'expand'; id: RowId }
  | { type: 'collapse'; id: RowId }
  | { type: 'collapseAll' };

export const initialExpansionState: Set<RowId> = new Set();

/**
 * Expansion reducer.
 *
 * Returns a fresh `Set` on every change so memoized row renderers can detect it cheaply
 * via reference equality. Idempotent on `expand`/`collapse` when the row is already in
 * the desired state.
 */
export function expansionReducer(state: Set<RowId>, action: ExpansionAction): Set<RowId> {
  switch (action.type) {
    case 'set':
      return action.ids instanceof Set ? new Set(action.ids) : new Set(action.ids);
    case 'collapseAll':
      return state.size === 0 ? state : new Set();
    case 'toggle': {
      const next = new Set(state);
      if (next.has(action.id)) next.delete(action.id);
      else next.add(action.id);
      return next;
    }
    case 'expand': {
      if (state.has(action.id)) return state;
      const next = new Set(state);
      next.add(action.id);
      return next;
    }
    case 'collapse': {
      if (!state.has(action.id)) return state;
      const next = new Set(state);
      next.delete(action.id);
      return next;
    }
  }
}