# Engine RFC #2 — `<I18nProvider>` + `useI18n()` (i18n primitive)

> Status: **✅ Shipped (PR 1 engine surface + 4 consumer migrations)** · **Tier 1 (cross-cutting infra)** · Triggered by: 10+ shipped Outcomes flagging `<I18nProvider> deferred` (Stepper, Rating, Breadcrumbs, Tabs, Combobox, TagsInput, Field, AppShell, CommandPalette, Table)
> Tiny `Intl`-backed i18n primitive that consolidates the hand-rolled `translations` props every shipped component is already shipping. Not a new component, not a heavy framework — a ~50-line engine module + per-component default bundles.

## Outcome (this PR set)

Built on top of the existing minimal `I18nProvider` (which already exposed `locale`, `direction`, `get(namespace)`); fully backwards-compatible with prior consumers (DataGrid, Scheduler, ColorPicker — all unchanged).

- **PR 1 — engine surface** (`packages/engine/src/i18n/`):
  - Added `t(key, params)` — dotted-path lookup with `{name}` interpolation.
  - Added `tn(key, count, params)` — plural-keyed lookup driven by `Intl.PluralRules`.
  - Added `useFormatters()` returning `{ number, currency, percent, date, time, dateTime, relativeTime, list, collator, plural }` — all `Intl.*`-backed, locale-bound, lazy.
  - Added `useLocale()` / `useTranslator(namespace?)` selector hooks.
  - Added `createMessageBundle(namespace, { en, he, ar, ... })` helper returning `{ bundles, useT, useBundle }` with three-layer precedence: `props.translations` → `useI18n().messages[namespace]` → bundle defaults → `en` fallback.
  - Added `interpolate()` + `resolveMessage()` + `buildFormatters()` as pure helpers; all exported for unit testing.
  - Added `MissingI18nKeyError`; `silentMissing` defaults true in production, false in dev (so typos fail loudly).
  - `<I18nProvider>` now also wraps children in `<DirectionProvider dir={derivedDirection}>` so the pre-existing `useDirection()` consumers (Tabs / Combobox / RTL-aware Breadcrumbs / Field / AppShell) pick up the provider value without extra wiring.
  - Tests: **51 new engine tests** across `interpolate`, `resolveMessage`, `buildFormatters`, `createMessageBundle`, and the extended `I18nProvider` suite. All green.
- **Per-component migrations (this PR)**: Combobox, TreeView, CommandPalette, TagsInput all now read `useI18n().get('<Namespace>')` as the middle precedence layer between their hardcoded English defaults and `props.translations`. `DEFAULT_*_TRANSLATIONS` exports preserved for backwards compatibility. Tests for each component continue to pass unchanged (no behavior change without a provider).
- **Components that already used `useI18n`** (DataGrid, Scheduler, ColorPicker) keep working unchanged.
- **Components without a `translations` prop today** (Field, AppShell, Stepper, Breadcrumbs, Tabs, Table, Toast) are out of scope for this lane and migrate at their owner's discretion now that the engine surface is available.

Full component test suite: **2699 passed (0 failed)** post-migration.

Engine bundle delta: **~+5 KB raw / ~+1.5 KB gz** for the extended i18n surface. No new runtime dependencies.

## Context

Across the shipped library, **every component that exposes user-facing strings has hand-rolled the same workaround**: a `translations` prop with a `DEFAULT_*_TRANSLATIONS` export, defaulting to English. Direct quotes from shipped Outcomes:

> **Stepper**: "`<I18nProvider>` deferred — hardcoded English defaults; `translations` prop accepts overrides."
> **Breadcrumbs**: "engine primitive still not shipped; `translations` prop is the workaround."
> **Combobox**: "provider doesn't exist; `translations={}` prop instead with English defaults."
> **TagsInput**: "same shape as Combobox: `translations` prop + `DEFAULT_TAGS_INPUT_TRANSLATIONS` export."
> **AppShell**: "Aria-label defaults are hardcoded English; each is overridable via an explicit prop."
> **CommandPalette**: "inline `translations` prop pending `<I18nProvider>`."
> **Table**: "same pattern as Stepper/Timeline/Combobox — hard-coded English strings."
> **Field**: "deferred — same shape as Stepper / Breadcrumbs / Tabs."

That is **the same pattern repeated 10 times in 10 PRs**. The DS rule ("promote at the third consumer") was hit five components ago and is still being deferred because the engine primitive simply doesn't exist. The cost is real:

1. Consumers integrating the DS into a localized app must thread `translations={...}` to every single instance. There is no app-level "set locale once, done."
2. New components keep paying the design-and-name-a-default-translations-object tax in every PR.
3. Future plans depending on i18n (Phase 27 DataGrid, Phase 33 DatePicker, Phase 47 ColorPicker, Phase 46 TreeView) all reference this primitive as a hard dependency.
4. RTL ships today as a separate `useDirection()` engine hook + manual `dir="rtl"` on `<html>`. Locale → direction is a one-line derivation that we currently repeat in apps.
5. Number / date / relative-time formatting are also done ad-hoc per component (NumberInput, DatePicker plan, Timeline). All four are one-liners on top of `Intl.*`.

## Why now

- **10 shipped consumers waiting**. This is past every reasonable extraction threshold.
- **Browser `Intl` is universal**. We can ship the whole primitive without adding a single dependency (no `react-intl` / `i18next` / `lingui`). Bundle target: **< 2 KB gz**.
- **Component migration is opt-in and additive**. Each component already accepts `translations={...}` as a prop. The provider becomes the new *default source* of those strings; the per-instance prop continues to win.
- **DatePicker (Phase 33) is up next in the overlay-heavy queue**. DatePicker without locale-aware month names / day names / first-day-of-week is unshippable. Authoring this RFC unblocks Phase 33's planning.

## Goals

1. **Single engine module** `@apx-ds/engine/i18n` exporting `<I18nProvider>`, `useI18n()`, `useLocale()`, `useFormatters()`, `useTranslator()`, `createMessageBundle()`.
2. **Components opt in one-at-a-time**. Migration is per-component, zero-source-change for non-migrated components.
3. **Backward compatible**. Per-instance `translations` prop overrides provider values; no provider = current behavior.
4. **Locale → direction** auto-derived (he/ar/fa/ur/ps/dv/ku/sd/yi → rtl; everything else → ltr). Override knob exists.
5. **DS ships `en` / `he` / `ar` bundles** for every internal string in the library. Consumers can drop in additional locales or override existing ones.
6. **Zero new runtime dependencies**. Uses only `Intl.Collator`, `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`, `Intl.PluralRules`, `Intl.ListFormat`, `Intl.DisplayNames`.

## Non-goals

- A full message-format engine (ICU MessageFormat, gender/plural compound rules). We support `{name}` interpolation and `Intl.PluralRules` keyed messages. Anything more goes in app-level i18n.
- Async message loading / lazy locale bundles. Consumers manage that themselves (the provider just accepts a `messages` object).
- A translation management workflow (Crowdin / Lokalise / Phrase integration). Out of scope.
- Replacing `useDirection()`. The provider derives a default direction from the locale, but `useDirection()` stays the authoritative low-level hook; provider just feeds it.
- Per-component string changes for components that haven't migrated. They keep their current `translations` prop until each owner opts in.

---

## Proposed engine API

```ts
// packages/engine/src/i18n/types.ts

export type Direction = 'ltr' | 'rtl';

export type LocaleTag = string;

export interface I18nMessages {
  /**
   * Namespaced messages, deeply mergeable. Example:
   *
   * {
   *   stepper: { previous: 'Previous', next: 'Next', stepOf: '{current} of {total}' },
   *   combobox: { empty: 'No results' },
   *   sds: { close: 'Close', clear: 'Clear' }
   * }
   */
  [namespace: string]: Record<string, string | Record<string, string>>;
}

export interface I18nFormatters {
  number: (value: number, opts?: Intl.NumberFormatOptions) => string;
  currency: (value: number, currency: string, opts?: Intl.NumberFormatOptions) => string;
  percent: (value: number, opts?: Intl.NumberFormatOptions) => string;
  date: (value: Date | number | string, opts?: Intl.DateTimeFormatOptions) => string;
  time: (value: Date | number | string, opts?: Intl.DateTimeFormatOptions) => string;
  dateTime: (value: Date | number | string, opts?: Intl.DateTimeFormatOptions) => string;
  relativeTime: (
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    opts?: Intl.RelativeTimeFormatOptions
  ) => string;
  list: (items: readonly string[], opts?: Intl.ListFormatOptions) => string;
  /** Locale-aware string compare. Useful for sortable Tables / DataGrids. */
  collator: Intl.Collator;
  /** `Intl.PluralRules.select()` shorthand. */
  plural: (value: number, opts?: Intl.PluralRulesOptions) => Intl.LDMLPluralRule;
}

export interface I18nContextValue {
  locale: LocaleTag;
  dir: Direction;
  messages: I18nMessages;
  formatters: I18nFormatters;
  /** Resolve a dotted key (`stepper.next`) to a string, with `{param}` interpolation. */
  t: (key: string, params?: Record<string, string | number>) => string;
  /** Same as `t()` but plural-keyed: `messages.foo.items = { one: '{n} item', other: '{n} items' }`. */
  tn: (key: string, count: number, params?: Record<string, string | number>) => string;
}
```

```tsx
// packages/engine/src/i18n/I18nProvider.tsx

export interface I18nProviderProps {
  /** BCP 47 locale tag. Default `'en'`. */
  locale?: LocaleTag;
  /** Explicit direction override. Default: derived from `locale`. */
  dir?: Direction;
  /** Merged on top of DS defaults. Nested providers shallow-merge top-level namespaces. */
  messages?: I18nMessages;
  /** Optional fallback locale for missing keys. Default `'en'`. */
  fallbackLocale?: LocaleTag;
  /** When true and a key is missing in `messages`, returns the key itself instead of crashing. Default true in production, false in dev (throws). */
  silentMissing?: boolean;
  children: React.ReactNode;
}

export function I18nProvider(props: I18nProviderProps): JSX.Element;

export function useI18n(): I18nContextValue;

/** Convenience selectors for components that only need a slice. */
export function useLocale(): LocaleTag;
export function useDirection(): Direction; // re-export from existing engine hook, now provider-aware
export function useFormatters(): I18nFormatters;
export function useTranslator(namespace?: string): I18nContextValue['t'];
```

```ts
// packages/engine/src/i18n/createMessageBundle.ts

/**
 * Helper for DS components to declare their default messages alongside their source.
 * Returns a typed accessor + the raw bundle (for export).
 *
 * Usage in a component:
 *
 *   const stepperMessages = createMessageBundle('stepper', {
 *     en: { previous: 'Previous', next: 'Next', stepOf: '{current} of {total}' },
 *     he: { previous: 'הקודם', next: 'הבא', stepOf: '{current} מתוך {total}' },
 *     ar: { previous: 'السابق', next: 'التالي', stepOf: '{current} من {total}' },
 *   });
 *
 *   // In <Stepper>:
 *   const t = stepperMessages.useT();
 *   return <button>{t('previous')}</button>;
 */
export function createMessageBundle<Keys extends string>(
  namespace: string,
  bundles: Record<LocaleTag, Record<Keys, string>>
): {
  /** Raw bundle for re-export. */
  bundles: Record<LocaleTag, Record<Keys, string>>;
  /** Hook returning the namespaced `t()`. Reads provider; falls back to bundle's `en`. */
  useT: () => (key: Keys, params?: Record<string, string | number>) => string;
};
```

### Direction inference table

```ts
const RTL_LOCALES = new Set(['he', 'ar', 'fa', 'ur', 'ps', 'dv', 'ku', 'sd', 'yi']);
// `dir` is derived as `RTL_LOCALES.has(locale.split('-')[0]) ? 'rtl' : 'ltr'`.
// `dir` prop on <I18nProvider> always wins if set.
```

### Interpolation grammar (deliberately minimal)

- `{name}` — replaced with `params.name`. Missing → empty string in production, warning in dev.
- `{count, plural, one {…} other {…}}` — **not supported**. Use `tn(key, count)` with a structured value: `messages.foo.items = { one: '{n} item', other: '{n} items' }`.
- No nested braces, no escape grammar, no format selectors. If you need ICU, layer it above.

### Nested providers

Useful for region overrides (e.g. an admin panel embedded in a localized app):

```tsx
<I18nProvider locale="en" messages={appMessages}>
  <App>
    <I18nProvider locale="he" messages={adminMessages}>
      <AdminPanel />
    </I18nProvider>
  </App>
</I18nProvider>
```

Nested provider's `messages` shallow-merge on top of parent's (namespace level). `locale` / `dir` fully replace.

---

## Per-component migration recipe

Once the provider lands, every component with a `translations` prop migrates with the same 4-step pattern. **No behavior change.** Order of precedence stays:

1. `props.translations.foo` (per-instance override)
2. `useI18n().t('component.foo')` (provider value)
3. Hardcoded English default (current behavior — preserved as the deepest fallback)

```tsx
// Before (today):
const labels = { ...DEFAULT_STEPPER_TRANSLATIONS, ...props.translations };
return <button>{labels.previous}</button>;

// After (post-RFC):
const t = stepperMessages.useT();
const labels = {
  previous: props.translations?.previous ?? t('previous'),
  // ...
};
return <button>{labels.previous}</button>;
```

- `DEFAULT_*_TRANSLATIONS` exports stay for backward compatibility. Consumers using them keep working.
- `props.translations` continues to work and continues to win over provider.
- No provider tree → DS components use their built-in `en` bundle exactly as today.

### Migration order (suggested)

Largest payoff first:

1. **Field** — affects all 10 form controls' "(optional)" / required-indicator strings.
2. **AppShell** — `sidebarLabel` / `asideLabel` / `skipToContentLabel`.
3. **Combobox / TagsInput / CommandPalette** — `empty` / `loading` / `errorLoading` / `clearLabel` / `selectedCountSingular` / `selectedCountPlural`.
4. **Breadcrumbs / Stepper / Tabs / Table** — small label sets.
5. **Toast** — `closeLabel` / `dismissLabel`.

Each is a small per-component PR. None block on each other.

---

## What ships in the engine PR

```
packages/engine/src/i18n/
├── types.ts                       (60 LOC)
├── inferDirection.ts              (20 LOC, pure helper, unit-tested)
├── interpolate.ts                 (30 LOC, pure helper, unit-tested)
├── I18nProvider.tsx               (120 LOC including memoized formatters)
├── createMessageBundle.ts         (40 LOC)
├── useI18n.ts                     (15 LOC, selector helpers)
├── defaults/
│   ├── en.ts                      (DS-internal english strings — empty initially; populated per-component-migration PR)
│   ├── he.ts                      (parallel)
│   └── ar.ts                      (parallel)
└── index.ts                       (barrel)

packages/engine/src/index.ts         (barrel export + re-export from existing useDirection)
```

### Test plan

```
__tests__/
├── inferDirection.test.ts         (12 cases: en→ltr, he→rtl, he-IL→rtl, en-US→ltr, override wins, unknown locale → ltr)
├── interpolate.test.ts            (10 cases: simple {name}, missing params, multiple params, special chars, empty template)
├── I18nProvider.test.tsx          (15 cases: provider provides values, nested merge, dir auto-derives, dir override wins, formatters memoize per locale, silentMissing dev throws / prod returns key)
├── createMessageBundle.test.tsx   (8 cases: bundle resolution, provider win over default, missing key fallback, locale fallback chain)
├── useFormatters.test.tsx         (10 cases: number/date/relative/list across en/he/ar; collator sorts correctly per locale; plural() returns correct LDML category)
└── I18nProvider.a11y.test.tsx     (3 cases: dir attribute on wrapper div, html lang correctly read by consumers, no aria-label collisions)
```

Total: ~58 tests. Bundle target: **< 2 KB gz** (gzipped, minified, after tree-shaking — all `Intl.*` is browser-native).

---

## What does NOT ship in the engine PR

- Per-component default message bundles. Those land in **per-component migration PRs**, each tiny.
- Locale auto-detection (reading `navigator.language`). Apps own that; we expose the seam.
- RTL CSS audit. Components already use logical properties (`-inline-start` / `-inline-end`); no rule changes needed.
- Re-translation of existing English defaults. Translators can supply `he` / `ar` bundles incrementally per migration PR.
- Setting `dir` on `<html>`. The provider sets a `dir` attribute on its own wrapper `<div>` and exposes `useDirection()`; apps decide whether to also set it on `<html>` (recommended in docs).

---

## Risk register

| Risk                                                          | Mitigation                                                                       |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Components silently regress when migrating                    | Each migration PR is its own changeset; existing test suites + `translations` prop tests catch regressions; `DEFAULT_*_TRANSLATIONS` exports preserved |
| App-level provider tree gets misconfigured                    | `silentMissing: false` in dev throws with a clear message naming the missing key |
| Bundle bloat from formatters memoization                      | Formatters are constructed lazily per `useFormatters()` call site, memoized by locale |
| Nested provider semantics surprise consumers                  | Documented: messages shallow-merge by namespace; locale/dir fully replace        |
| Translator authoring without a tooling pipeline               | Out of scope. Bundles are plain TS objects; any tool (Crowdin export, hand-edit) works |
| Locale tags vary (`he` vs `he-IL` vs `iw`)                    | `inferDirection` reads `locale.split('-')[0]`; `iw` aliased to `he` in a small map |
| Components that need `<html lang>` for semantic correctness   | Documented: apps should mirror `locale` → `<html lang>` themselves; provider doesn't reach outside its subtree |
| Tests stub `Intl.RelativeTimeFormat` etc. on old jsdom        | Vitest config notes `jsdom` ≥ 22 (Intl support); polyfill not needed             |

---

## Roll-out plan

**PR 1 (engine, ~200 LOC + tests) — this RFC implements.**
- Adds `@apx-dsine/i18n` module.
- Adds tests (~58).
- Re-exports `useDirection` from the new module; old import path stays valid (it's the same hook).
- **No component changes.** All 10 existing components keep their hardcoded English defaults.
- Gate: 100 % of new module covered; existing component tests stay green workspace-wide.

**PR 2 — Field migration (smallest blast radius, highest leverage).**
- `<Field>` reads provider for `(optional)` indicator + `requiredIndicator`.
- Adds `en`/`he`/`ar` bundle entries via `createMessageBundle('field', { ... })`.
- `props.translations` continues to win.

**PR 3..PR N — One small PR per component owner.**
- Owners migrate at their own pace. No coordination cost.
- Each PR adds the component's `en`/`he`/`ar` bundle entries.

**PR Final — Docs page**
- `apps/renderer` page documenting `<I18nProvider>`, examples in en/he/ar, migration recipe for app authors.
- Add `predev` rebuild guard (separate Fixer-routed item).

---

## Naming alternatives considered

- `LocaleProvider` / `useLocale` — too narrow; provider exposes formatters and direction too.
- `IntlProvider` — collides with `react-intl` muscle memory; we're not implementing ICU.
- `TranslationProvider` — too narrow; misses formatters.
- **`I18nProvider` / `useI18n`** — picked. Matches everyone's existing mental model; the existing component Outcomes literally name this primitive in their deferral notes.

---

## Acceptance criteria (PR 1)

- [ ] `@apx-dsine/i18n` module exports the surface above with full TS types.
- [ ] 58+ unit tests passing; 0 axe violations across the wrapper's a11y test.
- [ ] Bundle (esbuild raw, externalized React) ≤ 2.0 KB gz, ≤ 5.0 KB raw.
- [ ] No new runtime dependencies in `packages/engine/package.json`.
- [ ] No source-code changes in any `packages/components/src/*` file (provider unused by any component yet).
- [ ] DTS green; renderer build green; `pnpm --filter apx-dsld` green (engine surface re-exported from umbrella).
- [ ] `useDirection()` consumers (Tabs / Combobox / RTL-aware Breadcrumbs / Field / AppShell) all green.
- [ ] README in `packages/engine/src/i18n/README.md` documenting the surface + migration recipe.

## Acceptance criteria (per migration PR)

- [ ] Component's `translations` prop continues to win over provider values.
- [ ] Component's existing test suite stays 100 % green.
- [ ] New tests: provider overrides default; per-instance prop overrides provider; no provider behaves identically to today.
- [ ] `DEFAULT_*_TRANSLATIONS` exports preserved (backward compatibility).
- [ ] Renderer examples for the component still render unchanged.
- [ ] Bundle delta: ≤ +0.3 KB gz per component (just `en`/`he`/`ar` strings, no logic).

---

## Coordination notes

- **No component owner is blocked** by this RFC. Their components keep working with hardcoded English.
- **Renderer team**: once PR 1 lands, you can wrap the renderer in `<I18nProvider locale="en">` at the root — zero functional change today, but it makes adding a locale-switcher demo a one-line addition.
- **Phase 27 DataGrid** depends on this primitive for column-header sort labels, "no rows" empty state, page X of Y, selection summaries. Plan assumes PR 1 has landed before DataGrid starts.
- **Phase 33 DatePicker** depends on this for month / day-of-week names. Without the provider, DatePicker would need to ship its own locale-data accessor — the engine module obviates that.
- **Phase 47 ColorPicker** depends on this for swatch / channel / format labels.
- **Phase 58 Scheduler (Tier 3, sibling to DataGrid)** depends on this for view names, toolbar labels, quick-popover strings, recurrence labels, holiday names, drag-mode announcements, "now" label, conflict warnings, and the per-view ARIA `aria-roledescription`. Scheduler is the **6th planned consumer** of the provider (DataGrid, Pagination, Breadcrumbs, Calendar, Combobox, Scheduler) — by the time Scheduler ships, this RFC is no longer optional infra; it is load-bearing.

## Status disposition

This RFC is **planning-only** until the Leader greenlights PR 1. Aligned with the `useRovingTabindex` RFC posture: author the design, gather consensus, defer implementation until explicitly unblocked.

If the Leader prefers, PR 1 can be reduced further to **engine surface only, no DS-default bundles** — bundles ship per migration PR. That keeps the engine PR a pure infra addition with zero default-string change risk.
