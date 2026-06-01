'use client';

import { useEffect, useState } from 'react';

/**
 * Tiny companion to `useAvatarImage` that debounces the fallback's first paint. Mirrors Radix
 * Avatar's `delayMs` semantics: when an `src` is being loaded, we *want* to show nothing for a
 * brief window so fast-loading images don't flicker through the initials tile.
 *
 *   - `delayMs <= 0`  → returns `true` immediately (no debounce; fallback paints instantly).
 *   - `delayMs > 0`   → returns `false` for `delayMs` ms after mount / `delayMs` change, then `true`.
 *
 * The render side of `<Avatar>` uses the result like:
 *
 *     {state === 'loaded' && <img />}
 *     {state !== 'loaded' && canShowFallback && <Fallback />}
 *
 * so the fallback can never paint *before* the debounce window elapses, regardless of whether
 * the image arrived first.
 */
export function useFallbackDelay(delayMs: number): boolean {
  const [ready, setReady] = useState(delayMs <= 0);

  useEffect(() => {
    if (delayMs <= 0) {
      setReady(true);
      return;
    }
    setReady(false);
    const timer = setTimeout(() => setReady(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return ready;
}