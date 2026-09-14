'use client';

import { useMode, useVariant, type ThemeOverride } from '@apx-ui/ds';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/**
 * Shares a template's **seeded** mode / variant between the two places that need it: the scoped
 * `<ThemeProvider>` inside `<TemplateSurface>`, which applies it, and `<PreviewToolbar>`, which
 * must *report* it.
 *
 * ## Why this exists
 *
 * `TemplateMeta.preferredMode` promises two things at once — the template opens in the mode it was
 * designed for, and "the viewer toolbar can still flip it". Pinning `defaultMode` on the scoped
 * provider delivers the first; deliberately not touching the root delivers the second, because the
 * toolbar drives the root.
 *
 * The cost is that the two disagree on entry: the template renders dark while the toolbar, reading
 * the root, still reports `System`. That is not merely untidy — the scope's real state was
 * unreadable from outside it, and a careful audit sampled entry-state as "light mode", got the
 * dark palette, and concluded a correctly-authored template was authored backwards (#10, #11).
 *
 * So the seed lives here, above both, and is released the moment the user actually moves the axis.
 * `null` means "no seed active — inherit the root", which is what both consumers do with it.
 */
export interface TemplateSeed {
  /** The mode the scope should pin, or `null` once released / never seeded. */
  mode: 'light' | 'dark' | null;
  /** The variant the scope should pin, or `null`. */
  variant: string | null;
  /** Called by the toolbar before it drives the root, so the seed yields instead of fighting it. */
  release: () => void;
}

const TemplateSeedContext = createContext<TemplateSeed | null>(null);

/** `null` outside a template preview — every consumer treats that as "nothing seeded". */
export function useTemplateSeed(): TemplateSeed | null {
  return useContext(TemplateSeedContext);
}

export interface TemplateSeedProviderProps {
  preferredMode?: 'light' | 'dark' | undefined;
  preferredVariant?: string | undefined;
  children: ReactNode;
}

export function TemplateSeedProvider({
  preferredMode,
  preferredVariant,
  children,
}: TemplateSeedProviderProps) {
  const { mode } = useMode();
  const { variant } = useVariant();

  // The root values as they stood on first render. A later change means the *user* moved the
  // axis — nothing else writes these while a preview is open.
  const initialMode = useRef(mode);
  const initialVariant = useRef(variant);
  const [released, setReleased] = useState(false);

  useEffect(() => {
    if (mode !== initialMode.current || variant !== initialVariant.current) setReleased(true);
  }, [mode, variant]);

  const release = useCallback(() => setReleased(true), []);

  const value = useMemo<TemplateSeed>(
    () => ({
      mode: released ? null : (preferredMode ?? null),
      variant: released ? null : (preferredVariant ?? null),
      release,
    }),
    [released, preferredMode, preferredVariant, release],
  );

  return <TemplateSeedContext.Provider value={value}>{children}</TemplateSeedContext.Provider>;
}

/** Re-exported so the preview page can type its `theme` prop without a second import. */
export type { ThemeOverride };
