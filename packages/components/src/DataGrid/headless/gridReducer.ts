import type { DataGridState } from '../DataGrid.types';
import {
  columnOrderReducer,
  type ColumnOrderAction,
} from './reducers/columnOrder';
import {
  columnPinningReducer,
  type ColumnPinningAction,
} from './reducers/columnPinning';
import {
  columnSizeReducer,
  type ColumnSizeAction,
} from './reducers/columnSize';
import {
  columnVisibilityReducer,
  type ColumnVisibilityAction,
} from './reducers/columnVisibility';
import { densityReducer, type DensityAction } from './reducers/density';
import { editingReducer, type EditingAction } from './reducers/editing';
import { expansionReducer, type ExpansionAction } from './reducers/expansion';
import { filterReducer, type FilterAction } from './reducers/filter';
import {
  globalSearchReducer,
  type GlobalSearchAction,
} from './reducers/globalSearch';
import { paginationReducer, type PaginationAction } from './reducers/pagination';
import { selectionReducer, type SelectionAction } from './reducers/selection';
import { sortReducer, type SortAction } from './reducers/sort';

/**
 * Top-level discriminated action union dispatched by `useDataGrid`. Each slice owns
 * its own action sub-union; the grid reducer routes by `type` and applies the matching
 * slice reducer without touching the other slices.
 */
export type GridAction =
  | { type: 'sort'; payload: SortAction }
  | { type: 'filter'; payload: FilterAction }
  | { type: 'globalSearch'; payload: GlobalSearchAction }
  | { type: 'pagination'; payload: PaginationAction }
  | { type: 'selection'; payload: SelectionAction }
  | { type: 'columnVisibility'; payload: ColumnVisibilityAction }
  | { type: 'columnOrder'; payload: ColumnOrderAction }
  | { type: 'columnSize'; payload: ColumnSizeAction }
  | { type: 'columnPinning'; payload: ColumnPinningAction }
  | { type: 'density'; payload: DensityAction }
  | { type: 'expansion'; payload: ExpansionAction }
  | { type: 'editing'; payload: EditingAction }
  | { type: 'hydrate'; payload: Partial<DataGridState> }
  | { type: 'reset'; payload: DataGridState };

/**
 * Compose the per-slice reducers into one reducer the hook can drive with `useReducer`.
 *
 * The returned object is fresh on every dispatched action (even no-ops at the slice
 * level would still return a new top-level object) so React re-renders downstream
 * consumers; per-slice referential equality is preserved by the slice reducers, so
 * memoized derivations stay cheap.
 */
export function gridReducer(state: DataGridState, action: GridAction): DataGridState {
  switch (action.type) {
    case 'sort':
      return { ...state, sort: sortReducer(state.sort, action.payload) };
    case 'filter':
      return { ...state, filters: filterReducer(state.filters, action.payload) };
    case 'globalSearch':
      return {
        ...state,
        globalSearch: globalSearchReducer(state.globalSearch, action.payload),
      };
    case 'pagination':
      return {
        ...state,
        pagination: paginationReducer(state.pagination, action.payload),
      };
    case 'selection':
      return {
        ...state,
        selection: selectionReducer(state.selection, action.payload),
      };
    case 'columnVisibility':
      return {
        ...state,
        columnVisibility: columnVisibilityReducer(state.columnVisibility, action.payload),
      };
    case 'columnOrder':
      return {
        ...state,
        columnOrder: columnOrderReducer(state.columnOrder, action.payload),
      };
    case 'columnSize':
      return {
        ...state,
        columnSizes: columnSizeReducer(state.columnSizes, action.payload),
      };
    case 'columnPinning':
      return {
        ...state,
        columnPinning: columnPinningReducer(state.columnPinning, action.payload),
      };
    case 'density':
      return { ...state, density: densityReducer(state.density, action.payload) };
    case 'expansion':
      return { ...state, expanded: expansionReducer(state.expanded, action.payload) };
    case 'editing':
      return { ...state, editingCell: editingReducer(state.editingCell, action.payload) };
    case 'hydrate':
      return { ...state, ...action.payload };
    case 'reset':
      return action.payload;
  }
}
