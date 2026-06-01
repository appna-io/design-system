'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/** Pre-rendered source for one inspectable section. Generated server-side. */
export interface InspectableSource {
  id: string;
  label: string;
  /** Path relative to the template folder, shown as the modal's filename. */
  file: string;
  /** Raw source text (used by the modal's "Copy" button + fallback rendering). */
  raw: string;
  /** Shiki-highlighted HTML for `<html data-mode='light'>`. */
  light: string;
  /** Shiki-highlighted HTML for `<html data-mode='dark'>`. */
  dark: string;
}

export type InspectableSourceMap = Record<string, InspectableSource>;

interface InspectorContextValue {
  /** Whether inspector mode is currently engaged. */
  active: boolean;
  /** Toggle inspector mode on / off. */
  toggle: () => void;
  /** Force-set inspector mode (used by the toolbar button). */
  setActive: (next: boolean) => void;
  /** Source map keyed by inspectable id; lookup target for the modal. */
  sources: InspectableSourceMap;
  /** Currently-open source id, or `null` if the modal is closed. */
  openId: string | null;
  /** Open the modal for a specific id. No-op when the id is unknown. */
  openSource: (id: string) => void;
  /** Close the modal. */
  closeSource: () => void;
}

const InspectorContext = createContext<InspectorContextValue | null>(null);

export function useInspector(): InspectorContextValue {
  const ctx = useContext(InspectorContext);
  if (!ctx) {
    throw new Error('useInspector must be used inside <InspectorProvider />');
  }
  return ctx;
}

/**
 * Lets components opt out of `useInspector` throwing. Used by the `<Inspectable>`
 * wrapper so the template still renders correctly when embedded outside the viewer
 * (e.g. in a future MDX example).
 */
export function useOptionalInspector(): InspectorContextValue | null {
  return useContext(InspectorContext);
}

interface InspectorProviderProps {
  sources: InspectableSourceMap;
  children: ReactNode;
}

export function InspectorProvider({ sources, children }: InspectorProviderProps) {
  const [active, setActiveState] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const setActive = useCallback((next: boolean) => {
    setActiveState(next);
    if (!next) setOpenId(null);
  }, []);

  const toggle = useCallback(() => setActiveState((a) => !a), []);

  const openSource = useCallback(
    (id: string) => {
      if (sources[id]) setOpenId(id);
    },
    [sources],
  );

  const closeSource = useCallback(() => setOpenId(null), []);

  const value = useMemo<InspectorContextValue>(
    () => ({ active, toggle, setActive, sources, openId, openSource, closeSource }),
    [active, toggle, setActive, sources, openId, openSource, closeSource],
  );

  return <InspectorContext.Provider value={value}>{children}</InspectorContext.Provider>;
}