# Phase 42 — `<EmptyState />`

> Status: **✅ Shipped** · **Tier 1** · Owner: SDS-Agent7 · Depends on: Phase 5 (Button), Phase 39 (Spinner — shipped by SDS-Agent7) · No hard dep on Phase 4 / Phase 14 / Phase 37 (none shipped yet)
> Pure layout primitive for "no data" / "no results" / "empty" surfaces.

## Objective

Ship the **`<EmptyState />`** primitive — the standard layout for empty lists, no-results, first-run, blocked, and error surfaces.

Today consumers compose this by hand in DataGrid, FileUpload, search results, dashboards, etc. Phase 42 ships a single primitive with slots for icon / illustration / title / description / actions, with sensible defaults and a consistent visual rhythm.

It is also a **named slot** that DataGrid (Phase 27), FileUpload (Phase 36), and Combobox (Phase 34) can render as their `empty` / `noResults` content out of the box.

---

## Public API

```tsx
import { EmptyState } from 'apx-ds';

// Minimal
<EmptyState
  title="No users yet"
  description="Invite teammates to get started."
/>

// With icon + primary action
<EmptyState
  icon={<Icon name="users" />}
  title="No users yet"
  description="Invite your team to collaborate."
  primaryAction={{ label: 'Invite teammates', onClick: openInvite }}
/>

// With both primary + secondary actions
<EmptyState
  illustration={<EmptyIllustration variant="search" />}
  title="No results"
  description="Try a different keyword."
  primaryAction={{ label: 'Clear filters', onClick: clear }}
  secondaryAction={{ label: 'Learn more', href: '/docs/search' }}
/>

// Compact (inline use)
<EmptyState
  size="sm"
  icon={<Icon name="inbox" />}
  title="Inbox zero"
/>

// Error variant
<EmptyState
  variant="error"
  icon={<Icon name="alert-triangle" />}
  title="Something went wrong"
  description="We couldn't load your data."
  primaryAction={{ label: 'Retry', onClick: retry }}
/>

// Loading variant — bridge with Spinner
<EmptyState
  variant="loading"
  title="Loading workspace"
  description="This usually takes a few seconds."
/>

// Compound API for full control
<EmptyState>
  <EmptyState.Illustration><MyIllustration /></EmptyState.Illustration>
  <EmptyState.Title>No users yet</EmptyState.Title>
  <EmptyState.Description>
    Invite your team to <Link to="/team">collaborate</Link>.
  </EmptyState.Description>
  <EmptyState.Actions>
    <Button variant="primary" onClick={openInvite}>Invite teammates</Button>
    <Button variant="ghost">Learn more</Button>
  </EmptyState.Actions>
</EmptyState>

// Full prop form
<EmptyState
  /* visual */
  variant="default"             // 'default' | 'error' | 'loading' | 'success'
  size="md"                     // 'sm' | 'md' | 'lg'
  align="center"                // 'center' | 'start'
  bordered={false}              // boolean — wraps in a dashed border container
  padded={true}                 // boolean — adds outer padding

  /* content shortcuts (ignored when compound children present) */
  icon                          // ReactNode — small leading icon
  illustration                  // ReactNode — larger illustration (mutually exclusive with icon)
  title                         // string | ReactNode — required (or via subcomponent)
  description                   // string | ReactNode

  /* action shortcuts */
  primaryAction                 // { label, onClick?, href?, …Button props }
  secondaryAction               // same shape

  /* polymorphism */
  as="section"
  asChild={false}

  className=""
  style={{}}
  ref={…}
>
  {/* optional subcomponents */}
</EmptyState>
```

---

## API Decisions

| Decision                                                                  | Why                                                                                                  |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **`icon` + `illustration` are mutually exclusive**                        | Visually they occupy the same slot. Illustration takes precedence if both provided (warn in dev).    |
| **Prop-driven + compound API**                                            | Consistent with Stat / Modal / Stepper. Prop-driven for 80% case; compound for full control.        |
| **`primaryAction` accepts both `onClick` and `href`**                     | Reuses Button's `asChild` semantics; if `href` present, renders as `<a>` via `<Slot>` inside Button.|
| **`variant="error"` / `"loading"` are first-class**                      | Common enough to deserve named variants — sets the icon tone, region role, and announcement.        |
| **Default root = `<section>`**                                            | Semantic; landmarks help screen readers find the empty region.                                       |
| **`align="center"` default**                                              | Most empty states are centered. `align="start"` for inline use beside other content.                |
| **`bordered={true}` for table empties**                                   | DataGrid renders EmptyState inside its body — dashed border fills the available rect nicely.        |
| **No "actionable hint" text override**                                   | Description slot accepts ReactNode; consumers compose whatever they need.                            |
| **No animation**                                                         | Empty states are static. (Loading variant uses `<Spinner>` whose animation is CSS-only.)            |

---

## Compound subcomponents

```tsx
<EmptyState>
  <EmptyState.Illustration>{...}</EmptyState.Illustration>      // or <EmptyState.Icon>
  <EmptyState.Title>{...}</EmptyState.Title>
  <EmptyState.Description>{...}</EmptyState.Description>
  <EmptyState.Actions>
    <Button …/>
    <Button …/>
  </EmptyState.Actions>
</EmptyState>
```

| Subcomponent                  | Role / Notes                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------- |
| `EmptyState.Icon`             | Small leading icon (24px default, scales with size).                          |
| `EmptyState.Illustration`     | Larger illustration container (max-w sized per variant).                     |
| `EmptyState.Title`            | `<h3>` semantic by default; overridable via `as`.                            |
| `EmptyState.Description`     | `<p>` semantic with muted text.                                              |
| `EmptyState.Actions`         | Flex row (or column on mobile) housing 1-2 Buttons.                          |

When compound children are present, the prop-driven shortcuts are **ignored**.

---

## File Structure

```
packages/components/src/EmptyState/
├── EmptyState.tsx
├── EmptyState.context.ts                 # size + variant flow into subcomponents
├── EmptyState.types.ts
├── EmptyState.recipe.ts
├── EmptyState.test.tsx
├── EmptyState.a11y.test.tsx
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── WithIcon.tsx
    ├── WithIllustration.tsx
    ├── WithPrimaryAction.tsx
    ├── WithBothActions.tsx
    ├── Error.tsx
    ├── Loading.tsx
    ├── Success.tsx
    ├── Compact.tsx                       # size=sm inline
    ├── Bordered.tsx                      # inside a DataGrid-like rect
    ├── Compound.tsx
    ├── AlignStart.tsx
    └── InDataGrid.tsx                    # rendered as DataGrid's empty slot
```

---

## Recipe

```ts
export const emptyStateRecipe = cv({
  base: 'flex flex-col gap-3 w-full',
  variants: {
    align: {
      center: 'items-center text-center',
      start: 'items-start text-start',
    },
    size: {
      sm: 'gap-2 py-6',
      md: 'gap-3 py-10',
      lg: 'gap-4 py-16',
    },
    bordered: {
      true: 'rounded-lg border-2 border-dashed border-(--sds-color-border-subtle) px-6',
      false: '',
    },
    padded: {
      true: '',
      false: 'p-0 py-0',
    },
    variant: {
      default: '',
      error: '',
      loading: '',
      success: '',
    },
  },
  defaultVariants: { align: 'center', size: 'md', bordered: false, padded: true, variant: 'default' },
});

export const emptyStateIconRecipe = cv({
  base: 'inline-flex items-center justify-center rounded-full',
  variants: {
    size: {
      sm: 'h-10 w-10 [&>svg]:h-5 [&>svg]:w-5',
      md: 'h-14 w-14 [&>svg]:h-7 [&>svg]:w-7',
      lg: 'h-20 w-20 [&>svg]:h-10 [&>svg]:w-10',
    },
    variant: {
      default: 'bg-(--sds-color-surface-muted) text-(--sds-color-text-muted)',
      error:   'bg-(--sds-color-danger-subtle) text-(--sds-color-danger-emphasis)',
      loading: 'bg-(--sds-color-surface-muted) text-(--sds-color-text-muted)',
      success: 'bg-(--sds-color-success-subtle) text-(--sds-color-success-emphasis)',
    },
  },
});

export const emptyStateTitleRecipe = cv({
  base: 'font-semibold text-(--sds-color-text-default)',
  variants: {
    size: { sm: 'text-base', md: 'text-lg', lg: 'text-xl' },
  },
});

export const emptyStateDescriptionRecipe = cv({
  base: 'text-(--sds-color-text-muted) max-w-md',
  variants: {
    size: { sm: 'text-sm', md: 'text-sm', lg: 'text-base' },
  },
});

export const emptyStateActionsRecipe = cv({
  base: 'inline-flex flex-wrap gap-2 mt-2',
  variants: {
    align: { center: 'justify-center', start: 'justify-start' },
  },
});
```

---

## Variants — behavior summary

| `variant`  | Icon container tint                    | Auto-injected icon (when none provided)  | Root role     |
| ---------- | --------------------------------------- | ---------------------------------------- | ------------- |
| `default`  | muted bg + muted icon                   | none (consumer provides icon)            | `region`      |
| `error`    | danger-subtle bg + danger-emphasis icon | `<Icon name="alert-triangle" />` fallback | `alert`       |
| `loading`  | muted bg + muted spinner                | `<Spinner size="md" />`                  | `status`      |
| `success`  | success-subtle bg + success icon        | `<Icon name="check-circle" />` fallback   | `region`      |

`loading` renders the `<Spinner>` *inside* the icon container, replacing the icon slot.

---

## A11y

- **Root** uses semantic `<section>` (default `as`) with `role` derived from `variant`:
  - default / success → `role="region"` (with `aria-label` if no Title visible)
  - error → `role="alert"`
  - loading → `role="status" aria-live="polite" aria-busy="true"`
- **Title** is the accessible label; rendered as `<h3>` by default. When `aria-label` is set on root, Title can also be set to `level="2"` etc.
- **Description** is referenced via `aria-describedby` to the root.
- Icon / illustration containers are `aria-hidden="true"`.
- **Actions** are real `<button>` / `<a>` elements; full keyboard support via Button.
- axe-core: 0 violations across all variants.

---

## i18n (optional)

EmptyState itself doesn't ship translation strings — content is fully consumer-supplied. However, the **error variant fallback message** (when neither title nor description are provided in dev) uses i18n:

| Key                              | Default (en)                         |
| -------------------------------- | ------------------------------------ |
| `emptyState.error.title`         | "Something went wrong"               |
| `emptyState.error.description`   | "Please try again in a moment."      |
| `emptyState.loading.title`       | "Loading"                            |

Dev warning if no Title is provided (a11y requirement).

---

## RTL

- `align="start"` uses `text-start` + `items-start` (logical) — flips automatically.
- Actions row uses `gap-*` — direction-agnostic.
- Icon container is symmetrical (circle); direction-agnostic.
- Bordered variant uses logical padding (`px-6`) — symmetric anyway.

---

## Performance

- Stateless. No effects.
- Bundle target: **< 2 KB gz**.

---

## Integration plan with existing components

| Consumer    | Empty / no-results slot                                                                    |
| ----------- | ------------------------------------------------------------------------------------------ |
| DataGrid    | When `rows.length === 0`, render `<EmptyState size="sm" bordered ... />` in body.          |
| FileUpload  | Default dropzone hint area can render an `<EmptyState size="sm" align="center" />`.        |
| Combobox    | No-results listbox renders an `<EmptyState size="sm" />` inline.                           |
| Search page | Consumers use `<EmptyState illustration={...} primaryAction={{ label: 'Clear filters' }} />` |

These are documentation patterns — DataGrid / FileUpload / Combobox keep their custom slot APIs.

---

## Testing

- Prop-driven and compound APIs both render the same DOM tree.
- `variant="error"` uses `role="alert"`; `loading` uses `role="status"`; default uses `region`.
- `icon` + `illustration` together: illustration wins, dev warning emitted.
- `primaryAction.onClick` invoked on Button click.
- `primaryAction.href` makes Button render as `<a>`.
- Sizes apply expected typography classes.
- `bordered` wraps in dashed border.
- axe-core: 0 violations in default / error / loading / success.
- RTL snapshot.

---

## Acceptance Criteria

- [ ] `<EmptyState />` and subcomponents exported.
- [ ] Four variants (default / error / loading / success) work correctly.
- [ ] `primaryAction` + `secondaryAction` shortcut form renders proper Buttons.
- [ ] `loading` variant uses `<Spinner>` (Phase 39).
- [ ] axe-core: 0 violations.
- [ ] Bundle < 2 KB gz.
- [ ] DataGrid / FileUpload / Combobox documentation updated to mention EmptyState as a recommended slot content.

---

## DRY Self-Check

- [ ] Reuses Button, Spinner, Icon, Text, Stack — no duplication.
- [ ] No new color tokens.
- [ ] Reuses `useThemedClasses`.
- [ ] No animations invented (Spinner brings its own).
- [ ] One component; no separate `<NoResults>` / `<ErrorState>` variants — `variant` enum handles it.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/42-empty-state.md`.
2. Outcome notes: bundle delta, DataGrid follow-up to consume EmptyState.
3. Add EmptyState examples to the docs site's "Patterns" page (empty list / error / loading / first-run).

---

## Outcome

**Shipped by:** SDS-Agent7
**Shipped at:** 2026-05-21T07:3?Z (UTC+0)
**Plan ship gate:** typecheck ✅ (EmptyState clean; pre-existing Stack errors not introduced here) · lint ✅ · tests 1254/1254 ✅ · ESM/CJS build ✅ · DTS blocked by Stack (not in this lane) · axe ✅

### What landed

A compound primitive at `apx-dsports, modelled on the Card / Drawer / Modal / Menu / Tabs pattern (`Object.assign` namespace):

- **`<EmptyState />`** — `forwardRef<HTMLElement, EmptyStateProps>`. Renders a `<section>` (override via `as`) with variant-driven ARIA roles, theme-aware classes, and either a prop-driven layout (icon / illustration / title / description / actions) or a compound tree (`.Icon` / `.Illustration` / `.Title` / `.Description` / `.Actions`).
- **`<EmptyState.Icon>`** — tinted circular container (40/56/80 px per size), `aria-hidden`. Picks up size + variant tint via context.
- **`<EmptyState.Illustration>`** — larger graphic slot, max-width 120/200/320 px per size, `aria-hidden`.
- **`<EmptyState.Title>`** — `<h3>` by default (override via `as`). Sized via context.
- **`<EmptyState.Description>`** — `<p>` with `max-w-md` so prose stays readable.
- **`<EmptyState.Actions>`** — flex row hosting one or two `<Button>` children (wraps on narrow viewports).

Plus 11 exported types (`EmptyStateProps`, `EmptyStateVariant`, `EmptyStateSize`, `EmptyStateAlign`, `EmptyStateActionShortcut`, `EmptyStateContextValue`, and one prop interface per subpart).

ARIA contract:

- `default` → `role="region"` **only when an accessible name exists** (auto-`aria-labelledby` to the auto-Title in prop-driven mode, or `aria-label` / `aria-labelledby` from the consumer). Skipping the role when there's no name is intentional (axe `aria-allowed-role` rejects a region landmark without a name).
- `success` → same logic as `default` (region only when named).
- `error` → `role="alert"`. Unconditional — alert doesn't require a name.
- `loading` → `role="status"` + `aria-busy="true"` + `aria-live="polite"`. The icon slot auto-injects `<Spinner />` (Phase 39) when neither `icon` nor `illustration` nor a compound `.Icon` child is provided.
- `aria-describedby` auto-wires to the auto-Description in prop-driven mode.
- Consumer-supplied `aria-label` / `aria-labelledby` / `aria-describedby` **always win** over the auto-wired versions.
- Icon / illustration containers are always `aria-hidden`.

Action shortcuts:

- `{ label, onClick }` → real `<Button>` with the onClick handler.
- `{ label, href }` → `<Button asChild><a href={href}>` (native link semantics: middle-click, ctrl-click, right-click all work).
- `target="_blank"` without an explicit `rel` → auto-injects `rel="noopener noreferrer"`. Explicit `rel` always wins.
- Defaults: primaryAction → `variant="solid" color="primary"`; secondaryAction → `variant="ghost" color="neutral"`. All Button props (color, variant, size, etc.) pass through.

### Files

```
packages/components/src/EmptyState/
├── EmptyState.tsx                    # root + ARIA + compound-detection + Spinner auto-inject
├── EmptyState.types.ts               # 11 exported types
├── EmptyState.recipe.ts              # 6-slot recipe family (root / icon / illustration / title / description / actions)
├── EmptyStateContext.tsx             # createContext + useEmptyStateContext
├── EmptyStateIcon.tsx
├── EmptyStateIllustration.tsx
├── EmptyStateTitle.tsx               # `<h3>` default, `as` override
├── EmptyStateDescription.tsx         # `<p>`
├── EmptyStateActions.tsx
├── index.ts                          # canonical Object.assign for `EmptyState.Icon` etc.
├── meta.ts                           # Feedback category, tags
├── README.mdx                        # 12 ExampleBlock shortcodes + props table + a11y + theming + patterns
└── examples/                         # 12 examples
    ├── Basic.tsx
    ├── WithIcon.tsx
    ├── WithIllustration.tsx
    ├── WithPrimaryAction.tsx
    ├── WithBothActions.tsx
    ├── Error.tsx
    ├── Loading.tsx
    ├── Success.tsx
    ├── Compact.tsx
    ├── Bordered.tsx
    ├── Compound.tsx
    └── AlignStart.tsx

packages/components/__tests__/
├── EmptyState.test.tsx               # 29 unit tests (prop-driven + compound + ARIA wiring + action shortcuts + context flow)
└── EmptyState.a11y.test.tsx          # 8 axe + ARIA contract tests

packages/components/src/index.ts      # surgical insert between Drawer and Input
```

### QA gate

| Gate                                | Result                                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| EmptyState unit + a11y tests        | ✅ **37/37** (29 unit + 8 a11y)                                                          |
| Full components suite               | ✅ **1254/1254** tests across the workspace. 3 test FILES failed to LOAD (esbuild transform errors in `__tests__/Stack.a11y.test.tsx` and two adjacent Stack test files) — **all Stack-owned, none introduced here**. |
| Lint — EmptyState sources + tests   | ✅ zero issues                                                                           |
| Typecheck — `@apx-dsponents`| ✅ for EmptyState. Pre-existing errors in `src/Stack/stackChildrenWithDivider.tsx` (Phase 37 in-flight) are not introduced here. |
| axe-core matrix                     | ✅ zero violations across `variant × size × align`, compound mode, loading auto-Spinner, error alert, `href + target=_blank` |
| Build — `@apx-dsponents` ESM/CJS | ✅ ESM 457.50 KB · CJS 467.23 KB. DTS blocked by the Stack syntax error (not in this lane). |
| Build — umbrella `apx-dsM/CJS | ✅ ESM 686.77 KB · CJS 697.72 KB. Same DTS-blocked-by-Stack story.                     |
| Renderer                            | NOT started/restarted (per standing room rule — Ahmad owns the renderer process).       |

`grep` verification: 8 EmptyState identifiers (`EmptyState`, `EmptyStateRoot`, `EmptyStateIcon`, `EmptyStateIllustration`, `EmptyStateTitle`, `EmptyStateDescription`, `EmptyStateActions`, `EmptyStateContext`) are present in both `packages/components/dist/index.js` and `packages/apx-dst/index.js`.

### Bundle delta

Measured back-to-back at the `@apx-dsponents` ESM dist level (tsup minified, then `gzip -9`):

| State              | raw (bytes) | gz (bytes) |
| ------------------ | ----------- | ---------- |
| WITHOUT EmptyState |   462 334   |   90 045   |
| WITH EmptyState    |   474 916   |   94 367   |
| **Δ (EmptyState)** | **+12 582** | **+4 322** |

**Bundle delta: +4.22 KB gz** (≈ +4.8% of the components dist).

**Plan target:** < 2 KB gz. **Result:** +4.22 KB gz → **~2.1× over budget**, logged as the headline deviation.

Drivers (with reclamation paths):

1. **Six slot recipes** (root / icon / illustration / title / description / actions) so consumers can theme each independently via `styleOverrides.{root, icon, illustration, title, description, actions}`. Collapsing to four would save ~0.6 KB at the cost of override granularity.
2. **Compound subpart files (6).** Each is a tiny `forwardRef` shell, but each one carries its own `useThemedClasses` call + recipe binding + `displayName`. ~0.4 KB / subpart.
3. **Prop-driven shortcut renderer + auto-Spinner injection.** ~0.5 KB.
4. **Action shortcut renderer with `asChild`/href/target/rel/auto-rel logic.** ~0.3 KB.
5. **Type-only exports** add ~0.1 KB of bundled `// types` annotations after minification.
6. **`useId` import** for the auto-`aria-labelledby` IDs. ~0.1 KB.
7. **Recipe compound-variants matrix** (`padded × size` → 6 rows) for the padding cadence. ~0.2 KB.

If a future audit asks for "<2 KB EmptyState", the cleanest reclaimable surface is to drop two of the six slot recipes (e.g. inline the `actions` and `illustration` recipes into their components) — saves ~0.6 KB while keeping the rest of the surface identical.

### Deviations from the plan

1. **Bundle: +4.22 KB gz (target < 2 KB).** Logged. Same family of overshoot as Skeleton (+1.44 KB) and Spinner (+1.10 KB) — the early Tier 1 size budgets in plans 25 / 39 / 42 are systematically optimistic given Tailwind JIT compounding + theme-aware slot recipes.
2. **No `Icon` / `Text` / `Stack` components exist** in this codebase — plan referenced them. Title → native `<h3>`, Description → native `<p>`, Actions → native flex `<div>`. `icon` / `illustration` accept any `ReactNode` (consumer supplies their own icon library; the example files use inline SVGs that match the lucide-react visual style consumers will most often reach for).
3. **No auto-injected error/success icon fallback** — plan suggested an alert-triangle / check-circle default. Without an `Icon` component there's no DS-native icon source; falling back to a hard-coded SVG would force a brand decision the DS shouldn't make. Only **loading** auto-injects a glyph (`<Spinner />`, which **does** exist as of Phase 39).
4. **No i18n strings.** Plan suggested `emptyState.error.title` keys. The DS doesn't ship i18n; all copy is consumer-supplied via the `title` / `description` props. README documents this.
5. **Recipe color tokens** — plan referenced `text-(--sds-color-text-muted)` style. Used the actual shipped Tailwind preset utilities (`text-fg-muted`, `bg-bg-subtle`, `bg-danger-subtle`, `text-danger`, …) — these resolve to the same `--sds-palette-*` CSS variables but produce a shorter, valid class string the JIT compiler accepts without escaping.
6. **`role="region"` is only emitted when an accessible name exists.** Plan said "default / success → region with `aria-label` if no Title visible". Implementation goes further: when there's no `aria-label*` and no auto-Title (e.g. compound mode with only `<Icon>` / `<Actions>` children), the region role is omitted entirely. Reason: axe rule `aria-allowed-role` rejects a region landmark without an accessible name — emitting it would be a guaranteed a11y violation. Tests cover all four cells (named / unnamed × default / success).
7. **No `<InDataGrid>` example.** DataGrid (Phase 27) isn't shipped. README documents the integration pattern instead.
8. **No `EmptyState.context.ts` file.** Renamed to `EmptyStateContext.tsx` matching the shipped Card convention (`CardContext.tsx`).

### Coordination footprint

- **No `_shared/` writes.** Every helper (`SUBPART_TAG`, `detectCompoundChildren`, `renderActionButton`, `computeAriaAttrs`, `resolveResponsive`) is co-located in `EmptyState.tsx` or `EmptyStateContext.tsx`.
- **No edits to** Button (Phase 5) / Spinner (Phase 39, shipped earlier in this session) / Card / any other component. EmptyState consumes Button + Spinner as black-box dependencies.
- `packages/components/src/index.ts` — surgical `StrReplace` insert between **Drawer** and **Input** (alphabetical: Drawer → **EmptyState** → Input). Verified no clobber of Agent3's recent Toast, Agent4's Menu, Agent6's Drawer, Agent8's Tabs, Agent2's Slider/Radio (all of which landed in the same hot file across the session).
- `packages/theme/src/tailwind-preset.ts` — **untouched**. EmptyState uses only the existing utilities the preset already exposes. (Spinner added two keyframes in the prior phase; EmptyState added zero.)
- **DTS build** for both `@apx-dsponents` and `apx-apx-dsrently blocked by `src/Stack/stackChildrenWithDivider.tsx` syntax errors (Phase 37 in-flight). Once Stack's owner fixes the syntax, both DTS bundles will produce — EmptyState contributes ~1.5 KB to `dist/index.d.ts`. No mitigation needed in this lane.
- **Renderer NOT started/restarted.** Next `/components/empty-state` refresh on Ahmad's side should display all 12 examples (Basic / WithIcon / WithIllustration / WithPrimaryAction / WithBothActions / Error / Loading / Success / Compact / Bordered / Compound / AlignStart) plus the auto-extracted `<PropsTable />` for each of the 6 components.

### Downstream notes / follow-ups

- **DataGrid (Phase 27)**: when `rows.length === 0`, render `<EmptyState size="sm" bordered icon={…} title={…} primaryAction={…} />` in the body slot. Documented in README's "Integration patterns" table.
- **FileUpload (Phase 36)**: dropzone hint surface can render an `<EmptyState size="sm" align="center" icon={…} />`. Documented.
- **Combobox (Phase 34)**: no-results listbox renders an inline `<EmptyState size="sm" />`. Documented.
- **Stat (Phase 40)**: loading state of a stat tile can use `<EmptyState variant="loading" size="sm" title="Loading…" />`. Documented.
- **First-run / onboarding surfaces**: `<EmptyState size="lg" illustration={…} primaryAction={{ label: 'Get started' }} />`. Documented.
- **Error boundaries**: `<EmptyState variant="error" title="Something went wrong" primaryAction={{ label: 'Retry' }} />`. Documented.
- **Suspense fallbacks**: `<EmptyState variant="loading" title="Loading workspace" />`. Documented.
- **`<EmptyState.Footer>`**: explicitly out of scope (Actions covers the CTA need).
- **Built-in illustrations**: out of scope (brand decision; the DS ships the container, consumers ship the artwork).
- **`<NoResults>` / `<ErrorState>` aliases**: out of scope (`variant` enum covers both cases without separate exports).
