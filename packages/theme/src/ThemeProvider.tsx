'use client';

import { DirectionContext, type Direction, type ThemeShape } from '@apx-ui/engine';
import type { ThemePlatform } from '@apx-ui/tokens';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ThemeContext,
  type ModeSetting,
  type PlatformSetting,
  type ResolvedMode,
} from './context';
import { defineTheme } from './defineTheme';
import { mergeTheme, type ThemeOverride } from './mergeTheme';
import { detectPlatform } from './platform';
import { themeToCssVars } from './themeToCssVars';

export interface ThemeProviderProps {
  /** A theme produced by `defineTheme(...)`. If omitted, `defaultTheme` is used. */
  theme?: ThemeShape;
  /** Initial mode setting before any persisted value is read. Defaults to `'system'`. */
  defaultMode?: ModeSetting;
  /** Initial direction before any persisted value is read. Defaults to the theme's `dir`. */
  defaultDir?: Direction;
  /** Initial variant before any persisted value is read. Defaults to the theme's `variant`. */
  defaultVariant?: string;
  /**
   * Initial platform setting before any persisted value is read. Defaults to `'auto'` (browser
   * sniffing). Pass `'apple'` or `'other'` to pin — useful for screenshot tests, design
   * reviews, or apps that want to opt out of detection entirely.
   */
  defaultPlatform?: PlatformSetting;
  /**
   * Initial runtime overrides before any persisted value is read. Lets you ship a default
   * "flavour" without redefining the whole theme — e.g. `{ palette: { light: { primary: { main: '#ff5722' } } } }`.
   * The Theme Studio reads / writes the same field, so end-users can tweak from here.
   */
  defaultOverrides?: ThemeOverride;
  /**
   * `localStorage` key. Set to `null` to disable persistence. Defaults to `'sds-theme'`.
   * The provider persists `mode`, `dir`, `variant`, `platform`, and `overrides` under
   * `${key}-mode`, `${key}-dir`, `${key}-variant`, `${key}-platform`, `${key}-overrides`.
   */
  storageKey?: string | null;
  /** Whether to inject the generated CSS variables into a `<style>` tag. Default `true`. */
  injectCss?: boolean;
  /** Skip mounting transitions while switching mode (`color-scheme` flash mitigation). Default `true`. */
  disableTransitionOnChange?: boolean;
  children: ReactNode;
}

const DEFAULT_STORAGE_KEY = 'sds-theme';
const MEDIA_DARK = '(prefers-color-scheme: dark)';

function safeGetItem(key: string | null): string | null {
  if (!key) return null;
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}
function safeSetItem(key: string | null, value: string): void {
  if (!key) return;
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    /* quota or unavailable — ignore */
  }
}

function isPlatformSetting(value: unknown): value is PlatformSetting {
  return value === 'apple' || value === 'other' || value === 'auto';
}

function safeParseOverrides(raw: string | null): ThemeOverride | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as ThemeOverride;
    }
    return null;
  } catch {
    return null;
  }
}

function isEmptyObject(value: unknown): boolean {
  return Boolean(value) && typeof value === 'object' && Object.keys(value as object).length === 0;
}

function deepMergeOverride(base: ThemeOverride, patch: ThemeOverride): ThemeOverride {
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
    if (v === undefined) continue;
    const existing = out[k];
    if (
      v !== null &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      existing !== null &&
      typeof existing === 'object' &&
      !Array.isArray(existing)
    ) {
      out[k] = deepMergeOverride(existing as ThemeOverride, v as ThemeOverride);
    } else {
      out[k] = v;
    }
  }
  return out as ThemeOverride;
}

/**
 * Root provider. Owns mode/variant/platform/dir state, persists them, watches OS color-scheme
 * when `mode === 'system'`, syncs `<html>` data attributes (`data-mode`, `data-variant`,
 * `data-platform`, `dir`), and injects a `<style>` tag with all generated CSS variables (light +
 * dark + per-variant + per-platform overlay).
 *
 * Compatible with the engine's `DirectionContext` — components consuming `useDirection()` see the
 * provider's `dir` value automatically.
 */
export function ThemeProvider({
  theme,
  defaultMode = 'system',
  defaultDir,
  defaultVariant,
  defaultPlatform = 'auto',
  defaultOverrides,
  storageKey = DEFAULT_STORAGE_KEY,
  injectCss = true,
  disableTransitionOnChange = true,
  children,
}: ThemeProviderProps) {
  const baseTheme = useMemo(() => theme ?? defineTheme(), [theme]);

  const modeKey = storageKey ? `${storageKey}-mode` : null;
  const dirKey = storageKey ? `${storageKey}-dir` : null;
  const variantKey = storageKey ? `${storageKey}-variant` : null;
  const platformKey = storageKey ? `${storageKey}-platform` : null;
  const overridesKey = storageKey ? `${storageKey}-overrides` : null;

  // SSR-stable initializers. Anything that depends on `localStorage`, `navigator`, or
  // `matchMedia` would return different values on server vs client and trigger React hydration
  // mismatches in any consumer that branches on these values (e.g. `<ModeToggle>` reading
  // `aria-checked`). We initialize with server-safe defaults and hydrate from the browser inside
  // a single mount effect below. The pre-paint `<ThemeScript />` already writes the correct
  // `<html>` attributes before first paint, so users with the script never see a visual flash.
  const [mode, setModeState] = useState<ModeSetting>(defaultMode);
  const [variant, setVariantState] = useState<string>(
    defaultVariant ?? baseTheme.variant ?? 'default',
  );
  const [platform, setPlatformState] = useState<PlatformSetting>(defaultPlatform);
  const [detectedPlatform, setDetectedPlatform] = useState<ThemePlatform>('other');
  const [dir, setDirState] = useState<Direction>(defaultDir ?? baseTheme.dir ?? 'ltr');
  const [systemDark, setSystemDark] = useState<boolean>(false);
  const [overrides, setOverridesState] = useState<ThemeOverride>(() => defaultOverrides ?? {});

  /**
   * `true` once the mount effect has reconciled state with `localStorage` and browser detection.
   * Gates the attribute-writing effect below so we never overwrite `<ThemeScript />`'s correct
   * pre-paint attribute values with our initial-default state during the first commit.
   */
  const [hasHydrated, setHasHydrated] = useState(false);

  // Subscribe to the OS color-scheme MQL. Updates `systemDark` on every system change.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(MEDIA_DARK);
    const update = () => setSystemDark(mql.matches);
    update();
    if (mql.addEventListener) {
      mql.addEventListener('change', update);
      return () => mql.removeEventListener('change', update);
    }
    mql.addListener(update);
    return () => mql.removeListener(update);
  }, []);

  // Single hydration pass: read persisted settings + run platform detection, then unlock the
  // attribute-writing effect. Storage keys are derived from the immutable `storageKey` prop, so
  // running this exactly once on mount is correct.
  useEffect(() => {
    const storedMode = safeGetItem(modeKey);
    if (storedMode === 'light' || storedMode === 'dark' || storedMode === 'system') {
      setModeState(storedMode);
    }
    const storedVariant = safeGetItem(variantKey);
    if (storedVariant) setVariantState(storedVariant);
    const storedPlatform = safeGetItem(platformKey);
    if (isPlatformSetting(storedPlatform)) setPlatformState(storedPlatform);
    const storedDir = safeGetItem(dirKey);
    if (storedDir === 'ltr' || storedDir === 'rtl') setDirState(storedDir);

    const storedOverrides = safeParseOverrides(safeGetItem(overridesKey));
    if (storedOverrides) setOverridesState(storedOverrides);

    setDetectedPlatform(detectPlatform());
    setHasHydrated(true);
  }, [modeKey, variantKey, platformKey, dirKey, overridesKey]);

  const resolvedMode: ResolvedMode = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
  const resolvedPlatform: ThemePlatform = platform === 'auto' ? detectedPlatform : platform;

  const effectiveTheme = useMemo<ThemeShape>(() => {
    // baseTheme + active variant tokens first, then layer runtime overrides on top so any
    // hex / token the Studio touches wins. `mergeTheme` is a no-op when `overrides` is `{}`,
    // so the common case stays cheap.
    const withVariant =
      variant === baseTheme.variant
        ? baseTheme
        : defineTheme({ ...baseTheme, variant } as Partial<ThemeShape>);
    if (isEmptyObject(overrides)) return withVariant;
    return mergeTheme(withVariant, overrides);
  }, [baseTheme, variant, overrides]);

  const css = useMemo<string>(
    () => (injectCss ? themeToCssVars(effectiveTheme) : ''),
    [effectiveTheme, injectCss],
  );

  useEffect(() => {
    // Wait until storage + platform detection have been reconciled. Before that, `<ThemeScript />`
    // (when present) has already written correct attributes; writing our defaults here would
    // briefly clobber them on first commit.
    if (!hasHydrated || typeof document === 'undefined') return;
    const root = document.documentElement;
    const prevTransition = root.style.transition;
    if (disableTransitionOnChange) root.style.transition = 'none';
    root.setAttribute('data-mode', resolvedMode);
    root.setAttribute('data-variant', variant);
    root.setAttribute('data-platform', resolvedPlatform);
    root.setAttribute('dir', dir);
    if (disableTransitionOnChange) {
      const id = window.setTimeout(() => {
        root.style.transition = prevTransition;
      }, 0);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [hasHydrated, resolvedMode, variant, resolvedPlatform, dir, disableTransitionOnChange]);

  const setMode = useCallback(
    (next: ModeSetting) => {
      setModeState(next);
      safeSetItem(modeKey, next);
    },
    [modeKey],
  );

  const setVariant = useCallback(
    (next: string) => {
      setVariantState(next);
      safeSetItem(variantKey, next);
    },
    [variantKey],
  );

  const setPlatform = useCallback(
    (next: PlatformSetting) => {
      setPlatformState(next);
      safeSetItem(platformKey, next);
    },
    [platformKey],
  );

  const setDir = useCallback(
    (next: Direction) => {
      setDirState(next);
      safeSetItem(dirKey, next);
    },
    [dirKey],
  );

  const persistOverrides = useCallback(
    (next: ThemeOverride) => {
      if (!overridesKey) return;
      if (isEmptyObject(next)) {
        try {
          globalThis.localStorage?.removeItem(overridesKey);
        } catch {
          /* ignore */
        }
        return;
      }
      safeSetItem(overridesKey, JSON.stringify(next));
    },
    [overridesKey],
  );

  const setOverrides = useCallback(
    (next: ThemeOverride) => {
      setOverridesState(next);
      persistOverrides(next);
    },
    [persistOverrides],
  );

  const patchOverrides = useCallback(
    (patch: ThemeOverride) => {
      setOverridesState((prev) => {
        const merged = deepMergeOverride(prev, patch);
        persistOverrides(merged);
        return merged;
      });
    },
    [persistOverrides],
  );

  const resetOverrides = useCallback(() => {
    setOverridesState({});
    persistOverrides({});
  }, [persistOverrides]);

  const value = useMemo(
    () => ({
      theme: effectiveTheme,
      mode,
      resolvedMode,
      variant,
      platform,
      resolvedPlatform,
      dir,
      overrides,
      setMode,
      setVariant,
      setPlatform,
      setDir,
      setOverrides,
      patchOverrides,
      resetOverrides,
    }),
    [
      effectiveTheme,
      mode,
      resolvedMode,
      variant,
      platform,
      resolvedPlatform,
      dir,
      overrides,
      setMode,
      setVariant,
      setPlatform,
      setDir,
      setOverrides,
      patchOverrides,
      resetOverrides,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>
      <DirectionContext.Provider value={dir}>
        {injectCss && css ? (
          <style data-apx-ds-theme="" dangerouslySetInnerHTML={{ __html: css }} />
        ) : null}
        {children}
      </DirectionContext.Provider>
    </ThemeContext.Provider>
  );
}
ThemeProvider.displayName = 'ThemeProvider';
