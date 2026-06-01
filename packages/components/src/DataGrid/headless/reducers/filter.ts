import type { ColumnFilter, ColumnFiltersState, ColumnId } from '../../DataGrid.types';

export type FilterAction =
  | { type: 'set'; columnId: ColumnId; filter: ColumnFilter | undefined }
  | { type: 'replaceAll'; filters: ColumnFiltersState }
  | { type: 'clear' };

export const initialFilterState: ColumnFiltersState = {};

/**
 * Per-column filter reducer.
 *
 * `set` with `filter: undefined` removes the column's filter; otherwise it overwrites
 * the existing one. Always returns a fresh object so consumers can compare by reference
 * to detect filter changes.
 */
export function filterReducer(
  state: ColumnFiltersState,
  action: FilterAction,
): ColumnFiltersState {
  switch (action.type) {
    case 'replaceAll':
      return { ...action.filters };
    case 'clear':
      return {};
    case 'set': {
      const next: ColumnFiltersState = { ...state };
      if (action.filter === undefined) {
        delete next[action.columnId];
      } else {
        next[action.columnId] = action.filter;
      }
      return next;
    }
  }
}