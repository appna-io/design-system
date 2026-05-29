# Phase 24 — `<Progress />` (linear) + `<CircularProgress />`

> Status: **Pending** · Depends on: Phase 6 (Button — only for color palette baseline) · Blocks: nothing
> Independent of the positioning engine — safe to ship in parallel with any of Phases 17–23.

## Objective

Ship two progress indicators in one phase:

- **`<Progress />`** — linear progress bar (determinate + indeterminate).
- **`<CircularProgress />`** — circular spinner-style progress (determinate + indeterminate).

Both share the same prop vocabulary (`value`, `min`, `max`, `variant`, `size`, `color`, `striped`, `animated`, `indeterminate`) and the same ARIA semantics. This phase exists primarily to extract the
`useProgressValue()` helper + the `striped` SVG/CSS pattern in one place so neither component
copies the other.

---

## What This Component Proves

- Two visually different components can ship a single coherent API.
- CSS-driven animation (no Motion library) for the indeterminate spinner — keeps bundle tiny.
- `prefers-reduced-motion` cleanly disables the indeterminate animation in favor of a static "pulsing" treatment.
- ARIA `progressbar` role usage for both shapes.

---

## Public API

### Linear

```tsx
import { Progress } from 'apx-ds';

<Progress value={66} />

<Progress
  value={66}              // 0–100 (or 0–max if max set)
  min={0}
  max={100}
  indeterminate={false}   // when true, value is ignored
  variant="solid"         // 'solid' (default) | 'soft' | 'striped'
  size="md"               // 'sm' | 'md' | 'lg'
  color="primary"         // 7-color palette
  rounded="full"          // 'sm' | 'md' | 'lg' | 'full'
  showLabel={false}       // render the percentage label inside the bar
  labelFormat={(v, max) => `${Math.round((v / max) * 100)}%`}
  animated={true}         // animate the bar transition on value change
  striped={false}         // diagonal stripes overlay (variant === 'striped' shortcut)
  className=""
  sx={{}}
/>
```

### Circular

```tsx
import { CircularProgress } from 'apx-ds';
<CircularProgress value={66} />

<CircularProgress
  value={66}
  min={0}
  max={100}
  indeterminate={false}
  variant="solid"         // 'solid' (default) | 'soft'
  size="md"               // 'sm' | 'md' | 'lg' | number (custom px)
  color="primary"
  thickness={4}           // stroke width in px (default scales with size)
  showLabel={false}       // render numeric label in the center
  labelFormat={(v, max) => `${Math.round((v / max) * 100)}%`}
  animated={true}
  trackOpacity={0.2}      // track (unfilled) opacity
  className=""
  sx={{}}
/>
```

### Prop Decisions

- **Two components, not one with a `shape` prop** — visually distinct enough that consumers reach for them by name. Less prop noise.
- **`indeterminate={true}` overrides `value`** — explicit; consumers don't need to think about combo states.
- **`min` / `max` props** — most consumers won't touch them, but allows the same component to render "downloaded 2 GB of 4 GB" etc.
- **`showLabel` defaults false** — labels need explicit opt-in; default form is "just a bar".
- **`animated` for value transitions** — when `value` changes, the bar/arc animates smoothly. Tied to `prefers-reduced-motion`.
- **`striped` for linear** — adds the diagonal CSS pattern; for the playful style some apps want. Mutually exclusive with `variant='striped'` (it's a shortcut).

---

## Variants — Designed Inline

### Linear variants

| Variant   | Track          | Bar                        | Notes                                       |
| --------- | -------------- | -------------------------- | ------------------------------------------- |
| `solid`   | `bg-bg-subtle` | `bg-<color>`               | **Default.**                                |
| `soft`    | `bg-<color>-subtle` | `bg-<color>`          | Subtle / dimmed look.                       |
| `striped` | `bg-bg-subtle` | `bg-<color>` + diagonal stripes via CSS `linear-gradient` | Playful loading state.            |

### Circular variants

| Variant  | Track                 | Arc            | Notes                                |
| -------- | --------------------- | -------------- | ------------------------------------ |
| `solid`  | `stroke-bg-subtle`    | `stroke-<color>`| **Default.**                         |
| `soft`   | `stroke-<color>-subtle`| `stroke-<color>`| Subtle.                              |

(No `striped` variant for circular — SVG strokes don't pattern as cleanly; we'd need a `<pattern>` def. Out of scope V1.)

### Sizes

#### Linear

| Size | Height  | Label font |
| ---- | ------- | ---------- |
| `sm` | `h-1`   | `text-[10px]` (if showLabel) |
| `md` | `h-2`   | `text-xs`  |
| `lg` | `h-3`   | `text-sm`  |

#### Circular

| Size | Diameter | Default thickness | Label font |
| ---- | -------- | ----------------- | ---------- |
| `sm` | `24px`   | `3px`             | `text-[10px]` |
| `md` | `40px`   | `4px`             | `text-xs`  |
| `lg` | `56px`   | `5px`             | `text-sm`  |

Numeric `size` value (`size={80}`) sets diameter directly; thickness defaults to `size / 10`.

### Variant × color matrix

3 × 7 = 21 linear cells; 2 × 7 = 14 circular cells. Compound rules for both, mirroring Badge.

---

## File Structure

```
packages/components/src/Progress/
├── Progress.tsx                 # linear
├── CircularProgress.tsx
├── Progress.types.ts
├── Progress.recipe.ts           # linear: track, bar, label
├── CircularProgress.recipe.ts   # circular: track, arc, label
├── useProgressValue.ts          # shared: clamp + percent calc + indeterminate state
├── Progress.test.tsx
├── CircularProgress.test.tsx
├── Progress.a11y.test.tsx
├── README.mdx
├── meta.ts                      # exports both
└── examples/
    ├── Basic.tsx                # linear
    ├── BasicCircular.tsx        # circular
    ├── Variants.tsx             # solid / soft / striped
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── Indeterminate.tsx        # both shapes
    ├── WithLabel.tsx
    ├── CustomFormat.tsx         # 2.4 GB / 4 GB style
    ├── Rounded.tsx              # linear rounded variants
    ├── ThicknessCircular.tsx
    ├── CustomSize.tsx           # CircularProgress size={120}
    └── Animated.tsx             # value transitions
```

---

## Recipe Sketches

```ts
// Progress.recipe.ts (linear)
import { cv } from '@apx-dsine';

export const progressRecipes = {
  track: cv({
    base: 'relative w-full overflow-hidden',
    variants: {
      size: { sm: 'h-1', md: 'h-2', lg: 'h-3' },
      rounded: { sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', full: 'rounded-full' },
      variant: { solid: 'bg-bg-subtle', soft: '', striped: 'bg-bg-subtle' },
      color: { primary: '', secondary: '', success: '', warning: '', danger: '', info: '', neutral: '' },
    },
    compoundVariants: [
      { variant: 'soft', color: 'primary',   class: 'bg-primary-subtle' },
      // …6 more soft
    ],
    defaultVariants: { size: 'md', rounded: 'full', variant: 'solid', color: 'primary' },
  }),
  bar: cv({
    base: [
      'h-full transition-[width] duration-normal ease-emphasized',
      'data-[indeterminate=true]:animate-progress-indeterminate',
      'data-[striped=true]:bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] data-[striped=true]:bg-[length:1rem_1rem]',
    ].join(' '),
    variants: {
      color: { primary: 'bg-primary', secondary: 'bg-secondary', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger', info: 'bg-info', neutral: 'bg-neutral' },
    },
    defaultVariants: { color: 'primary' },
  }),
  label: cv({
    base: 'absolute inset-0 flex items-center justify-center font-medium text-fg-on-color mix-blend-overlay',
    variants: { size: { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' } },
    defaultVariants: { size: 'md' },
  }),
};
```

```ts
// CircularProgress.recipe.ts
import { cv } from '@apx-dsine';

export const circularProgressRecipes = {
  svg: cv({
    base: 'block -rotate-90 data-[indeterminate=true]:animate-circular-indeterminate',
    variants: {
      size: { sm: 'size-6', md: 'size-10', lg: 'size-14' },
    },
    defaultVariants: { size: 'md' },
  }),
  track: cv({
    base: 'fill-none',
    variants: {
      color: { primary: 'stroke-primary', secondary: 'stroke-secondary', success: 'stroke-success', warning: 'stroke-warning', danger: 'stroke-danger', info: 'stroke-info', neutral: 'stroke-neutral' },
    },
    defaultVariants: { color: 'primary' },
  }),
  arc: cv({
    base: 'fill-none transition-[stroke-dashoffset] duration-normal ease-emphasized',
    variants: {
      color: { primary: 'stroke-primary', secondary: 'stroke-secondary', success: 'stroke-success', warning: 'stroke-warning', danger: 'stroke-danger', info: 'stroke-info', neutral: 'stroke-neutral' },
    },
    defaultVariants: { color: 'primary' },
  }),
  label: cv({
    base: 'absolute inset-0 flex items-center justify-center font-medium text-fg-default',
    variants: { size: { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' } },
    defaultVariants: { size: 'md' },
  }),
};
```

---

## Keyframes (`packages/theme/src/styles/globals.css`)

```css
/* ──────────────────────────────────────────────────────────────
   Progress (Phase 24) keyframes
   ────────────────────────────────────────────────────────────── */
@keyframes progress-indeterminate {
  0%   { transform: translateX(-100%); width: 50%; }
  50%  { width: 50%; }
  100% { transform: translateX(200%); width: 50%; }
}
@keyframes circular-indeterminate-spin {
  0%   { transform: rotate(-90deg); }
  100% { transform: rotate(270deg); }
}
@keyframes circular-indeterminate-dash {
  0%   { stroke-dashoffset: 280; }
  50%  { stroke-dashoffset: 75; }
  100% { stroke-dashoffset: 280; }
}

@media (prefers-reduced-motion: reduce) {
  .animate-progress-indeterminate { animation: none; opacity: 0.6; }
  .animate-circular-indeterminate { animation: none; opacity: 0.6; }
}
```

(Wraps in a section comment per Phase 12 convention so future appends don't collide.)

---

## Component Sketches

```tsx
// Progress.tsx (linear)
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(props, ref) {
  const { value, min = 0, max = 100, indeterminate, variant, size, color, rounded, showLabel, labelFormat, animated, striped, className, style, sx, ...rest } = props;
  const { clampedValue, percent } = useProgressValue({ value, min, max, indeterminate });

  const trackCls = useThemedClasses({ recipe: progressRecipes.track, componentName: 'Progress', slot: 'track', props: { variant, size, color, rounded, className, sx, style } });
  const barCls   = useThemedClasses({ recipe: progressRecipes.bar,   componentName: 'Progress', slot: 'bar',   props: { color } });
  const labelCls = useThemedClasses({ recipe: progressRecipes.label, componentName: 'Progress', slot: 'label', props: { size } });

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : clampedValue}
      aria-valuetext={indeterminate ? 'Loading' : labelFormat?.(clampedValue, max)}
      className={trackCls.className}
      style={trackCls.style}
      {...rest}
    >
      <div
        className={barCls.className}
        style={{ width: indeterminate ? undefined : `${percent}%` }}
        data-indeterminate={indeterminate || undefined}
        data-striped={(striped || variant === 'striped') || undefined}
      />
      {showLabel && !indeterminate ? <span className={labelCls.className}>{labelFormat?.(clampedValue, max) ?? `${Math.round(percent)}%`}</span> : null}
    </div>
  );
}, 'Progress');

// CircularProgress.tsx — SVG circle with strokeDasharray/Offset for progress
// Uses cx, cy = size/2, r = (size - thickness) / 2
// dashOffset = circumference * (1 - percent/100)
```

---

## `useProgressValue`

```ts
// useProgressValue.ts
export function useProgressValue(opts: { value?: number; min?: number; max?: number; indeterminate?: boolean }) {
  const { value = 0, min = 0, max = 100, indeterminate } = opts;
  if (indeterminate) return { clampedValue: 0, percent: 0 };
  const range = Math.max(max - min, 1);
  const clamped = Math.min(Math.max(value, min), max);
  return { clampedValue: clamped, percent: ((clamped - min) / range) * 100 };
}
```

20 lines. Stays Progress-local — no engine promotion until a third consumer needs it.

---

## Types

```ts
import type { HTMLAttributes } from 'react';
import type { Sx, ResponsiveValue } from '@apx-dsine';

export type ProgressVariant = 'solid' | 'soft' | 'striped';
export type ProgressSize = 'sm' | 'md' | 'lg';
export type ProgressColor =
  | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type ProgressRounded = 'sm' | 'md' | 'lg' | 'full';

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  value?: number;
  min?: number;
  max?: number;
  indeterminate?: boolean;
  variant?: ResponsiveValue<ProgressVariant>;
  size?: ResponsiveValue<ProgressSize>;
  color?: ResponsiveValue<ProgressColor>;
  rounded?: ResponsiveValue<ProgressRounded>;
  showLabel?: boolean;
  labelFormat?: (value: number, max: number) => string;
  animated?: boolean;
  striped?: boolean;
  sx?: Sx;
}

export type CircularProgressVariant = 'solid' | 'soft';

export interface CircularProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  value?: number;
  min?: number;
  max?: number;
  indeterminate?: boolean;
  variant?: CircularProgressVariant;
  size?: ProgressSize | number;
  color?: ResponsiveValue<ProgressColor>;
  thickness?: number;
  showLabel?: boolean;
  labelFormat?: (value: number, max: number) => string;
  animated?: boolean;
  trackOpacity?: number;
  sx?: Sx;
}
```

---

## Accessibility

- `role="progressbar"` on the root element of both.
- `aria-valuemin`, `aria-valuemax`, `aria-valuenow` set when determinate.
- `aria-valuetext` for human-readable values (uses `labelFormat` when provided, otherwise "Loading" for indeterminate).
- Indeterminate omits `aria-valuenow` (correct ARIA).
- When `showLabel={true}`, the visible label is the percentage; `aria-hidden` since it duplicates `aria-valuenow`.
- No focusable child elements; progress bars are pure presentational state.
- axe-core: zero violations.

---

## Animation / Interactions

- Determinate: width / strokeDashoffset transition, 300ms `ease-emphasized`. Skip transition when `animated={false}` or `prefers-reduced-motion`.
- Indeterminate linear: CSS `@keyframes progress-indeterminate` (translate + width oscillation). Loops infinitely.
- Indeterminate circular: combined `circular-indeterminate-spin` (full rotation) + `circular-indeterminate-dash` (stroke growth/shrink).
- `prefers-reduced-motion`: animations halted; static at 60% opacity to indicate "in progress" without motion.

---

## Responsive

```tsx
<Progress value={50} size={{ base: 'sm', md: 'lg' }} color={{ base: 'neutral', dark: 'primary' }} />
```

---

## RTL

- Linear progress bar fills **from logical start to logical end** — in RTL, fills from right edge. CSS uses logical properties (`inset-inline-start` instead of `left`).
- CircularProgress is rotation-symmetric; RTL has no effect.

---

## Override Examples

```tsx
<ThemeProvider theme={defineTheme({
  components: {
    Progress: {
      defaultProps: { variant: 'soft', rounded: 'md' },
      styleOverrides: { track: '', bar: 'opacity-90', label: '' },
    },
    CircularProgress: {
      defaultProps: { thickness: 5 },
      styleOverrides: { svg: '', track: 'opacity-30', arc: '', label: '' },
    },
  },
})} />
```

---

## Examples List

| File                  | Demonstrates                                       |
| --------------------- | -------------------------------------------------- |
| `Basic.tsx`           | Default linear progress                            |
| `BasicCircular.tsx`   | Default circular                                   |
| `Variants.tsx`        | solid / soft / striped (linear)                    |
| `Sizes.tsx`           | sm / md / lg (both shapes)                         |
| `Colors.tsx`          | 7 colors × both shapes                             |
| `Indeterminate.tsx`   | Both shapes in indeterminate mode                  |
| `WithLabel.tsx`       | `showLabel`                                        |
| `CustomFormat.tsx`    | `labelFormat={(v, max) => "2.4 GB / 4 GB"}`        |
| `Rounded.tsx`         | Linear `rounded` variants                          |
| `ThicknessCircular.tsx`| Custom thickness                                 |
| `CustomSize.tsx`      | `size={120}`                                       |
| `Animated.tsx`        | Value transitions over time                        |

---

## Testing Plan

`Progress.test.tsx`:
- `value=50` sets bar width to 50%
- `value=150 max=100` clamps to 100
- `indeterminate` omits `aria-valuenow`, applies animation class
- `striped={true}` adds stripes class
- `variant='striped'` is equivalent to `striped={true}`
- `showLabel` renders label; `labelFormat` formats correctly
- `variant` / `size` / `color` / `rounded` apply correct classes
- Theme `styleOverrides.{ track, bar, label }` merge correctly
- `ref` forwarded to root

`CircularProgress.test.tsx`:
- SVG dimensions match `size` (numeric or token)
- Stroke dashoffset matches percent calc
- `thickness` controls stroke width
- Custom `size={120}` produces 120×120 SVG
- `indeterminate` applies the combined spin+dash animation classes
- `showLabel` centers numeric label
- `trackOpacity` applied to track stroke

`Progress.a11y.test.tsx`:
- `role="progressbar"` on root (both)
- `aria-valuemin/max/now/text` correct for determinate
- `aria-valuenow` absent for indeterminate
- Label is `aria-hidden` when present
- axe passes for every variant / color / size cell

---

## File-Level Tasks (Ordered)

1. [ ] Create `packages/components/src/Progress/` folder
2. [ ] Write `Progress.types.ts`
3. [ ] Write `Progress.recipe.ts` and `CircularProgress.recipe.ts`
4. [ ] Write `useProgressValue.ts`
5. [ ] Write `Progress.tsx` and `CircularProgress.tsx`
6. [ ] Append keyframes to `packages/theme/src/styles/globals.css` (wrap in section comment)
7. [ ] Write `meta.ts` (category `Feedback`, tags `['progress', 'loading', 'indicator']`; both components exported via one meta)
8. [ ] Write `Progress.test.tsx`, `CircularProgress.test.tsx`, `Progress.a11y.test.tsx`
9. [ ] Write 12 example files
10. [ ] Write `README.mdx`
11. [ ] Export `Progress` and `CircularProgress` from package index + `apx-ds
12. [ ] Renderer discovery check
13. [ ] Bundle delta: < 2 KB gzipped combined (no Motion lib)

---

## Acceptance Criteria

- [ ] Both components share API shape where it makes sense (value/min/max/indeterminate).
- [ ] CSS-only animations work; no Motion library dependency added.
- [ ] Indeterminate animations honor `prefers-reduced-motion`.
- [ ] All variants × colors × sizes render.
- [ ] RTL: linear bar fills from logical start.
- [ ] axe passes.
- [ ] Bundle delta < 2 KB gzipped combined.

---

## DRY Self-Check

- [ ] No `cn` / `clsx` import
- [ ] `useProgressValue` shared between linear and circular
- [ ] No keyframe duplication — Linear and Circular each name distinct animations; Linear has 1, Circular has 2
- [ ] Adding a color = palette entry + 1 row in each component's bar/arc/track recipe; no logic changes

---

## Out of Scope (Future Components / Phases)

- **Segmented Progress** (stepped progress with N segments) — separate component if requested.
- **Buffer state** (HTML5 video progress with played + buffered) — niche; ship later.
- **Progress with `striped` for circular** — needs `<pattern>` element; defer.
- **Progress with internal label embedded in the arc path** — niche.

---

## When This Phase Is Complete

1. Move this file to `plans/completed/components/24-progress.md`.
2. Append `## Outcome`: API, bundle delta, axe results.
3. Resume Phase 25 — Skeleton.

---

## Outcome

> Shipped by **SDS-Agent6** on 2026-05-20.

### Files

```
packages/components/src/Progress/
├── Progress.tsx
├── CircularProgress.tsx
├── Progress.types.ts
├── Progress.recipe.ts
├── CircularProgress.recipe.ts
├── useProgressValue.ts
├── meta.ts
├── README.mdx
└── examples/
    ├── Animated.tsx
    ├── Basic.tsx
    ├── BasicCircular.tsx
    ├── Colors.tsx
    ├── CustomFormat.tsx
    ├── CustomSize.tsx
    ├── Indeterminate.tsx
    ├── Rounded.tsx
    ├── Sizes.tsx
    ├── ThicknessCircular.tsx
    ├── Variants.tsx
    └── WithLabel.tsx

packages/components/__tests__/
├── Progress.test.tsx
├── CircularProgress.test.tsx
└── Progress.a11y.test.tsx
```

Plus a one-time edit to `packages/components/src/index.ts` (alphabetical insert after `Input`,
before `Textarea`) and `packages/theme/src/tailwind-preset.ts` (three new keyframes + matching
`animation` utilities). The umbrella `apx-dsckage is `export *`, so no edit needed there.

### API as shipped

Both components match the public API in the plan exactly. Two notes:

- `<Progress />` exposes a single `striped` boolean **and** a `variant='striped'` value. Both
  paths land on the same compound rule via the bar's `data-striped` attribute (assert covered by
  `Progress.test.tsx > Progress — striped`).
- `<CircularProgress />` accepts `size: 'sm' | 'md' | 'lg' | number`. Numeric `size` sets the
  diameter directly and derives `thickness` as `Math.max(2, Math.round(size / 10))` unless the
  consumer overrides it (covered by `CircularProgress.test.tsx > sizing`).

### Test results

- **57 new tests** (`Progress.test.tsx` 24 + `CircularProgress.test.tsx` 22 +
  `Progress.a11y.test.tsx` 11). axe-core passes for the full 21-cell linear matrix and the full
  14-cell circular matrix at every size.
- Workspace tests: **417/417 pass** across 22 test files.
- `@apx-dsponents tsc --noEmit` ✅. `pnpm -w typecheck` ✅ (12/12 tasks).
- `eslint src/Progress` + the three test files ✅. (Workspace lint reports two pre-existing
  errors in `src/Card/examples/{AsChild,WithDivider}.tsx` from a parallel agent's in-flight
  work — unrelated to Phase 24.)

### Bundle delta

Measured via `esbuild --bundle --minify` with `react`, `react-dom`, `lucide-react`, and the
`@apx-dsgine,theme,tokens}` peers externalized:

| Surface                                     | Bytes (gz) |
| ------------------------------------------- | ---------- |
| `Progress` + `CircularProgress` source-only | **2.16 KB**|
| Empty entry baseline                        | 0.02 KB    |

That's **~9% over the 2 KB combined target.** The overage lives in the variant × color matrix
class strings — Tailwind v3's content scanner needs every utility to appear literally in source,
so flattening or templating those rows is not an option without breaking JIT discovery.

### Deviations from the plan

1. **Keyframes location.** The plan called out `packages/theme/src/styles/globals.css`. That file
   does not exist in the repo — the established convention (set by Phase 12 / Badge) is to
   register component-owned keyframes + animation utilities in
   `packages/theme/src/tailwind-preset.ts` so consumers using the preset get the animation classes
   without an extra CSS import. Followed the existing convention. The three new keyframes:
   `progress-indeterminate`, `circular-indeterminate-spin`, `circular-indeterminate-dash`.
2. **`useProgressValue` is a pure function**, not a React hook. The `use*` prefix is kept for
   symmetry with the surrounding component-level hooks; staying lock-free avoids paying React's
   dispatcher cost per value update and lets the helper be called from non-render paths (tests,
   stories) without a render context.
3. **Reduced-motion treatment.** The plan called for `.animate-*` utilities suppressed via a
   `@media (prefers-reduced-motion: reduce)` block in CSS. Since the keyframes live in the Tailwind
   preset, used the `motion-reduce:` Tailwind variant directly on the recipe slots instead. Same
   end-user behavior; no extra CSS to import.
4. **Indeterminate linear bar geometry.** The plan's keyframe used `width` interpolation. Switched
   to `transform: translateX` because animating `width` triggers layout for every frame whereas
   `transform` is composited. Same visual sweep, smoother rendering on lower-end devices.
5. **Circular indeterminate uses inline `strokeDashoffset` baseline + a CSS-driven oscillation**
   rather than animating the dasharray itself; the keyframe-based dasharray approach in the plan
   sketch produced flickers on Safari. Tradeoff worth calling out in case the visual story drifts.
6. **Bundle target overshoot** (see above) — 2.16 KB gz vs the < 2 KB target. Logged here rather
   than chased into something un-Tailwind-friendly.

### `_shared/` net

Untouched. No new entries; no consumed entries. Progress is a display primitive (its own color
story, no form-control affordances), so there is no `controlBase` / `useFormFieldA11y` /
`variantColorMatrix` overlap. Following the same posture as Badge and Avatar.

### Heads-up for other agents

- **Tailwind preset edit** (`packages/theme/src/tailwind-preset.ts`) — added three keyframes and
  three animation utilities. Existing `badge-pulse` is untouched. If anyone touches the preset
  next, append below my block to keep the section ordered by phase.
- **Package `index.ts`** — alphabetical insert at `Input → Progress → Textarea`. No collision
  with Card / Switch / Avatar / Checkbox slots.
