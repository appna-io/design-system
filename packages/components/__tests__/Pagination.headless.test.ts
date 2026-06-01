import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { usePagination } from '../src/Pagination/usePagination';

describe('usePagination — page mode', () => {
  it('derives pageCount + range from totalCount + pageSize', () => {
    const { result } = renderHook(() =>
      usePagination({ totalCount: 120, defaultPageSize: 25 }),
    );

    expect(result.current.mode).toBe('page');
    expect(result.current.pageIndex).toBe(0);
    expect(result.current.pageSize).toBe(25);
    expect(result.current.pageCount).toBe(5);
    expect(result.current.totalCount).toBe(120);
    expect(result.current.fromRow).toBe(1);
    expect(result.current.toRow).toBe(25);
    expect(result.current.atFirstPage).toBe(true);
    expect(result.current.atLastPage).toBe(false);
  });

  it('reports an empty range when totalCount is 0', () => {
    const { result } = renderHook(() => usePagination({ totalCount: 0 }));
    expect(result.current.pageCount).toBe(1);
    expect(result.current.fromRow).toBe(0);
    expect(result.current.toRow).toBe(0);
    expect(result.current.atFirstPage).toBe(true);
    expect(result.current.atLastPage).toBe(true);
  });

  it('setPageIndex updates state + fires onChange', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      usePagination({ totalCount: 120, defaultPageSize: 25, onChange }),
    );

    act(() => result.current.setPageIndex(2));

    expect(result.current.pageIndex).toBe(2);
    expect(result.current.fromRow).toBe(51);
    expect(result.current.toRow).toBe(75);
    expect(onChange).toHaveBeenCalledWith({ pageIndex: 2, pageSize: 25 });
  });

  it('setPageIndex clamps out-of-range values', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      usePagination({ totalCount: 50, defaultPageSize: 25, onChange }),
    );

    act(() => result.current.setPageIndex(99));
    expect(result.current.pageIndex).toBe(1); // pageCount = 2
    expect(onChange).toHaveBeenLastCalledWith({ pageIndex: 1, pageSize: 25 });

    act(() => result.current.setPageIndex(-5));
    expect(result.current.pageIndex).toBe(0);
  });

  it('setPageIndex is a no-op when the value is unchanged', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      usePagination({ totalCount: 50, defaultPageIndex: 1, onChange }),
    );

    act(() => result.current.setPageIndex(1));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('setPageSize resets pageIndex to 0 and fires onChange once', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      usePagination({
        totalCount: 200,
        defaultPageSize: 25,
        defaultPageIndex: 3,
        onChange,
      }),
    );

    act(() => result.current.setPageSize(50));
    expect(result.current.pageSize).toBe(50);
    expect(result.current.pageIndex).toBe(0);
    expect(onChange).toHaveBeenCalledWith({ pageIndex: 0, pageSize: 50 });
  });

  it('goFirst / goPrevious / goNext / goLast navigate', () => {
    const { result } = renderHook(() =>
      usePagination({ totalCount: 100, defaultPageSize: 10 }),
    );

    expect(result.current.pageCount).toBe(10);
    act(() => result.current.goLast());
    expect(result.current.pageIndex).toBe(9);
    expect(result.current.atLastPage).toBe(true);

    act(() => result.current.goPrevious());
    expect(result.current.pageIndex).toBe(8);

    act(() => result.current.goFirst());
    expect(result.current.pageIndex).toBe(0);
    expect(result.current.atFirstPage).toBe(true);

    act(() => result.current.goNext());
    expect(result.current.pageIndex).toBe(1);
  });

  it('respects controlled pageIndex without internal mutation', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ pageIndex }: { pageIndex: number }) =>
        usePagination({ totalCount: 100, pageSize: 10, pageIndex, onChange }),
      { initialProps: { pageIndex: 2 } },
    );

    expect(result.current.pageIndex).toBe(2);

    act(() => result.current.setPageIndex(5));
    // Controlled: onChange is the only side-effect; the effective pageIndex
    // does not move until the consumer re-passes the new prop.
    expect(onChange).toHaveBeenCalledWith({ pageIndex: 5, pageSize: 10 });
    expect(result.current.pageIndex).toBe(2);

    rerender({ pageIndex: 5 });
    expect(result.current.pageIndex).toBe(5);
  });

  it('emits a page-number window matching the reference table (0 / 10 / 1 / 1)', () => {
    const { result } = renderHook(() =>
      usePagination({ totalCount: 100, defaultPageSize: 10, siblingCount: 1, boundaryCount: 1 }),
    );
    expect(result.current.pageItems).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 10]);
  });
});

describe('usePagination — cursor mode', () => {
  it('reports infinite pageCount and an empty window', () => {
    const { result } = renderHook(() =>
      usePagination({ mode: 'cursor', hasPreviousPage: true, hasNextPage: true }),
    );

    expect(result.current.mode).toBe('cursor');
    expect(result.current.pageCount).toBe(Number.POSITIVE_INFINITY);
    expect(result.current.totalCount).toBe(null);
    expect(result.current.pageItems).toEqual([]);
    expect(result.current.fromRow).toBe(0);
    expect(result.current.toRow).toBe(0);
  });

  it('atFirstPage / atLastPage mirror the hasPrev / hasNext flags', () => {
    const { result, rerender } = renderHook(
      ({ prev, next }: { prev: boolean; next: boolean }) =>
        usePagination({ mode: 'cursor', hasPreviousPage: prev, hasNextPage: next }),
      { initialProps: { prev: false, next: true } },
    );

    expect(result.current.atFirstPage).toBe(true);
    expect(result.current.atLastPage).toBe(false);

    rerender({ prev: true, next: false });
    expect(result.current.atFirstPage).toBe(false);
    expect(result.current.atLastPage).toBe(true);
  });

  it('goPrevious / goNext fire the consumer callbacks', () => {
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    const { result } = renderHook(() =>
      usePagination({
        mode: 'cursor',
        hasPreviousPage: true,
        hasNextPage: true,
        onPrevious,
        onNext,
      }),
    );

    act(() => result.current.goPrevious());
    expect(onPrevious).toHaveBeenCalledTimes(1);

    act(() => result.current.goNext());
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('setPageIndex / goFirst / goLast are no-ops in cursor mode', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      usePagination({ mode: 'cursor', onChange }),
    );

    act(() => result.current.setPageIndex(5));
    act(() => result.current.goFirst());
    act(() => result.current.goLast());

    expect(onChange).not.toHaveBeenCalled();
  });
});