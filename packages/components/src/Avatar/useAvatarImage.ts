'use client';

import { useEffect, useState } from 'react';

/**
 * Async lifecycle states an `<img>`-backed avatar can be in. Matches the Radix Avatar contract so
 * consumers swapping engines stay familiar.
 *
 *   - `'idle'`    — no `src` provided; the component renders the fallback (initials or icon).
 *   - `'loading'` — `src` is set, the browser is fetching; nothing is rendered yet (avoids a
 *                   first-paint flash of the initials for fast-loading images).
 *   - `'loaded'`  — `onload` fired; the `<img>` is safe to paint.
 *   - `'error'`   — `onerror` fired or the request was aborted; show the fallback permanently.
 */
export type AvatarImageState = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * State machine for an `<img>` source. Lives outside the render tree so the rules stay testable
 * in isolation (three jsdom tests cover idle → loading → loaded/error transitions).
 *
 * Why we don't render the `<img>` directly in `<Avatar>` and let React handle `onLoad`/`onError`:
 *   1. The `<img>` would briefly take layout space before its `onload` fires, which would push
 *      the fallback initials around for one frame on slow connections.
 *   2. The `delayMs` debounce — "don't even *show* the fallback until 600 ms have passed" — needs
 *      the component to know both the image's state *and* a wall-clock timer, which is cleaner to
 *      orchestrate inside a hook than inside JSX conditionals.
 *
 * The hook intentionally does not deal with the timer: the caller asks "is `state === 'loaded'`?"
 * for the image, and a separate `delayMs` countdown decides whether the fallback may paint yet.
 * Splitting those concerns keeps each piece below 30 lines.
 *
 * Memory safety: every effect creates a fresh `Image()` and detaches handlers on cleanup so
 * stale `onload` events from a previous `src` cannot race the current one.
 */
export function useAvatarImage(src: string | undefined): AvatarImageState {
  const [state, setState] = useState<AvatarImageState>(src ? 'loading' : 'idle');

  useEffect(() => {
    if (!src) {
      setState('idle');
      return;
    }

    // SSR guard: jsdom defines `Image`, but defensively short-circuit in non-browser envs.
    if (typeof window === 'undefined' || typeof window.Image === 'undefined') {
      return;
    }

    let cancelled = false;
    setState('loading');

    const image = new window.Image();
    const handleLoad = () => {
      if (!cancelled) setState('loaded');
    };
    const handleError = () => {
      if (!cancelled) setState('error');
    };

    image.addEventListener('load', handleLoad);
    image.addEventListener('error', handleError);
    image.src = src;

    return () => {
      cancelled = true;
      image.removeEventListener('load', handleLoad);
      image.removeEventListener('error', handleError);
    };
  }, [src]);

  return state;
}
