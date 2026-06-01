import { useControllableState } from '@apx-ui/engine';
import { useCallback, useMemo } from 'react';

import { computePageWindow } from './computePageWindow';
import type {
  PaginationChange,
  UsePaginationOptions,
  UsePaginationReturn,
} from './Pagination.types';

const DEFAULT_PAGE_INDEX = 0;
const DEFAULT_PAGE_SIZE = 25;

/**
 * Headless state machine driving `<Pagination />`.
 *
 * Handles both modes from a single hook:
 *
 *   - `page` mode (the default) — `pageIndex` + `pageSize` form the state;
 *     `totalCount` drives `pageCount` and the page-number window.
 *     `setPageIndex` clamps into legal range.
 *
 *   - `cursor` mode — `pageIndex` is always 0 (the server has no concept of
 *     it), `pageCount = Infinity`, the page-number window is empty, and
 *     `goPrevious` / `goNext` proxy to the consumer-supplied callbacks
 *     instead of mutating local state.
 *
 * The hook is fully controllable: pass `pageIndex` / `pageSize` to control;
 * omit them and pass `defaultPageIndex` / `defaultPageSize` to stay
 * uncontrolled. `onChange` fires in both flavors.
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const mode = options.mode ?? 'page';

  const [pageIndexState, setPageIndexInternal] = useControllableState<number>({
    value: options.pageIndex,
    defaultValue: options.defaultPageIndex ?? DEFAULT_PAGE_INDEX,
    onChange: undefined,
  });

  const [pageSizeState, setPageSizeInternal] = useControllableState<number>({
    value: options.pageSize,
    defaultValue: options.defaultPageSize ?? DEFAULT_PAGE_SIZE,
    onChange: undefined,
  });

  const rawPageIndex = pageIndexState ?? DEFAULT_PAGE_INDEX;
  const pageSize = Math.max(1, pageSizeState ?? DEFAULT_PAGE_SIZE);

  /* -------- derived values -------- */

  const totalCount =
    mode === 'page' && typeof options.totalCount === 'number'
      ? Math.max(0, options.totalCount)
      : null;

  const pageCount = useMemo(() => {
    if (mode === 'cursor') return Number.POSITIVE_INFINITY;
    if (totalCount === null) return 1;
    return Math.max(1, Math.ceil(totalCount / pageSize));
  }, [mode, totalCount, pageSize]);

  // Clamp the page index into the legal range. In cursor mode it's always 0.
  const pageIndex =
    mode === 'cursor'
      ? 0
      : Math.min(Math.max(rawPageIndex, 0), Math.max(0, pageCount - 1));

  const { fromRow, toRow } = useMemo(() => {
    if (mode === 'cursor' || totalCount === null || totalCount === 0) {
      return { fromRow: 0, toRow: 0 };
    }
    const start = pageIndex * pageSize + 1;
    const end = Math.min(totalCount, (pageIndex + 1) * pageSize);
    return { fromRow: start, toRow: end };
  }, [mode, totalCount, pageIndex, pageSize]);

  const atFirstPage =
    mode === 'cursor' ? options.hasPreviousPage === false : pageIndex <= 0;
  const atLastPage =
    mode === 'cursor'
      ? options.hasNextPage === false
      : pageIndex >= pageCount - 1;

  const pageItems = useMemo(
    () =>
      mode === 'cursor'
        ? []
        : computePageWindow({
            pageIndex,
            pageCount,
            siblingCount: options.siblingCount,
            boundaryCount: options.boundaryCount,
          }),
    [mode, pageIndex, pageCount, options.siblingCount, options.boundaryCount],
  );

  /* -------- actions -------- */

  const emitChange = useCallback(
    (next: PaginationChange) => {
      options.onChange?.(next);
    },
    [options],
  );

  const setPageIndex = useCallback(
    (next: number) => {
      if (mode === 'cursor') return; // no-op; consumer drives via prev/next
      const clamped = Math.min(Math.max(next, 0), Math.max(0, pageCount - 1));
      if (clamped === pageIndex) return;
      setPageIndexInternal(clamped);
      emitChange({ pageIndex: clamped, pageSize });
    },
    [mode, pageCount, pageIndex, pageSize, emitChange, setPageIndexInternal],
  );

  const setPageSize = useCallback(
    (next: number) => {
      const clamped = Math.max(1, Math.floor(next));
      if (clamped === pageSize) return;
      setPageSizeInternal(clamped);
      // Reset to the first page so a smaller page size doesn't strand the
      // user on a page that no longer exists. The DataGrid integration
      // already does this, mirrors that convention.
      if (pageIndex !== 0 && mode === 'page') {
        setPageIndexInternal(0);
      }
      emitChange({
        pageIndex: mode === 'page' ? 0 : pageIndex,
        pageSize: clamped,
      });
    },
    [mode, pageIndex, pageSize, emitChange, setPageIndexInternal, setPageSizeInternal],
  );

  const goFirst = useCallback(() => {
    if (mode === 'cursor') return;
    setPageIndex(0);
  }, [mode, setPageIndex]);

  const goPrevious = useCallback(() => {
    if (mode === 'cursor') {
      options.onPrevious?.();
      return;
    }
    setPageIndex(pageIndex - 1);
  }, [mode, options, pageIndex, setPageIndex]);

  const goNext = useCallback(() => {
    if (mode === 'cursor') {
      options.onNext?.();
      return;
    }
    setPageIndex(pageIndex + 1);
  }, [mode, options, pageIndex, setPageIndex]);

  const goLast = useCallback(() => {
    if (mode === 'cursor') return;
    setPageIndex(pageCount - 1);
  }, [mode, pageCount, setPageIndex]);

  return {
    mode,
    pageIndex,
    pageSize,
    pageCount,
    totalCount,
    fromRow,
    toRow,
    atFirstPage,
    atLastPage,
    pageItems,
    setPageIndex,
    setPageSize,
    goFirst,
    goPrevious,
    goNext,
    goLast,
  };
}