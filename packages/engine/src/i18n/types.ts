import type { ReactNode } from 'react';

import type { Direction } from '../direction';
import type { InterpolationParams } from './interpolate';

/**
 * BCP 47 locale tag (`'en'`, `'en-US'`, `'he-IL'`, `'ar-EG'`, …).
 *
 * No runtime validation — consumers pass whatever `Intl.*` will accept; the provider
 * derives a direction from the language subtag and otherwise treats it as an opaque string
 * forwarded to formatters and `Intl.Collator`.
 */
export type LocaleTag = string;

/**
 * Re-exported here so consumers can `import type { InterpolationParams } from '@apx-ui/engine'`
 * without reaching into the implementation file.
 */
export type TranslationParams = InterpolationParams;

/**
 * Namespaced message bag.
 *
 * Top-level keys are component namespaces (e.g. `'DataGrid'`, `'Pagination'`). Each
 * namespace's value is typically an object of strings (with optional `{param}` placeholders)
 * or nested objects of strings. Treated as `unknown` here so consumers can plug in their own
 * typed bundles without ceremony; the per-component hook (e.g. `useDataGridTranslations`)
 * reasserts the type.
 *
 * For plural-keyed entries used by `tn()`, the value at the leaf key is a small object
 * keyed by `Intl.LDMLPluralRule` categories:
 *
 *   { items: { one: '{count} item', other: '{count} items' } }
 *
 * @example
 * const messages: I18nMessages = {
 *   DataGrid: { selectAllRows: 'בחר את כל השורות' },
 *   Pagination: { next: 'הבא' },
 *   stepper: { previous: 'הקודם', stepOf: '{current} מתוך {total}' },
 * };
 */
export interface I18nMessages {
  [namespace: string]: unknown;
}

/**
 * Lazy bag of `Intl.*` formatters scoped to the active locale. All entries are constructed
 * on first call and cached by the provider, so consumers don't pay the (non-trivial)
 * `Intl.NumberFormat` construction cost on every render.
 *
 * Designed to cover the >95 % of formatting needs the DS sees in shipped components —
 * NumberInput (currency / percent), DataGrid (number columns, locale-aware sort),
 * DatePicker (date / time / day names), Timeline (relativeTime), CommandPalette (list),
 * Stat (percent / currency / change). For exotic Intl options consumers pass them via the
 * trailing `opts` parameter — the formatter forwards them through.
 */
export interface I18nFormatters {
  /** Locale-aware integer / decimal formatting. `formatters.number(1234.5)` → `"1,234.5"`. */
  number: (value: number, opts?: Intl.NumberFormatOptions) => string;
  /** Currency formatting. `formatters.currency(99.5, 'USD')` → `"$99.50"`. */
  currency: (value: number, currency: string, opts?: Intl.NumberFormatOptions) => string;
  /** Percent formatting. Pass `0.42` (not `42`). `formatters.percent(0.42)` → `"42%"`. */
  percent: (value: number, opts?: Intl.NumberFormatOptions) => string;
  /** Date-only formatting. Accepts `Date`, epoch-ms, or ISO string. */
  date: (value: Date | number | string, opts?: Intl.DateTimeFormatOptions) => string;
  /** Time-only formatting. */
  time: (value: Date | number | string, opts?: Intl.DateTimeFormatOptions) => string;
  /** Combined date + time. */
  dateTime: (value: Date | number | string, opts?: Intl.DateTimeFormatOptions) => string;
  /** Relative time. `formatters.relativeTime(-3, 'day')` → `"3 days ago"`. */
  relativeTime: (
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    opts?: Intl.RelativeTimeFormatOptions,
  ) => string;
  /** List joining. `formatters.list(['a','b','c'])` → `"a, b, and c"` (en). */
  list: (items: readonly string[], opts?: Intl.ListFormatOptions) => string;
  /** Locale-aware string comparison. Useful for sortable Tables / DataGrids. */
  collator: Intl.Collator;
  /** `Intl.PluralRules.select()` shorthand. */
  plural: (value: number, opts?: Intl.PluralRulesOptions) => Intl.LDMLPluralRule;
}

/**
 * The value exposed by `useI18n()`.
 *
 * Stable across renders when `locale` / `direction` / `messages` reference identity is
 * stable — the provider memoizes by those inputs. Consumers that only need a slice (the
 * locale, the direction, just the formatters, just the `t`) should prefer the dedicated
 * selector hooks (`useLocale`, `useDirection`, `useFormatters`, `useTranslator`) which
 * subscribe more narrowly via context.
 */
export interface I18nContextValue {
  /** Resolved locale (BCP 47). */
  locale: LocaleTag;
  /** Resolved reading direction. Auto-derived from `locale` unless explicitly overridden. */
  direction: Direction;
  /**
   * Look up a top-level namespace from the merged messages bag.
   *
   * Backwards-compatible accessor — Phase-26-and-earlier consumers (DataGrid, Scheduler,
   * etc.) rely on this shape. Returns `undefined` if the namespace is absent so callers
   * can fall back to their own defaults without throwing. Type parameter is opt-in:
   *
   * @example
   * const dg = useI18n()?.get<Partial<DataGridTranslations>>('DataGrid');
   */
  get: <T = unknown>(namespace: string) => T | undefined;
  /**
   * Resolve a dotted-path message key with `{param}` interpolation.
   *
   * @example
   *   t('stepper.previous')                          // → "Previous"
   *   t('stepper.stepOf', { current: 2, total: 5 }) // → "Step 2 of 5"
   *
   * Missing keys fall back to:
   *  - `silentMissing: true` (default in production) — returns the key itself, e.g.
   *    `'stepper.previous'`, so the UI keeps rendering.
   *  - `silentMissing: false` (default in development) — throws `MissingI18nKeyError` so
   *    the typo is loud during dev.
   */
  t: (key: string, params?: TranslationParams) => string;
  /**
   * Plural-keyed message resolution.
   *
   * The value at `key` must be an object keyed by `Intl.LDMLPluralRule` categories
   * (`one` / `other` etc.). The active locale's `Intl.PluralRules.select(count)` chooses
   * which entry to use; the chosen string is then interpolated with `{ count, ...params }`.
   *
   * @example
   *   // messages.cart.items = { one: '{count} item', other: '{count} items' }
   *   tn('cart.items', 1)            // → "1 item"
   *   tn('cart.items', 5)            // → "5 items"
   */
  tn: (key: string, count: number, params?: TranslationParams) => string;
  /** Locale-aware formatters (lazy, memoized by locale). */
  formatters: I18nFormatters;
  /**
   * Missing-key behavior. When `true`, missing keys return the key itself; when `false`,
   * they throw `MissingI18nKeyError`. Defaults to `false` in dev, `true` in production.
   */
  silentMissing: boolean;
}

export interface I18nProviderProps {
  /** BCP 47 locale tag. Forwarded to formatters and inferred for direction. */
  locale: LocaleTag;
  /**
   * Explicit reading direction. Defaults to derivation from `locale`'s language subtag
   * (`he`, `ar`, `fa`, `ur`, `ps`, `dv`, `ku`, `sd`, `yi` → `rtl`; everything else → `ltr`).
   * Set this when the locale alone is insufficient — e.g. a transliterated Arabic doc.
   */
  direction?: Direction;
  /**
   * Namespaced messages. Shallow-merged on top of any outer `<I18nProvider>` by namespace key:
   * an inner provider that supplies `{ DataGrid: {...} }` replaces the outer's `DataGrid`
   * namespace wholesale (so callers do not need to recompose per-namespace dictionaries).
   * `locale` and `direction` always replace fully.
   */
  messages?: I18nMessages;
  /**
   * Missing-key behavior. When `undefined`, the provider picks a sensible default based on
   * `NODE_ENV`: `false` (throw) in development, `true` (return the key) in production.
   * Setting this explicitly is recommended for SSR consumers who want deterministic output.
   */
  silentMissing?: boolean;
  /**
   * Override for `Intl.*` formatter construction. Rarely needed; the provider builds one
   * formatter per call site lazily and caches by locale. Useful for tests that need to
   * inject a fake `Intl` implementation, or for consumers polyfilling an older runtime.
   */
  formatters?: Partial<I18nFormatters>;
  children: ReactNode;
}

/**
 * Error thrown for missing `t()` / `tn()` keys when `silentMissing` is `false`. Exposed so
 * consumers can selectively catch and recover (e.g. log to a translator inbox) instead of
 * crashing.
 */
export class MissingI18nKeyError extends Error {
  override name = 'MissingI18nKeyError';
  constructor(public readonly key: string) {
    super(`[@apx-ui/engine/i18n] Missing translation key "${key}".`);
  }
}
