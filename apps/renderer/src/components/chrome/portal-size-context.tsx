'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Renderer-wide "what viewport am I previewing at?" state. The renderer's `<TopBar>` exposes a
 * Mobile / Tablet / Default / Custom segmented control; picking anything other than Default
 * causes every `<ExampleViewer>` on the current page to render its live example inside an
 * iframe sized to the chosen width, so CSS media queries and `matchMedia` calls evaluate
 * against the simulated viewport instead of the docs page width. Default is a no-op pass-
 * through (no iframe overhead).
 *
 * Scope: the simulator is intentionally limited to the docs surface — the `/templates/<slug>`
 * preview viewer renders a full website at the actual browser viewport, so wrapping it in an
 * iframe would defeat its purpose.
 *
 * The provider sits at the layout root so navigation between `/components/*`, `/theming`, and
 * back keeps the user's choice. Persistence rides on `localStorage`; SSR sees the default and
 * the client rehydrates after mount to avoid hydration mismatches.
 */
export type PortalSizePreset = 'default' | 'mobile' | 'tablet' | 'custom';

export interface PortalSizeState {
  preset: PortalSizePreset;
  /** Width applied when `preset === 'custom'`, in CSS pixels. */
  customWidth: number;
}

interface PortalSizeContextValue extends PortalSizeState {
  setPreset: (preset: PortalSizePreset) => void;
  setCustomWidth: (width: number) => void;
  /** Resolved width in CSS pixels for the current preset, or `null` for "default" (fill). */
  width: number | null;
}

const PRESET_WIDTHS: Record<Exclude<PortalSizePreset, 'default' | 'custom'>, number> = {
  mobile: 390,
  tablet: 820,
};

export const PORTAL_SIZE_MIN = 280;
export const PORTAL_SIZE_MAX = 2560;
const DEFAULT_CUSTOM_WIDTH = 1024;
const STORAGE_KEY = 'apx-renderer:portal-size';

const PortalSizeContext = createContext<PortalSizeContextValue | null>(null);

function clampWidth(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_CUSTOM_WIDTH;
  return Math.min(PORTAL_SIZE_MAX, Math.max(PORTAL_SIZE_MIN, Math.round(value)));
}

function readPersisted(): PortalSizeState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PortalSizeState>;
    const preset: PortalSizePreset =
      parsed.preset === 'mobile' ||
      parsed.preset === 'tablet' ||
      parsed.preset === 'custom' ||
      parsed.preset === 'default'
        ? parsed.preset
        : 'default';
    const customWidth = clampWidth(
      typeof parsed.customWidth === 'number' ? parsed.customWidth : DEFAULT_CUSTOM_WIDTH,
    );
    return { preset, customWidth };
  } catch {
    return null;
  }
}

export function PortalSizeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PortalSizeState>({
    preset: 'default',
    customWidth: DEFAULT_CUSTOM_WIDTH,
  });

  useEffect(() => {
    const persisted = readPersisted();
    if (persisted) setState(persisted);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage may be unavailable (private mode, quota); silent fallback is fine.
    }
  }, [state]);

  const setPreset = useCallback((preset: PortalSizePreset) => {
    setState((prev) => ({ ...prev, preset }));
  }, []);

  const setCustomWidth = useCallback((width: number) => {
    setState((prev) => ({ ...prev, customWidth: clampWidth(width) }));
  }, []);

  const value = useMemo<PortalSizeContextValue>(() => {
    let width: number | null;
    switch (state.preset) {
      case 'mobile':
      case 'tablet':
        width = PRESET_WIDTHS[state.preset];
        break;
      case 'custom':
        width = state.customWidth;
        break;
      default:
        width = null;
    }
    return {
      preset: state.preset,
      customWidth: state.customWidth,
      setPreset,
      setCustomWidth,
      width,
    };
  }, [state, setPreset, setCustomWidth]);

  return <PortalSizeContext.Provider value={value}>{children}</PortalSizeContext.Provider>;
}

export function usePortalSize(): PortalSizeContextValue {
  const ctx = useContext(PortalSizeContext);
  if (!ctx) {
    throw new Error('usePortalSize must be used inside <PortalSizeProvider>');
  }
  return ctx;
}

/** Read-only accessor for surfaces that may render outside the provider (e.g. error boundaries). */
export function useOptionalPortalSize(): PortalSizeContextValue | null {
  return useContext(PortalSizeContext);
}