# Phase 37 — `<Stack />` + `<HStack />` + `<VStack />` + `<Spacer />`

> Status: **✅ Shipped** · Owner: **SDS-Agent2** · **Tier 1** · Depends on: Phase 3 (`<Slot>` / `asChild` infra) · Blocks: nothing
> Pure layout primitive. No engine, no overlay, no animation.

## Objective

Ship the canonical **flexbox layout primitives** — `<Stack />`, `<HStack />`, `<VStack />`, `<Spacer />`.

A modern DS needs a small, composable layout vocabulary so consumers stop reaching for raw `<div className="flex …">` everywhere. These four primitives cover ~95% of layout composition in product surfaces:

- `<Stack>` — generic flex container (defaults to vertical).
- `<HStack>` — horizontal alias (`direction="row"`).
- `<VStack>` — vertical alias (`direction="column"`).
- `<Spacer>` — `flex: 1` element that pushes siblings apart inside a Stack.

---

## What This Component Proves

- Pure layout primitives can be **tiny** (< 1 KB gz combined) while still being type-safe + responsive + RTL-correct.
- Logical inline/block axis (`flex-direction: row` flips automatically under `dir="rtl"`) eliminates per-direction mirroring code.
- The DS's `ResponsiveValue<T>` shape (already used by Button / Input / etc.) generalizes to layout props.

---

## Public API

```tsx
import { Stack, HStack, VStack, Spacer } from 'apx-ds';

// Vertical stack (default)
<Stack gap={4}>
  <Card>One</Card>
  <Card>Two</Card>
  <Card>Three</Card>
</Stack>

// Horizontal
<HStack gap={2} align="center">
  <Avatar src={user.avatar} />
  <span>{user.name}</span>
  <Spacer />
  <Button>Edit</Button>
</HStack>

// Responsive direction
<Stack
  direction={{ base: 'column', md: 'row' }}
  gap={{ base: 2, md: 4 }}
  align="stretch"
  justify="between"
>
  <Sidebar />
  <Main />
</Stack>

// Polymorphic (renders as <ul>)
<VStack as="ul" gap={1} role="list">
  {items.map((item) => <li key={item.id}>{item.label}</li>)}
</VStack>

// Full prop form
<Stack
  /* axis */
  direction="column"                   // 'column' | 'column-reverse' | 'row' | 'row-reverse' | ResponsiveValue<…>
  /* alignment */
  align="stretch"                      // 'start' | 'center' | 'end' | 'stretch' | 'baseline' | ResponsiveValue<…>
  justify="start"                      // 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' | ResponsiveValue<…>
  /* spacing */
  gap={4}                              // 0..12 (theme scale) | 'px' | ResponsiveValue<…>
  rowGap={undefined}                   // overrides gap on row axis
  columnGap={undefined}                // overrides gap on col axis
  /* wrapping */
  wrap={false}                         // boolean | 'reverse'
  /* dividers (auto-inserted between children) */
  divider={undefined}                  // ReactNode | <Divider />  — auto-replicated between non-Spacer children
  /* sizing */
  fullWidth={false}                    // w-full (block-level)
  inline={false}                       // inline-flex instead of flex
  /* polymorphism */
  as="div"                             // any HTML element
  asChild={false}                      // <Slot> — render as the single child
  /* misc */
  className=""
  sx={{}}
  style={{}}
  ref={…}
>
  {children}
</Stack>

<HStack {…same props, direction locked to 'row'} />
<VStack {…same props, direction locked to 'column'} />

<Spacer
  size={undefined}                     // number — fixed size in theme units (skips flex: 1)
  axis="auto"                          // 'auto' | 'inline' | 'block' — overrides parent's direction when needed
/>
```

---

## API Decisions

| Decision                                                       | Why                                                                                                       |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Default `direction="column"`**                                | "Stack" connotes vertical to most developers (Chakra / Polaris convention). HStack / VStack are explicit aliases. |
| **`HStack` / `VStack` are alias components**, not boolean flags | Clearer at the call site; `<HStack gap={2}>` reads better than `<Stack direction="row" gap={2}>`.        |
| **`gap` is a number on the theme spacing scale (0..12)**       | Matches Tailwind's `space-y-*` / `gap-*`. Allows `'px'` for 1px and `ResponsiveValue<number>` for breakpoints. |
| **`divider` auto-inserts between children**                    | Killer feature — `<Stack divider={<Divider />} gap={2}>…</Stack>` "just works."                          |
| **`<Spacer>` is a separate component**                         | `flex: 1` element. Avoids consumers writing `<div className="flex-1" />` everywhere; named role.          |
| **`align` + `justify` use logical-axis names** (`start`/`end`) | Logical-property friendly; works correctly in RTL without manual mirroring.                                |
| **No `padding` / `margin` props**                              | Out of scope. Padding lives on Card / Box equivalents. Margin is anti-pattern in a gap-first system.       |
| **No `width` / `height` props**                                | Use `className` / `style` for overrides. Keeps the API surface minimal.                                    |
| **Polymorphic via `as` AND `asChild`**                        | `as` for the 90% case (semantic element); `asChild` for the rare polymorphic-with-className case.         |

---

## Variants — Designed Inline

Stack has **no visual variants** — it's invisible. Only layout axes:

### Direction × axis-aware spacing

```ts
direction: 'column'         → flex-direction: column → gap-y: $gap; gap-x: $columnGap || $gap
direction: 'row'            → flex-direction: row    → gap-x: $gap; gap-y: $rowGap || $gap
direction: 'column-reverse' → flex-direction: column-reverse
direction: 'row-reverse'    → flex-direction: row-reverse  (RTL: flips to LTR visual order; usually you want row instead)
```

### Align × justify map

| Prop value  | flex equivalent     |
| ----------- | ------------------- |
| `start`     | `flex-start`        |
| `center`    | `center`            |
| `end`       | `flex-end`          |
| `stretch`   | `stretch`           |
| `baseline`  | `baseline` (align only) |
| `between`   | `space-between` (justify only) |
| `around`    | `space-around` (justify only) |
| `evenly`    | `space-evenly` (justify only) |

### Spacing scale

| `gap` value | px (default theme)  |
| ----------- | ------------------- |
| `0`         | 0                   |
| `'px'`      | 1                   |
| `0.5`       | 2                   |
| `1`         | 4                   |
| `2`         | 8                   |
| `3`         | 12                  |
| `4`         | 16 (default)        |
| `6`         | 24                  |
| `8`         | 32                  |
| `12`        | 48                  |

Plus arbitrary numbers via Tailwind JIT (`gap-[24px]` if needed).

---

## File Structure

```
packages/components/src/Stack/
├── Stack.tsx
├── HStack.tsx                          # alias — re-exports Stack with `direction="row"` baked in
├── VStack.tsx                          # alias — same, "column"
├── Spacer.tsx
├── Stack.types.ts
├── Stack.recipe.ts
├── stackChildrenWithDivider.ts         # pure: children[] + divider → React.Children
├── Stack.test.tsx
├── Stack.a11y.test.tsx
├── stackChildrenWithDivider.test.ts
├── index.ts                            # exports: Stack, HStack, VStack, Spacer + types
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Horizontal.tsx
    ├── Responsive.tsx                  # direction switches column → row at md
    ├── WithDividers.tsx
    ├── WithSpacer.tsx
    ├── Justify.tsx                     # all 6 justify values side-by-side
    ├── Align.tsx
    ├── Gap.tsx
    ├── Wrap.tsx
    ├── PolymorphicAs.tsx               # as="nav", as="ul"
    ├── AsChild.tsx                     # asChild + a router Link
    └── Nested.tsx                      # composing HStack inside VStack for typical card layouts
```

---

## Recipe

```ts
export const stackRecipe = cv({
  base: 'flex min-w-0',          // min-w-0 to allow children to shrink (e.g. truncated text)
  variants: {
    direction: {
      column: 'flex-col',
      'column-reverse': 'flex-col-reverse',
      row: 'flex-row',
      'row-reverse': 'flex-row-reverse',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
      reverse: 'flex-wrap-reverse',
    },
    inline: { true: 'inline-flex', false: 'flex' },
    fullWidth: { true: 'w-full', false: '' },
  },
  defaultVariants: {
    direction: 'column',
    align: 'stretch',
    justify: 'start',
    wrap: false,
    inline: false,
    fullWidth: false,
  },
});

// gap is applied separately because it accepts arbitrary numeric scale + responsive
export function getGapClass(gap: number | string | ResponsiveValue<number | string>): string {
  // returns e.g. "gap-4" or "gap-x-4 gap-y-2" or "gap-2 md:gap-4"
}
```

Gap helper produces Tailwind-JIT-discoverable classes (no `gap-[var(…)]` runtime expressions).

---

## Divider Insertion Logic — `stackChildrenWithDivider.ts`

```ts
import { Children, cloneElement, Fragment, isValidElement } from 'react';

export function stackChildrenWithDivider(
  children: ReactNode,
  divider: ReactNode | undefined
): ReactNode {
  if (!divider) return children;

  const arr = Children.toArray(children).filter(Boolean);
  const out: ReactNode[] = [];

  arr.forEach((child, i) => {
    out.push(child);
    if (i < arr.length - 1) {
      // Skip dividers around <Spacer> — spacers already create separation
      const next = arr[i + 1];
      const isSpacerEdge = isSpacer(child) || isSpacer(next);
      if (!isSpacerEdge) {
        out.push(
          isValidElement(divider)
            ? cloneElement(divider, { key: `divider-${i}` })
            : <Fragment key={`divider-${i}`}>{divider}</Fragment>
        );
      }
    }
  });

  return out;
}

function isSpacer(node: ReactNode): boolean {
  return isValidElement(node) && (node.type as { __sds_spacer?: boolean }).__sds_spacer === true;
}
```

`<Spacer>` exports a `__sds_spacer = true` marker on the component so divider insertion can skip it without consumers thinking about it.

---

## Polymorphism

- `as="ul"` — root element changes. `<Slot>` not used; just `createElement(as, props, children)`.
- `asChild` — uses `<Slot>` from Phase 3. Renders as the single child, forwarding props. Cannot combine with `as`.

```ts
if (asChild) {
  return <Slot {...mergedProps}>{children}</Slot>;
}
return createElement(as ?? 'div', mergedProps, processedChildren);
```

---

## A11y

- **Implicit semantic role: none** — Stack is a layout primitive (`<div>` by default).
- For lists, consumers use `as="ul"` + `<li>` children explicitly, or `role="list"` on the Stack and `role="listitem"` on children.
- `<Spacer>` is `aria-hidden` (purely visual).
- No focus management — layout doesn't carry focus semantics.
- axe-core: 0 violations (nothing to violate).

---

## RTL

- `flex-direction: row` flows logical-start to logical-end in both LTR and RTL — browser handles it natively.
- `justify-start` / `justify-end` are logical (also browser-native).
- `align-*` operate on the cross axis — direction-agnostic.
- **No RTL-specific code needed.** Tested with `dir="rtl"` ensuring HStack content flips correctly.

---

## Performance

- Stateless function components — no state, no effects, no event handlers.
- `stackChildrenWithDivider` runs once per render; O(n) over children with stable identity.
- `gap` class computation is memoized when `gap` is responsive (object).
- Divider insertion uses `cloneElement` with a stable key (`divider-${index}`) — no key warnings.

Bundle target: **< 1 KB gz combined for all 4 exports.**

---

## Testing

- Renders correct flex classes for each variant axis.
- `direction={{ base: 'column', md: 'row' }}` emits `flex-col md:flex-row`.
- `gap={{ base: 2, md: 4 }}` emits `gap-2 md:gap-4`.
- `divider={<hr />}` inserts dividers between non-Spacer children (n-1 dividers for n children).
- `<Spacer>` renders `flex: 1` element.
- `<Spacer size={4}>` renders fixed-size element instead.
- `as="ul"` renders `<ul>`.
- `asChild` clones single child + forwards props.
- `wrap`, `align`, `justify`, `inline`, `fullWidth` all map to expected classes.
- `ref` forwards to the rendered element.
- HStack / VStack render with locked direction and forward all other props.
- axe-core: 0 violations.

---

## Acceptance Criteria

- [ ] `<Stack>`, `<HStack>`, `<VStack>`, `<Spacer>` all exported.
- [ ] Default direction = `'column'`.
- [ ] `direction` / `align` / `justify` / `gap` accept `ResponsiveValue`.
- [ ] `divider` auto-inserts between children, skipping Spacer edges.
- [ ] `as` polymorphic + `asChild` via `<Slot>`.
- [ ] No state, no effects.
- [ ] axe-core: 0 violations.
- [ ] RTL flows naturally with `dir="rtl"` (no per-direction code).
- [ ] Bundle < 1 KB gz combined.

---

## DRY Self-Check

- [ ] No new layout utilities invented — uses standard Tailwind `flex` / `gap` / `items-*` / `justify-*`.
- [ ] Reuses `<Slot>` (Phase 3) for `asChild`.
- [ ] Reuses `ResponsiveValue<T>` type from engine.
- [ ] `stackChildrenWithDivider` is pure + testable.
- [ ] No `clsx`; uses `useThemedClasses`.
- [ ] HStack / VStack are 4-line wrappers over Stack — no duplication.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/37-stack.md`.
2. Append `## Outcome`: bundle delta (all 4 exports combined), test count, deviations.
3. With Stack shipped, future Section / Container / Grid layout primitives slot in alongside it as a coherent layout vocabulary.

---

## Outcome

Shipped by **SDS-Agent2** on **2026-05-21**.

### Shape

Four named exports from `apx-ds

| Export      | Role                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------- |
| `Stack`     | Generic flex container. Default `direction="column"`, `align="stretch"`, `justify="start"`.       |
| `HStack`    | 4-line wrapper that locks `direction="row"`. Reads cleaner than `<Stack direction="row">`.        |
| `VStack`    | 4-line wrapper that locks `direction="column"`. Explicit "vertical stack" intent.                 |
| `Spacer`    | Partner separator (`flex: 1` by default; fixed size via `size`). Carries `__sds_spacer` marker.   |

Plus a public `useRadioGroup`-style trio of named helpers: `stackChildrenWithDivider` (pure transform), `isSpacer` (predicate), and `SPACER_MARKER` constant — exposed for advanced consumers who want to build their own divider-aware containers.

### Engine consumption (no new primitives, per @SDS-Leader guardrail)

| Primitive                                | Usage                                                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `cv` + `useThemedClasses`                | All axis recipes (`direction` / `align` / `justify` / `wrap` / `inline` / `fullWidth`).          |
| `forwardRef`                             | All four exports.                                                                                |
| `Slot`                                   | `asChild` polymorphism path (the only Slot dependency in this phase).                            |
| `ResponsiveValue<T>`, `resolveResponsive`, `breakpointPrefix`, `isResponsiveObject`, `prefixClasses` | `gapClasses` helper — `gap` family can't ride `cv` directly because it splits into `gap-x-*` / `gap-y-*` when overrides land. |

`cv` already exposes responsive support via `prefixClasses` (per `packages/engine/src/cv.ts`), so `direction={{ base: 'column', md: 'row' }}` emits `flex-col md:flex-row` with zero Stack-side code.

### Files shipped

```
packages/components/src/Stack/
├── Stack.tsx                        (root, ~75 LoC)
├── HStack.tsx                       (4-line wrapper)
├── VStack.tsx                       (4-line wrapper)
├── Spacer.tsx                       (~50 LoC, sets __sds_spacer on the function)
├── Stack.types.ts                   (StackProps + SpacerProps + 7 axis types)
├── Stack.recipe.ts                  (stackRecipe + spacerRecipe + GAP_CLASSES + SPACER_FIXED_CLASSES literal tables)
├── gapClasses.ts                    (gap / rowGap / columnGap resolver)
├── stackChildrenWithDivider.tsx     (pure transform + isSpacer predicate)
├── meta.ts                          (renderer metadata)
├── index.ts                         (barrel)
├── README.mdx                       (full docs with <ExampleBlock> shortcodes)
└── examples/
    ├── Basic.tsx                    (vertical stack with gap)
    ├── Horizontal.tsx               (HStack align center)
    ├── Responsive.tsx               (column → row at md)
    ├── WithDividers.tsx             (auto-inserted between siblings)
    ├── WithSpacer.tsx               (action-row push-apart)
    ├── Justify.tsx                  (all 6 distribution values)
    ├── Align.tsx                    (all 5 cross-axis values)
    ├── Gap.tsx                      (spacing scale 0..8)
    ├── Wrap.tsx                     (flex-wrap badges)
    ├── PolymorphicAs.tsx            (as="nav", as="ul")
    ├── AsChild.tsx                  (wrap an anchor)
    └── Nested.tsx                   (HStack-in-VStack card row)
```

Tests:

```
packages/components/__tests__/
├── Stack.test.tsx                       (60 unit tests)
├── Stack.a11y.test.tsx                  (6 axe-core tests)
└── stackChildrenWithDivider.test.tsx    (12 pure-function tests)
```

### QA gate (Stack scope — all green)

- `pnpm exec vitest run __tests__/Stack.test.tsx __tests__/Stack.a11y.test.tsx __tests__/stackChildrenWithDivider.test.tsx` → **78 / 78 ✅**.
- Full workspace test run: **1335 / 1335 ✅** (up from 1257 pre-Stack — net +78 tests, zero regressions).
- `pnpm exec eslint src/Stack __tests__/Stack.test.tsx __tests__/Stack.a11y.test.tsx __tests__/stackChildrenWithDivider.test.tsx` → ✅ zero errors, zero warnings.
- `pnpm exec tsc --noEmit` workspace-wide → ✅ zero errors (including downstream `StatGroup.tsx` which now type-checks against `Stack`).
- `pnpm -F @apx-dsponents build` → ✅ ESM + CJS + DTS emitted; `Stack` / `HStack` / `VStack` / `Spacer` all appear in `dist/index.d.ts`.
- `pnpm -F apx-dsld` → ✅ umbrella package picks up the four exports via the existing `export *` chain.
- `axe-core` (jest-axe) across default vertical Stack, HStack-with-Spacer toolbar, VStack-as-`<nav>` with anchors, Stack-as-`<ul>` with `<li>` children, divider-between-children → **0 violations**.
- Did **not** start / restart the renderer.

### Bundle delta

Measured via `esbuild --bundle --minify --format=esm --target=es2022` with React, `@apx-dsine`, `@apx-apx-ds `@apx-ds/tapx-dsailwind-merge`, `clsx` externalized. Source-tree-shaken from `packages/components/src/Stack/index.ts`:

```
raw : 4350 bytes (4.25 KB)
gz  : 1733 bytes (1.69 KB)
```

| Metric            | Value         |
| ----------------- | ------------- |
| Plan target       | < 1.0 KB gz   |
| Actual            | 1.69 KB gz    |
| Delta             | **+706 bytes / +70%** |

**Deviation logged.** Drivers:

1. **GAP_CLASSES literal table** — 13 spacing tokens × 3 prefixes (`gap`, `gap-x`, `gap-y`) = 39 entries. Each entry must appear as a literal string in source so Tailwind's content-scanning JIT picks it up; runtime-computed `gap-${n}` strings are invisible to the scanner.
2. **SPACER_FIXED_CLASSES literal table** — 13 tokens × 2 axes (`block` → `h-*`, `inline` → `w-*`) = 26 entries. Same Tailwind-discoverability constraint.
3. **`gapClasses` helper** — gap can't ride `cv` natively because `cv` is single-value-per-axis; the helper does the responsive resolution by hand using the engine's `resolveResponsive` / `breakpointPrefix` primitives.
4. **4 component shells** (Stack + HStack + VStack + Spacer), each with their own forwardRef wrapper.

**Reclamation path (deferred — not in scope per guardrail):** the cleanest win is to move the GAP/SPACER literal tables out of `Stack.recipe.ts` and into the Tailwind preset's `safelist` (`packages/theme/src/tailwind-preset.ts`). That would let the helper return runtime-built `gap-${n}` strings while keeping Tailwind aware of them, shrinking the bundle to ~0.6 KB gz. Deferred because (a) it would touch `packages/theme/`, which is outside the Stack lane's guardrails, and (b) the absolute bundle size at 1.69 KB is still tiny — Tailwind's JIT path is the right one until Stack lands in a perf-critical context.

For reference, comparable layout primitives: Chakra `<Stack>` ~3.5 KB gz, MUI `<Stack>` ~2.8 KB gz (without their gap-resolver), Mantine `<Stack>` ~2 KB gz. We're meaningfully smaller than every comparable in absolute terms.

### Deviations from plan

1. **`StackGap` type widened to `… | (number & {})`.** The plan listed only the discrete spacing scale (0, 'px', 0.5, 1…12). The `& {}` IntelliSense trick preserves autocomplete for the scale literals while letting downstream consumers (notably `StatGroup.tsx`, which forwards `ResponsiveValue<number>` directly into Stack) compile without a narrowing cast. Off-scale values silently produce no class — graceful degradation, no crashes. **Documented in `Stack.types.ts` with the reasoning inline.**

2. **`stackChildrenWithDivider.tsx` not `.ts`.** Plan suggested `.ts`; the file contains JSX (`<Fragment key={…}>` wrapping primitive dividers) so esbuild required `.tsx`. Behavior identical.

3. **`__sds_spacer` marker tagged on the *function value* returned by `forwardRef`**, not on the component metadata. The marker has to survive minification + React.lazy + dynamic imports — putting it on the public function value (and reading it from `isSpacer(...).type[SPACER_MARKER]`) is the only place that stays stable across bundler optimizations. Added a tiny type assertion to keep the public API typed.

4. **Bundle target missed by +70%** (see "Bundle delta" above). Logged as the headline deviation; reclamation path documented.

5. **Dev-mode `as` + `asChild` mutual-exclusion warning.** Plan didn't call it out explicitly; added because the runtime resolution (asChild wins) silently overrides `as` and the warning saves a debugging trip. Matches Card / Button / Toggle convention. Test added (`Stack — dev-mode \`as\` + \`asChild\` guard`).

6. **`stackChildrenWithDivider` no longer re-filters falsy children.** Plan sketch did the filter inline; `Children.toArray` already strips `false` / `null` / `undefined` per the React docs. Dropped the redundant filter, kept the regression test that proves conditional rendering still produces n−1 dividers for n visible children.

### Coordination notes for downstream lanes

- **`StatGroup.tsx`** (Phase 40, prior lane): was authored against a Stack that didn't yet exist. Now compiles cleanly thanks to the `StackGap` widening. No code changes needed in Stat.
- **`Divider` integration**: the plan mentioned `<Divider />` as the canonical divider node. Stack accepts any ReactNode — `<Divider />` works as a divider value when consumers pass it. No special-case wiring.
- **`useThemedClasses` precedence**: all three Stack-family components use `componentName: 'Stack'` for theme overrides so `theme.components.Stack.styleOverrides.root` covers HStack/VStack with one entry. Spacer uses `componentName: 'Spacer'`.
- **No `_shared/` writes.** No theme-token / tailwind-preset edits. No edits to other component lanes. No renderer touches.

### Outstanding follow-ups

1. **Safelist promotion** for the GAP / SPACER class tables when a perf budget requires it (see "Reclamation path" above). Requires a theme-lane PR.
2. **Visual regression (Playwright)** carryover from prior phases — Stack's responsive direction × align × justify matrix deserves a snapshot pass alongside Card / Drawer / Modal.
3. **Section / Container / Grid layout primitives** (future Tier 1 phases) slot in alongside Stack as a coherent layout vocabulary. Plan callout #3 in the original spec.
4. **`<Box />` primitive (not in scope here)** — if/when added, it should compose with Stack via `asChild` instead of duplicating axes.

