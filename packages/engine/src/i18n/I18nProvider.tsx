'use client';

import { createContext, useContext, useMemo, type ReactElement } from 'react';

import { DirectionProvider } from '../direction';
import { buildFormatters } from './buildFormatters';
import { inferDirection } from './inferDirection';
import { interpolate } from './interpolate';
import { mergeMessages } from './mergeMessages';
import { resolveMessage } from './resolveMessage';
import {
  MissingI18nKeyError,
  type I18nContextValue,
  type I18nFormatters,
  type I18nMessages,
  type I18nProviderProps,
  type TranslationParams,
} from './types';

/**
 * Internal context value carries the merged message bag so nested providers can pick it
 * up without re-walking the React tree. The exported `I18nContextValue` deliberately
 * omits this field — public consumers go through `get()` / `t()` / `tn()`.
 */
interface InternalI18nContextValue extends I18nContextValue {
  readonly __messages: I18nMessages;
}

/**
 * Context default is `null` (no provider). `useI18n()` returns `null` in that case so
 * consumers can fall back to their own English defaults without throwing.
 */
export const I18nContext = createContext<InternalI18nContextValue | null>(null);
I18nContext.displayName = 'ApxI18nContext';

/**
 * Provide locale, direction, translations, and `Intl.*` formatters to a subtree.
 *
 * The provider exposes five layers:
 *
 *  - **Locale** (`useLocale()` or `useI18n().locale`) — BCP 47 tag used by formatters.
 *  - **Direction** (`useDirection()` or `useI18n().direction`) — `'ltr'` / `'rtl'`, derived
 *    from `locale` unless overridden via the `direction` prop. The provider also wraps its
 *    children in a `<DirectionProvider>` so the existing `useDirection()` consumers pick
 *    up the new value without extra wiring.
 *  - **Messages** (`useI18n().get('Namespace')` for the namespace shape; `t(key)` /
 *    `tn(key, count)` for dotted-path lookups with interpolation). Nested providers
 *    shallow-merge messages by top-level namespace.
 *  - **Formatters** (`useFormatters()` or `useI18n().formatters`) — `Intl.NumberFormat`,
 *    `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`, `Intl.ListFormat`, `Intl.Collator`,
 *    `Intl.PluralRules` — all lazy + memoized per locale.
 *  - **Missing-key policy** (`silentMissing`) — when `false` (default in dev), missing
 *    translation keys throw `MissingI18nKeyError` so typos are loud. When `true` (default
 *    in production), missing keys return the key itself so the UI keeps rendering.
 *
 * The context value is memoized by `(outer identity, locale, direction, messages,
 * silentMissing, formatters overrides)` so passing a stable `messages` object avoids
 * re-rendering every consumer on unrelated re-renders.
 *
 * @example
 *   <I18nProvider locale="he" messages={{ DataGrid: heDataGridMessages }}>
 *     <App />
 *   </I18nProvider>
 */
export function I18nProvider({
  locale,
  direction,
  messages,
  silentMissing,
  formatters: formattersOverride,
  children,
}: I18nProviderProps): ReactElement {
  const outer = useContext(I18nContext);

  const value = useMemo<InternalI18nContextValue>(() => {
    const resolvedDirection = direction ?? inferDirection(locale);
    const merged = mergeMessages(outer?.__messages, messages);
    const formatters: I18nFormatters = buildFormatters(locale, formattersOverride);

    // `silentMissing` defaults to a `NODE_ENV` heuristic so dev catches typos loudly and
    // production never crashes on a missing string. Tests can pin to either value
    // explicitly.
    const resolvedSilentMissing =
      silentMissing ??
      (typeof process !== 'undefined' &&
      process.env &&
      process.env.NODE_ENV === 'production'
        ? true
        : false);

    const get = <T,>(namespace: string): T | undefined =>
      merged[namespace] as T | undefined;

    /**
     * Resolve a dotted-path key against the merged messages bag, interpolate `{param}`
     * placeholders, and return the resulting string. Handles missing-key policy.
     */
    const t = (key: string, params?: TranslationParams): string => {
      const found = resolveMessage(merged, key);
      if (typeof found === 'string') return interpolate(found, params);
      if (resolvedSilentMissing) return key;
      throw new MissingI18nKeyError(key);
    };

    /**
     * Plural-keyed translation. Expects the leaf at `key` to be `{ [LDMLPluralRule]:
     * string }` (e.g. `{ one: '{count} item', other: '{count} items' }`). Picks the entry
     * via `Intl.PluralRules.select(count)`, then interpolates with `{ count, ...params }`.
     *
     * Missing leaf object → same missing-key policy as `t()`. Missing plural category for
     * the count (e.g. the message only defines `other` but the count selects `one`) falls
     * back to `other` if present, otherwise the first available entry.
     */
    const tn = (key: string, count: number, params?: TranslationParams): string => {
      const found = resolveMessage(merged, key);
      const isPluralBag = (v: unknown): v is Record<string, string> =>
        typeof v === 'object' && v !== null && !Array.isArray(v);
      if (!isPluralBag(found)) {
        if (resolvedSilentMissing) return key;
        throw new MissingI18nKeyError(key);
      }
      const category = formatters.plural(count);
      const template =
        found[category] ?? found.other ?? Object.values(found).find((s) => typeof s === 'string');
      if (typeof template !== 'string') {
        if (resolvedSilentMissing) return key;
        throw new MissingI18nKeyError(key);
      }
      return interpolate(template, { count, ...params });
    };

    return {
      locale,
      direction: resolvedDirection,
      get,
      t,
      tn,
      formatters,
      silentMissing: resolvedSilentMissing,
      __messages: merged,
    };
  }, [outer, locale, direction, messages, silentMissing, formattersOverride]);

  return (
    <I18nContext.Provider value={value}>
      <DirectionProvider dir={value.direction}>{children}</DirectionProvider>
    </I18nContext.Provider>
  );
}
I18nProvider.displayName = 'I18nProvider';

/**
 * Read the nearest `I18nProvider` context value.
 *
 * Returns `null` when no provider is present so callers can fall back to their own
 * English defaults without crashing. Component-side translation hooks (e.g.
 * `useDataGridTranslations`, `useStepperTranslations`) wrap this and apply the three-layer
 * precedence:
 *
 *   1. `props.translations` (per-instance override)
 *   2. `useI18n()?.t('component.foo')` (provider value)
 *   3. Built-in English defaults
 */
export function useI18n(): I18nContextValue | null {
  return useContext(I18nContext);
}

/** Read just the locale. Suitable for `Intl.*` calls that want a stable string. */
export function useLocale(): string | null {
  return useContext(I18nContext)?.locale ?? null;
}

/** Read just the formatters bag. Returns `null` when no provider is present. */
export function useFormatters(): I18nFormatters | null {
  return useContext(I18nContext)?.formatters ?? null;
}

/**
 * Read a namespaced translator function. Returns a function that prefixes every key with
 * `namespace.` — convenient inside a component that always reads from the same namespace.
 *
 * When no provider is present, returns a fallback function that simply echoes the key back
 * with `{param}` interpolation applied; consumers can detect the no-provider case with
 * `useI18n() === null` if they care.
 *
 * @example
 *   const t = useTranslator('stepper');
 *   t('previous')                          // → "Previous" (looks up 'stepper.previous')
 *   t('stepOf', { current: 2, total: 5 }) // → "Step 2 of 5"
 */
export function useTranslator(
  namespace?: string,
): (key: string, params?: TranslationParams) => string {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return (key, params) => interpolate(key, params);
  }
  if (!namespace) return ctx.t;
  return (key, params) => ctx.t(`${namespace}.${key}`, params);
}
