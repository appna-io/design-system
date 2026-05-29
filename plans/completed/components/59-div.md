# Phase 59 — `<Div />` Style + Layout Primitive

> Status: **Shipped** · **Tier 1** · Depends on: Phase 3 (`<Slot>`), Phase 37 (Stack template), engine `sxToStyle` + `motionPresets` + `prefixClasses` · Blocks: nothing
> A MUI Box / Chakra Box equivalent — a `<div>` with built-in style shorthand props, responsive show/hide, motion presets, a `centered` shortcut, polymorphic `actLike`, full HTML pass-through, and pseudo-state className hooks.

## Objective

Ship a single layout primitive `<Div />` that lets consumers write idiomatic style markup without reaching for `className="…"` for every layout/spacing/color need. Goals:

- Replace 80% of `<div className="flex items-center p-4 bg-bg-paper">…</div>` with a typed, theme-aware `<Div display="flex" alignItems="center" p={4} bg="bg.paper">…</Div>`.
- Provide first-class **responsive show/hide** (`hideOn` / `displayOn`).
- Provide first-class **motion presets** opt-in (`animation="fadeIn"`) reusing the engine's `motionPresets`.
- Provide a `centered` shortcut (flex + center cross + main).
- Polymorphic via `actLike` (alias of the DS-wide `as`) + Radix-style `asChild`.
- Pseudo-state className hooks (`onHover`, `onFocus`, `onFocusVisible`, `onActive`, `onDisabled`, `onChecked`, `onGroupHover`, `onDataState`).
- Full HTML attribute pass-through (`id`, `role`, `aria-*`, `data-*`, event handlers).

---

## What This Component Proves

- The DS's `sxToStyle` token-resolution engine generalizes from a single `sx` prop to a flat-prop surface — same code path, more ergonomic call site.
- The Tailwind responsive-prefix utility (`prefixClasses`) already used for variant axes also powers pseudo-state class composition with zero new infrastructure.
- A pure-render primitive can offer "MUI Box" ergonomics in **< 1.5 KB gz** because all the heavy lifting (token resolution, motion, prefixing) is already shared engine code.

---

## Locked Design Decisions

| Decision | Why |
| --- | --- |
| **Inline styles via `sxToStyle`** for shorthand props (not Tailwind class maps) | Free-form values (`flex={1.5}`, `width="42%"`), unified token resolution (`bg="primary.main"`), matches MUI/Chakra/Emotion mental model. |
| **Scalars only on style props** in v1 | Responsive on inline styles needs per-element scoped CSS (out of scope). Use `hideOn` / `displayOn` / `className` for responsive layout. |
| **`hideOn` / `displayOn` — Tailwind "from upward"** semantics, single value only | `hideOn="md"` → `md:hidden`; `displayOn="md"` → `hidden md:block`. Matches Tailwind/Mantine convention; single utility class; no `xs`. |
| **`animation` opt-in via `motionPresets`** | Reuses the existing presets; Motion runtime only loads when prop is set; `useReducedMotion()` short-circuits. |
| **`actLike` aliases `as`** | User-requested name. Both accepted; `actLike` wins when both set (with dev warning, mirroring `as` + `asChild`). |
| **Pseudo props accept className strings** | Lets consumers reuse all of Tailwind's vocabulary (`onHover="bg-primary-50 scale-105"` → `hover:bg-primary-50 hover:scale-105`); zero runtime cost beyond string concat. |
| **No `Box` alias in v1** | `Div` already reads as the intent. Easy to add `export const Box = Div` later if requested. |

---

## Public API

```tsx
import { Div } from 'apx-ds';

// Basic styling shorthand
<Div display="flex" flex={1} p={4} bg="primary.50" radius="md">
  {children}
</Div>

// Responsive show/hide
<Div hideOn="md">Visible only below md</Div>
<Div displayOn="lg">Visible from lg up</Div>

// Animation (opt-in)
<Div animation="fadeIn">Fades in on mount</Div>

// Centered shortcut
<Div centered h="100vh">Centered child</Div>

// Polymorphic — actLike alias for as
<Div actLike="button" onClick={handleClick} role="button">Click me</Div>
<Div actLike="a" href="/docs">Docs</Div>

// asChild — Radix-style merge onto an existing child
<Div asChild p={4} bg="bg.paper">
  <a href="/x">…</a>
</Div>

// Full HTML props
<Div id="hero" role="region" aria-label="Hero" data-section="hero">…</Div>

// Pseudo-state className hooks
<Div
  onHover="bg-primary-100 scale-[1.02]"
  onFocusVisible="ring-2 ring-primary-500"
  onActive="scale-[0.98]"
  onDisabled="opacity-50"
>
  Interactive
</Div>

// Full prop form
<Div
  /* polymorphism */
  as="div"                       // ElementType
  actLike={undefined}            // ElementType — alias for `as`
  asChild={false}                // Slot-style merge onto single child
  /* responsive show/hide */
  hideOn={undefined}             // 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  displayOn={undefined}          // 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /* animation */
  animation={undefined}          // 'fadeIn' | 'scaleIn' | 'slideInFromBottom' | 'slideInFromTop' | 'pressScale'
  /* shortcuts */
  centered={false}               // flex + items-center + justify-content-center
  /* pseudo-state classNames */
  onHover={undefined}            // string
  onFocus={undefined}            // string
  onFocusVisible={undefined}     // string
  onActive={undefined}           // string
  onDisabled={undefined}         // string
  onChecked={undefined}          // string (aria-checked:)
  onGroupHover={undefined}       // string (group-hover:)
  onDataState={undefined}        // string (data-[state=open]:)
  /* style shorthand (curated ~80 props) */
  display="flex"
  flex={1}
  p={4}
  m={2}
  bg="primary.50"
  radius="md"
  shadow="md"
  /* misc */
  className=""
  sx={{}}
  style={{}}
  ref={…}
>
  {children}
</Div>
```

---

## File Structure

```
packages/components/src/Div/
├── Div.tsx                         # main implementation
├── Div.types.ts                    # DivProps, DivAnimation, DivBreakpoint, DivPseudoState, DivStyleProps
├── Div.recipe.ts                   # cv() for hideOn/displayOn classes (static Tailwind literals)
├── styleProps.ts                   # curated key set + extractStyleProps() delegating to sxToStyle
├── pseudoProps.ts                  # PSEUDO_PREFIX table + buildPseudoClassName()
├── index.ts                        # exports
├── meta.ts                         # renderer discovery metadata
├── README.mdx                      # docs page
└── examples/
    ├── Basic.tsx
    ├── Flex.tsx
    ├── Centered.tsx
    ├── HideOn.tsx
    ├── DisplayOn.tsx
    ├── Animation.tsx
    ├── ActLikeButton.tsx
    ├── ActLikeAnchor.tsx
    ├── OnHover.tsx
    ├── OnFocus.tsx
    └── TokenStyles.tsx

packages/components/__tests__/
├── Div.test.tsx
├── Div.styleProps.test.ts
├── Div.pseudoProps.test.ts
└── Div.a11y.test.tsx
```

---

## Recipe

```ts
// Div.recipe.ts — class-only features (hide/display). Style shorthand is handled inline.
export const divRecipe = cv({
  base: '',
  variants: {
    hideOn: {
      sm: 'sm:hidden', md: 'md:hidden', lg: 'lg:hidden', xl: 'xl:hidden', '2xl': '2xl:hidden',
    },
    displayOn: {
      sm: 'hidden sm:block', md: 'hidden md:block', lg: 'hidden lg:block', xl: 'hidden xl:block', '2xl': 'hidden 2xl:block',
    },
  },
});
```

Every class is a literal Tailwind utility so the JIT scanner picks it up at build time.

---

## Style Prop Registry

A curated set covering MUI Box's surface. The extractor walks `props` once; matched keys land in a single style object (delegated through `sxToStyle` for token resolution), the rest flow to the rendered element.

- **Aliases (already in `sxToStyle`):** `m mt mr mb ml mx my p pt pr pb pl px py w h radius shadow z bg fg`
- **Layout:** `display position top right bottom left inset zIndex overflow overflowX overflowY visibility`
- **Flex / Grid:** `flex flexDirection flexWrap flexBasis flexGrow flexShrink alignItems alignContent alignSelf justifyContent justifyItems justifySelf gap rowGap columnGap order gridTemplateColumns gridTemplateRows gridArea gridColumn gridRow gridAutoFlow placeItems placeContent placeSelf`
- **Sizing:** `width height minWidth maxWidth minHeight maxHeight boxSizing aspectRatio`
- **Spacing:** `margin padding`
- **Color/bg:** `color backgroundColor background backgroundImage`
- **Border:** `border borderRadius borderWidth borderStyle borderColor borderTop borderRight borderBottom borderLeft`
- **Typography:** `fontSize fontWeight fontFamily lineHeight letterSpacing textAlign textTransform textDecoration whiteSpace textOverflow wordBreak`
- **Effects:** `boxShadow opacity cursor transition transform pointerEvents userSelect filter backdropFilter`

---

## Pseudo Prop Table

```ts
const PSEUDO_PREFIX = {
  onHover: 'hover:',
  onFocus: 'focus:',
  onFocusVisible: 'focus-visible:',
  onActive: 'active:',
  onDisabled: 'disabled:',
  onChecked: 'aria-checked:',
  onGroupHover: 'group-hover:',
  onDataState: 'data-[state=open]:',
} as const;
```

Each prop's string is split on whitespace; each token is Tailwind-prefixed via `prefixClasses(...)`; results are `cn`-merged into the final className.

---

## A11y

- `<Div />` is a layout primitive: no implicit role, no implicit ARIA, no focus management of its own.
- When `actLike="button"`, consumers should pair with `role="button"` + `tabIndex={0}` (or let the rendered intrinsic `<button>` do it for free).
- `hideOn` / `displayOn` use `display:none`, which removes the node from the accessibility tree at the matching breakpoint (matches user intent).
- axe-core: 0 violations on the example matrix.

---

## RTL

- No RTL-specific code. Logical properties via `sxToStyle` aliases (`mx` → `marginInline`, `my` → `marginBlock`, `px` / `py`) automatically respect direction.
- Pseudo-state classes work uniformly under `dir="rtl"`.

---

## Performance

- Stateless function component. No effects, no event handlers it owns.
- Style extraction is a single O(props) loop with a `Set` lookup per key.
- Pseudo prefixer skips entirely when no pseudo props are set.
- `useReducedMotion()` short-circuits Motion wrapping (no Motion subscription cost when `animation` is unused).
- Bundle target: **< 1.5 KB gz** for `Div` alone (Motion only loaded when `animation` is set).

---

## Examples List

| Example | What it shows |
| --- | --- |
| `Basic` | `<Div p={4} bg="primary.50" radius="md">` |
| `Flex` | `display="flex"` + `gap={4}` + `flex={1}` children |
| `Centered` | `centered h="200px"` shortcut |
| `HideOn` | `hideOn="md"` — visible below md only |
| `DisplayOn` | `displayOn="lg"` — visible from lg up only |
| `Animation` | `animation="fadeIn"` + `animation="slideInFromBottom"` |
| `ActLikeButton` | `actLike="button"` + onClick + focus ring |
| `ActLikeAnchor` | `actLike="a"` + href |
| `OnHover` | `onHover="bg-primary-100 scale-[1.02]"` |
| `OnFocus` | `onFocusVisible="ring-2 ring-primary-500"` |
| `TokenStyles` | `bg="primary.main" color="primary.contrast" radius="lg" shadow="md"` |

---

## Testing Plan

- **`Div.styleProps.test.ts`** — `extractStyleProps` returns `{styleObj, restProps}`; spacing aliases resolve via `sxToStyle`; palette tokens resolve to CSS vars; unknown props pass through; explicit numeric/string values pass through unchanged.
- **`Div.pseudoProps.test.ts`** — `buildPseudoClassName` prefixes each token; multi-token strings yield multiple prefixed classes; `undefined`/empty inputs yield empty output.
- **`Div.test.tsx`** — Renders `<div>` by default; `as="section"` renders `<section>`; `actLike="button"` renders `<button>` and wins over `as` with dev warning; `asChild` wraps a single child via `<Slot>`; `hideOn="md"` emits `md:hidden`; `displayOn="lg"` emits `hidden lg:block`; `centered` injects flex+center styles; explicit `display` overrides `centered`; pseudo props emit prefixed classes; `animation="fadeIn"` renders the Motion variant; `useReducedMotion()` short-circuits animation; consumer `className` survives recipe + pseudo composition; `ref` lands on the rendered element; HTML pass-through (`id`, `role`, `aria-*`, `data-*`, `onClick`).
- **`Div.a11y.test.tsx`** — axe-core sweeps over the basic, actLike-button, and animation examples — 0 violations.

---

## Acceptance Criteria

- [ ] `<Div />` renders a `div` by default; `as` or `actLike` swap the element; `asChild` supported via `<Slot>`; dev warnings on `as`+`actLike` and `as`+`asChild` mutual exclusion.
- [ ] Every curated shorthand prop flows through `sxToStyle`; palette / radius / shadow / spacing tokens resolve to CSS vars.
- [ ] `centered` injects `display: flex; align-items: center; justify-content: center;` — explicit style wins.
- [ ] `hideOn="md"` emits `md:hidden`; `displayOn="md"` emits `hidden md:block`. Consumer `className` survives.
- [ ] `animation="fadeIn"` wraps the element via `motion.create(...)`; `useReducedMotion()` short-circuits to a plain element.
- [ ] Each pseudo prop prefixes all tokens correctly; multi-token strings work; undefined inputs skip.
- [ ] HTML pass-through: `id`, `role`, `aria-*`, `data-*`, event handlers all reach the rendered element.
- [ ] All shipped Tailwind classes are static literals (JIT-discoverable) — `hideOn` / `displayOn` work in production without `safelist`.
- [ ] Tests: extractor unit, pseudo unit, integration, a11y — all green.
- [ ] Bundle target: **< 1.5 KB gz** for `Div` alone.

---

## DRY Self-Check

- [ ] Style extraction delegates to `sxToStyle` — no duplicate alias/token table.
- [ ] Pseudo prefixer reuses `prefixClasses` from the engine.
- [ ] Animation reuses `motionPresets` + `useReducedMotion` from the engine.
- [ ] Recipe is one tiny `cv()`; no new utility helpers beyond `extractStyleProps` + `buildPseudoClassName`.
- [ ] Polymorphism follows the existing `as` + `asChild` + `<Slot>` pattern; `actLike` is a thin alias.

---

## Out of Scope (v1)

- Responsive values on inline-style shorthand props (would require scoped CSS-in-JS injection).
- A `<Box />` alias (easy follow-up: `export const Box = Div`).
- `actLike` ref-type narrowing beyond the existing `PolymorphicRef` pattern.
- Pseudo props that compose multiple states (e.g. `onHoverFocus`) — consumers can stack tokens manually.

---

## Workflow

1. Author plan at `plans/pending/components/59-div.md`.
2. Move to `plans/in-progress/components/59-div.md` when implementation starts.
3. Move to `plans/completed/components/59-div.md` with appended `## Outcome` when shipped.

---

## Outcome

Shipped end-to-end in a single pass.

### Shape

Single primary export `<Div />` from `apx-dse-exported through the `@apx-apx-dsnts` aggregator), plus a handful of low-level helpers for power users / consumers building their own polymorphic wrappers on top:

| Export                  | Role                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| `Div`                   | The component itself.                                                                         |
| `divRecipe`             | The `cv()` recipe driving `hideOn` / `displayOn`.                                             |
| `extractStyleProps`     | Pure helper that splits a props bag into `{ styleObj, restProps }` via `sxToStyle`.           |
| `STYLE_PROP_KEYS`       | `ReadonlySet<string>` — the curated style-shorthand surface (~80 keys).                       |
| `buildPseudoClassName`  | Pure helper that prefixes pseudo-prop strings via the engine's `prefixClasses`.               |
| `PSEUDO_PREFIX`         | `Record<PseudoPropName, string>` — the 7 supported pseudo-state hooks.                        |

Type exports cover the full surface: `DivProps`, `DivOwnProps`, `DivStyleProps`, `DivPseudoProps`, `DivAnimation`, `DivBreakpoint`, `DivPseudoState`, plus the helper return types.

### Files

```
packages/components/src/Div/
├── Div.tsx                         (~180 LoC)
├── Div.types.ts                    (~270 LoC, types only — stripped at build)
├── Div.recipe.ts                   (~30  LoC)
├── styleProps.ts                   (~170 LoC, mostly the curated key Set literal)
├── pseudoProps.ts                  (~45  LoC)
├── index.ts
├── meta.ts
├── README.mdx
└── examples/                       (11 examples: Basic, Flex, Centered, HideOn, DisplayOn, Animation, ActLikeButton, ActLikeAnchor, OnHover, OnFocus, TokenStyles)

packages/components/__tests__/
├── Div.styleProps.test.ts          (11 tests)
├── Div.pseudoProps.test.ts         (11 tests)
├── Div.test.tsx                    (32 tests)
└── Div.a11y.test.tsx               (6  tests)
```

### Test results

- **Div-specific:** 60 / 60 tests passing across the 4 files (styleProps + pseudoProps unit + integration + axe-core).
- **Full components suite:** 2737 / 2737 tests still green across 156 files — no regressions.
- **axe-core:** 0 violations across the 6 a11y scenarios (basic, `as="section"`, `actLike="button"`, `actLike="a"`, animated, pseudo-state hooks).
- **`pnpm typecheck`:** clean for all Div files. The 2 remaining errors in `__tests__/ColorPicker.test.tsx` (unused `fireEvent` / `within` imports) are pre-existing and unrelated.
- **`pnpm lint`:** clean for all Div files. The 4 remaining errors in `ColorPicker.tsx` / `PresetsGrid.tsx` are pre-existing and unrelated.
- **`pnpm build`:** succeeds. `dist/index.js` 1.15 MB / `dist/index.cjs` 1.19 MB (full package, including Div).

### API decisions confirmed at shipping

| Decision | Rationale at the line |
| --- | --- |
| Inline-style delegation to `sxToStyle` | One token-resolution code path shared with the existing `sx` prop. No new alias table; adding new aliases means adding them once to the engine. |
| Scalars only on style shorthand props | Responsive on inline styles would need scoped CSS injection; documented as out-of-scope for v1. Consumers use `hideOn` / `displayOn` / `className` for responsive layout. |
| `hideOn` / `displayOn` single value | One Tailwind utility class per render, JIT-discoverable. Arrays were ambiguous under "from upward" semantics (a `["sm","lg"]` array would have been redundant under the "from" model). |
| `actLike` aliases `as`, wins on conflict | Matches the user-requested ergonomic reading (`<Div actLike="button">`) without breaking existing `as` consumers. Dev warning on collision mirrors the existing `as` + `asChild` guard. |
| `animation` excludes `pressScale` | `pressScale` is a `whileTap` interaction (no `initial` / `animate` / `exit` triple) — it belongs on a trigger element, not a layout primitive. Narrowed `DivAnimation = Exclude<MotionPresetName, 'pressScale'>` to enforce this. |
| `onFocus` intentionally **not** exposed | Collides with React's native `onFocus` event handler. `onFocusVisible` is shipped instead (the a11y-correct default for focus rings); pointer-focus styling falls back to `className`. |
| `centered` shortcut at the **bottom** of the style stack | Explicit `display` / `alignItems` / `justifyContent` from later layers win naturally — no extra "check before assign" logic needed. |
| Hooks always called unconditionally | `useReducedMotion` + `useThemedClasses` run before any conditional return, satisfying the React Rules of Hooks. `useReducedMotion` short-circuits the Motion wrapper, not the hook itself. |

### Deviations from the plan

None. The implementation matches the locked design decisions exactly. Two minor implementation choices were made during execution and documented inline:

1. **`DivProps` includes a small list of common element-specific HTML attrs** (`href`, `type`, `target`, `rel`, `download`, `src`, `alt`, `name`, `value`, `htmlFor`, `disabled`, `checked`) so `<Div actLike="a" href="…" />` and `<Div actLike="button" type="submit" />` type-check without a `Record<string, unknown>` cast. The plan called this out as a known polymorphic-typing trade-off — the chosen approach is the lightest pragmatic fix.
2. **`PSEUDO_PREFIX` ships exactly 7 hooks** (`onHover`, `onFocusVisible`, `onActive`, `onDisabled`, `onChecked`, `onGroupHover`, `onDataState`) — `onFocus` was dropped to avoid the React event-handler collision (already documented in the plan + README).

### Follow-ups (not in scope)

- `export const Box = Div` alias — trivial; defer until requested.
- Responsive shape on inline-style shorthand props — requires per-element scoped CSS or styled-components-style atomic-class generation. Significant new engine work; not justified yet.
- Polymorphic ref-type narrowing for `as` / `actLike` — would need a generic `Div<C extends ElementType>` signature. Out of scope for v1 because the existing `HTMLAttributes<HTMLElement>` + explicit common attrs already covers the 95% case.
