import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useScrollLock, __scrollLockInternals } from '../src/useScrollLock';

afterEach(() => {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  __scrollLockInternals.reset();
});

describe('useScrollLock', () => {
  it('locks document.body.overflow when active', () => {
    expect(document.body.style.overflow).toBe('');
    renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores the prior overflow when inactive / unmounted', () => {
    document.body.style.overflow = 'auto';
    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('toggling active=false within the same hook releases the lock', () => {
    const { rerender } = renderHook(({ active }: { active: boolean }) => useScrollLock(active), {
      initialProps: { active: true },
    });
    expect(document.body.style.overflow).toBe('hidden');
    rerender({ active: false });
    expect(document.body.style.overflow).toBe('');
  });

  it('reference-counts: two concurrent locks → still locked after one unlocks', () => {
    const a = renderHook(() => useScrollLock(true));
    const b = renderHook(() => useScrollLock(true));
    expect(__scrollLockInternals.getLockCount()).toBe(2);
    expect(document.body.style.overflow).toBe('hidden');

    a.unmount();
    expect(__scrollLockInternals.getLockCount()).toBe(1);
    expect(document.body.style.overflow).toBe('hidden');

    b.unmount();
    expect(__scrollLockInternals.getLockCount()).toBe(0);
    expect(document.body.style.overflow).toBe('');
  });

  it('compensates the scrollbar gutter via paddingRight', () => {
    // Force a known scrollbar gutter by setting innerWidth and clientWidth via defineProperty.
    // `vi.spyOn(...,'get')` on these jsdom-internal getters can recurse — defineProperty avoids it.
    const origInnerWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth');
    const origClientWidth = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(document.documentElement) as object,
      'clientWidth',
    );
    Object.defineProperty(window, 'innerWidth', { configurable: true, get: () => 1000 });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      get: () => 984,
    });

    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.paddingRight).toBe('16px');
    unmount();
    expect(document.body.style.paddingRight).toBe('');

    if (origInnerWidth) Object.defineProperty(window, 'innerWidth', origInnerWidth);
    if (origClientWidth) {
      Object.defineProperty(
        Object.getPrototypeOf(document.documentElement) as object,
        'clientWidth',
        origClientWidth,
      );
    } else {
      // Property was set on the instance only; remove it.
      Reflect.deleteProperty(document.documentElement, 'clientWidth');
    }
  });

  it('iOS: pins body.position to fixed and offsets top by -scrollY', () => {
    const origUA = Object.getOwnPropertyDescriptor(Navigator.prototype, 'userAgent');
    const origScrollY = Object.getOwnPropertyDescriptor(window, 'scrollY');
    Object.defineProperty(Navigator.prototype, 'userAgent', {
      configurable: true,
      get: () =>
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    });
    Object.defineProperty(window, 'scrollY', { configurable: true, get: () => 120 });

    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.top).toBe('-120px');
    expect(document.body.style.width).toBe('100%');
    unmount();
    expect(document.body.style.position).toBe('');
    expect(document.body.style.top).toBe('');

    if (origUA) Object.defineProperty(Navigator.prototype, 'userAgent', origUA);
    if (origScrollY) Object.defineProperty(window, 'scrollY', origScrollY);
    else Reflect.deleteProperty(window, 'scrollY');
  });

  it('non-iOS user agents do NOT set position:fixed', () => {
    // Mac without touch points (true Mac, not iPad-as-Mac).
    const origUA = Object.getOwnPropertyDescriptor(Navigator.prototype, 'userAgent');
    const origPlatform = Object.getOwnPropertyDescriptor(Navigator.prototype, 'platform');
    Object.defineProperty(Navigator.prototype, 'userAgent', {
      configurable: true,
      get: () => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
    });
    Object.defineProperty(Navigator.prototype, 'platform', {
      configurable: true,
      get: () => 'MacIntel',
    });
    Object.defineProperty(Navigator.prototype, 'maxTouchPoints', {
      configurable: true,
      get: () => 0,
    });

    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.position).toBe('');
    unmount();

    if (origUA) Object.defineProperty(Navigator.prototype, 'userAgent', origUA);
    if (origPlatform) Object.defineProperty(Navigator.prototype, 'platform', origPlatform);
    Reflect.deleteProperty(Navigator.prototype, 'maxTouchPoints');
  });
});