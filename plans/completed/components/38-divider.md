# Phase 38 — `<Divider />`

> Status: **Pending** · **Tier 1** · Depends on: Phase 3 (`asChild`) · Used by: Stack (Phase 37), Menu (Phase 22), Card, Modal
> Pure separator primitive. No state, no JS-driven layout.

## Objective

Ship the canonical **`<Divider />`** — horizontal or vertical rule with optional inline label.

Used as:

- Stand-alone `<hr>`-style separator in vertical layouts.
- Vertical separator inside HStacks (e.g. toolbar groupings).
- Auto-inserted divider between Stack children (`<Stack divider={<Divider />}>`).
- Section separator with inline label (`<Divider>OR</Divider>`).
- Menu group separator.

The DS already uses bordered separators ad-hoc inside Card, Modal, Menu — Phase 38 promotes the pattern to a first-class primitive.

---

## Public API

```tsx
import { Divider } from 'apx-ds';

// Default — horizontal rule
<Divider />

// Vertical (inside HStacks)
<HStack gap={2} align="center">
  <Button variant="ghost">Cut</Button>
  <Button variant="ghost">Copy</Button>
  <Divider orientation="vertical" />
  <Button variant="ghost">Paste</Button>
</HStack>

// With inline label
<Divider>OR</Divider>
<Divider labelPosition="start">Section heading</Divider>
<Divider labelPosition="end">end</Divider>

// Styled
<Divider thickness={2} color="strong" variant="dashed" />

// Polymorphic
<Divider as="hr" />              // default
<Divider as="li" role="separator" />   // inside <ul role="menu">

// Full prop form
<Divider
  orientation="horizontal"        // 'horizontal' | 'vertical'
  variant="solid"                 // 'solid' | 'dashed' | 'dotted'
  thickness={1}                   // 1 | 2 | 4  (px)
  color="subtle"                  // 'subtle' | 'default' | 'strong'  (token-mapped)
  inset={0}                       // 0 | number — inline-padding before/after the rule
  labelPosition="center"          // 'start' | 'center' | 'end'
  decorative={false}              // boolean — if true, role="presentation"
  className=""
  style={{}}
  ref={…}
>
  {/* optional label */}
</Divider>
```

---

## API Decisions

| Decision                                                              | Why                                                                                                            |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`orientation` prop replaces separate `HDivider`/`VDivider` exports** | Single primitive; cleaner. Vertical needs to know the parent has finite cross-axis height (HStack provides this). |
| **Default element = `<hr>`** when no label, `<div role="separator">` when labeled | `<hr>` cannot contain children; switch element when label is present.                                          |
| **`decorative={true}` → `role="presentation"`**                       | Per ARIA spec: when a divider is purely visual (e.g. inside a Card already announced as a region), suppress it from AT. |
| **`color` is token-mapped** (`subtle`, `default`, `strong`)            | Uses `--sds-color-border-*` vars. Theme-aware automatically; no raw hex.                                       |
| **`thickness` is a finite enum (1/2/4)**                              | Prevents off-pixel rendering. Most DSes use 1px; 2/4 reserved for emphasis dividers.                          |
| **`variant` covers solid/dashed/dotted**                              | Border-style passthrough; common need for "draft" / "incomplete" section separators.                          |
| **Label rendering uses flex with pseudo-rules** (border-before / border-after) | CSS-only; no extra DOM nodes. Single element wraps the label + draws lines via `::before` / `::after`.       |
| **No animation**                                                      | A divider doesn't transition. Skip motion entirely.                                                            |

---

## Recipe

```ts
export const dividerRecipe = cv({
  base: 'shrink-0 border-0 m-0',  // reset <hr> defaults
  variants: {
    orientation: {
      horizontal: 'w-full block',
      vertical: 'h-full inline-block self-stretch',
    },
    variant: {
      solid:  'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
    },
    thickness: {
      1: '',   // applied via border-t-1 / border-l-1 below
      2: '',
      4: '',
    },
    color: {
      subtle:  '[border-color:var(--sds-color-border-subtle)]',
      default: '[border-color:var(--sds-color-border-default)]',
      strong:  '[border-color:var(--sds-color-border-strong)]',
    },
  },
  compoundVariants: [
    // horizontal × thickness → border-top-*
    { orientation: 'horizontal', thickness: 1, class: 'border-t' },
    { orientation: 'horizontal', thickness: 2, class: 'border-t-2' },
    { orientation: 'horizontal', thickness: 4, class: 'border-t-4' },
    // vertical × thickness → border-inline-start-*
    { orientation: 'vertical', thickness: 1, class: 'border-s' },
    { orientation: 'vertical', thickness: 2, class: 'border-s-2' },
    { orientation: 'vertical', thickness: 4, class: 'border-s-4' },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'solid',
    thickness: 1,
    color: 'subtle',
  },
});
```

`border-s-*` (border-inline-start) is RTL-correct — flips automatically with `dir="rtl"`.

### Labeled-divider recipe

```ts
export const labeledDividerRecipe = cv({
  base: 'flex items-center w-full text-sm text-(--sds-color-text-muted)',
  variants: {
    labelPosition: {
      start:  'before:hidden after:flex-1',
      center: 'before:flex-1 after:flex-1',
      end:    'before:flex-1 after:hidden',
    },
  },
  // ::before / ::after pseudo-elements get the border
  // gap between label + rule is controlled via gap-*
  defaultVariants: { labelPosition: 'center' },
});
```

Pseudo-elements drawing the border: `before:content-[''] before:border-t before:border-(--sds-color-border-subtle)` etc. Both before/after inherit the `variant` and `color` props at runtime via inline CSS vars.

---

## File Structure

```
packages/components/src/Divider/
├── Divider.tsx
├── Divider.types.ts
├── Divider.recipe.ts
├── Divider.test.tsx
├── Divider.a11y.test.tsx
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Vertical.tsx                # inside an HStack toolbar
    ├── WithLabel.tsx
    ├── LabelPositions.tsx
    ├── Thickness.tsx
    ├── Variant.tsx                 # solid / dashed / dotted side-by-side
    ├── Colors.tsx
    ├── InCard.tsx                  # Card body with divider between sections
    └── InStack.tsx                 # Stack with divider={<Divider />}
```

---

## A11y

- **Role**:
  - Unlabeled, `decorative=false` (default) → `<hr>` with native `role="separator"`.
  - Labeled → `<div role="separator" aria-orientation={orientation}>` containing `<span>{children}</span>`.
  - `decorative=true` → `role="presentation"` (or `aria-hidden="true"` on `<hr>`).
- `aria-orientation` set when orientation is vertical (horizontal is the implicit default).
- Label text is announced as part of the separator.
- axe-core: 0 violations.

---

## Polymorphism

- `as` accepts `'hr' | 'div' | 'li' | …`. Default chosen based on whether children are present.
- `asChild` (via `<Slot>`) supported for the labeled variant only — unlabeled `<hr>` cannot have children so Slot makes no sense.

---

## Testing

- Renders `<hr>` by default with no children.
- Renders `<div role="separator">` when children are present.
- `orientation="vertical"` adds `aria-orientation="vertical"`.
- `decorative` switches role to `presentation`.
- `thickness` × `orientation` produce the expected border class.
- `color` uses the corresponding CSS variable.
- `variant="dashed"` / `dotted` applied.
- `labelPosition` produces correct flex-grow pattern (before/after pseudo-rules).
- RTL: vertical divider uses `border-inline-start` so it appears on the visually-leading edge regardless of direction.
- axe-core: 0 violations in horizontal, vertical, labeled, decorative modes.

---

## Acceptance Criteria

- [ ] Exports `<Divider />`.
- [ ] `orientation`, `variant`, `thickness`, `color`, `labelPosition`, `decorative` all work.
- [ ] Default = horizontal, solid, 1px, subtle.
- [ ] Labeled variant uses pseudo-elements (no extra DOM nodes).
- [ ] Vertical divider works inside an HStack with `align="stretch"`.
- [ ] axe-core: 0 violations.
- [ ] Stack (Phase 37) auto-divider passes `<Divider />` and renders correctly.
- [ ] Card / Menu refactor to use `<Divider />` instead of inline border classes (optional, follow-up PR).

---

## DRY Self-Check

- [ ] No raw hex / px — all colors via CSS vars; thickness via Tailwind enum.
- [ ] Uses `useThemedClasses`.
- [ ] Pseudo-element label trick avoids 3-DOM-node labeled divider (no `<span><hr/><span>`).
- [ ] RTL-correct via `border-inline-start` (no per-dir branches).
- [ ] One component for both horizontal + vertical (no HDivider/VDivider duplication).

---

## When This Phase Is Complete

1. Move to `plans/completed/components/38-divider.md`.
2. Outcome notes: any Card / Menu refactor opportunities (separate PRs).
3. Document standard usage in MDX so consumers stop writing `<hr className="border-t …">`.

---

## Outcome

**Shipped (Phase 38).** `<Divider />` is the canonical separator primitive — token-mapped,
RTL-correct, with both `<hr>` and labeled flavors under one API.

### Files delivered

```
packages/components/src/Divider/
├── Divider.tsx              # polymorphic component (hr / div role=separator)
├── Divider.recipe.ts        # rule recipe + labeled-wrapper recipe
├── Divider.types.ts
├── meta.ts
├── README.mdx
├── index.ts
└── examples/                # 8 examples
    ├── Basic.tsx
    ├── Vertical.tsx
    ├── WithLabel.tsx
    ├── LabelPositions.tsx
    ├── Thickness.tsx
    ├── Variant.tsx
    ├── Colors.tsx
    ├── InCard.tsx
    └── Decorative.tsx
```

### Public API delivered

All plan props ship as designed:

- `orientation: 'horizontal' | 'vertical'` (default `'horizontal'`)
- `variant: 'solid' | 'dashed' | 'dotted'` (default `'solid'`)
- `thickness: 1 | 2 | 4` (default `1`)
- `color: 'subtle' | 'default' | 'strong'` (default `'subtle'`)
- `labelPosition: 'start' | 'center' | 'end'` (default `'center'`)
- `decorative: boolean` (default `false`)
- `as: ElementType` (default `'hr'` unlabeled, `'div'` labeled)
- `className`, `style`, `sx`, `ref`, `role`, `aria-orientation`, `aria-hidden` — all standard.

Auto-selection: when `children` is present the rendered element flips from `<hr>` (which is a
void element and cannot contain content) to `<div role="separator" aria-labelledby={labelId}>`.

### Labeled-divider implementation

The plan suggested CSS pseudo-elements (`::before` / `::after`) for the flanking rules. I
chose **real `<span aria-hidden>` siblings** instead because:

1. Tailwind's JIT scanner needs to see the rule classes literally; pseudo-element variants
   (`before:border-t`) double the class list and complicate the `border-X` token wiring.
2. Reusing `dividerRuleRecipe` for both the unlabeled `<hr>` and the flank spans means a
   single source of truth for `color × variant × thickness × orientation` — no second copy
   of the compound-variant matrix.
3. Real spans give us a clean a11y story: `aria-hidden="true"` on the lines, the label sits
   inside `<span id={labelId}>`, and the wrapper's `aria-labelledby` points at it so screen
   readers always announce the label as the separator's accessible name. dom-accessibility-api
   doesn't apply name-from-content to `role="separator"`, so the explicit `aria-labelledby`
   wiring was necessary.

The extra DOM cost is 2 `<span>`s per labeled divider — negligible.

### Accessibility

- Unlabeled: native `<hr>` carries `role="separator"`. `aria-orientation="vertical"` emitted
  only when needed (horizontal is the spec default).
- Labeled: `<div role="separator" aria-labelledby={labelId}>` with `<span id={labelId}>` as
  the named target. Flank rules are `aria-hidden="true"`.
- `decorative={true}` → `role="presentation"` + `aria-hidden="true"`.
- RTL: vertical divider uses `border-inline-start` (Tailwind `border-s`) so it always sits on
  the visually-leading edge regardless of `dir=`.
- **axe-core: zero violations** across the full prop matrix (3 variants × 3 thicknesses × 3
  colors × 2 orientations + labeled + decorative).

### Tests

- `Divider.test.tsx` — 26 tests. Element switch (`<hr>` vs `<div>`), `as` polymorphism,
  orientation, thickness × orientation compound rules (6 cells explicit), variant matrix,
  color matrix, decorative role/aria-hidden, labeled-form flank rendering, labelPosition
  collapse, color flow-through to flank spans, className passthrough on both forms.
- `Divider.a11y.test.tsx` — 17 tests. Native `<hr>` role/orientation, vertical aria-orientation,
  labeled accessible name (via `aria-labelledby`), decorative AT-hiding, axe across all
  orientations / variants / thicknesses / colors + labeled + decorative.

**Total: 43 tests, all passing.**

### Bundle size

Measured standalone (esbuild bundle of `src/Divider/index.ts`, all peer deps external,
minified + gzipped):

| Bundle artifact         | Size       |
| ----------------------- | ---------- |
| Divider (standalone)    | **1,062 B (≈ 1.0 KB) gzipped** |

The plan didn't fix a target; for a layout primitive this is squarely in tiny-primitive
territory (Skeleton + Badge are in the same band). Workspace-wide delta wasn't measurable
cleanly because the workspace build is currently red from other agents' WIP (Stack JSX-in-`.ts`,
EmptyState missing JSX namespace import) — both pre-existing and not in my lane.

### Deviations from spec

1. **Real `<span>` flank rules instead of CSS pseudo-elements** — see "Labeled-divider
   implementation" above. Same visual, simpler recipe story, no class-scanner gymnastics.
2. **`thickness` keys stored as `'1' / '2' / '4'` strings inside the recipe** — `cv`'s
   `VariantValues` type requires string keys. The public `DividerThickness` type stays as
   `1 | 2 | 4` (consumers pass the number); the component coerces with `String(thickness)`
   at the recipe boundary. Zero consumer-facing impact.
3. **`asChild` (Slot) deferred.** The plan listed it as supported for the labeled variant.
   Slot would need wrapper-element substitution (the `<span>` flank rules can't be cloned
   into arbitrary children's slots), so it's a meaningful design exercise rather than a
   one-line addition. The current `as: ElementType` prop covers the common cases
   (`<Divider as="li">`); Slot can be added in a follow-up if a real consumer needs it.

### Lint / typecheck / build

- `eslint src/Divider/**` — **clean**. Pre-existing errors in other agents' lanes flagged:
  - `src/Stack/stackChildrenWithDivider.ts:82` — JSX in a `.ts` file (SDS-Agent2).
  - `src/Breadcrumbs/BreadcrumbsItem.tsx:81` — unused `eslint-disable` directive (Breadcrumbs lane).
  - `src/Stack/Stack.tsx:67` — unused `eslint-disable` directive (SDS-Agent2).
- `tsc --noEmit` for `src/Divider/**` — clean. Workspace typecheck blocked by Stack JSX
  parse error and EmptyState missing JSX namespace import — both other-agent issues.
- `tsup build` — components ESM build clean (`419.67 KB` total raw / `~86.6 KB gzipped`
  with Divider in place). DTS phase failed on EmptyState; not Divider.

### Coordination

- No `_shared/` writes.
- No edits to Card / Menu / Modal / any consumer (per plan — consumer migration is a
  follow-up PR).
- No theme-token / tailwind-preset edits.
- No new engine primitives requested.
- `packages/components/src/index.ts` — surgical alphabetical insert between `Checkbox` and
  `Drawer`. No collision with parallel lanes.
- Renderer not started / restarted.

### Follow-ups (logged, not blocking)

- **Consumer migration** — Card, Menu, Modal currently use inline `border-t` for section
  separators. Migration to `<Divider />` is a follow-up PR per the plan's "When This Phase
  Is Complete" notes. Stack (Phase 37) is the first new consumer via its `divider` prop.
- **`asChild` / Slot integration** — when a labeled-form consumer needs it.
- **Vertical labeled dividers** — current implementation only labels horizontal dividers.
  Vertical labels are a pathological visual; deferred unless a real consumer surfaces.
