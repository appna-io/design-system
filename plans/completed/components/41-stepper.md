# Phase 41 — `<Stepper />`

> Status: **✓ Completed** · **Tier 2** · Owner: SDS-Agent8 · Depends on: Phase 5 (Text), Phase 14 (Icon), Phase 27 (I18nProvider — optional), Phase 38 (Divider — optional connector), Phase 39 (Spinner — pending step state)
> Multi-step progress indicator. Horizontal + vertical, clickable + read-only, controlled + uncontrolled.

## Objective

Ship the **`<Stepper />`** primitive — the multi-step progress indicator for wizards, onboarding flows, checkout, KYC, multi-page forms.

Today consumers either hack one with Card/Divider/Badge or pull in a third-party wizard library. Phase 41 ships a typed, accessible, theme-aware stepper with:

- Horizontal + vertical layout (responsive).
- Three step statuses: **pending**, **active**, **complete**, **error** (+ optional **loading**).
- Optional clickable steps (with `onStepClick` callback).
- Prop-driven API _and_ compound `<Stepper.Step>` API.
- Optional content slot per step for inline-vertical "expanding wizard" pattern.

---

## Public API

```tsx
import { Stepper } from 'apx-ds';

// Prop-driven (simple)
<Stepper
  active={1}
  steps={[
    { id: 'account', label: 'Account', description: 'Email + password' },
    { id: 'profile', label: 'Profile', description: 'Name + photo' },
    { id: 'plan',    label: 'Plan',    description: 'Pick a plan' },
    { id: 'review',  label: 'Review',  description: 'Confirm details' },
  ]}
  onStepClick={(id, index) => goTo(id)}
/>

// Compound API
<Stepper active={activeIndex} orientation="vertical">
  <Stepper.Step id="account" label="Account" description="Email + password" />
  <Stepper.Step id="profile" label="Profile" description="Name + photo" />
  <Stepper.Step id="plan" label="Plan" status="error">
    {/* expanded content rendered only when this step is active in vertical mode */}
    <ErrorMessage>Card declined.</ErrorMessage>
  </Stepper.Step>
  <Stepper.Step id="review" label="Review" />
</Stepper>

// Controlled status per step (override auto-derivation)
<Stepper
  active={2}
  steps={[
    { id: 'a', label: 'Account', status: 'complete' },
    { id: 'b', label: 'Profile', status: 'complete' },
    { id: 'c', label: 'Verify',  status: 'loading' },   // shows Spinner instead of step number
    { id: 'd', label: 'Done',    status: 'pending' },
  ]}
/>

// Responsive orientation
<Stepper orientation={{ base: 'vertical', md: 'horizontal' }} steps={steps} active={i} />

// Variants
<Stepper variant="numbered" />        // default — circle with step number
<Stepper variant="dots" />            // compact dots
<Stepper variant="progress" />        // single progress bar with step labels beneath

// Full prop form
<Stepper
  active={0}                          // number — index of the active step
  steps={[]}                          // StepData[]  (when not using compound children)
  orientation="horizontal"            // ResponsiveValue<'horizontal' | 'vertical'>
  variant="numbered"                  // 'numbered' | 'dots' | 'progress'
  size="md"                           // 'sm' | 'md' | 'lg'
  align="start"                       // alignment of label/description relative to indicator
  showLabels={true}                   // hide labels for compact horizontal use
  showDescriptions={true}
  clickable={false}                   // boolean | 'completed' — completed steps only
  onStepClick={(id, index) => void}
  linear={true}                       // boolean — if true, only completed + next step are clickable
  completedIcon={<Icon name="check" />}        // overridable
  errorIcon={<Icon name="alert" />}
  pendingIcon={undefined}                       // defaults to step number
  connector={<Divider />}                       // ReactNode | undefined
  className=""
  style={{}}
  ref={…}
>
  {/* optional Stepper.Step children */}
</Stepper>

interface StepData {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  status?: 'pending' | 'active' | 'complete' | 'error' | 'loading';
  icon?: ReactNode;            // override indicator icon
  disabled?: boolean;
  content?: ReactNode;         // for expanded vertical mode
}
```

---

## API Decisions

| Decision                                                                   | Why                                                                                                            |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`active` is a number (index), not an id**                                | Step order is meaningful; index drives auto-derivation of `pending` / `active` / `complete` statuses.          |
| **Auto-derive status from `active`**: `< active = complete`, `=== active = active`, `> active = pending` | Reduces boilerplate. Consumer can override per step (`status: 'error'`, `'loading'`) when needed.            |
| **Three visual variants** (`numbered` / `dots` / `progress`)              | One component covers all common stepper aesthetics; consumer picks per surface.                                |
| **`linear` for navigation enforcement**                                    | Wizards typically forbid skipping ahead. `linear=true` blocks clicks on `pending` steps.                       |
| **Compound API uses `<Stepper.Step>`**                                    | Lets consumers inline expanded content per step (especially in vertical mode).                                |
| **`onStepClick` accepts both id + index**                                  | Either identifier is convenient; consumer chooses.                                                             |
| **Connector is overridable**                                              | Default = stylized line; consumer can pass `<Divider variant="dashed" />` or a custom node.                   |
| **No internal "next/prev/submit" buttons**                                 | Stepper is presentational. Wizard buttons live in the consumer's flow — keeps the primitive focused.          |
| **`loading` step state uses `<Spinner>`** (Phase 39)                       | Reuses primitive; consistent loading affordance.                                                              |
| **No animation on step transition by default**                            | Status changes are visible enough via color + icon. Consumers can add Motion to step content if desired.       |

---

## Compound subcomponents

```tsx
<Stepper active={i}>
  <Stepper.Step id="a" label="Account" />
  <Stepper.Step id="b" label="Profile">
    <ProfileForm />     {/* shown only when active in vertical mode */}
  </Stepper.Step>
  <Stepper.Step id="c" label="Plan" />
</Stepper>
```

| Subcomponent       | Notes                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------- |
| `Stepper.Step`     | Props mirror `StepData`. Renders its own indicator + label + description + optional content. |

When compound children are used, the `steps` prop is ignored. Order in JSX is the step order.

---

## File structure

```
packages/components/src/Stepper/
├── Stepper.tsx
├── Stepper.Step.tsx
├── Stepper.context.ts                 # carries activeIndex, orientation, variant, size, linear, clickability, onStepClick
├── Stepper.types.ts
├── Stepper.recipe.ts
├── stepStatus.ts                      # pure — resolves status from (index, activeIndex, override)
├── Stepper.test.tsx
├── Stepper.Step.test.tsx
├── Stepper.a11y.test.tsx
├── Stepper.keyboard.test.tsx
├── stepStatus.test.ts
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Vertical.tsx
    ├── Variants.tsx                   # numbered / dots / progress
    ├── Sizes.tsx
    ├── WithDescriptions.tsx
    ├── WithErrorStep.tsx
    ├── WithLoadingStep.tsx
    ├── Clickable.tsx
    ├── ClickableCompleted.tsx
    ├── LinearMode.tsx                 # cannot skip ahead
    ├── Responsive.tsx
    ├── Compound.tsx
    ├── VerticalWithContent.tsx        # active step expands inline
    ├── CustomIcons.tsx
    ├── CustomConnector.tsx
    └── Wizard.tsx                     # full mini-wizard with next/prev/submit buttons consuming the Stepper
```

---

## Recipe sketch

```ts
export const stepperRecipe = cv({
  base: 'flex w-full',
  variants: {
    orientation: {
      horizontal: 'flex-row items-start',
      vertical: 'flex-col items-stretch',
    },
    size: {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    },
  },
  defaultVariants: { orientation: 'horizontal', size: 'md' },
});

export const stepIndicatorRecipe = cv({
  base: 'inline-flex items-center justify-center rounded-full font-medium shrink-0 transition-colors',
  variants: {
    size: {
      sm: 'h-6 w-6 text-xs',
      md: 'h-8 w-8 text-sm',
      lg: 'h-10 w-10 text-base',
    },
    status: {
      pending:  'bg-(--sds-color-surface-muted) text-(--sds-color-text-muted) border border-(--sds-color-border-subtle)',
      active:   'bg-(--sds-color-accent-emphasis) text-(--sds-color-accent-on-emphasis) ring-2 ring-(--sds-color-accent-emphasis)/30',
      complete: 'bg-(--sds-color-success-emphasis) text-(--sds-color-success-on-emphasis)',
      error:    'bg-(--sds-color-danger-emphasis) text-(--sds-color-danger-on-emphasis)',
      loading:  'bg-(--sds-color-surface-muted) text-(--sds-color-text-muted) border border-(--sds-color-border-subtle)',
    },
  },
});

export const stepLabelRecipe = cv({
  base: 'text-sm font-medium transition-colors',
  variants: {
    status: {
      pending:  'text-(--sds-color-text-muted)',
      active:   'text-(--sds-color-text-default)',
      complete: 'text-(--sds-color-text-default)',
      error:    'text-(--sds-color-danger-emphasis)',
      loading:  'text-(--sds-color-text-default)',
    },
  },
});

export const stepConnectorRecipe = cv({
  base: 'transition-colors',
  variants: {
    orientation: {
      horizontal: 'flex-1 h-px self-center mx-2 border-t',
      vertical: 'w-px self-start ms-4 my-1 grow border-s',
    },
    status: {
      complete: 'border-(--sds-color-success-emphasis)',
      active:   'border-(--sds-color-accent-emphasis)',
      pending:  'border-(--sds-color-border-subtle)',
      error:    'border-(--sds-color-danger-emphasis)',
    },
  },
  defaultVariants: { orientation: 'horizontal', status: 'pending' },
});
```

Connector status is **the status of the step _before_ it** — visually the line "fills in" as you advance.

---

## `stepStatus.ts` — pure helper

```ts
export type StepStatus = 'pending' | 'active' | 'complete' | 'error' | 'loading';

export function resolveStepStatus(args: {
  index: number;
  activeIndex: number;
  explicit?: StepStatus;
}): StepStatus {
  if (args.explicit && args.explicit !== 'pending') {
    // explicit error/loading/complete/active always wins
    if (args.explicit === 'active' && args.index !== args.activeIndex) {
      // active can only be on the active index
      return args.index < args.activeIndex ? 'complete' : 'pending';
    }
    return args.explicit;
  }
  if (args.index < args.activeIndex) return 'complete';
  if (args.index === args.activeIndex) return 'active';
  return 'pending';
}
```

Unit-tested with the full status truth table.

---

## A11y

- **Root**: `<ol role="list" aria-label={ariaLabel ?? i18n('stepper.label', 'Progress')}>`.
- **Steps**: each step is `<li>` with `aria-current="step"` when active.
- **Indicator icon / number**: `aria-hidden="true"`; the step label is the accessible name.
- **Status**: encoded in `aria-label` of the indicator ("Step 2 of 4: Profile, complete").
- **Clickable steps**: render as `<button type="button">` with disabled state for non-clickable steps (linear mode + pending). Otherwise plain text.
- **Keyboard**:
  - When `clickable`, steps participate in tab order; Enter / Space activate.
  - When `clickable={false}` (default), steps are non-interactive — no tab stop, no focus ring.
- **`linear` mode**: `aria-disabled="true"` on pending steps that are not the next one; `disabled` on button.
- axe-core: 0 violations in horizontal, vertical, clickable, linear modes.

---

## i18n

When wrapped in `<I18nProvider>`, Stepper consumes:

| Key                       | Default (en)               | Notes                                       |
| ------------------------- | -------------------------- | ------------------------------------------- |
| `stepper.label`           | "Progress"                 | Root `aria-label`                            |
| `stepper.step`            | "Step {{n}} of {{total}}"  | Indicator `aria-label` prefix                |
| `stepper.status.complete` | "complete"                 | appended to step aria-label                  |
| `stepper.status.active`   | "in progress"              |                                              |
| `stepper.status.pending`  | "not started"              |                                              |
| `stepper.status.error`    | "has errors"               |                                              |
| `stepper.status.loading`  | "loading"                  |                                              |

English / Hebrew / Arabic bundles shipped (consistent with DataGrid / Pagination).

---

## RTL

- Horizontal stepper flows logical-start → logical-end. In RTL the first step appears on the right.
- Connector uses `border-inline-start` for the vertical variant — appears on logical-start edge.
- Step number digits remain LTR (consistent with `tabular-nums` and standard form indicators).
- Icons (check, alert): direction-agnostic.

---

## Performance

- Pure render given props. No effects except for the optional `onStepClick` handler.
- Compound mode walks `Children.toArray` once per render.
- `stepStatus` is O(1) per step.
- Bundle target: **< 4 KB gz**.

---

## Testing

- Renders horizontal + vertical, all three variants.
- Status auto-derivation matches the truth table.
- Explicit `status: 'error'` and `'loading'` override auto status.
- `linear={true}` makes pending steps non-clickable.
- `clickable="completed"` lets only completed steps fire `onStepClick`.
- Keyboard navigation (Tab/Enter/Space) works when clickable.
- Connector status reflects the preceding step's status.
- Compound mode honors children order over `steps` prop.
- Responsive `orientation={{ base: 'vertical', md: 'horizontal' }}` switches class set.
- Vertical mode shows active step's `content` (if provided); others hide it.
- i18n: `aria-label` strings change with `<I18nProvider locale="he">`.
- RTL snapshot tests.
- axe-core: 0 violations across all modes.

---

## Acceptance Criteria

- [ ] `<Stepper />` + `<Stepper.Step />` exported.
- [ ] Horizontal + vertical layouts; responsive.
- [ ] Three variants: numbered / dots / progress.
- [ ] All five step statuses render correctly (incl. loading via Spinner, error via icon).
- [ ] Clickable + linear modes function.
- [ ] Connector lights up step-by-step.
- [ ] i18n bundle for en/he/ar.
- [ ] RTL correct.
- [ ] axe-core: 0 violations.
- [ ] Bundle < 4 KB gz.

---

## DRY Self-Check

- [ ] Reuses `<Spinner>` (Phase 39), `<Divider>` (Phase 38), `<Icon>` (Phase 14), `<Slot>` if needed.
- [ ] `stepStatus.ts` pure + testable.
- [ ] No new color tokens — uses semantic tokens (accent/success/danger/muted).
- [ ] Reuses `useThemedClasses`.
- [ ] Reuses `useI18n` from engine.
- [ ] `useStepperKeyboard` not extracted yet — keyboard logic small enough to live inline; revisit if Stepper gets a roving-focus pattern.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/41-stepper.md`.
2. Outcome notes: bundle delta, decisions on Spinner sizing inside indicator, any i18n key tweaks.
3. Document the "wizard pattern": `Stepper` + form + footer with `Button` next/prev/submit, controlled state in consumer.

---

## Outcome

Shipped `<Stepper />` as a compound + array-API navigation primitive that renders `<ol aria-label="Progress">` with one `<li>` per step, weaves connector `<li>`s between them, and threads variant / size / orientation / clickability through React context to subparts. Both APIs land on the exact same DOM shape so screen readers see one consistent progression regardless of which surface the consumer chose.

### Files shipped

- `packages/components/src/Stepper/Stepper.types.ts` — `StepData`, `StepperProps`, `StepperStepProps`, `StepperContextValue`, `StepperClickable`, `StepperClickInfo`, `StepStatus`.
- `packages/components/src/Stepper/Stepper.recipe.ts` — six-slot recipe (`root`, `item`, `interactive`, `indicator`, `label`, `description`, `connector`, `content`) with 3 variants × 5 statuses × 3 sizes via `compoundVariants`.
- `packages/components/src/Stepper/StepperContext.ts` — context + `useStepperContext(componentName)` that throws when subparts render outside the root.
- `packages/components/src/Stepper/stepStatus.ts` — pure status truth-table resolver (`resolveStepStatus`), connector mirror (`resolveConnectorStatus`), and clickability gate (`isStepClickable`); table-tested in isolation.
- `packages/components/src/Stepper/StepperStepRender.tsx` — shared renderer used by both array + compound APIs, including the indicator glyph picker (`renderIndicatorContent`) that swaps step number → `<Check>` / `<AlertCircle>` / `<Spinner>` based on status.
- `packages/components/src/Stepper/Stepper.tsx` — root that owns array-API rendering, compound-API child walking with `cloneElement(child, { __stepperIndex })` to inject the index, connector weaving, and context propagation.
- `packages/components/src/Stepper/StepperStep.tsx` — `<Stepper.Step>` subpart with internal `__stepperIndex` prop the root injects; resolves its own status + clickability locally.
- `packages/components/src/Stepper/index.ts` — `Object.assign(StepperRoot, { Step })` compound.
- `packages/components/src/Stepper/meta.ts` — renderer metadata.
- `packages/components/src/Stepper/examples/*.tsx` (16 examples): `Basic`, `Vertical`, `Variants`, `Sizes`, `WithDescriptions`, `WithErrorStep`, `WithLoadingStep`, `Clickable`, `ClickableCompleted`, `LinearMode`, `Responsive`, `Compound`, `VerticalWithContent`, `CustomIcons`, `CustomConnector`, `Wizard`.
- `packages/components/src/Stepper/README.mdx` — anatomy / examples / props / status auto-derivation / clickability / variants / sizes / accessibility / i18n / RTL / theming / wizard composition pattern / do-don't.
- `packages/components/__tests__/stepStatus.test.ts` (20 tests — full status truth table + connector mirror + clickability gate).
- `packages/components/__tests__/Stepper.test.tsx` (31 tests — array + compound APIs, status auto-derivation, connectors, clickability, linear, icons, ref forwarding, regression).
- `packages/components/__tests__/Stepper.a11y.test.tsx` (26 tests — including a 27-cell axe matrix across all variant × orientation × size combos + dedicated error / loading / clickable + linear / compound API cells).
- `packages/components/src/index.ts` — public exports for `Stepper`, `useStepperContext`, `isStepClickable`, `resolveConnectorStatus`, `resolveStepStatus`, and the full type surface (inserted alphabetically between `Stat` and `Switch`).
- `apps/renderer/src/generated/exampleRegistry.ts` — regenerated, 16 Stepper entries wired (total 435 entries up from 419).

### Test summary

`pnpm vitest run __tests__/stepStatus.test.ts __tests__/Stepper.test.tsx __tests__/Stepper.a11y.test.tsx` → **77 / 77 pass** (20 + 31 + 26). Lint clean (0 errors, 0 warnings on Stepper files). Typecheck clean — `pnpm typecheck` reports zero workspace errors after the Stack lane's recent `StackGap` widening unblocked the previously red `Stat/StatGroup` files.

### Ship-gate (functional-example rule)

- **Default `Basic` example** is interactive: visible **Back / Next / Reset** buttons advance a real `useState` index. No auto-advance on mount.
- **`Clickable` / `ClickableCompleted` / `LinearMode`** examples all render the full clickable button row, with the active label echoed in a paragraph so Ahmad can see which step fired.
- **`WithErrorStep` / `WithLoadingStep`** include a visible toggle / trigger button (not auto-cycling) so the renderer demonstrates the override status without surprising the user.
- **`Wizard`** is a self-contained 4-step wizard with Input + Back/Next/Submit buttons and a "Reset" path — exercises the full Stepper API end-to-end.
- No example mounts a hidden-only piece; every example wraps in `<ExampleBlock />`.
- No renderer restart performed.

### Notable implementation decisions

1. **`interactive` vs `clickable` split inside the renderer** — when the consumer passes `clickable={true}` (or `'completed'` / `linear`), every step renders inside a `<button>` shell so screen-reader users see a uniform focusable list. The button's `disabled` attribute (driven by `isStepClickable`) controls whether the click can actually fire. This avoids axe violations from steps that "look interactive but aren't" and gives keyboard users predictable Tab order.
2. **`__stepperIndex` via `cloneElement` for the compound API** — the root walks children once per render and injects each `<Stepper.Step>`'s 0-based index. Avoids a `useEffect`-based registry round-trip that would cause a render desync on the first paint.
3. **Six-slot recipe** (`root`, `item`, `interactive`, `indicator`, `label`, `description`, `connector`, `content`) — the plan called for four slots; I added `interactive` (for the optional `<button>` shell) and split `content` out from `description` so theme overrides can target the vertical "expanded panel" independently of the secondary text line.
4. **`aria-label` lives on the `<button>` in interactive mode, not on the indicator span** — axe rejects `aria-label` on a roleless `<span>`. The `<li data-stepper-item>` already conveys list-item semantics; the composed "Step 2 of 4: Profile, in progress" string is the button's accessible name when interactive, and the label text + status data attrs cover the non-interactive case.
5. **Loading state auto-injects `<Spinner>` from Phase 39** — no other primitive can carry the indeterminate work-in-progress affordance cleanly, and consumers asked for visible loading on async steps. Default size maps `sm/md` → `xs`, `lg` → `sm`.
6. **Pure helpers (`resolveStepStatus`, `resolveConnectorStatus`, `isStepClickable`)** — table-tested without React; same convention as `computeVisibleItems` (Breadcrumbs) and `useTabsKeyboard` (Tabs).

### Deviations from the plan

- **`<I18nProvider>` integration deferred** — the engine primitive still hasn't shipped (same blocker noted in Breadcrumbs Outcome). The default `aria-label="Progress"` and the per-step status strings (`"complete"`, `"in progress"`, etc.) are currently hard-coded English; the `aria-label` prop accepts a consumer override today. When `<I18nProvider>` lands, the same prop surface plugs into `t('stepper.label')` / `t('stepper.status.complete')` etc. with no breaking change. Plan acceptance criteria checkbox for `<I18nProvider>` is left unchecked; the rest of the i18n row is satisfied via prop-level overrides.
- **`<Icon>` component doesn't exist in this codebase** — used `lucide-react` icons directly (`<Check>`, `<AlertCircle>`), matching the Tabs / Breadcrumbs / EmptyState convention.
- **Recipe color tokens** — used the shipped Tailwind preset utilities (`bg-primary`, `text-fg-default`, `bg-success`, etc.) instead of the plan's `(--sds-color-*)` CSS-variable syntax. Matches every other shipped component recipe.
- **No 1-LoC keyboard hook** — plan calls out `useStepperKeyboard not extracted yet — keyboard logic small enough to live inline`. Native `<button>` keyboard handling (Enter / Space) covers everything we need; no custom roving-focus pattern is required because each step gets its own native tab stop. If a third roving-focus consumer surfaces (Tabs + Toolbar are already shipped consumers), the existing `_shared/useListKeyboard.ts` should be the destination, not a Stepper-specific helper.
- **Six recipe slots, not four** — see decision #3 above.
- **Bundle measurement deferred** — no bundle-size guard exists in the components package yet; the implementation is small (one root + one subpart + one renderer + pure helper) and Spinner / `lucide-react` icons are peer imports so they tree-shake out when consumers don't reach into those code paths. A bundle gate can be added later without code changes.

### Coordination notes

- **No `_shared/` writes.** No edits to Spinner / Divider / Card / any other component package. `<Spinner>` is consumed via direct import (`../Spinner/Spinner`), `<Check>` / `<AlertCircle>` from `lucide-react`. Roving-focus pattern from Tabs was NOT duplicated; native `<button>` keyboard semantics cover the Stepper use case.
- **`packages/components/src/index.ts`** — surgical insert between `Stat` exports and `Switch` (alphabetical). 5 named exports + 11 named types in one block.
- **`packages/theme/`, `packages/engine/`, `packages/tokens/`** — untouched.
- **Pre-existing failures unrelated to Stepper**: full `pnpm test` run shows 12 failed across `Toast.test.tsx` / `Combobox.a11y.test.tsx` / `Alert.test.tsx` / `Select.a11y.test.tsx` — all `act()` warnings or jsdom `scrollTo` not-implemented from Motion. None overlap with Stepper. Stepper-scoped run is 77/77 green.
