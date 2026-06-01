import type { RowId, SelectionIds, SelectionMode, SelectionState } from '../../DataGrid.types';

export type SelectionAction =
  | { type: 'setMode'; mode: SelectionMode }
  | { type: 'set'; ids: SelectionIds }
  | { type: 'toggleRow'; id: RowId; orderedIds: ReadonlyArray<RowId>; range?: boolean }
  | { type: 'toggleAll'; orderedIds: ReadonlyArray<RowId> }
  | { type: 'clear' };

export const initialSelectionState: SelectionState = {
  mode: 'none',
  ids: null,
  anchorId: null,
};

/**
 * Selection reducer.
 *
 * The shape of `ids` is discriminated by `mode`:
 *  - `mode === 'none'`     → `ids === null`
 *  - `mode === 'single'`   → `ids: RowId | null`
 *  - `mode === 'multiple'` → `ids: Set<RowId>`
 *
 * Shift-click range selection lives here: `toggleRow` with `range: true` walks the
 * `orderedIds` array between the anchor and the clicked row and adds every id in that
 * span. The anchor is set on every non-range toggle so the next shift-click extends from
 * the latest "regular" click. Mirrors macOS Finder + GitHub PR file-tree behaviour.
 */
export function selectionReducer(
  state: SelectionState,
  action: SelectionAction,
): SelectionState {
  switch (action.type) {
    case 'setMode': {
      if (state.mode === action.mode) return state;
      return { mode: action.mode, ids: emptyFor(action.mode), anchorId: null };
    }

    case 'set':
      return { ...state, ids: action.ids };

    case 'clear':
      return { ...state, ids: emptyFor(state.mode), anchorId: null };

    case 'toggleAll': {
      if (state.mode !== 'multiple') return state;
      const current = idsAsSet(state.ids);
      const allSelected =
        action.orderedIds.length > 0 && action.orderedIds.every((id) => current.has(id));
      if (allSelected) return { ...state, ids: new Set(), anchorId: null };
      return { ...state, ids: new Set(action.orderedIds), anchorId: null };
    }

    case 'toggleRow': {
      if (state.mode === 'none') return state;

      if (state.mode === 'single') {
        const current = state.ids as RowId | null;
        const next = current === action.id ? null : action.id;
        return { ...state, ids: next, anchorId: action.id };
      }

      // multiple
      const current = idsAsSet(state.ids);

      if (action.range && state.anchorId !== null) {
        const next = new Set(current);
        const range = idsBetween(action.orderedIds, state.anchorId, action.id);
        for (const id of range) next.add(id);
        return { ...state, ids: next };
      }

      const next = new Set(current);
      if (next.has(action.id)) next.delete(action.id);
      else next.add(action.id);
      return { ...state, ids: next, anchorId: action.id };
    }
  }
}

function emptyFor(mode: SelectionMode): SelectionIds {
  if (mode === 'none') return null;
  if (mode === 'single') return null;
  return new Set();
}

function idsAsSet(ids: SelectionIds): Set<RowId> {
  if (ids instanceof Set) return ids;
  return new Set();
}

/**
 * Inclusive range slice between `from` and `to` ids in `ordered`. Returns `[]` if either
 * id is missing — callers should fall back to the default single-toggle path in that case.
 * Direction-agnostic: clicking up or down the list works identically.
 */
export function idsBetween(
  ordered: ReadonlyArray<RowId>,
  from: RowId,
  to: RowId,
): RowId[] {
  const fromIdx = ordered.indexOf(from);
  const toIdx = ordered.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) return [];
  const [start, end] = fromIdx <= toIdx ? [fromIdx, toIdx] : [toIdx, fromIdx];
  return ordered.slice(start, end + 1) as RowId[];
}