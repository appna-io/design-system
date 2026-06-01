import type { PaginationState, Row } from '../../DataGrid.types';
import { isCursorPagination } from '../reducers/pagination';

export interface DerivePaginatedRowsOptions<T> {
  rows: ReadonlyArray<Row<T>>;
  pagination: PaginationState;
}

export interface DerivePaginatedRowsResult<T> {
  rows: Row<T>[];
  /** Effective page index post-clamp. `0` in cursor mode (no concept of page index). */
  pageIndex: number;
  pageSize: number;
  /** Total pages for offset mode, `Infinity` for cursor mode (unknown total). */
  pageCount: number;
  /** First (1-based) row index in the current page, for `paginationOfTotal` labels. */
  fromRow: number;
  /** Last (1-based) row index in the current page. */
  toRow: number;
}

/**
 * Slice a row array down to the current page.
 *
 * Offset mode: clamps `pageIndex` into `[0, max]` so a stale state can't crash the
 * derivation (the reducer never sets a too-large index because it doesn't know the
 * total; we clamp here, the consumer can decide whether to write back the clamped
 * value).
 *
 * Cursor mode: returns rows as-is — the server has already pre-sliced them.
 *
 * Special-case `pageSize === 0` → "show all" (pagination subpart is hidden in PR 3+).
 */
export function derivePaginatedRows<T>(
  options: DerivePaginatedRowsOptions<T>,
): DerivePaginatedRowsResult<T> {
  const { rows, pagination } = options;

  if (isCursorPagination(pagination)) {
    return {
      rows: [...rows],
      pageIndex: 0,
      pageSize: pagination.pageSize,
      pageCount: Number.POSITIVE_INFINITY,
      fromRow: rows.length === 0 ? 0 : 1,
      toRow: rows.length,
    };
  }

  const pageSize = pagination.pageSize;
  if (pageSize <= 0) {
    return {
      rows: [...rows],
      pageIndex: 0,
      pageSize: 0,
      pageCount: 1,
      fromRow: rows.length === 0 ? 0 : 1,
      toRow: rows.length,
    };
  }

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const requested = Math.max(0, pagination.pageIndex);
  const pageIndex = Math.min(requested, pageCount - 1);
  const start = pageIndex * pageSize;
  const end = Math.min(start + pageSize, rows.length);
  const slice = rows.slice(start, end);

  return {
    rows: slice as Row<T>[],
    pageIndex,
    pageSize,
    pageCount,
    fromRow: slice.length === 0 ? 0 : start + 1,
    toRow: end,
  };
}