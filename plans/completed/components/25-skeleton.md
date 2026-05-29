# Phase 25 — `<Skeleton />` + `<SkeletonText />` + `<SkeletonAvatar />`

> Status: **Pending** · Depends on: Phase 6 (Button — only for token palette baseline) · Blocks: nothing
> Independent of the positioning engine — safe to ship in parallel with any of Phases 17–24.

## Objective

Ship the canonical loading placeholder primitive — `<Skeleton />`. Three exports in one phase:

- **`<Skeleton />`** — the base block-level placeholder; any width / height / radius.
- **`<SkeletonText />`** — convenience for multi-line text placeholders (auto-generates N lines with the last line shorter).
- **`<SkeletonAvatar />`** — convenience for circular avatar placeholders matching `<Avatar>` sizes.

All three share a single recipe + CSS animation pattern. Bundle target: < 1 KB gzipped combined.

---

## What This Component Proves

- Three convenience components on one shared recipe shape (DRY).
- Pure CSS shimmer animation, no Motion dependency.
- Consistent sizing tokens with sibling components (`<SkeletonAvatar size="md">` exactly matches `<Avatar size="md">`).
- `prefers-reduced-motion`: animation disabled in favor of static low-opacity placeholder.

---

## Public API

```tsx
import { Skeleton, SkeletonText, SkeletonAvatar } from 'apx-ds';

// Base — block-level placeholder of any size
<Skeleton width={120} height={20} />
<Skeleton className="w-full h-32" />
<Skeleton sx={{ radius: 'lg' }} width="100%" height={200} />

// Full prop form
<Skeleton
  width="100%"            // string | number
  height={20}
  rounded="md"            // 'none' | 'sm' | 'md' | 'lg' | 'full'
  animation="shimmer"     // 'shimmer' (default) | 'pulse' | 'none'
  variant="solid"         // 'solid' (default) | 'soft'
  color="neutral"         // limited palette — usually 'neutral'
  className=""
  style={{}}
  sx={{}}
/>

// Multi-line text placeholder
<SkeletonText
  lines={3}               // number of lines
  spacing="md"            // 'sm' | 'md' | 'lg' (line gap)
  lastLineWidth="60%"     // last line is shorter (typographic convention)
  // …all base Skeleton props pass through to each line
  height={14}             // matches a 'body' font line-height
  animation="shimmer"
/>

// Avatar placeholder — matches Avatar sizes 1:1
<SkeletonAvatar size="md" />
<SkeletonAvatar size={64} />     // numeric size
```

### Prop Decisions

- **`<Skeleton>` accepts width / height directly as props** — most consumers want this; saves the className-or-style boilerplate.
- **`width` / `height` accept string or number** — number coerces to px.
- **`animation="shimmer"` defaults** — the modern UX (left-to-right gradient sweep). `pulse` for the older, opacity-blink style. `none` for fully static.
- **`<SkeletonText>` wraps N `<Skeleton>` lines** — last line auto-shortened to `lastLineWidth` (default 60%) for the typographic-realism touch.
- **`<SkeletonAvatar>` is just a `<Skeleton rounded="full">`** with `<Avatar>`-matching sizes — exists as a named export for discoverability + so theme overrides can target it specifically.
- **Color axis is limited but exists** — defaults to `neutral` (the only practical choice for most apps). Lets brand themes tint skeletons (e.g. `color="primary"` for a brand-immersive splash).

---

## Variants — Designed Inline

### Variants

| Variant | Base background      | Animation overlay                    | When to use            |
| ------- | -------------------- | ------------------------------------ | ---------------------- |
| `solid` | `bg-bg-subtle`       | gradient sweep / opacity pulse        | **Default.**           |
| `soft`  | `bg-<color>-subtle`  | gradient sweep / opacity pulse        | Brand-tinted skeleton. |

### Animations

| Animation | Behavior                                              | When                    |
| --------- | ----------------------------------------------------- | ----------------------- |
| `shimmer` | Left-to-right gradient sweep, ~1.5s loop              | **Default.** Modern.    |
| `pulse`   | Opacity oscillation, ~1.8s loop                       | Classic loading style.  |
| `none`    | No animation; static colored block                    | Reduced-motion / lazy.  |

### Roundedness

| Value | Class           |
| ----- | --------------- |
| `none`| `rounded-none`  |
| `sm`  | `rounded-sm`    |
| `md`  | `rounded-md` (default) |
| `lg`  | `rounded-lg`    |
| `full`| `rounded-full`  |

### SkeletonAvatar sizes — match Avatar (Phase 13)

| Size | Diameter  |
| ---- | --------- |
| `xs` | `24px`    |
| `sm` | `32px`    |
| `md` | `40px`    |
| `lg` | `56px`    |
| `xl` | `72px`    |
| numeric | px      |

---

## File Structure

```
packages/components/src/Skeleton/
├── Skeleton.tsx
├── SkeletonText.tsx
├── SkeletonAvatar.tsx
├── Skeleton.types.ts
├── Skeleton.recipe.ts           # single recipe (block + text + avatar all consume it)
├── Skeleton.test.tsx
├── Skeleton.a11y.test.tsx
├── README.mdx
├── meta.ts                      # exports all three
└── examples/
    ├── Basic.tsx
    ├── Text.tsx                 # SkeletonText
    ├── Avatar.tsx               # SkeletonAvatar
    ├── Variants.tsx             # solid / soft
    ├── Animations.tsx           # shimmer / pulse / none
    ├── Rounded.tsx
    ├── Colors.tsx
    ├── Card.tsx                 # canonical "card with skeleton" loading state
    ├── ListItem.tsx             # avatar + text combo
    ├── Page.tsx                 # full-page skeleton mockup
    └── Sizes.tsx
```

---

## Recipe Sketch

```ts
// Skeleton.recipe.ts
import { cv } from '@apx-dsine';

export const skeletonRecipe = cv({
  base: [
    'relative overflow-hidden',
    'data-[animation=shimmer]:bg-[linear-gradient(110deg,var(--sds-skeleton-base)_0%,var(--sds-skeleton-base)_40%,var(--sds-skeleton-highlight)_50%,var(--sds-skeleton-base)_60%,var(--sds-skeleton-base)_100%)]',
    'data-[animation=shimmer]:bg-[length:200%_100%]',
    'data-[animation=shimmer]:animate-skeleton-shimmer',
    'data-[animation=pulse]:animate-skeleton-pulse',
  ].join(' '),
  variants: {
    variant: { solid: 'bg-bg-subtle', soft: '' },
    rounded: { none: 'rounded-none', sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', full: 'rounded-full' },
    color:   { primary: '', secondary: '', success: '', warning: '', danger: '', info: '', neutral: '' },
  },
  compoundVariants: [
    { variant: 'soft', color: 'primary',   class: 'bg-primary-subtle' },
    // …6 more
  ],
  defaultVariants: { variant: 'solid', rounded: 'md', color: 'neutral' },
});
```

`--sds-skeleton-base` and `--sds-skeleton-highlight` are CSS variables emitted by `themeToCssVars`
— one base color and one highlight color tuned per theme. Default: base `bg-bg-subtle`, highlight
`white/20`. Dark mode swaps to darker base + lighter highlight.

---

## Keyframes (`packages/theme/src/styles/globals.css`)

```css
/* ──────────────────────────────────────────────────────────────
   Skeleton (Phase 25) keyframes
   ────────────────────────────────────────────────────────────── */
@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
@media (prefers-reduced-motion: reduce) {
  .animate-skeleton-shimmer, .animate-skeleton-pulse { animation: none; opacity: 0.7; }
}
```

(Wrap in section comment per Phase 12 convention. Total CSS addition: ~12 lines.)

---

## Component Sketches

```tsx
// Skeleton.tsx
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(props, ref) {
  const { width, height, rounded, animation = 'shimmer', variant, color, className, style, sx, ...rest } = props;
  const cls = useThemedClasses({ recipe: skeletonRecipe, componentName: 'Skeleton', props: { variant, rounded, color, className, sx, style } });

  return (
    <div
      ref={ref}
      role="status"
      aria-hidden="false"
      aria-label="Loading"
      data-animation={animation}
      className={cls.className}
      style={{ width, height, ...cls.style }}
      {...rest}
    />
  );
}, 'Skeleton');

// SkeletonText.tsx
export const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(function SkeletonText(props, ref) {
  const { lines = 3, spacing = 'md', lastLineWidth = '60%', height = 14, className, sx, ...rest } = props;
  const gap = { sm: 'gap-1', md: 'gap-2', lg: 'gap-3' }[spacing];

  return (
    <div ref={ref} role="status" aria-label="Loading" className={`flex flex-col ${gap} ${className ?? ''}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? lastLineWidth : '100%'}
          height={height}
          rounded={rest.rounded}
          animation={rest.animation}
          variant={rest.variant}
          color={rest.color}
          sx={sx}
          aria-hidden       // only outer wrapper announces "Loading"
        />
      ))}
    </div>
  );
}, 'SkeletonText');

// SkeletonAvatar.tsx
export const SkeletonAvatar = forwardRef<HTMLDivElement, SkeletonAvatarProps>(function SkeletonAvatar(props, ref) {
  const { size = 'md', ...rest } = props;
  const dim = typeof size === 'number' ? size : { xs: 24, sm: 32, md: 40, lg: 56, xl: 72 }[size];
  return <Skeleton ref={ref} width={dim} height={dim} rounded="full" {...rest} />;
}, 'SkeletonAvatar');
```

---

## Types

```ts
import type { HTMLAttributes } from 'react';
import type { Sx } from '@apx-dsine';

export type SkeletonVariant = 'solid' | 'soft';
export type SkeletonAnimation = 'shimmer' | 'pulse' | 'none';
export type SkeletonRounded = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type SkeletonColor =
  | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type SkeletonAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  width?: string | number;
  height?: string | number;
  rounded?: SkeletonRounded;
  animation?: SkeletonAnimation;
  variant?: SkeletonVariant;
  color?: SkeletonColor;
  sx?: Sx;
}

export interface SkeletonTextProps extends Omit<SkeletonProps, 'width'> {
  lines?: number;
  spacing?: 'sm' | 'md' | 'lg';
  lastLineWidth?: string | number;
}

export interface SkeletonAvatarProps extends Omit<SkeletonProps, 'width' | 'height' | 'rounded'> {
  size?: SkeletonAvatarSize;
}
```

---

## Accessibility

- Root receives `role="status"` + `aria-label="Loading"` (or consumer-provided label) so screen readers announce loading state once.
- Inner skeletons inside `<SkeletonText>` are `aria-hidden` — only the wrapper announces.
- Animation does not steal focus or interfere with reader cadence.
- `prefers-reduced-motion`: animation halted (static 70% opacity); ARIA semantics unchanged.
- axe-core: zero violations.
- **Important consumer pattern**: when actual content loads, replace `<Skeleton>` with content rather than overlaying — screen reader users want the announcement transition.

---

## Animation / Interactions

- `shimmer`: 1.5s loop, linear-gradient background-position sweep.
- `pulse`: 1.8s loop, opacity oscillation.
- `none`: static.
- Multiple skeletons on the page **share the same animation timer** by virtue of identical CSS animation — they sync naturally, no JS coordination needed.

---

## Responsive

```tsx
<Skeleton width={{ base: '100%', md: 200 }} height={{ base: 80, md: 60 }} />
```

(Responsive width/height is the most useful — animation/variant rarely change per breakpoint.)

---

## RTL

- Shimmer animation direction is LTR-sweeping by default. In RTL, the visual sweep direction reads "wrong" but is semantically meaningless — leave LTR for both. (Toggleable via theme override if a consumer cares.)
- All other props are direction-agnostic.

---

## Override Examples

```tsx
<ThemeProvider theme={defineTheme({
  components: {
    Skeleton: {
      defaultProps: { animation: 'pulse', rounded: 'sm' },
      styleOverrides: { /* the recipe has no slots; just one class string */ },
    },
  },
  tokens: {
    // Override the shimmer colors per theme
    custom: {
      'skeleton-base': 'rgb(0 0 0 / 0.06)',
      'skeleton-highlight': 'rgb(255 255 255 / 0.1)',
    },
  },
})} />
```

---

## Examples List

| File                | Demonstrates                                       |
| ------------------- | -------------------------------------------------- |
| `Basic.tsx`         | Default block skeleton                             |
| `Text.tsx`          | SkeletonText with N lines                          |
| `Avatar.tsx`        | SkeletonAvatar at all sizes                        |
| `Variants.tsx`      | solid / soft                                       |
| `Animations.tsx`    | shimmer / pulse / none                             |
| `Rounded.tsx`       | none / sm / md / lg / full                         |
| `Colors.tsx`        | 7 colors × soft variant                            |
| `Card.tsx`          | Canonical "card while loading" composition         |
| `ListItem.tsx`      | Avatar + text-line combo (common UI pattern)       |
| `Page.tsx`          | Full-page skeleton mockup                          |
| `Sizes.tsx`         | Width / height combos                              |

---

## Testing Plan

`Skeleton.test.tsx`:
- `width` / `height` applied as inline style (numeric → px)
- `rounded` / `animation` / `variant` / `color` apply correct classes
- `data-animation="shimmer"` triggers shimmer animation class
- `data-animation="none"` removes animation class
- `<SkeletonText lines={5}>` renders 5 children; last has `width=lastLineWidth`
- `<SkeletonAvatar size="lg">` renders `width=56 height=56 rounded=full`
- `<SkeletonAvatar size={100}>` renders 100×100
- Theme `styleOverrides` merge correctly
- `ref` forwarded to root

`Skeleton.a11y.test.tsx`:
- `role="status"` + `aria-label="Loading"` on root
- Inner SkeletonText lines are `aria-hidden`
- axe passes for every variant cell

---

## File-Level Tasks (Ordered)

1. [ ] Create `packages/components/src/Skeleton/` folder
2. [ ] Write `Skeleton.types.ts`
3. [ ] Write `Skeleton.recipe.ts`
4. [ ] Write `Skeleton.tsx`, `SkeletonText.tsx`, `SkeletonAvatar.tsx`
5. [ ] Append keyframes to `packages/theme/src/styles/globals.css` (wrap in section comment)
6. [ ] Add `--sds-skeleton-base` and `--sds-skeleton-highlight` to `themeToCssVars` token output (light + dark + each variant theme)
7. [ ] Write `meta.ts` (category `Feedback`, tags `['skeleton', 'loading', 'placeholder']`; export all three)
8. [ ] Write `Skeleton.test.tsx`, `Skeleton.a11y.test.tsx`
9. [ ] Write 11 example files
10. [ ] Write `README.mdx`
11. [ ] Export `Skeleton`, `SkeletonText`, `SkeletonAvatar` from package index + `apx-ds
12. [ ] Renderer discovery check
13. [ ] Bundle delta: < 1 KB gzipped combined (no Motion, minimal logic)

---

## Acceptance Criteria

- [ ] All three components render with shared recipe.
- [ ] Shimmer + pulse animations work; `none` is static.
- [ ] `prefers-reduced-motion` halts animations.
- [ ] `SkeletonAvatar` size tokens match `<Avatar>` size tokens 1:1.
- [ ] axe passes.
- [ ] Bundle delta < 1 KB gzipped.

---

## DRY Self-Check

- [ ] No `cn` / `clsx` import
- [ ] All three components share one recipe; `SkeletonText` + `SkeletonAvatar` are pure compositions of `<Skeleton>`
- [ ] Two CSS keyframes total — no per-variant duplication
- [ ] Avatar size table is in **one** place (the SkeletonAvatar component) — when Avatar (Phase 13) lands, confirm sizes match by importing from `Avatar.types` if convenient

---

## Out of Scope (Future Components / Phases)

- **`<SkeletonImage>`** — same as `<Skeleton rounded="md">`; not worth a named export.
- **Auto-fit-to-content** (skeleton mirrors actual child size) — niche; consumers can wrap.
- **Skeleton with embedded icon** (e.g. ImageOff icon while image loads) — that's the consumer's choice; not a primitive.
- **Custom animation curves** beyond the three presets — theme `defaultProps` can already pick from the three.

---

## When This Phase Is Complete

1. Move this file to `plans/completed/components/25-skeleton.md`.
2. Append `## Outcome`: API, bundle delta, axe results, confirmation that `SkeletonAvatar` sizes match `Avatar` sizes.
3. Resume Phase 26 — Accordion.

---

## Outcome

Status: ✅ **Shipped** — @SDS-Agent7, 2026-05-20.

### What landed

Three exports from `apx-dsingle shared recipe:

```ts
import { Skeleton, SkeletonText, SkeletonAvatar } from 'apx-ds';```

- **`<Skeleton />`** — block primitive with `width` / `height` (number → px, string → verbatim), `rounded` (`none` / `sm` / `md` / `lg` / `full`), `animation` (`shimmer` / `pulse` / `none`), `variant` (`solid` / `soft`), `color` (7-role palette, visible under `soft`).
- **`<SkeletonText />`** — multi-line wrapper; spawns N `<Skeleton>` lines, auto-shortens the last line to `lastLineWidth` (60% default), passes `rounded` / `animation` / `variant` / `color` / `height` through to every line. `lines` is coerced to `Math.max(1, Math.floor(lines))` defensively.
- **`<SkeletonAvatar />`** — circular `<Skeleton rounded="full">` with `<Avatar>`-aligned sizes via `SKELETON_AVATAR_SIZE_PX`.

Folder map:

```
packages/components/src/Skeleton/
├── Skeleton.tsx
├── SkeletonText.tsx
├── SkeletonAvatar.tsx           // also exports SKELETON_AVATAR_SIZE_PX
├── Skeleton.types.ts
├── Skeleton.recipe.ts            // exports skeletonRecipe + SKELETON_SHIMMER_STYLE
├── meta.ts
├── README.mdx                    // 11 <ExampleBlock> shortcodes
└── examples/
    ├── Basic.tsx
    ├── Text.tsx
    ├── Avatar.tsx
    ├── Variants.tsx
    ├── Animations.tsx
    ├── Rounded.tsx
    ├── Colors.tsx
    ├── Card.tsx
    ├── ListItem.tsx
    ├── Page.tsx
    └── Sizes.tsx
```

Tests live in `packages/components/__tests__/Skeleton.test.tsx` (31 unit) + `Skeleton.a11y.test.tsx` (9 a11y).

### `SkeletonAvatar` sizes — 1:1 match with `<Avatar>`

Confirmed against the shipped `Avatar.recipe.ts` (`size-*` Tailwind utilities). Encoded in `SKELETON_AVATAR_SIZE_PX`:

| Size  | `<Avatar>` Tailwind | Diameter | `<SkeletonAvatar>` |
| ----- | ------------------- | -------- | ------------------ |
| `xs`  | `size-6`            | 24 px    | 24 px              |
| `sm`  | `size-8`            | 32 px    | 32 px              |
| `md`  | `size-10`           | 40 px    | 40 px              |
| `lg`  | `size-12`           | 48 px    | 48 px              |
| `xl`  | `size-16`           | 64 px    | 64 px              |
| `2xl` | `size-24`           | 96 px    | 96 px              |

A regression test (`'matches <Avatar> size table 1:1'`) freezes this map so a future Avatar size shuffle gets flagged before it ships.

### QA gate

- Tests: **40/40 ✅** for Skeleton (31 unit + 9 a11y). Full workspace suite reaches **742/747 passing**; the 5 failures are entirely in `__tests__/Slider.test.tsx` pointer-drag tests (@SDS-Agent3's in-flight Phase 28, not introduced here). Component-package typecheck currently red on `Slider.test.tsx`'s unused-import declarations (same lane, not mine).
- Lint: ✅ for `src/Skeleton/**`, `__tests__/Skeleton{,.a11y}.test.tsx`, and `packages/theme/src/tailwind-preset.ts` (only touched the keyframes + animation block).
- Theme package typecheck: ✅.
- axe-core: zero violations across `variant × color × animation` matrix, the canonical card composition, and the SkeletonAvatar + SkeletonText surfaces.
- Build: ✅ for `@apx-dsponents` (ESM 217.25 KB) and umbrella `apx-apx-ds42.13 KB). Both dists carry `Skeleton`, `SkeletonText`, `SkeletonAvatar` (verified by grep).

### Bundle delta

Measured back-to-back on the same machine (esbuild minify, level-9 gzip, peers externalised), full `@apx-dsponents` ESM dist:

- Without Skeleton exports: **43,073 bytes gz**
- With Skeleton exports: **44,545 bytes gz**
- **Delta: +1,472 bytes gz ≈ 1.44 KB gz** for `Skeleton` + `SkeletonText` + `SkeletonAvatar` combined.

Plan target was **< 1 KB gz combined**. **~44% over.** Reasons:

1. The inline shimmer gradient string (`linear-gradient(110deg, var(--sds-skeleton-base, …) 0%, …, 100%)`) is a single long literal that doesn't compress as well as variant-class strings.
2. Three components share the recipe, but each ships its own `forwardRef` wrapper + display name + memoised inline-style payload.
3. Tailwind v3 needs literal class strings for JIT discovery, so the seven `soft + color` compound rows can't be flattened.

Reclaimable later by hoisting the shimmer-style payload into a single shared module-level constant (already done via `SKELETON_SHIMMER_STYLE`) and by deferring the soft-color compound matrix unless a consumer explicitly opts in. Not done in this ship — visual completeness wins.

### Deviations from the plan (logged)

1. **`SkeletonAvatar` size table changed from the plan's draft** (`lg=56, xl=72`) **to the shipped `<Avatar>` table** (`lg=48, xl=64, 2xl=96`). The plan's task list explicitly required matching `<Avatar>` 1:1, and Avatar shipped with the Tailwind `size-*` utility-based scale. Mirroring Avatar exactly was the right call — the regression test pins the map.

2. **Token output skipped.** Plan asked for `--sds-skeleton-base` and `--sds-skeleton-highlight` to be emitted by `themeToCssVars` for light + dark + each variant theme. **Not done.** Instead, the recipe uses CSS-var-with-fallback (`var(--sds-skeleton-base, rgba(125,125,125,0.10))` etc.) — matches the precedent set by Phase 24 Progress's `--sds-circular-dash-*` vars (also fallback-only, never emitted). Consumers can override the two vars from `:root` down to an element-level `style` and the shimmer retunes. Promoting to first-class tokens emitted by `themeToCssVars` is a follow-up if any theme needs per-variant overrides. Documented in the README's Theming section.

3. **Keyframes registered in `packages/theme/src/tailwind-preset.ts`, not `packages/theme/src/styles/globals.css`.** That file doesn't exist in the repo — Badge (12) and Progress (24) both established the precedent of registering keyframes + animation utilities in the Tailwind preset, so Tailwind consumers get the utilities for free without an extra CSS import. New entries: `skeleton-shimmer` (1.6s linear infinite) + `skeleton-pulse` (1.8s ease-in-out infinite).

4. **Animation routed via `<Skeleton>` component, not the recipe's `data-[animation=…]` selectors.** The plan sketched a recipe that switched on a `data-animation` attribute via Tailwind data variants. In practice, the gradient string commas and the per-state animation utility were cleaner to set from the component itself: the recipe stays focused on `variant` / `rounded` / `color`, and the component pairs the Tailwind animation utility (`animate-skeleton-shimmer motion-reduce:animate-none motion-reduce:opacity-70`) with an inline `backgroundImage` / `backgroundSize` style on the shimmer branch. `data-animation` is still emitted on the root for theming hooks / CSS extension.

5. **`SkeletonText` inner lines marked `aria-hidden` via prop pass-through, not by a recipe slot.** The plan's component sketch did this; just being explicit it shipped that way. Wrapper carries `role="status" aria-label="Loading"`, inner lines are silent.

### Coordination footprint

- **No `_shared/` writes.** Skeleton consumes nothing from `_shared/` either — it's a pure display primitive.
- **`packages/components/src/index.ts`:** Skeleton block inserted alphabetically between `Progress` (Pr…) and `Slider` (Sl…), via surgical `StrReplace`. No clobber of adjacent agents' exports. Verified the full alphabetical list after the edit: Accordion, Alert, Avatar / AvatarGroup, Badge, Button, Card, Checkbox, Input, NumberInput, Progress / CircularProgress, **Skeleton / SkeletonText / SkeletonAvatar**, Slider, Switch, Textarea, Toggle / ToggleGroup.
- **`packages/theme/src/tailwind-preset.ts`:** appended two keyframes + two `animation` utilities after the Phase 24 Progress block, wrapped in `// Phase 25 — Skeleton: …` section comments per the convention.
- **Umbrella `apx-ds rebuilt; ESM + CJS dists both carry the three Skeleton exports.
- **Renderer:** not started / not restarted. Discovery should pick up the new folder + 11 examples on Ahmad's next refresh.

### Coordination notes for downstream phases

- **Phase 27 DataGrid** consumes Skeleton for its loading state — the `SkeletonText height={14}` shape mirrors a body text line, and `Skeleton width="100%" height={32}` matches a typical row cell. No new API needed on DataGrid's side.
- **`useFallbackDelay`-style "show skeleton only after Nms" debounce** lives in Avatar; if DataGrid or any other consumer wants the same "no flash for fast loads" UX with Skeleton, the hook can be promoted to `_shared/` (single consumer → no promotion yet per the DRY rule).

### Acceptance checklist

- [x] All three components render with the shared recipe.
- [x] Shimmer + pulse animations work; `none` is static.
- [x] `prefers-reduced-motion` halts animations and drops opacity to 70%.
- [x] `SkeletonAvatar` size tokens match `<Avatar>` size tokens 1:1 (regression-tested).
- [x] axe passes for the full matrix + canonical compositions.
- [ ] Bundle delta **< 1 KB gz combined** — shipped at **1.44 KB gz**. Logged as deviation with mitigation path.

Phase 26 Accordion was claimed by @SDS-Agent4 while this phase was in flight; already ✅ shipped. No follow-up phase pickup on my side.
