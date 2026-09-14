'use client';

import { DirectionContext, type Direction, type ThemeShape } from '@apx-ui/engine';
import type { ThemePlatform } from '@apx-ui/tokens';
import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
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

/**
 * Every optional prop is written `?: T | undefined` rather than bare `?: T`.
 *
 * The workspace compiles with `exactOptionalPropertyTypes`, under which a bare `?:` means the key
 * may be *absent* but may not be *present and undefined*. That makes conditional props
 * (`defaultMode={pinned ? 'dark' : undefined}`) a type error and forces callers into conditional
 * spreads — which is exactly the pattern this provider invites, since "pin this axis, or inherit
 * it" is the choice a scoped provider exists to express. The rest of the DS already writes props
 * this way; this interface was the outlier.
 */
export interface ThemeProviderProps {
  /** A theme produced by `defineTheme(...)`. If omitted, `defaultTheme` is used. */
  theme?: ThemeShape | undefined;
  /**
   * Initial mode setting before any persisted value is read. Defaults to `'system'`.
   * On a `scope`d provider, passing this **pins** the mode instead of inheriting it — see `scope`.
   */
  defaultMode?: ModeSetting | undefined;
  /** Initial direction before any persisted value is read. Defaults to the theme's `dir`. */
  defaultDir?: Direction | undefined;
  /** Initial variant before any persisted value is read. Defaults to the theme's `variant`. */
  defaultVariant?: string | undefined;
  /**
   * Initial platform setting before any persisted value is read. Defaults to `'auto'` (browser
   * sniffing). Pass `'apple'` or `'other'` to pin — useful for screenshot tests, design
   * reviews, or apps that want to opt out of detection entirely.
   */
  defaultPlatform?: PlatformSetting | undefined;
  /**
   * Initial runtime overrides before any persisted value is read. Lets you ship a default
   * "flavour" without redefining the whole theme — e.g. `{ palette: { light: { primary: { main: '#ff5722' } } } }`.
   * The Theme Studio reads / writes the same field, so end-users can tweak from here.
   *
   * This **seeds** the override state. To drive it from outside — a colour picker that lives
   * beyond the provider's own subtree, so `useThemeOverrides()` cannot reach it — pass the
   * controlled `overrides` prop instead.
   */
  defaultOverrides?: ThemeOverride | undefined;
  /**
   * Controlled runtime overrides. When set, this is the override layer and the provider keeps no
   * state of its own; `onOverridesChange` reports what an inner `useThemeOverrides()` call tried
   * to change. Same `value` / `defaultValue` / `onChange` shape as `Drawer`'s
   * `open` / `defaultOpen` / `onOpenChange`.
   *
   * The case this exists for: a control rendered *outside* a `scope`d provider. Anything inside a
   * scope can already call `useThemeOverrides()` and reach its nearest provider — but a preview
   * toolbar that is a sibling of the themed subtree resolves to the *root* provider instead, and
   * would repaint the whole app. Lifting the overrides to the parent and passing them down here
   * is how an external control drives one scope and nothing else.
   */
  overrides?: ThemeOverride | undefined;
  /** Called with the next override object whenever something inside asks to change it. */
  onOverridesChange?: ((overrides: ThemeOverride) => void) | undefined;
  /**
   * Confine this theme to its own subtree instead of the document.
   *
   * A scoped provider renders a wrapper element, writes its `data-mode` / `data-variant` /
   * `data-platform` / `dir` onto **that** element rather than `<html>`, and emits its CSS
   * variables under a selector matching it. Since the DS reads everything through
   * `var(--sds-*)` and custom properties cascade, the subtree re-themes completely — palette,
   * typography, radii, shadows, motion — and nothing outside it changes.
   *
   * Use it to brand a region (a template preview, an embedded widget, a tenant surface) without
   * repainting the host app. Nest freely: an inner scope overrides an outer one the same way
   * CSS custom properties always do.
   *
   * Three deliberate differences from the root provider:
   *
   *  - **Mode / direction / variant / platform are inherited, not owned.** A scope is about
   *    tokens; light/dark and reading direction belong to the app, so a branded region keeps
   *    answering to the app's toggles instead of freezing at whatever it mounted with. Setters
   *    delegate upward too, so a `<ModeToggle>` inside a scope still works. **Pass the axis to
   *    pin it** — an explicit `defaultMode="light"` makes a light-only region inside a dark app.
   *    Omitted means inherit, given means own; a value you pass is never silently ignored. A
   *    provider with no ancestor owns all four, exactly as before.
   *  - **Persistence is off by default** — a scoped theme is a property of the subtree, not a
   *    user preference, and sharing the root's `localStorage` keys would let one leak into the
   *    other. Pass an explicit `storageKey` if you really want a scoped instance to persist.
   *  - **No pre-paint script** — `<ThemeScript />` only writes `<html>`, so a scoped subtree
   *    renders in its light palette until mount. Pinning `defaultMode` also skips that flash.
   */
  scope?: boolean | undefined;
  /**
   * `localStorage` key. Set to `null` to disable persistence. Defaults to `'sds-theme'` — or to
   * `null` when `scope` is set (see `scope`).
   * The provider persists `mode`, `dir`, `variant`, `platform`, and `overrides` under
   * `${key}-mode`, `${key}-dir`, `${key}-variant`, `${key}-platform`, `${key}-overrides`.
   */
  storageKey?: string | null | undefined;
  /** Whether to inject the generated CSS variables into a `<style>` tag. Default `true`. */
  injectCss?: boolean | undefined;
  /** Skip mounting transitions while switching mode (`color-scheme` flash mitigation). Default `true`. */
  disableTransitionOnChange?: boolean | undefined;
  children: ReactNode;
}

const DEFAULT_STORAGE_KEY = 'sds-theme';
const MEDIA_DARK = '(prefers-color-scheme: dark)';

/**
 * `display: contents` keeps the wrapper out of layout (see the render at the bottom).
 *
 * `fontFamily` is the scope's equivalent of the `body` rule in `styles/reset.css`. Nothing inside
 * the DS applies the body face — the reset does it once, on `<body>`, which is *outside* any
 * scope. So a scoped theme could set `typography.fontFamily.sans`, emit a correct
 * `--sds-font-sans` onto its own subtree, and still render in the host page's font, because no
 * element in between ever read the variable. Applying it on the wrapper closes that silently.
 *
 * Stable object so React's style diff is a no-op across renders and never competes with the
 * `style.transition` the attribute effect writes imperatively.
 */
const SCOPE_WRAPPER_STYLE = {
  display: 'contents',
  fontFamily: 'var(--sds-font-sans)',
} as const;

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

/**
 * `useId()` emits `:r1:` — the colons are illegal in an attribute selector unless escaped, and
 * the generated CSS has to match the attribute we render. Strip to the safe alphabet on both
 * sides rather than escaping on one.
 */
function toScopeId(reactId: string): string {
  return `apx${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
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
 * With `scope`, the same machinery targets a wrapper element instead of `<html>` — see the
 * `scope` prop. The two paths differ only in *which element* carries the attributes and *which
 * selector* the CSS is emitted under; state, persistence, and the OS listener are identical.
 *
 * Compatible with the engine's `DirectionContext` — components consuming `useDirection()` see the
 * provider's `dir` value automatically.
 */
export function ThemeProvider({
  theme,
  defaultMode,
  defaultDir,
  defaultVariant,
  defaultPlatform,
  defaultOverrides,
  overrides: overridesProp,
  onOverridesChange,
  scope = false,
  storageKey: storageKeyProp,
  injectCss = true,
  disableTransitionOnChange = true,
  children,
}: ThemeProviderProps) {
  // The nearest enclosing provider, or `null` at the root. A scoped provider follows its
  // ancestor's axes — see `follow*` below.
  const outer = useContext(ThemeContext);

  /**
   * Which axes this provider *follows* rather than owns.
   *
   * A scope is about tokens — the brand palette, the type faces, the radii. Light/dark, reading
   * direction, variant and platform are properties of the *app*, and a branded region inside it
   * should keep answering to the app's mode toggle rather than freezing at whatever it mounted
   * with. So a scoped provider with an enclosing provider follows the outer value, live.
   *
   * The opt-out is simply passing the axis: an explicit `defaultMode` on a scoped provider pins
   * it (a light-only template preview inside a dark app is a legitimate thing to want). Omitted
   * means inherit; given means own. One rule, no flag — and an axis the caller passed is never
   * silently ignored.
   *
   * A root provider (no ancestor) is unaffected and owns everything, as before.
   */
  const canFollow = scope && outer !== null;
  const followMode = canFollow && defaultMode === undefined;
  const followDir = canFollow && defaultDir === undefined;
  const followVariant = canFollow && defaultVariant === undefined;
  const followPlatform = canFollow && defaultPlatform === undefined;
  const baseTheme = useMemo(() => theme ?? defineTheme(), [theme]);

  // A scoped theme describes its subtree, not a user preference — persisting it under the root's
  // keys would let the two overwrite each other. Explicit beats the default either way.
  const storageKey =
    storageKeyProp !== undefined ? storageKeyProp : scope ? null : DEFAULT_STORAGE_KEY;

  const scopeId = toScopeId(useId());
  const scopeRef = useRef<HTMLDivElement | null>(null);

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
  const [ownMode, setModeState] = useState<ModeSetting>(defaultMode ?? 'system');
  const [ownVariant, setVariantState] = useState<string>(
    defaultVariant ?? baseTheme.variant ?? 'default',
  );
  const [ownPlatform, setPlatformState] = useState<PlatformSetting>(defaultPlatform ?? 'auto');
  const [detectedPlatform, setDetectedPlatform] = useState<ThemePlatform>('other');
  const [ownDir, setDirState] = useState<Direction>(defaultDir ?? baseTheme.dir ?? 'ltr');
  const [systemDark, setSystemDark] = useState<boolean>(false);
  const [ownOverrides, setOverridesState] = useState<ThemeOverride>(() => defaultOverrides ?? {});
  const isControlled = overridesProp !== undefined;
  const overrides = isControlled ? overridesProp : ownOverrides;
  // Read inside the mount-once hydration effect, which must not re-run when control changes.
  const isControlledRef = useRef(isControlled);
  isControlledRef.current = isControlled;

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

    // A controlled `overrides` prop is the source of truth; hydrating over it would fight the
    // parent for one render and then be overwritten anyway.
    if (!isControlledRef.current) {
      const storedOverrides = safeParseOverrides(safeGetItem(overridesKey));
      if (storedOverrides) setOverridesState(storedOverrides);
    }

    setDetectedPlatform(detectPlatform());
    setHasHydrated(true);
  }, [modeKey, variantKey, platformKey, dirKey, overridesKey]);

  // The effective axes: the outer provider's where we follow, our own otherwise. Everything below
  // — the emitted CSS, the attribute effect, the context value — reads only these, so neither path
  // needs to know which is which.
  const mode = followMode ? outer!.mode : ownMode;
  const variant = followVariant ? outer!.variant : ownVariant;
  const platform = followPlatform ? outer!.platform : ownPlatform;
  const dir = followDir ? outer!.dir : ownDir;

  // Resolution (`system` → light/dark, `auto` → detected) is taken from the outer provider too
  // when following, rather than recomputed — it already watches the OS media query, and computing
  // it twice is how the two drift apart for a frame.
  const resolvedMode: ResolvedMode = followMode
    ? outer!.resolvedMode
    : mode === 'system'
      ? systemDark
        ? 'dark'
        : 'light'
      : mode;
  const resolvedPlatform: ThemePlatform = followPlatform
    ? outer!.resolvedPlatform
    : platform === 'auto'
      ? detectedPlatform
      : platform;

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
    () =>
      injectCss
        ? themeToCssVars(
            effectiveTheme,
            scope ? { selector: `[data-apx-theme-scope='${scopeId}']` } : {},
          )
        : '',
    [effectiveTheme, injectCss, scope, scopeId],
  );

  useEffect(() => {
    // Wait until storage + platform detection have been reconciled. Before that, `<ThemeScript />`
    // (when present) has already written correct attributes; writing our defaults here would
    // briefly clobber them on first commit.
    if (!hasHydrated || typeof document === 'undefined') return;
    // Scoped instances drive their own wrapper; only the root instance owns `<html>`. Writing the
    // attributes from an effect (rather than as JSX props on the wrapper) keeps both paths on one
    // code path and avoids a hydration mismatch on `data-mode`, which is resolved from the OS
    // media query and so differs between server and client.
    const target = scope ? scopeRef.current : document.documentElement;
    if (!target) return;
    const prevTransition = target.style.transition;
    if (disableTransitionOnChange) target.style.transition = 'none';
    target.setAttribute('data-mode', resolvedMode);
    target.setAttribute('data-variant', variant);
    target.setAttribute('data-platform', resolvedPlatform);
    target.setAttribute('dir', dir);
    if (disableTransitionOnChange) {
      const id = window.setTimeout(() => {
        target.style.transition = prevTransition;
      }, 0);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [hasHydrated, resolvedMode, variant, resolvedPlatform, dir, disableTransitionOnChange, scope]);

  // Setters mirror the read side: an axis we follow is not ours to change locally, so the call
  // goes to whoever owns it. Without this, a `<ModeToggle>` rendered inside a scope would set
  // state nobody reads and appear to do nothing.
  const ownSetMode = useCallback(
    (next: ModeSetting) => {
      setModeState(next);
      safeSetItem(modeKey, next);
    },
    [modeKey],
  );
  const setMode = followMode ? outer!.setMode : ownSetMode;

  const ownSetVariant = useCallback(
    (next: string) => {
      setVariantState(next);
      safeSetItem(variantKey, next);
    },
    [variantKey],
  );
  const setVariant = followVariant ? outer!.setVariant : ownSetVariant;

  const ownSetPlatform = useCallback(
    (next: PlatformSetting) => {
      setPlatformState(next);
      safeSetItem(platformKey, next);
    },
    [platformKey],
  );
  const setPlatform = followPlatform ? outer!.setPlatform : ownSetPlatform;

  const ownSetDir = useCallback(
    (next: Direction) => {
      setDirState(next);
      safeSetItem(dirKey, next);
    },
    [dirKey],
  );
  const setDir = followDir ? outer!.setDir : ownSetDir;

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

  /**
   * One commit path for all three setters. Controlled: report upward and keep no state — the
   * parent decides, exactly like `Drawer`'s `onOpenChange`. Uncontrolled: set and persist.
   * Persistence is skipped while controlled because the parent owns the value; writing it would
   * resurrect a stale override on the next mount.
   */
  const commitOverrides = useCallback(
    (next: ThemeOverride) => {
      if (isControlled) {
        onOverridesChange?.(next);
        return;
      }
      setOverridesState(next);
      persistOverrides(next);
    },
    [isControlled, onOverridesChange, persistOverrides],
  );

  const setOverrides = commitOverrides;

  const patchOverrides = useCallback(
    (patch: ThemeOverride) => {
      commitOverrides(deepMergeOverride(overrides, patch));
    },
    [commitOverrides, overrides],
  );

  const resetOverrides = useCallback(() => {
    commitOverrides({});
  }, [commitOverrides]);

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

  const styleTag =
    injectCss && css ? (
      <style data-apx-ds-theme="" dangerouslySetInnerHTML={{ __html: css }} />
    ) : null;

  // The wrapper is what the generated selector matches and what the effect above writes the
  // attributes onto. `display: contents` keeps it out of layout, so dropping a scoped provider
  // into a flex or grid parent doesn't introduce a box between the parent and its children —
  // custom properties, `dir`, and the attribute selector all still apply through it.
  const body = scope ? (
    <div ref={scopeRef} data-apx-theme-scope={scopeId} style={SCOPE_WRAPPER_STYLE}>
      {styleTag}
      {children}
    </div>
  ) : (
    <>
      {styleTag}
      {children}
    </>
  );

  return (
    <ThemeContext.Provider value={value}>
      <DirectionContext.Provider value={dir}>{body}</DirectionContext.Provider>
    </ThemeContext.Provider>
  );
}
ThemeProvider.displayName = 'ThemeProvider';