# Phase 40 — `<Stat />` + `<StatGroup />`

> Status: **Pending** · **Tier 2** · Depends on: Phase 5 (Text typography), Phase 14 (Icon), Phase 27 (I18nProvider — optional), Phase 39 (Spinner)
> Display primitive for dashboards & analytics surfaces.

## Objective

Ship the **dashboard metric tile** — `<Stat />` — together with **`<StatGroup />`** for laying out several stats with consistent dividers and responsive collapse.

Dashboards are a top-3 use case for every B2B product. Today consumers compose:

```tsx
<Card>
  <Card.Body>
    <div className="text-sm text-muted">Revenue</div>
    <div className="text-3xl font-semibold">$12,400</div>
    <div className="text-sm text-success">+12.3% MoM</div>
  </Card.Body>
</Card>
```

…by hand, ~7 lines per tile, no shared semantics, no formatting helpers, no a11y. Phase 40 ships a single primitive that handles label / value / delta / formatting / states.

---

## Public API

```tsx
import { Stat, StatGroup } from 'apx-ds';

// Basic
<Stat label="Revenue" value="$12,400" />

// With delta
<Stat label="Active users" value={1240} delta={{ value: 12.3, direction: 'up' }} />

// Locale-aware numeric value
<Stat
  label="Conversion"
  value={0.214}
  format="percent"                // 21.4%
  fractionDigits={1}
/>

// Currency
<Stat
  label="MRR"
  value={84512}
  format="currency"
  currency="USD"
/>

// With icon + caption
<Stat
  label="Orders today"
  icon={<Icon name="shopping-cart" />}
  value={47}
  caption="vs 39 yesterday"
/>

// With trend chart slot
<Stat label="Signups" value={120} delta={{ value: 5, direction: 'up' }}>
  <Sparkline data={signupSeries} />
</Stat>

// Loading + error states
<Stat label="Revenue" loading />
<Stat label="Revenue" error="Failed to load" />

// Variants
<Stat label="Revenue" value="$12,400" size="lg" variant="elevated" />
<Stat label="Revenue" value="$12,400" align="end" />

// StatGroup — laid out horizontally with dividers
<StatGroup divider>
  <Stat label="Revenue" value="$12.4k" />
  <Stat label="Orders" value={47} />
  <Stat label="Conversion" value={0.214} format="percent" />
</StatGroup>

// Responsive collapse: row at md+, column on mobile
<StatGroup direction={{ base: 'column', md: 'row' }} divider gap={4}>
  …
</StatGroup>

// Full Stat prop form
<Stat
  /* content */
  label                        // string | ReactNode (required)
  value                        // string | number | ReactNode (required unless loading/error)
  caption                      // string | ReactNode — secondary line beneath value
  icon                         // ReactNode
  delta={{                     // optional delta indicator
    value: 12.3,               // number — percentage points
    direction: 'up',           // 'up' | 'down' | 'neutral'
    label: undefined,          // override "+12.3%" string
    suffix: '%',               // default '%'
    inverse: false,            // boolean — flip color logic (e.g. churn going down is GOOD)
  }}

  /* formatting */
  format                       // 'auto' | 'number' | 'currency' | 'percent' | 'compact'
  currency                     // ISO code for format=currency (USD, EUR, …)
  fractionDigits               // number 0-4
  locale                       // string — overrides I18nProvider locale

  /* visual */
  variant="default"            // 'default' | 'elevated' | 'minimal'
  size="md"                    // 'sm' | 'md' | 'lg'
  align="start"                // 'start' | 'center' | 'end'
  colorize="auto"              // 'auto' | 'never' — whether delta tint applies to delta only or value too

  /* states */
  loading={false}              // shows <Spinner> + sr-only "Loading"
  error                        // string | undefined — shows error message instead of value

  /* slots */
  children                     // ReactNode — rendered below caption (e.g. sparkline)

  /* polymorphism */
  as="div"
  asChild={false}

  className=""
  style={{}}
  ref={…}
/>

// StatGroup prop form
<StatGroup
  direction="row"              // ResponsiveValue<'row' | 'column'>
  gap={4}                      // ResponsiveValue<number>
  divider={false}              // boolean | ReactNode — auto-insert <Divider /> between stats
  align="stretch"
  justify="start"
  className=""
  ref={…}
>
  {stats}
</StatGroup>
```

---

## API Decisions

| Decision                                                            | Why                                                                                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **`delta` is a structured object, not a string**                    | Lets the component handle color (success / danger / neutral), icon direction, and inversion logic. Consumer doesn't reinvent the wheel. |
| **`format` + `Intl.NumberFormat`**                                  | Auto-localizes when wrapped in `<I18nProvider>`. Default `format="auto"`: string passes through, number gets `Intl.NumberFormat` with grouping. |
| **`inverse` on delta**                                              | "Churn down 5%" is good. Consumer flips the color logic by setting `inverse: true`.                          |
| **Loading state renders `<Spinner>`**                               | Consistent with rest of DS; respects reduced motion.                                                           |
| **`StatGroup` uses `<Divider>`**                                   | Consistent with Stack `divider` prop; auto-orients (vertical divider for row direction, horizontal for column). |
| **No internal "data fetching"**                                     | Stat is presentational. Loading / error are controlled props.                                                |
| **`size` covers 3 sizes**                                           | sm (compact dashboard widgets) / md (default) / lg (hero KPI tiles).                                          |
| **`align="end"` for RTL-friendly right-aligned tiles**              | Logical-end via `text-align: end` so it reverses in RTL automatically.                                       |
| **Compound `Stat.Label`, `Stat.Value`, `Stat.Delta`** as opt-in subcomponents | For consumers who need full control over composition (icon between label and value, etc). Static prop-driven API stays primary. |

---

## Compound subcomponents

Beyond the prop-driven API, Stat exposes subcomponents for advanced composition:

```tsx
<Stat>
  <Stat.Icon><Icon name="dollar" /></Stat.Icon>
  <Stat.Label>Revenue</Stat.Label>
  <Stat.Value>$12,400</Stat.Value>
  <Stat.Delta value={12.3} direction="up" />
  <Stat.Caption>vs last month</Stat.Caption>
</Stat>
```

When children include any `Stat.*` subcomponent, the prop-driven shortcuts (`label`, `value`, etc.) are **ignored** — the dev opted into compound mode.

| Subcomponent  | Role / Notes                                       |
| ------------- | -------------------------------------------------- |
| `Stat.Icon`   | Decorative leading icon. `aria-hidden`.            |
| `Stat.Label`  | `<dt>` semantic when inside `<dl>` (auto-detect).   |
| `Stat.Value`  | `<dd>` semantic when inside `<dl>`. Bold + larger.  |
| `Stat.Delta`  | Delta tile (value + arrow icon). Color from `direction` + `inverse`. |
| `Stat.Caption`| Smaller muted text below value.                    |

---

## File Structure

```
packages/components/src/Stat/
├── Stat.tsx
├── StatGroup.tsx
├── Stat.types.ts
├── Stat.recipe.ts
├── Stat.context.ts                 # carries size + colorize from Stat to subcomponents
├── formatValue.ts                  # pure helper — Intl.NumberFormat + format + currency + fractionDigits
├── deltaPresentation.ts            # pure: { value, direction, inverse } → { tone, icon, sign, formatted }
├── Stat.test.tsx
├── StatGroup.test.tsx
├── Stat.a11y.test.tsx
├── formatValue.test.ts
├── deltaPresentation.test.ts
├── index.ts                        # exports: Stat, StatGroup, types
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── WithDelta.tsx
    ├── DeltaInverse.tsx            # churn going down = good
    ├── Currency.tsx
    ├── Percent.tsx
    ├── Compact.tsx                 # 12.4k formatting
    ├── WithIcon.tsx
    ├── WithSparkline.tsx
    ├── Sizes.tsx
    ├── Variants.tsx                # default / elevated / minimal
    ├── Loading.tsx
    ├── Error.tsx
    ├── Compound.tsx                # Stat.Label / Stat.Value / Stat.Delta usage
    ├── Group.tsx
    ├── GroupResponsive.tsx
    └── DashboardGrid.tsx           # realistic 4-tile KPI dashboard
```

---

## Recipe sketches

```ts
export const statRecipe = cv({
  base: 'inline-flex flex-col min-w-0',
  variants: {
    variant: {
      default: '',
      elevated:
        'rounded-lg border border-(--sds-color-border-subtle) bg-(--sds-color-surface-raised) p-4 shadow-sm',
      minimal: 'gap-0.5',
    },
    size: {
      sm: 'gap-0.5',
      md: 'gap-1',
      lg: 'gap-1.5',
    },
    align: {
      start: 'items-start text-start',
      center: 'items-center text-center',
      end: 'items-end text-end',
    },
  },
  defaultVariants: { variant: 'default', size: 'md', align: 'start' },
});

export const statValueRecipe = cv({
  base: 'font-semibold text-(--sds-color-text-default) tabular-nums',
  variants: {
    size: {
      sm: 'text-lg',
      md: 'text-2xl',
      lg: 'text-4xl',
    },
  },
  defaultVariants: { size: 'md' },
});

export const statDeltaRecipe = cv({
  base: 'inline-flex items-center gap-1 text-sm font-medium tabular-nums',
  variants: {
    tone: {
      positive: 'text-(--sds-color-success-emphasis)',
      negative: 'text-(--sds-color-danger-emphasis)',
      neutral:  'text-(--sds-color-text-muted)',
    },
  },
});
```

`tabular-nums` ensures monospaced digits — values don't visually wobble as data updates.

---

## `formatValue.ts`

```ts
export interface FormatValueOptions {
  value: number | string | ReactNode;
  format?: 'auto' | 'number' | 'currency' | 'percent' | 'compact';
  currency?: string;
  fractionDigits?: number;
  locale?: string;        // explicit override
  i18nLocale?: string;    // from useI18n() — fallback
}

export function formatValue({
  value, format = 'auto', currency, fractionDigits, locale, i18nLocale,
}: FormatValueOptions): ReactNode {
  if (typeof value !== 'number') return value;       // strings/ReactNodes passthrough
  const loc = locale ?? i18nLocale ?? undefined;     // undefined = runtime default

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat(loc, {
        style: 'currency', currency: currency ?? 'USD',
        minimumFractionDigits: fractionDigits ?? 2,
        maximumFractionDigits: fractionDigits ?? 2,
      }).format(value);
    case 'percent':
      return new Intl.NumberFormat(loc, {
        style: 'percent',
        minimumFractionDigits: fractionDigits ?? 0,
        maximumFractionDigits: fractionDigits ?? 1,
      }).format(value);
    case 'compact':
      return new Intl.NumberFormat(loc, {
        notation: 'compact', maximumFractionDigits: fractionDigits ?? 1,
      }).format(value);
    case 'number':
    case 'auto':
    default:
      return new Intl.NumberFormat(loc, {
        minimumFractionDigits: fractionDigits ?? 0,
        maximumFractionDigits: fractionDigits ?? 2,
      }).format(value);
  }
}
```

Pure, deterministic, fully unit-testable.

---

## `deltaPresentation.ts`

```ts
export function deltaPresentation(delta: DeltaProp, inverse = false) {
  const dir = delta.direction;
  const positiveDir = inverse ? 'down' : 'up';
  const negativeDir = inverse ? 'up' : 'down';
  const tone =
    dir === positiveDir ? 'positive' :
    dir === negativeDir ? 'negative' : 'neutral';
  const icon = dir === 'up' ? 'arrow-up' : dir === 'down' ? 'arrow-down' : 'minus';
  const sign = dir === 'up' ? '+' : dir === 'down' ? '−' : '';
  const formatted = delta.label ?? `${sign}${delta.value}${delta.suffix ?? '%'}`;
  return { tone, icon, sign, formatted };
}
```

`−` is the Unicode minus sign (U+2212) — not `-`, for typography parity with `+`.

---

## A11y

- **Semantic**: when an explicit `<dl>` ancestor is detected (rare) Stat renders as `<div>` containing `<dt>` (label) + `<dd>` (value). Otherwise plain `<div>` with `aria-label` synthesised from label + value (one announcement).
- **Default announcement**: "Revenue, $12,400, up 12.3%".
- `delta` icon is `aria-hidden`; the direction is encoded in the spoken `sign` ("up" / "down" / unchanged).
- **Loading**: `<div role="status" aria-busy="true">Loading</div>` (label still visible).
- **Error**: `<div role="alert">{error}</div>`.
- `colorize` is purely visual — color is not the only indicator (icon + sign are present too).
- axe-core: 0 violations across default, loading, error, compound modes.

---

## RTL

- `align="end"` uses `text-end` which is logical (flips in RTL).
- Delta arrows: `up` / `down` are vertical → unaffected by direction. (No `arrow-right` / `arrow-left` needed for trend.)
- Currency formatting: `Intl.NumberFormat` handles locale-aware currency placement (`$12,400` in en-US vs `12 400 $` in fr-FR vs `‏-12,400 ₪‏` in he-IL).
- Tabular-nums apply in both directions.
- `StatGroup` row direction flips visually in RTL (browser-native flex behavior). Dividers (`<Divider orientation="vertical">`) use `border-inline-start` so they appear on the correct edge.

---

## Performance

- Stateless when no states; loading/error are conditional renders.
- `formatValue` is called once per render. Could memoize via `useMemo` keyed on `(value, format, currency, fractionDigits, locale)` — implement only if profiling shows a hotspot.
- Bundle target: **< 3 KB gz** (recipe + format helpers + 2 components).

---

## Testing

- Renders label + value + delta sections per prop / compound mode.
- `format="currency"` with `currency="EUR"` and `locale="de-DE"` outputs `12.400,00 €`.
- `format="percent"` with `value={0.214}` → `21.4%`.
- `format="compact"` with `value={12400}` → `12.4K` (en) / `12,4 K` (fr).
- `delta={{ value: 5, direction: 'up' }}` → tone = positive (green); `inverse` flips it to negative.
- `loading` renders `<Spinner>` + `aria-busy="true"`.
- `error` renders `role="alert"`.
- Compound mode: prop-driven shortcuts ignored when subcomponents present.
- `<StatGroup direction="row" divider>` inserts vertical Dividers between Stats; column direction inserts horizontal Dividers.
- RTL snapshot tests with `dir="rtl"`.
- axe-core: 0 violations in default / loading / error / compound.

---

## Acceptance Criteria

- [ ] `<Stat />`, `<StatGroup />`, and `Stat.{Icon,Label,Value,Delta,Caption}` exported.
- [ ] Prop-driven and compound APIs both supported (mutually exclusive at runtime).
- [ ] `format` × `currency` × `locale` honored via `Intl.NumberFormat`.
- [ ] `delta` with `inverse` produces correct tone/icon/formatted string.
- [ ] Loading uses `<Spinner>` (Phase 39).
- [ ] StatGroup uses `<Divider>` (Phase 38) with auto orientation.
- [ ] RTL snapshot passes.
- [ ] axe-core: 0 violations in all modes.
- [ ] Bundle < 3 KB gz.

---

## DRY Self-Check

- [ ] `formatValue` is the single source of truth for numeric formatting — reusable by Pagination, DataGrid.
- [ ] `deltaPresentation` is pure + testable.
- [ ] Reuses `<Spinner>`, `<Divider>`, `useThemedClasses`, `<Slot>`, `<I18nProvider>` consumption.
- [ ] No date logic (out of scope).
- [ ] No new color tokens — uses existing semantic tokens.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/40-stat.md`.
2. Outcome notes: any new tokens/utilities, bundle delta, formatter helpers promoted to engine if shared with DataGrid.
3. Consider promoting `formatValue` to `@apx-dsine/intl` if DataGrid (Phase 27) needs the same helper.

---

## Outcome

**Shipped:** Phase 40 `<Stat />` + `<StatGroup />` — the canonical dashboard metric tile + group layout. Implemented under `packages/components/src/Stat/`, surgically exported from the umbrella between `Stack` and `Switch`.

### Public surface

- `<Stat />` — prop-driven (label / value / delta / icon / caption / format / currency / fractionDigits / locale / variant / size / align / colorize / loading / error / as / asChild / children).
- Compound subcomponents — `Stat.Icon`, `Stat.Label`, `Stat.Value`, `Stat.Delta`, `Stat.Caption`. Mutual-exclusion at runtime: when any `Stat.*` child is present the shortcut props are ignored.
- `<StatGroup />` — thin wrapper over `<Stack>` with auto-oriented `<Divider>` insertion (`divider={true}` → vertical between row stats, horizontal between column stats; responsive direction uses the **base** breakpoint's value).
- Pure helpers re-exported for downstream consumers (DataGrid / Pagination): `formatValue`, `deltaPresentation`, plus their associated types.

### Files added

```
packages/components/src/Stat/
├── Stat.tsx                  (~4.8 KB minified)
├── StatGroup.tsx
├── Stat.types.ts
├── Stat.recipe.ts            (9 slot recipes, all literal Tailwind utilities)
├── Stat.context.ts
├── formatValue.ts            (pure, deterministic Intl wrapper)
├── deltaPresentation.ts      (pure tone/arrow/sign resolver)
├── meta.ts                   (renderer metadata)
├── index.ts
├── README.mdx
└── examples/                 (15 stories — Basic / WithDelta / DeltaInverse /
                               Currency / Percent / Compact / WithIcon / Sizes /
                               Variants / Loading / ErrorState / Compound / Group /
                               GroupResponsive / Dashboard)

packages/components/__tests__/
├── Stat.test.tsx             (33 tests — prop API, compound, polymorphism, group)
├── Stat.a11y.test.tsx        (14 tests — synthesised aria-label, sr-only delta
                               sentences, role=status/aria-busy, role=alert,
                               axe-clean across all modes)
├── formatValue.test.ts       (10 tests — currency, percent, compact, locale)
└── deltaPresentation.test.ts (10 tests — direction, inverse, label override)
```

### Verification

| Check                               | Result |
| ----------------------------------- | ------ |
| `pnpm lint` (components)            | ✅ clean — 0 errors, 0 warnings |
| `pnpm tsc --noEmit`                 | ✅ clean — strict + exactOptionalPropertyTypes |
| `pnpm vitest run` (full)            | ✅ 1402/1402 (71 files, +67 net new) |
| Stat-only tests                     | ✅ 67/67 across 4 files |
| `pnpm build` (tsup ESM + CJS + DTS) | ✅ all three artifacts emitted, 472 KB ESM |
| axe-core                            | ✅ 0 violations across default / loading / error / compound / grouped / variants |

### Bundle delta

Measured with `esbuild` minify + treeshake, externalising `react`, `react-dom`, `@apx-ds `lucide-react`, and the sibling components (`Spinner` / `Divider` / `Stack`) that are already part of the umbrella bundle.

- **Stat marginal cost: 2.88 KB gzipped** (9 351 B raw) — under the < 3 KB target.

Internal breakdown:

| Slice                  | Raw    | Share |
| ---------------------- | ------ | ----- |
| `Stat.tsx`             | 4.8 KB | 52.4% |
| `Stat.recipe.ts`       | 1.8 KB | 19.6% |
| `StatGroup.tsx`        | 867 B  | 9.3%  |
| `formatValue.ts`       | 635 B  | 6.8%  |
| `deltaPresentation.ts` | 446 B  | 4.8%  |
| `Stat.context.ts`      | 106 B  | 1.1%  |

### Implementation notes / deviations from plan

- **`<dl>` ancestor detection skipped.** The plan calls it "rare". Detecting it would require a ref+lookup pass that doesn't survive portals, and the synthesized `aria-label` already gives screen readers a complete one-pass announcement ("Revenue, $12,400, up 12.3%"). Consumers who need true description-list semantics can wrap in `<dl>` and compose with `<dt>`/`<dd>` themselves — Stat's subcomponents stay neutral `<span>`s today.
- **Delta chip extracted to internal `DeltaChip` helper.** Both the prop-driven path and the compound `Stat.Delta` subcomponent render identical arrow + sign + sr-only sentence markup. Sharing one implementation saved ~150 B and keeps the rendering invariants in one place.
- **`StatGroup` is a thin `<Stack>` wrapper.** We inherit responsive `direction` / `gap` / `align` / `justify` and the `stackChildrenWithDivider` transform rather than reimplementing layout. The only new logic is `primaryDirection()` — picks the divider orientation based on the resolved (or base-breakpoint) direction.
- **Responsive-direction divider orientation is fixed at runtime.** Cannot flip per breakpoint without a CSS-only `<Divider>` rewrite (out of scope). Consumers needing per-breakpoint flipping can pass a custom node: `<StatGroup divider={<MyResponsiveRule />}>`.
- **`meta.ts` is no longer re-exported from `index.ts`** — matches Divider/Spinner convention; renderer reads meta files directly via globbed loaders.
- **Unicode minus (`U+2212`) for `down`-direction deltas** — typographic parity with the `+` sign, matches the plan's specification.
- **Pure helpers are public** — `formatValue` and `deltaPresentation` are exported from the umbrella so downstream KPI surfaces (DataGrid totals row, Pagination totals, future analytics primitives) can reuse the same Intl wiring and tone resolver without re-importing private subpaths.

### Follow-ups

- **Promote `formatValue` to `@apx-dsine/intl`** when DataGrid (Phase 27) lands — same wiring will be needed there. Today it ships from `apx-apx-dsngine promotion is a no-op rename for consumers (umbrella re-export stays).
- **Responsive divider orientation** — a CSS-only `<Divider>` variant that flips via media-queries would let `<StatGroup direction={{ base: 'column', md: 'row' }}>` emit a divider that's horizontal on mobile and vertical on desktop. Tracked for Divider v2.
- **`Stat.Label as="dt"` polymorphism** — useful when wrapping a `StatGroup` in a `<dl>`. Low priority (consumers can write `<dt>` themselves today); ship if pattern emerges.