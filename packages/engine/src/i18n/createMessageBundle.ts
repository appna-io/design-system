'use client';

import { useContext, useMemo } from 'react';

import { I18nContext } from './I18nProvider';
import { interpolate } from './interpolate';
import { resolveMessage } from './resolveMessage';
import type { LocaleTag, TranslationParams } from './types';

/**
 * A bundle declaration for a single namespace: one record per locale, each containing the
 * same set of keys. The `en` locale is treated as the required source-of-truth: any keys
 * present in `en` must also exist in every other locale (TypeScript enforces this via the
 * `Bundles` generic — see overload below).
 */
export type LocaleBundles<Keys extends string = string> = {
  /** English default — the source-of-truth. Always required. */
  en: Record<Keys, string>;
  /** Additional locales. Authoring tools may add `he`, `ar`, `fr`, etc. */
  [locale: string]: Record<Keys, string>;
};

export interface MessageBundle<Keys extends string = string> {
  /** Namespace passed to `createMessageBundle`. */
  readonly namespace: string;
  /** Raw bundle entries, re-exportable by the consuming component. */
  readonly bundles: LocaleBundles<Keys>;
  /**
   * Hook that returns a typed `t(key, params)` function. Resolution order:
   *
   *  1. `<I18nProvider messages={{ [namespace]: { ... } }}>` — if the provider supplies
   *     a value for this key in the active locale, that wins.
   *  2. `bundles[provider.locale][key]` — locale-specific default from the bundle.
   *  3. `bundles.en[key]` — English fallback.
   *  4. Returns the key itself (silentMissing) or throws (dev) — same policy as `t()`.
   *
   * The returned function is memoized per `(provider, namespace, locale)` so referential
   * equality is stable across renders that don't change the provider.
   */
  readonly useT: () => (key: Keys, params?: TranslationParams) => string;
  /**
   * Same as `useT()` but returns the whole bundle for the active locale as a plain object
   * with per-instance overrides shallow-merged on top. Useful for components that want to
   * destructure a fixed set of keys (`const { previous, next } = useBundle({ previous: 'P' })`)
   * rather than calling `t('previous')` per key.
   */
  readonly useBundle: (
    overrides?: Partial<Record<Keys, string>>,
  ) => Record<Keys, string>;
}

/**
 * Declare a component-local message bundle.
 *
 * The bundle owns the component's English defaults *and* any in-tree translations the DS
 * ships (typically just `en`; consumers may add `he` / `ar` / etc. either by extending
 * the bundle in their fork or by passing them via `<I18nProvider messages={...}>`).
 *
 * Usage at the component-author site:
 *
 *   const stepperBundle = createMessageBundle('stepper', {
 *     en: { previous: 'Previous', next: 'Next', stepOf: 'Step {current} of {total}' },
 *     he: { previous: 'הקודם', next: 'הבא', stepOf: 'שלב {current} מתוך {total}' },
 *   });
 *
 *   // Inside <Stepper>:
 *   const t = stepperBundle.useT();
 *   return <button aria-label={t('previous')}>‹</button>;
 *
 * Usage at the app-author site (optional override):
 *
 *   <I18nProvider locale="he" messages={{ stepper: { next: 'קדימה' } }}>
 *
 * The provider's `stepper.next` wins; the bundle's `stepper.previous` is still used for
 * keys the app didn't override.
 */
export function createMessageBundle<Keys extends string>(
  namespace: string,
  bundles: LocaleBundles<Keys>,
): MessageBundle<Keys> {
  const englishDefaults = bundles.en;

  /**
   * Resolve the rendering of a single key by walking the precedence ladder. Pure — kept
   * out of the hook so the hook body can stay tiny + the resolver gets unit tests.
   */
  const resolveKey = (
    locale: LocaleTag | null,
    providerMessages: Record<string, unknown> | undefined,
    silentMissing: boolean,
    key: Keys,
    params: TranslationParams | undefined,
  ): string => {
    // 1) Provider override: lookup `messages.<namespace>.<key>` via the dotted-path resolver
    //    (allows nested key shapes like `stepper.icons.next` if the consumer chooses).
    if (providerMessages) {
      const fromProvider = resolveMessage(providerMessages, `${namespace}.${key}`);
      if (typeof fromProvider === 'string') {
        return interpolate(fromProvider, params);
      }
    }
    // 2) Locale-specific bundle entry.
    if (locale) {
      const localeBundle = bundles[locale] ?? bundles[locale.split('-')[0] ?? ''];
      if (localeBundle && typeof localeBundle[key] === 'string') {
        return interpolate(localeBundle[key], params);
      }
    }
    // 3) English fallback.
    if (englishDefaults && typeof englishDefaults[key] === 'string') {
      return interpolate(englishDefaults[key], params);
    }
    // 4) Missing — soft fallback or throw, mirroring the provider's `t()` policy.
    if (silentMissing) return String(key);
    throw new Error(
      `[@apx-ui/engine/i18n] Missing translation key "${namespace}.${String(key)}".`,
    );
  };

  const useT: MessageBundle<Keys>['useT'] = () => {
    const ctx = useContext(I18nContext);
    const locale = ctx?.locale ?? null;
    const providerMessages = ctx?.['__messages' as keyof typeof ctx] as
      | Record<string, unknown>
      | undefined;
    const silentMissing = ctx?.silentMissing ?? true;
    return useMemo(
      () =>
        (key: Keys, params?: TranslationParams): string =>
          resolveKey(locale, providerMessages, silentMissing, key, params),
      [locale, providerMessages, silentMissing],
    );
  };

  const useBundle: MessageBundle<Keys>['useBundle'] = (overrides) => {
    const t = useT();
    return useMemo(() => {
      const keys = Object.keys(englishDefaults) as Keys[];
      const result: Record<Keys, string> = {} as Record<Keys, string>;
      for (const key of keys) {
        const override = overrides?.[key];
        result[key] = typeof override === 'string' ? override : t(key);
      }
      return result;
      // `t` identity already encodes (locale, provider, silentMissing); adding `overrides`
      // covers per-instance changes. Stable references in → stable result out.
    }, [t, overrides]);
  };

  return {
    namespace,
    bundles,
    useT,
    useBundle,
  };
}