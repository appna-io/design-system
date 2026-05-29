import type { CursorPagination, OffsetPagination, PaginationState } from '../../DataGrid.types';

export type PaginationAction =
  | { type: 'set'; pagination: PaginationState }
  | { type: 'setPageIndex'; pageIndex: number }
  | { type: 'setPageSize'; pageSize: number }
  | { type: 'setCursor'; cursor: string | null };

export const initialPaginationState: OffsetPagination = { pageIndex: 0, pageSize: 25 };

export function isCursorPagination(p: PaginationState): p is CursorPagination {
  return 'cursor' in p;
}

/**
 * Pagination reducer.
 *
 * - `setPageIndex` clamps negatives to 0; upper-bound clamping is the derivation's job
 *   (the reducer doesn't know the total row count).
 * - `setPageSize` resets `pageIndex` to 0 (consumer expectation: "page size change shows
 *   you the top of the new pagination").
 * - `setCursor` flips the slice into cursor mode regardless of the prior shape; passing
 *   `setPageIndex` to a cursor-mode state is a no-op (cursor mode has no index).
 */
export function paginationReducer(
  state: PaginationState,
  action: PaginationAction,
): PaginationState {
  switch (action.type) {
    case 'set':
      return action.pagination;
    case 'setPageIndex': {
      if (isCursorPagination(state)) return state;
      return { pageIndex: Math.max(0, action.pageIndex), pageSize: state.pageSize };
    }
    case 'setPageSize': {
      if (isCursorPagination(state)) return { cursor: state.cursor, pageSize: action.pageSize };
      return { pageIndex: 0, pageSize: action.pageSize };
    }
    case 'setCursor':
      return { cursor: action.cursor, pageSize: state.pageSize };
  }
}
