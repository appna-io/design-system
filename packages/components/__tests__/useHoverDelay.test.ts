import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useHoverDelay } from '../src/NavigationMenu/useHoverDelay';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useHoverDelay — pure timer engine', () => {
  it('schedules an open after the configured delay', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useHoverDelay({ openDelay: 150, closeDelay: 250, onOpen, onClose }),
    );

    act(() => {
      result.current.scheduleOpen('a');
    });
    expect(onOpen).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(onOpen).toHaveBeenCalledWith('a');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('cancels the pending open when scheduleClose fires before the delay', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useHoverDelay({ openDelay: 150, closeDelay: 250, onOpen, onClose }),
    );

    act(() => {
      result.current.scheduleOpen('a');
      result.current.scheduleClose();
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onOpen).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('replaces the queued id when sweeping between triggers', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useHoverDelay({ openDelay: 150, closeDelay: 250, onOpen, onClose }),
    );

    act(() => {
      result.current.scheduleOpen('a');
    });
    act(() => {
      vi.advanceTimersByTime(50);
      result.current.scheduleOpen('b');
    });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith('b');
  });

  it('cancelClose pauses an in-flight close', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useHoverDelay({ openDelay: 150, closeDelay: 250, onOpen, onClose }),
    );

    act(() => {
      result.current.scheduleClose();
    });
    act(() => {
      vi.advanceTimersByTime(100);
      result.current.cancelClose();
      vi.advanceTimersByTime(500);
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});