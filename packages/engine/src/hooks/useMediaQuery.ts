import { useEffect, useState } from 'react';

export interface UseMediaQueryOptions {
  /** Value returned on the server / first paint, before the listener attaches. Default `false`. */
  defaultValue?: boolean;
}

/**
 * SSR-safe media query hook. Returns `true` whenever the query matches. The `defaultValue` is
 * used during SSR and the first client render to avoid hydration mismatches; the real value is
 * applied on mount.
 */
export function useMediaQuery(query: string, options: UseMediaQueryOptions = {}): boolean {
  const { defaultValue = false } = options;
  const [matches, setMatches] = useState<boolean>(defaultValue);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    if (mql.addEventListener) {
      mql.addEventListener('change', update);
      return () => mql.removeEventListener('change', update);
    }
    // Older Safari fallback.
    mql.addListener(update);
    return () => mql.removeListener(update);
  }, [query]);

  return matches;
}