import { renderHook, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  useEscapeStack,
  __escapeStackInternals,
} from '../../src/escape-stack/useEscapeStack';

function pressEscape(): void {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
  document.dispatchEvent(event);
}

afterEach(() => {
  __escapeStackInternals.reset();
});

describe('useEscapeStack', () => {
  it('fires onEscape for the only active subscriber', () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeStack({ active: true, onEscape }));
    act(() => pressEscape());
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('only the topmost (most recently mounted) subscriber receives Escape', () => {
    const outer = vi.fn();
    const inner = vi.fn();
    // Mount the outer hook first, then mount the inner hook second so it becomes topmost. Doing
    // this with two separate `renderHook` calls keeps each component's hook order stable —
    // conditionally calling a hook inside a single component would violate rules of hooks.
    const outerHook = renderHook(() => useEscapeStack({ active: true, onEscape: outer }));
    const innerHook = renderHook(() => useEscapeStack({ active: true, onEscape: inner }));

    act(() => pressEscape());
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).toHaveBeenCalledTimes(0);

    innerHook.unmount();
    outerHook.unmount();
  });

  it('after unmount, the new topmost gets Escape', () => {
    const outer = vi.fn();
    const inner = vi.fn();

    const a = renderHook(() => useEscapeStack({ active: true, onEscape: outer }));
    const b = renderHook(() => useEscapeStack({ active: true, onEscape: inner }));

    act(() => pressEscape());
    expect(inner).toHaveBeenCalledTimes(1);

    b.unmount();
    act(() => pressEscape());
    expect(outer).toHaveBeenCalledTimes(1);

    a.unmount();
  });

  it('active=false deregisters without unmount', () => {
    const onEscape = vi.fn();
    const { rerender } = renderHook(
      ({ active }: { active: boolean }) => useEscapeStack({ active, onEscape }),
      { initialProps: { active: true } },
    );
    act(() => pressEscape());
    expect(onEscape).toHaveBeenCalledTimes(1);

    rerender({ active: false });
    act(() => pressEscape());
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('detaches the global listener once the stack is empty', () => {
    const onEscape = vi.fn();
    const hook = renderHook(() => useEscapeStack({ active: true, onEscape }));
    expect(__escapeStackInternals.isListenerAttached()).toBe(true);
    hook.unmount();
    expect(__escapeStackInternals.isListenerAttached()).toBe(false);
  });

  it('priority overrides mount order', () => {
    const lowPriority = vi.fn();
    const highPriority = vi.fn();
    renderHook(() => useEscapeStack({ active: true, onEscape: lowPriority, priority: 0 }));
    renderHook(() => useEscapeStack({ active: true, onEscape: highPriority, priority: 10 }));
    // Mount a third low-priority entry AFTER the high one — high should still win.
    renderHook(() => useEscapeStack({ active: true, onEscape: lowPriority, priority: 0 }));

    act(() => pressEscape());
    expect(highPriority).toHaveBeenCalledTimes(1);
    expect(lowPriority).toHaveBeenCalledTimes(0);
  });

  it('reads the latest onEscape on every keystroke', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ cb }: { cb: () => void }) => useEscapeStack({ active: true, onEscape: cb }),
      { initialProps: { cb: first } },
    );
    rerender({ cb: second });
    act(() => pressEscape());
    expect(first).toHaveBeenCalledTimes(0);
    expect(second).toHaveBeenCalledTimes(1);
  });
});