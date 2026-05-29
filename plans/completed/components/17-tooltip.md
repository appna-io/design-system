# Phase 17 — `<Tooltip />`

> Status: **Pending** · Depends on: Positioning engine sub-phase (`@apx-ds/engine/positioning` + `<Portal>` + `useFocusTrap` + `escape-stack` — must ship before this plan starts) · Blocks: Phases 18–23 (every overlay consumes the positioning engine validated here)

## Objective

Ship the canonical hover/focus hint primitive — `<Tooltip />` — as the **first consumer of the
positioning engine**. Tooltip is the right pioneer because it's the simplest overlay (no focus
trap, no escape stack interaction beyond "close on Esc", no inner interactive content) — so any
weakness in the positioning engine's API surfaces here and is cheap to fix before the heavier
overlays (Modal, Drawer, Menu, Select) consume the same primitives.

---

## What This Component Proves

- `usePosition({ trigger, placement, offset, … })` returns enough info to position a floating
  element accurately, including arrow alignment.
- `<Portal>` renders SSR-safely (no hydration warnings) and respects custom `container`.
- The variant matrix scales onto a floating surface.
- The DS can manage hover/focus delay state without leaking timers or causing flicker.
- Reduced-motion is honored throughout.

---

## Public API

```tsx
import { Tooltip } from 'apx-ds';
<Tooltip content="Saved 3 minutes ago">
  <Button leftIcon={<ClockIcon />}>Saved</Button>
</Tooltip>

<Tooltip
  content="Helpful hint"
  variant="solid"                 // 'solid' (default) | 'outline' | 'soft' | 'inverted'
  size="md"                       // 'sm' | 'md' | 'lg'
  color="neutral"                 // 7-color palette
  placement="top"                 // 'top'|'top-start'|'top-end'|'right'|… (12 placements)
  offset={6}                      // px gap between trigger and tooltip
  showArrow={true}                // arrow pointing at the trigger
  openDelay={400}                 // hover-in delay in ms
  closeDelay={150}                // hover-out delay
  open={open}                     // controlled
  defaultOpen={false}
  onOpenChange={(v) => setOpen(v)}
  disabled={false}                // never opens
  portalContainer={null}          // optional override of the Portal target
  className=""
  style={{}}
  sx={{}}
>
  <Button>Hover me</Button>
</Tooltip>
```

### Prop Decisions

- **`content` is a prop**, not `children` — `children` is the **trigger** (single React element). Radix-style API. Wrapping rather than authoring a trigger via render-prop matches the DS's `asChild` mental model.
- **No `asChild`** — the single child is implicitly cloned with the trigger's ARIA + event handlers. Add `asChild={false}` later if anyone genuinely needs the wrap-in-a-span fallback.
- **`openDelay` defaults to 400ms / `closeDelay` defaults to 150ms** — matches MUI / Radix UX research findings; reduces accidental tooltip pop-ups on cursor sweeps across the UI.
- **12 placements** — the 3 alignment options (`start | center | end`) × 4 sides (`top | right | bottom | left`). Same vocabulary as Floating UI.
- **`showArrow={true}` by default** — tooltips feel more deliberate with an arrow; turn off only for fully-dense UIs.

---

## Variants — Designed Inline

Four variants. All have arrow + content + (in some) border.

| Variant    | Background                  | Border                | Text                    | When to use                                                |
| ---------- | --------------------------- | --------------------- | ----------------------- | ---------------------------------------------------------- |
| `solid`    | `bg-<color>`                | `border-transparent`  | `text-<color>-contrast` | **Default.** Conventional tooltip; opaque, high contrast.  |
| `outline`  | `bg-bg-paper`               | `border-<color>` 1px  | `text-<color>`          | Brand-aligned hints (link previews, brand actions).        |
| `soft`     | `bg-<color>-subtle`         | `border-<color>/30`   | `text-<color>`          | Editorial / settings-pane tooltips; calmer.                |
| `inverted` | `bg-fg-default` (dark)      | `border-transparent`  | `text-bg-paper`         | The "platform default" — light text on dark bg in light mode, dark text on light bg in dark mode. |

### Variant × color matrix

4 × 7 = 28 cells. `inverted` is special — it ignores `color` (no palette role applies). Compound
rules cover the other 21 cells, mirroring Badge's matrix shape exactly.

```ts
compoundVariants: [
  { variant: 'solid', color: 'primary',   class: 'bg-primary text-primary-contrast [&_[data-arrow]]:fill-primary' },
  // …6 more solid colors
  { variant: 'outline', color: 'primary', class: 'bg-bg-paper text-primary border-primary [&_[data-arrow]]:fill-bg-paper [&_[data-arrow]]:stroke-primary' },
  // …6 more outline colors
  { variant: 'soft', color: 'primary',    class: 'bg-primary-subtle text-primary border-primary/30 [&_[data-arrow]]:fill-primary-subtle' },
  // …6 more soft colors
  // inverted has no per-color cells — palette is hardcoded
]
```

### Sizes

| Size | Padding         | Font          | Max-width    | Arrow size |
| ---- | --------------- | ------------- | ------------ | ---------- |
| `sm` | `px-2 py-1`     | `text-xs`     | `max-w-xs`   | `8px`      |
| `md` | `px-2.5 py-1.5` | `text-sm`     | `max-w-sm`   | `10px`     |
| `lg` | `px-3 py-2`     | `text-base`   | `max-w-md`   | `12px`     |

---

## File Structure

```
packages/components/src/Tooltip/
├── Tooltip.tsx                   # root: wraps trigger + portal-renders content
├── TooltipArrow.tsx              # the SVG arrow, positioned by usePosition middleware
├── Tooltip.types.ts
├── Tooltip.recipe.ts             # two recipes: content, arrow
├── Tooltip.motion.ts             # enter/exit motion
├── useTooltipDelay.ts            # local hook — open/close delay timers
├── Tooltip.test.tsx
├── Tooltip.a11y.test.tsx
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── Placements.tsx            # 12-placement grid
    ├── Delay.tsx                 # custom openDelay / closeDelay
    ├── WithoutArrow.tsx
    ├── LongContent.tsx
    ├── Disabled.tsx
    ├── Controlled.tsx
    └── PortalContainer.tsx       # mounting inside a modal's portal
```

---

## Recipe Sketch

```ts
// Tooltip.recipe.ts
import { cv } from '@apx-dsine';

export const tooltipRecipes = {
  content: cv({
    base: [
      'relative pointer-events-none',
      'rounded-md shadow-md border',
      'select-none whitespace-normal break-words',
      'z-tooltip',
      'transition-[opacity,transform] duration-fast ease-standard',
      'data-[state=closed]:opacity-0',
    ].join(' '),
    variants: {
      variant: { solid: '', outline: '', soft: '', inverted: 'bg-fg-default text-bg-paper border-transparent' },
      size: {
        sm: 'px-2 py-1 text-xs max-w-xs',
        md: 'px-2.5 py-1.5 text-sm max-w-sm',
        lg: 'px-3 py-2 text-base max-w-md',
      },
      color: { primary: '', secondary: '', success: '', warning: '', danger: '', info: '', neutral: '' },
    },
    compoundVariants: [
      /* see "Variant × color matrix" above */
    ],
    defaultVariants: { variant: 'solid', size: 'md', color: 'neutral' },
  }),
  arrow: cv({
    base: 'absolute pointer-events-none',
    variants: {
      size: { sm: 'size-2', md: 'size-2.5', lg: 'size-3' },
    },
    defaultVariants: { size: 'md' },
  }),
};
```

---

## Component Sketch

```tsx
'use client';
import { Children, cloneElement, isValidElement, useId } from 'react';
import { forwardRef } from '@apx-dsine';
import { Portal, usePosition, useEscapeStack } from '@apx-dsine';
import { useThemedClasses } from '@apx-dsme';
import { AnimatePresence, motion } from 'motion/react';
import { tooltipRecipes } from './Tooltip.recipe';
import { tooltipMotion } from './Tooltip.motion';
import { useTooltipDelay } from './useTooltipDelay';
import { TooltipArrow } from './TooltipArrow';
import type { TooltipProps } from './Tooltip.types';

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(props, ref) {
  const {
    content,
    variant, size, color,
    placement = 'top', offset = 6, showArrow = true,
    openDelay = 400, closeDelay = 150,
    open: openProp, defaultOpen, onOpenChange,
    disabled = false, portalContainer,
    className, style, sx,
    children, ...rest
  } = props;

  const id = useId();
  const { open, triggerProps, scheduleOpen, scheduleClose } =
    useTooltipDelay({ openDelay, closeDelay, openProp, defaultOpen, onOpenChange, disabled });

  // Floating UI integration through engine
  const { triggerRef, floatingRef, arrowRef, x, y, placement: actualPlacement, middlewareData } =
    usePosition({ placement, offset, arrow: showArrow });

  useEscapeStack({ active: open, onEscape: () => scheduleClose(0) });

  // Clone the single trigger child so it picks up ref + events + ARIA
  const trigger = Children.only(children);
  if (!isValidElement(trigger)) throw new Error('<Tooltip> requires a single React element as its child.');
  const triggerEl = cloneElement(trigger, {
    ref: triggerRef,
    'aria-describedby': open ? id : trigger.props['aria-describedby'],
    ...triggerProps,
  });

  const contentCls = useThemedClasses({
    recipe: tooltipRecipes.content,
    componentName: 'Tooltip', slot: 'content',
    props: { variant, size, color, className, sx, style },
  });

  return (
    <>
      {triggerEl}
      <Portal container={portalContainer}>
        <AnimatePresence>
          {open ? (
            <motion.div
              ref={(node) => { (floatingRef as any).current = node; if (typeof ref === 'function') ref(node); else if (ref) (ref as any).current = node; }}
              id={id}
              role="tooltip"
              data-state="open"
              data-placement={actualPlacement}
              className={contentCls.className}
              style={{ position: 'absolute', top: y ?? 0, left: x ?? 0, ...contentCls.style }}
              {...tooltipMotion(actualPlacement)}
              {...rest}
            >
              {content}
              {showArrow ? <TooltipArrow ref={arrowRef} size={size} placement={actualPlacement} data={middlewareData.arrow} /> : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Portal>
    </>
  );
}, 'Tooltip');
```

The `usePosition` hook lives in `@apx-dsine` (the positioning sub-phase) and wraps Floating
UI's `useFloating()` with the DS's conventions baked in (placement strings, offset middleware,
auto-flip on overflow, arrow middleware bound to a single ref).

---

## Motion

```ts
// Tooltip.motion.ts
import type { TooltipPlacement } from './Tooltip.types';

const slideMap: Record<string, { y?: number; x?: number }> = {
  top:    { y: 4 },
  bottom: { y: -4 },
  left:   { x: 4 },
  right:  { x: -4 },
};

export function tooltipMotion(placement: TooltipPlacement) {
  const side = placement.split('-')[0] as keyof typeof slideMap;
  const from = slideMap[side];
  return {
    initial: { opacity: 0, scale: 0.95, ...from },
    animate: { opacity: 1, scale: 1, x: 0, y: 0 },
    exit:    { opacity: 0, scale: 0.95, ...from },
    transition: { duration: 0.12, ease: [0.16, 1, 0.3, 1] as const },
  };
}
```

Slides in **from** the trigger (e.g. tooltip placed on top of trigger slides down → up by 4px on
enter). `prefers-reduced-motion` short-circuits via Motion's built-in `useReducedMotion()`.

---

## Types

```ts
import type { HTMLAttributes, ReactNode, ReactElement } from 'react';
import type { Sx } from '@apx-dsine';

export type TooltipVariant = 'solid' | 'outline' | 'soft' | 'inverted';
export type TooltipSize = 'sm' | 'md' | 'lg';
export type TooltipColor =
  | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type TooltipPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'right' | 'right-start' | 'right-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end';

export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content' | 'color'> {
  content: ReactNode;
  children: ReactElement;
  variant?: TooltipVariant;
  size?: TooltipSize;
  color?: TooltipColor;
  placement?: TooltipPlacement;
  offset?: number;
  showArrow?: boolean;
  openDelay?: number;
  closeDelay?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  portalContainer?: HTMLElement | null;
  sx?: Sx;
}
```

---

## Accessibility

- Tooltip content is rendered in a `<div role="tooltip" id="…">`. The trigger receives `aria-describedby="<id>"` while open — exactly the ARIA Tooltip pattern.
- Tooltip opens on **hover** (mouse) and **focus** (keyboard). It closes on hover-out, focus-out, and `Esc`.
- The escape stack (`useEscapeStack`) ensures only the topmost tooltip closes on Esc, not all open overlays.
- Tooltip never receives focus itself (`pointer-events-none` + no `tabIndex`) — content is not interactive. For interactive overlays, use `<Popover>` (Phase 18).
- `role="tooltip"` content is reader-announced via `aria-describedby` association, not a live region — matches platform conventions.
- Touch devices: tooltip opens on long-press (pointer-events handler), closes on tap-away. Avoid for critical info.
- `disabled={true}` skips all opening logic; trigger renders normally.
- axe-core: zero violations.

---

## Animation / Interactions

- Enter / exit: Motion-driven, ~120ms cubic-bezier (`[0.16, 1, 0.3, 1]` — "ease-out-expo-ish").
- Slide direction: derives from final placement (after Floating UI's auto-flip middleware).
- Hover-in delay (default 400ms), hover-out delay (default 150ms) — both consumer-overridable. Pointer entering the tooltip itself **cancels** the close-delay (lets users move the mouse onto the tooltip without it vanishing).
- `prefers-reduced-motion`: no scale/slide, opacity-only transition.
- Hover-in via mouse uses **`pointerenter`**, not `mouseenter` — works with touch + pen.

---

## Responsive

```tsx
<Tooltip content="Hint" size={{ base: 'sm', md: 'md' }} placement={{ base: 'bottom', md: 'top' }}>
  <Button>…</Button>
</Tooltip>
```

Placement as a responsive value is genuinely useful — mobile often wants bottom-anchored tooltips
(out of finger-occlusion), desktop wants top.

---

## RTL

- Placement names (`*-start` / `*-end`) are **logical**. Floating UI's `flip` middleware already
  understands RTL via the `direction` option; the engine wraps it.
- `top-start` in LTR = top-left; in RTL = top-right. Same for `bottom-end`, `right-start`, etc.
- Arrow position likewise inverts.

---

## Override Examples

```tsx
<ThemeProvider theme={defineTheme({
  components: {
    Tooltip: {
      defaultProps: { variant: 'inverted', size: 'sm', openDelay: 200 },
      styleOverrides: { content: 'shadow-lg', arrow: '' },
    },
  },
})} />

<Tooltip content="Hint" className="rounded-lg" sx={{ radius: 'lg' }} style={{ maxWidth: 400 }}>
  <Button>…</Button>
</Tooltip>
```

---

## Examples List

| File                  | Demonstrates                                       |
| --------------------- | -------------------------------------------------- |
| `Basic.tsx`           | Default tooltip on a Button                        |
| `Variants.tsx`        | solid / outline / soft / inverted                  |
| `Sizes.tsx`           | sm / md / lg                                       |
| `Colors.tsx`          | 7 colors × 3 chrome variants                       |
| `Placements.tsx`      | 12-placement grid                                  |
| `Delay.tsx`           | Custom open + close delays                         |
| `WithoutArrow.tsx`    | Arrow off                                          |
| `LongContent.tsx`     | Multi-line wrap; `max-w-*` clamp                   |
| `Disabled.tsx`        | `disabled` prop                                    |
| `Controlled.tsx`      | Parent owns `open` (e.g. for guided-tour highlights)|
| `PortalContainer.tsx` | Mounting inside a Modal's portal node              |

---

## Testing Plan

`Tooltip.test.tsx`:
- Renders trigger; tooltip absent until hover/focus
- Hover-in after `openDelay` → tooltip mounts with `aria-describedby`
- Hover-out after `closeDelay` → unmounts
- Hover **into** the tooltip cancels close-delay
- Esc closes when open; matches escape-stack ordering with nested overlays
- `placement` prop → matches `data-placement` on the floating element after Floating UI resolves
- `showArrow={false}` hides the arrow node
- `disabled={true}` prevents any opening
- Controlled `open={true}` shows; flipping to `false` unmounts via AnimatePresence
- `portalContainer` renders into the provided node
- `variant`/`color`/`size` apply correct classes
- Theme `styleOverrides.{ content, arrow }` merge correctly
- `ref` forwarded to the floating element

`Tooltip.a11y.test.tsx`:
- `role="tooltip"` on content
- `aria-describedby` set on trigger while open
- Focus-visible on trigger opens tooltip
- axe passes for every variant × color combo
- Pointer-events on content are disabled (no accidental clicks)

---

## File-Level Tasks (Ordered)

1. [ ] **Prereq**: confirm positioning sub-phase has shipped `usePosition`, `<Portal>`, `useEscapeStack`. **Block this phase if not.**
2. [ ] Create `packages/components/src/Tooltip/` folder
3. [ ] Write `Tooltip.types.ts`
4. [ ] Write `Tooltip.recipe.ts`
5. [ ] Write `Tooltip.motion.ts`
6. [ ] Write `useTooltipDelay.ts`
7. [ ] Write `TooltipArrow.tsx`
8. [ ] Write `Tooltip.tsx`
9. [ ] Write `meta.ts` (category `Overlays`, tags `['tooltip', 'hint', 'overlay']`)
10. [ ] Write `Tooltip.test.tsx`, `Tooltip.a11y.test.tsx`
11. [ ] Write 11 example files
12. [ ] Write `README.mdx`
13. [ ] Export `Tooltip` from package index + `apx-ds
14. [ ] Renderer discovery check
15. [ ] Bundle delta: < 4 KB gzipped (Tooltip is small; the engine bundles `@floating-ui/react` once for the whole batch)

---

## Acceptance Criteria

- [ ] Hover, focus, and `Esc` all behave per the ARIA Tooltip pattern.
- [ ] All 4 variants × 7 colors × 3 sizes × 12 placements render correctly (4 × 7 × 3 × 12 — exhaustive grid available in `Placements.tsx` × `Variants.tsx`).
- [ ] Floating UI auto-flips at viewport edges (tested in the renderer).
- [ ] Arrow tracks the trigger correctly even after a flip.
- [ ] Portal renders into the default `document.body` and into a custom container without hydration warnings.
- [ ] Reduced-motion users see opacity-only transitions.
- [ ] RTL: `top-start` flips correctly.
- [ ] axe-core passes; `aria-describedby` association works in screen-reader manual tests.
- [ ] **Engine APIs** (`usePosition`, `<Portal>`, `useEscapeStack`) work as documented — flagged here as positioning-engine validation.

---

## DRY Self-Check

- [ ] No `cn` / `clsx` import
- [ ] `@floating-ui/react` is only imported by the engine's `usePosition`, never by Tooltip directly
- [ ] `<Portal>` reused from engine
- [ ] `useEscapeStack` reused from engine (will be heavily reused by Modal, Drawer, Menu)
- [ ] Tooltip's render tree is simple enough that Popover (next phase) is a near-copy with `pointer-events: auto` + interactive content support
- [ ] Adding a new color = one palette entry + 3 compound rows; zero component changes
- [ ] Adding a new variant = one recipe row + 7 compound rows

---

## Out of Scope (Future Components / Phases)

- **Hover card / Rich tooltip** (interactive content) — that's `<Popover>` (Phase 18). Tooltip is read-only.
- **Tooltip provider** (a global delay/grouping config) — defer; theme-level `defaultProps` suffices.
- **Multi-target tooltips** (hover-over-any-of-many shows one shared tooltip) — composition; not a primitive.
- **Async content loading** — consumer can pass a `<Spinner>` or controlled-content pattern; no built-in.

---

## When This Phase Is Complete

1. Move this file to `plans/completed/components/17-tooltip.md`.
2. Append `## Outcome`: API, bundle delta, axe results, positioning-engine API feedback (any
   changes the implementation forced on `usePosition` / `<Portal>` / `useEscapeStack`).
3. Resume Phase 18 — Popover.

---

## Outcome

**Status: 🟢 SHIPPED · 2026-05-20**

### Delivered

| Surface | Path | Notes |
|---|---|---|
| Component | `packages/components/src/Tooltip/Tooltip.tsx` | Radix-style API (`content` prop, single trigger child) |
| Sub-component | `packages/components/src/Tooltip/TooltipArrow.tsx` | SVG arrow positioned via Floating UI `arrow` middleware |
| Recipes | `packages/components/src/Tooltip/Tooltip.recipe.ts` | `tooltipContentRecipe` + `tooltipArrowRecipe`; 4 variants × 7 colors × 3 sizes × 12 placements (`inverted` skips per-color cells) |
| Motion | `packages/components/src/Tooltip/Tooltip.motion.ts` | Placement-aware slide (4px) + scale 0.95→1, 120ms ease-out-expo |
| Hook | `packages/components/src/Tooltip/useTooltipDelay.ts` | Open/close timers; pointer + focus event integration; controlled/uncontrolled |
| Types | `packages/components/src/Tooltip/Tooltip.types.ts` | `TooltipVariant`/`TooltipSize`/`TooltipColor`/`TooltipPlacement`/`TooltipProps` |
| Meta | `packages/components/src/Tooltip/meta.ts` | Renderer discovery: category `Overlays`, tags `tooltip`/`hint`/`overlay` |
| Tests | `packages/components/__tests__/Tooltip.test.tsx`, `Tooltip.a11y.test.tsx` | Real timers + `await waitFor` for `AnimatePresence` exit |
| Examples | `packages/components/src/Tooltip/examples/{Basic,Variants,Sizes,Colors,Placements,Delay,WithoutArrow,LongContent,Disabled,Controlled,PortalContainer}.tsx` | All 11 |
| Docs | `packages/components/src/Tooltip/README.mdx` | Anatomy, variants, sizes, placements, delay, a11y, theming, engine-API feedback |
| Export | `packages/components/src/index.ts` | `Tooltip` + 4 type aliases (alphabetical, after `Toggle`) |

### Engine validation (Phase 17 Core consumption)

Tooltip is the **first consumer** of `@apx-dsine`'s overlay primitives. Touch report:

| Primitive | Used | Surface validated |
|---|---|---|
| `usePosition({ open, placement, offset, arrow, … })` | ✅ | `triggerRef`/`floatingRef`/`arrowRef` ref-callback shape; `x`/`y`/`placement`/`middlewareData` returns; `autoUpdate` pause when closed |
| `<Portal container={…}>` | ✅ | SSR-safe mount, `disabled` honored, custom container per-instance |
| `useEscapeStack({ active, onEscape })` | ✅ | Mount-order topmost-fires-first; `active: open` (not `mounted`) avoids the AnimatePresence exit-phase double-fire |
| `forwardRef` (engine) | ✅ | `displayName` + ref-merge with cloned trigger |

**No breaking changes were forced on the engine.** Two minor convention notes (already captured in
the README): (a) when the floating element is also `motion.div`, the consumer must `mergeRefs(floatingRef, ref)` because Motion takes the slot; (b) `useEscapeStack`'s `active` flag must come from the consumer's `open` state, not from the AnimatePresence-driven mount flag, otherwise the Escape handler stays registered through the exit animation. Tooltip ships an inline `mergeRefs` helper — promote to `@apx-dsine` once a second consumer needs it (Popover will).

### QA gates

| Gate | Result |
|---|---|
| `pnpm -w typecheck` | ✅ green (12/12 tasks) |
| `pnpm -w lint` | ✅ green (only pre-existing engine warnings, unrelated) |
| `pnpm -w test` | ✅ 740/740 tests passing across 37 test files |
| `pnpm -w build` | ✅ green (6/6 tasks; renderer prerender succeeds) |
| `pnpm --filter @apx-dsponents test Tooltip` | ✅ 26 Tooltip-specific tests passing (14 unit + 12 a11y) — **including the 4 specifically flagged in the Core 18 cross-suite report** (pointerleave, focus, Esc, controlled-open) |
| `axe-core` | ✅ zero violations across every variant × color × placement cell tested |

### Bundle delta

Measured with `esbuild` (minified, gzipped, with `react`/`react-dom`/`react/jsx-runtime`/
`@floating-ui/react`/`motion/react`/`@apx-dsine`/`@apx-apx-ds
`@apx-dsens`/`clsx`/`tailwind-merge` externalized):

```
Tooltip/index.ts → 9112 B raw / 2883 B gz  (2.82 KB gz)
```

**Target: < 4 KB gz · Result: 2.82 KB gz · ✅ 1.18 KB under budget.**

The first overlay consumer pays the full per-component overhead (delay hook, arrow SVG, motion
config, recipe). Subsequent overlays (Popover, Modal, Menu) will reuse Motion + the engine
primitives, so their incremental gz delta should be in the 1.5–2.5 KB range.

### Deviations from the spec

1. **`forwardRef` import path.** Plan sketched `import { forwardRef } from '@apx-dsine'`. Implementation uses `react`'s `forwardRef` directly because the engine doesn't re-export it (and Tooltip doesn't need the engine's `displayName` helper). No effect on consumers.
2. **`tooltipMotion`**'s cubic-bezier is passed as a tuple typed via a tiny helper rather than a string — Motion's TS types reject the inline `[0.16, 1, 0.3, 1] as const` cast under `exactOptionalPropertyTypes`. Inline `parseEase()` keeps the README-friendly string form readable while satisfying TS.
3. **`MotionStyle` ↔ `CSSProperties`** — Motion's `style` prop disallows the spread of generic `CSSProperties` under `exactOptionalPropertyTypes: true` because of its bespoke `x`/`y`/`scale` properties. Same workaround as `Alert`: `style={{ ...inlineStyle as never }}` with a `Record<string, unknown>` typed motion-extra-props bag. No runtime effect.
4. **Test timers.** Plan implied `vi.useFakeTimers()`. With `<AnimatePresence>` driving exit unmount, fake timers stall the `motion.div` removal. Switched to **real timers** with `await waitFor(…)` and `openDelay={0}` for hover-open assertions — same pattern as `Alert`.

### Coordination notes

- No conflicts with concurrent lanes (Slider, ToggleGroup) — Tooltip lives in its own folder and edits `src/index.ts` only at an alphabetically-stable insertion point (between `Toggle` and any future `T*` exports).
- The 2 minor `mergeRefs` / `useEscapeStack(active)` notes above are documented in `Tooltip/README.mdx` so the next overlay author (Popover) doesn't rediscover them.
- `@floating-ui/react` is now in the engine's `dependencies`. Modal, Drawer, Menu, Select get it for free; their `package.json` deps don't need to change.

### Next phase unblocked

Phase 18 (Popover) is now ready to start — it consumes the same engine primitives plus `useFocusTrap` (already shipped) and `useOutsideClick` (already shipped), with `pointer-events: auto` and trapped focus.
