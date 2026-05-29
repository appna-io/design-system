import { useEffect } from 'react';

interface SavedBodyState {
  overflow: string;
  paddingRight: string;
  position: string;
  top: string;
  width: string;
  scrollY: number;
}

/**
 * Module-level reference count so multiple concurrent consumers (e.g. a Modal opening over a
 * Drawer) collapse into a single lock + unlock pair. The first consumer captures the original
 * body state; all subsequent consumers no-op the apply. The last consumer to release restores it.
 */
let lockCount = 0;
let saved: SavedBodyState | null = null;

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  // iPadOS 13+ reports as Mac; the maxTouchPoints check disambiguates iPad-as-Mac.
  return (
    /iP(?:hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints ?? 0) > 1)
  );
}

function applyLock(): void {
  if (typeof document === 'undefined') return;
  const body = document.body;
  const html = document.documentElement;
  const scrollY = window.scrollY || html.scrollTop || 0;
  const scrollbarGutter = window.innerWidth - html.clientWidth;

  saved = {
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
    position: body.style.position,
    top: body.style.top,
    width: body.style.width,
    scrollY,
  };

  body.style.overflow = 'hidden';
  // Compensate for the now-missing scrollbar so content doesn't shift right when the page locks.
  if (scrollbarGutter > 0) {
    body.style.paddingRight = `${scrollbarGutter}px`;
  }
  // iOS Safari ignores `overflow:hidden` on body. Pinning with `position:fixed` + a negative `top`
  // equal to the current scroll preserves the visual scroll position while the page is locked.
  if (isIOS()) {
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
  }
}

function releaseLock(): void {
  if (typeof document === 'undefined') return;
  if (!saved) return;
  const body = document.body;
  const restoreScrollY = saved.scrollY;
  const wasIOS = saved.position === 'fixed' || body.style.position === 'fixed';

  body.style.overflow = saved.overflow;
  body.style.paddingRight = saved.paddingRight;
  body.style.position = saved.position;
  body.style.top = saved.top;
  body.style.width = saved.width;
  saved = null;

  if (wasIOS) {
    // Restore visual scroll on iOS where we pinned with position:fixed. Guarded because some
    // environments (jsdom for tests, certain SSR shims) raise on `window.scrollTo`.
    try {
      window.scrollTo(0, restoreScrollY);
    } catch {
      /* no-op — environment does not implement scrollTo */
    }
  }
}

/**
 * Reference-counted page scroll lock. Two consumers (Modal + Drawer) opening simultaneously will
 * lock once; the body state is restored only when the last consumer deactivates. iOS Safari is
 * handled with a `position:fixed` pin because `overflow:hidden` is ignored on `<body>` there.
 *
 * The hook is a no-op when `active` is false, so an `open`-driven overlay can mount once and
 * toggle visibility without churning the body styles.
 */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return undefined;
    lockCount += 1;
    if (lockCount === 1) applyLock();
    return () => {
      lockCount -= 1;
      if (lockCount <= 0) {
        lockCount = 0;
        releaseLock();
      }
    };
  }, [active]);
}

/** Test-only helpers. Not part of the public package surface. */
export const __scrollLockInternals = {
  getLockCount: (): number => lockCount,
  reset: (): void => {
    lockCount = 0;
    saved = null;
  },
};
