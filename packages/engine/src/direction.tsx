'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Direction = 'ltr' | 'rtl';

/**
 * The internal context value is `Direction | null`. `null` means "no provider in the tree" and
 * tells `useDirection` to fall back to reading `<html dir>` from the DOM.
 */
export const DirectionContext = createContext<Direction | null>(null);
DirectionContext.displayName = 'ApxDirectionContext';

export interface DirectionProviderProps {
  /** The active direction. */
  dir: Direction;
  children: ReactNode;
}

/**
 * Wraps a subtree with a fixed direction. Components inside read it via `useDirection()`.
 * If you only need to set the page-level direction, prefer `<html dir="rtl">` and skip this.
 */
export function DirectionProvider({ dir, children }: DirectionProviderProps) {
  return <DirectionContext.Provider value={dir}>{children}</DirectionContext.Provider>;
}
DirectionProvider.displayName = 'DirectionProvider';

function readDocumentDir(): Direction {
  if (typeof document === 'undefined') return 'ltr';
  return document.documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
}

/**
 * Read the nearest `DirectionContext`. Falls back to `<html dir>` when no provider is present,
 * then to `'ltr'` on the server / when DOM is unavailable. The fallback path live-updates when
 * `<html dir>` changes.
 */
export function useDirection(): Direction {
  const ctx = useContext(DirectionContext);
  const hasProvider = ctx !== null;
  const [docDir, setDocDir] = useState<Direction>('ltr');

  useEffect(() => {
    if (hasProvider) return;
    if (typeof document === 'undefined') return;

    setDocDir(readDocumentDir());
    const observer = new MutationObserver(() => setDocDir(readDocumentDir()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
    return () => observer.disconnect();
  }, [hasProvider]);

  return hasProvider ? ctx : docDir;
}