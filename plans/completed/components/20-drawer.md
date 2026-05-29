# Phase 20 — `<Drawer />` + `Drawer.Trigger` + `Drawer.Content` + `Drawer.Header` + `Drawer.Body` + `Drawer.Footer` + `Drawer.Close`

> Status: **Pending** · Depends on: Phase 19 (Modal — Drawer is Modal's edge-anchored cousin, reuses backdrop + focus-trap + scroll-lock) · Blocks: nothing else in this batch

## Objective

Ship the edge-anchored sliding panel — `<Drawer />`. Drawer is Modal with two changes:

1. **Anchored to an edge** (left / right / top / bottom) instead of viewport center.
2. **Slides in from the edge** instead of fade+scale.

Everything else (compound shape, focus trap, backdrop, scroll lock, escape stack) is **reused
verbatim from Modal**. This phase exists primarily as a DRY proof — if Modal's pattern is right,
Drawer should be ~150 lines of layout/recipe code with no new infrastructure.

---

## What This Component Proves

- Modal's compound shape ports cleanly to a different layout (edge vs center).
- `useScrollLock` from Modal is generically applicable → promoted to `@apx-ds/engine`.
- Drawer.Body's overflow handling matches Modal.Body's (no copy-paste; shared recipe slot).
- Direction-aware slide animations work for all four edges + reduced-motion.

---

## Public API

```tsx
import { Drawer, Button } from 'apx-ds';
<Drawer>
  <Drawer.Trigger asChild>
    <Button>Open menu</Button>
  </Drawer.Trigger>
  <Drawer.Content side="right">
    <Drawer.Header title="Settings" />
    <Drawer.Body>…</Drawer.Body>
    <Drawer.Footer>
      <Drawer.Close asChild><Button variant="ghost">Close</Button></Drawer.Close>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer>

<Drawer
  open={open}
  defaultOpen={false}
  onOpenChange={(v) => setOpen(v)}
  closeOnEscape={true}
  closeOnBackdropClick={true}
  trapFocus={true}
  preventScroll={true}
  initialFocus={ref}
  finalFocus={ref}
>
  <Drawer.Trigger asChild>…</Drawer.Trigger>
  <Drawer.Content
    side="left"                  // 'left' (default) | 'right' | 'top' | 'bottom'
    size="md"                    // 'sm' | 'md' | 'lg' | 'xl' | 'full'
    overlay="dimmed"             // 'dimmed' | 'blur' | 'transparent'
    portalContainer={null}
    className=""
    style={{}}
    sx={{}}
  >
    …
  </Drawer.Content>
</Drawer>
```

### Prop Decisions

- **`side="left"` by default** — most common navigation drawer side in LTR.
- **`side` is on `Drawer.Content`, not root** — symmetric with Modal's `placement` being on Content.
- **Sizes are direction-aware**:
  - For `side: 'left' | 'right'` → `size` controls **width** (`max-w-xs` … `max-w-2xl`).
  - For `side: 'top' | 'bottom'` → `size` controls **height** (`max-h-xs` … `max-h-2xl`).
  - `size="full"` means full width on horizontal drawers, full height on vertical.
- **All other props mirror Modal** — keeps the mental model identical.

---

## Variants — Designed Inline

### Sides

| Side    | Anchors to    | Slides from | Size axis |
| ------- | ------------- | ----------- | --------- |
| `left`  | left edge     | left        | width     |
| `right` | right edge    | right       | width     |
| `top`   | top edge      | top         | height    |
| `bottom`| bottom edge   | bottom      | height    |

### Sizes

| Size | Horizontal (`left`/`right`) | Vertical (`top`/`bottom`) | Padding (slots) |
| ---- | --------------------------- | ------------------------- | --------------- |
| `sm` | `max-w-xs` (320px)          | `max-h-xs`                | `p-4`           |
| `md` | `max-w-sm` (384px)          | `max-h-sm`                | `p-5`           |
| `lg` | `max-w-md` (448px)          | `max-h-md`                | `p-6`           |
| `xl` | `max-w-xl` (576px)          | `max-h-xl`                | `p-6`           |
| `full` | `w-full`                  | `h-full`                  | `p-6`           |

### Overlays

Same as Modal (`dimmed` / `blur` / `transparent`).

---

## File Structure

```
packages/components/src/Drawer/
├── Drawer.tsx                   # context + state owner
├── DrawerTrigger.tsx
├── DrawerContent.tsx
├── DrawerHeader.tsx
├── DrawerBody.tsx
├── DrawerFooter.tsx
├── DrawerClose.tsx
├── Drawer.types.ts
├── Drawer.recipe.ts             # six recipes: backdrop, content, header, body, footer, close
├── Drawer.motion.ts             # direction-aware slide motion
├── DrawerContext.ts
├── index.ts                     # Object.assign
├── Drawer.test.tsx
├── Drawer.a11y.test.tsx
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Sides.tsx                # left / right / top / bottom
    ├── Sizes.tsx
    ├── Overlays.tsx
    ├── NavigationDrawer.tsx     # canonical mobile-nav use-case
    ├── BottomSheet.tsx          # mobile bottom-sheet pattern
    ├── ScrollableBody.tsx
    ├── FormInside.tsx
    ├── NestedDrawer.tsx         # Drawer + Drawer side-by-side
    ├── ResponsiveSide.tsx       # side flips on breakpoint
    ├── Controlled.tsx
    └── Programmatic.tsx
```

---

## Recipe Sketch

```ts
// Drawer.recipe.ts
import { cv } from '@apx-dsine';

export const drawerRecipes = {
  backdrop: cv({
    base: 'fixed inset-0 z-modal flex transition-opacity duration-fast',
    variants: {
      overlay: { dimmed: 'bg-overlay', blur: 'bg-overlay/40 backdrop-blur-sm', transparent: 'bg-transparent' },
      side: {
        left:   'items-stretch justify-start',
        right:  'items-stretch justify-end',
        top:    'items-start justify-stretch flex-col',
        bottom: 'items-end justify-stretch flex-col',
      },
    },
    defaultVariants: { overlay: 'dimmed', side: 'left' },
  }),
  content: cv({
    base: [
      'relative outline-none',
      'bg-bg-paper text-fg-default shadow-2xl',
      'flex flex-col',
      'transition-transform duration-normal ease-emphasized',
    ].join(' '),
    variants: {
      side: {
        left:   'h-full border-e border-border',
        right:  'h-full border-s border-border',
        top:    'w-full border-b border-border',
        bottom: 'w-full border-t border-border',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
        xl: '',
        full: 'rounded-none',
      },
    },
    compoundVariants: [
      // horizontal sides → width axis
      { side: 'left',  size: 'sm', class: 'w-full max-w-xs' },
      { side: 'left',  size: 'md', class: 'w-full max-w-sm' },
      { side: 'left',  size: 'lg', class: 'w-full max-w-md' },
      { side: 'left',  size: 'xl', class: 'w-full max-w-xl' },
      { side: 'left',  size: 'full', class: 'w-full' },
      { side: 'right', size: 'sm', class: 'w-full max-w-xs' },
      { side: 'right', size: 'md', class: 'w-full max-w-sm' },
      { side: 'right', size: 'lg', class: 'w-full max-w-md' },
      { side: 'right', size: 'xl', class: 'w-full max-w-xl' },
      { side: 'right', size: 'full', class: 'w-full' },
      // vertical sides → height axis
      { side: 'top',    size: 'sm', class: 'h-full max-h-xs' },
      { side: 'top',    size: 'md', class: 'h-full max-h-sm' },
      { side: 'top',    size: 'lg', class: 'h-full max-h-md' },
      { side: 'top',    size: 'xl', class: 'h-full max-h-xl' },
      { side: 'top',    size: 'full', class: 'h-full' },
      { side: 'bottom', size: 'sm', class: 'h-full max-h-xs' },
      { side: 'bottom', size: 'md', class: 'h-full max-h-sm' },
      { side: 'bottom', size: 'lg', class: 'h-full max-h-md' },
      { side: 'bottom', size: 'xl', class: 'h-full max-h-xl' },
      { side: 'bottom', size: 'full', class: 'h-full' },
    ],
    defaultVariants: { side: 'left', size: 'md' },
  }),
  header: cv({
    base: 'flex items-start gap-3 border-b border-border-subtle',
    variants: { size: { sm: 'p-4', md: 'p-5', lg: 'p-6', xl: 'p-6', full: 'p-6' } },
    defaultVariants: { size: 'md' },
  }),
  body: cv({
    base: 'flex-1 min-h-0 overflow-y-auto text-fg-default',
    variants: { size: { sm: 'p-4', md: 'p-5', lg: 'p-6', xl: 'p-6', full: 'p-6' } },
    defaultVariants: { size: 'md' },
  }),
  footer: cv({
    base: 'flex items-center gap-2 border-t border-border-subtle',
    variants: { size: { sm: 'p-4', md: 'p-5', lg: 'p-6', xl: 'p-6', full: 'p-6' } },
    defaultVariants: { size: 'md' },
  }),
  close: cv({
    base: 'absolute end-3 top-3 inline-flex items-center justify-center size-7 rounded text-fg-muted hover:text-fg-default hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2',
  }),
};
```

---

## Direction-aware Motion

```ts
// Drawer.motion.ts
import type { DrawerSide } from './Drawer.types';

const motionMap: Record<DrawerSide, { hidden: any; visible: any }> = {
  left:   { hidden: { x: '-100%' }, visible: { x: 0 } },
  right:  { hidden: { x: '100%'  }, visible: { x: 0 } },
  top:    { hidden: { y: '-100%' }, visible: { y: 0 } },
  bottom: { hidden: { y: '100%'  }, visible: { y: 0 } },
};

export function drawerMotion(side: DrawerSide) {
  return {
    initial: motionMap[side].hidden,
    animate: motionMap[side].visible,
    exit:    motionMap[side].hidden,
    transition: { duration: 0.28, ease: [0.2, 0, 0, 1] as const },
  };
}
```

`prefers-reduced-motion`: Motion handles via `useReducedMotion()` — fades in instead of sliding.

---

## Component Sketch

```tsx
'use client';
export function Drawer(props: DrawerProps) {
  // Identical to Modal — same context shape, same hooks. Different recipe + motion.
}

export const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(function DrawerContent(props, ref) {
  const { side = 'left', size, overlay, portalContainer, children, ...rest } = props;
  const ctx = useDrawerContext();
  const backdropCls = useThemedClasses({ recipe: drawerRecipes.backdrop, componentName: 'Drawer', slot: 'backdrop', props: { overlay, side } });
  const contentCls  = useThemedClasses({ recipe: drawerRecipes.content,  componentName: 'Drawer', slot: 'content',  props: { side, size, sx: rest.sx, className: rest.className, style: rest.style } });

  return (
    <Portal container={portalContainer}>
      <AnimatePresence>
        {ctx.open ? (
          <motion.div
            className={backdropCls.className}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onPointerDown={(e) => {
              if (ctx.closeOnBackdropClick && e.target === e.currentTarget) ctx.setOpen(false);
            }}
          >
            <FocusTrap active={ctx.trapFocus} initialFocus={ctx.initialFocus} finalFocus={ctx.finalFocus ?? ctx.triggerRef}>
              <motion.div
                ref={mergeRefs(ctx.contentRef, ref)}
                role="dialog"
                aria-modal="true"
                aria-labelledby={ctx.titleId}
                aria-describedby={ctx.descId}
                className={contentCls.className}
                style={contentCls.style}
                {...drawerMotion(side)}
                {...rest}
              >
                {children}
              </motion.div>
            </FocusTrap>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Portal>
  );
});
```

---

## Types

```ts
import type { HTMLAttributes, ReactNode, ReactElement, RefObject } from 'react';
import type { Sx } from '@apx-dsine';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type DrawerOverlay = 'dimmed' | 'blur' | 'transparent';

export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  trapFocus?: boolean;
  preventScroll?: boolean;
  initialFocus?: RefObject<HTMLElement>;
  finalFocus?: RefObject<HTMLElement>;
  children: ReactNode;
}

export interface DrawerContentProps extends HTMLAttributes<HTMLDivElement> {
  side?: DrawerSide;
  size?: DrawerSize;
  overlay?: DrawerOverlay;
  portalContainer?: HTMLElement | null;
  sx?: Sx;
}
// Header/Body/Footer/Close mirror Modal's exactly.
```

---

## Accessibility

- `role="dialog"`, `aria-modal="true"`.
- Focus trap, focus restoration, Esc-close, backdrop-click-close, scroll lock — all inherited verbatim from Modal patterns.
- `Drawer.Header.title` wires `aria-labelledby` via context id.
- Drawer **does not** announce itself as a "navigation region" by default — that's the consumer's call. They can pass `role="navigation"` via prop spread on Content for a side-nav drawer.
- axe-core: zero violations.

---

## Animation / Interactions

- Slide from anchored edge, 280ms `ease-emphasized`.
- Backdrop fade 180ms.
- `prefers-reduced-motion`: opacity-only.
- Edge swipe-to-close on touch devices: **out of scope V1**. Add later if a consumer needs it (uses `Pointer Events` + Motion's drag).

---

## Responsive

```tsx
<Drawer.Content side={{ base: 'bottom', md: 'right' }} size={{ base: 'lg', md: 'md' }}>
  …
</Drawer.Content>
```

This is the key responsive pattern: **bottom-sheet on mobile, side-drawer on desktop**. Drives many real-world UIs.

---

## RTL

- Sides are **physical** (`left` / `right` / `top` / `bottom`) — not logical. Choice: physical sides match the spatial intuition; flipping LTR's "left drawer" to "right drawer" in RTL would surprise consumers.
- Border placement (`border-s` / `border-e`) **is** logical — so the visual border lands on the correct inner edge regardless of RTL.
- Close button is logical-end (`end-3 top-3`) — flips correctly.

---

## Override Examples

```tsx
<ThemeProvider theme={defineTheme({
  components: {
    Drawer: {
      defaultProps: { /* none — Drawer is stateful */ },
      styleOverrides: {
        backdrop: 'bg-overlay/70',
        content: 'rounded-none border-0',
        header: 'border-b-0',
        body: '',
        footer: '',
        close: '',
      },
    },
  },
})} />
```

---

## Examples List

| File                  | Demonstrates                                       |
| --------------------- | -------------------------------------------------- |
| `Basic.tsx`           | Default left drawer                                |
| `Sides.tsx`           | left / right / top / bottom                        |
| `Sizes.tsx`           | sm → full                                          |
| `Overlays.tsx`        | dimmed / blur / transparent                        |
| `NavigationDrawer.tsx`| Mobile nav use-case                                |
| `BottomSheet.tsx`     | Mobile bottom-sheet pattern                        |
| `ScrollableBody.tsx`  | Long content                                       |
| `FormInside.tsx`      | Inputs inside (focus trap)                         |
| `NestedDrawer.tsx`    | Drawer inside Drawer (escape-stack)                |
| `ResponsiveSide.tsx`  | `side` flips on breakpoint                         |
| `Controlled.tsx`      | Parent owns open                                   |
| `Programmatic.tsx`    | Imperative open                                    |

---

## Testing Plan

`Drawer.test.tsx`:
- Trigger / Esc / backdrop / Close all open and close
- All four `side` values render content at correct edge
- All sizes apply the correct max-w / max-h
- Scroll lock applied; restored on close
- Focus trap + restoration work
- Nested drawers respect escape stack
- Responsive `side` via responsive value works
- Theme `styleOverrides.{ backdrop, content, header, body, footer, close }` merge correctly
- `ref` forwarded to Content

`Drawer.a11y.test.tsx`:
- `role="dialog"` + `aria-modal="true"` on Content
- `aria-labelledby` set when Header has title
- axe passes for every side × size cell

---

## File-Level Tasks (Ordered)

1. [ ] **Promote `useScrollLock` from Modal/ to `@apx-dsine`** — Drawer is the second consumer, triggering the extraction.
2. [ ] Update Modal to import from engine after promotion (one-line change).
3. [ ] Create `packages/components/src/Drawer/` folder
4. [ ] Write `Drawer.types.ts`
5. [ ] Write `Drawer.recipe.ts`
6. [ ] Write `Drawer.motion.ts`
7. [ ] Write `DrawerContext.ts`
8. [ ] Write all subpart files (mirroring Modal's six)
9. [ ] Write `index.ts` (Object.assign)
10. [ ] Write `meta.ts` (category `Overlays`, tags `['drawer', 'sheet', 'overlay']`)
11. [ ] Write `Drawer.test.tsx`, `Drawer.a11y.test.tsx`
12. [ ] Write 12 example files
13. [ ] Write `README.mdx`
14. [ ] Export from package index + `apx-ds
15. [ ] Renderer discovery check
16. [ ] Bundle delta: < 4 KB gzipped (smaller than Modal — no scroll-lock duplication)

---

## Acceptance Criteria

- [ ] All four sides render with correct anchoring + slide direction.
- [ ] Sizes work correctly per side (width vs height axis).
- [ ] Scroll lock + focus trap + escape stack all reused from engine — **zero new infra**.
- [ ] Responsive `side` works (bottom-sheet on mobile, right-drawer on desktop).
- [ ] axe-core passes.
- [ ] Reduced-motion users see opacity-only transitions.
- [ ] `useScrollLock` promoted to engine; Modal updated.

---

## DRY Self-Check

- [ ] No `cn` / `clsx` import
- [ ] `useScrollLock` is engine, not local (promoted as part of this phase)
- [ ] `FocusTrap`, `Portal`, `useEscapeStack`, `useControllableState` all imported from engine
- [ ] Compound subpart files share recipe slots with Modal where they're structurally identical (Header / Body / Footer / Close are visually the same as Modal's; the difference is layout direction handled by Content)
- [ ] No duplicated motion logic from Modal — Drawer has its own direction-aware motion file
- [ ] Adding a new side = one row in `motionMap` + four backdrop variant rows + four content variant rows; no component changes

---

## Out of Scope (Future Components / Phases)

- **Swipe-to-close** on touch — needs Pointer Events + Motion drag; ship V2.
- **Persistent drawer** (stays open beside content, no backdrop) — different use-case; ship as a separate `<SideNav>` component if needed.
- **Drawer-within-drawer animation** — current escape-stack handles ordering; visual stacking is left to consumers' z-index discipline.

---

## When This Phase Is Complete

1. Move this file to `plans/completed/components/20-drawer.md`.
2. Append `## Outcome`: API, bundle delta, axe results, `useScrollLock` promotion delta (Modal LOC change).
3. Resume Phase 21 — Toast.

---

## Outcome

> Status: ✅ **Shipped** · Owner: SDS-Agent6 · Promoted to engine: `mergeRefs` (third-consumer threshold).

### Delivered API

Compound primitive ships as the canonical Object.assign root + 6 subparts (mirrors Modal verbatim
modulo `side` instead of `placement`):

```tsx
import { Drawer, Button } from 'apx-ds';
<Drawer>
  <Drawer.Trigger asChild>
    <Button>Open menu</Button>
  </Drawer.Trigger>
  <Drawer.Content side="right" size="md" overlay="dimmed">
    <Drawer.Close />
    <Drawer.Header title="Settings" description="Update your preferences." />
    <Drawer.Body>…</Drawer.Body>
    <Drawer.Footer align="end">
      <Drawer.Close asChild><Button variant="ghost">Cancel</Button></Drawer.Close>
      <Button>Save</Button>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer>
```

- Root behavior props: `open` / `defaultOpen` / `onOpenChange`, `closeOnEscape`,
  `closeOnBackdropClick`, `trapFocus`, `preventScroll`, `initialFocus` / `finalFocus`. **All
  identical to Modal.**
- Content visual axes: `side ∈ {left, right, top, bottom}`, `size ∈ {sm, md, lg, xl, full}`,
  `overlay ∈ {dimmed, blur, transparent}`. All `ResponsiveValue<>` aware.
- Footer: `align ∈ {start, center, end, between}` (default `end`).
- Trigger: `asChild` (default `true`); Close: `asChild` (default `false`) — same shape as Modal.

### Plan task 1 status — `useScrollLock` engine promotion

**Already done in Phase 19 (Modal).** The plan was authored before Modal landed it, so plan task 1
is a no-op. Modal already imports `useScrollLock` from `@apx-dsine`; Drawer is the second
consumer of the engine hook, validating reference-counting end-to-end. No Modal LOC change
required for this phase.

### Engine API change — `mergeRefs` promotion

**Threshold of three consumers crossed (Tooltip / Popover / Modal).** Promoted in this PR:

- New file: `packages/engine/src/mergeRefs.ts` — `mergeRefs<T>(...refs: Array<Ref<T> | undefined>) => (node: T | null) => void`. Skips falsy refs, supports both callback and object refs, fires `null` on unmount to every input.
- New tests: `packages/engine/__tests__/mergeRefs.test.ts` — 6 tests covering object refs, callback refs, mixed, falsy, unmount, and shape stability.
- Re-exported from `packages/engine/src/index.ts`.
- Refactored consumers (5 inline copies removed): `Tooltip.tsx`, `PopoverTrigger.tsx`,
  `PopoverContent.tsx`, `ModalTrigger.tsx`, `ModalContent.tsx` now import from `@apx-dsine`.
- Drawer's `DrawerTrigger.tsx` and `DrawerContent.tsx` consume from engine on day one.

The 4 form-side consumers (`Checkbox.tsx`, `Input.tsx`, `Textarea.tsx`, `NumberInput.tsx`) use a
slightly different `AnyRef<T>` typing (allows explicit `null`) and were intentionally left in
place. The new engine helper accepts the same inputs at runtime; their owners can migrate when
convenient as a non-blocking follow-up.

### Engine validation summary (Phase 17 Core consumer audit — stays closed)

| Primitive | Drawer's consumption | Status |
|---|---|---|
| `<Portal>` | Backdrop + Content tree portal-rendered to `document.body` (or `portalContainer`). | ✅ re-validated |
| `useEscapeStack` | `active: open && closeOnEscape`; nested-Drawer Esc unwind tested. | ✅ re-validated |
| `useFocusTrap` | `active: open && trapFocus`; first-focusable / `initialFocus` / Tab-cycle / return-focus all green on edge-anchored content. | ✅ re-validated |
| `useScrollLock` | **Second consumer.** Reference-count discipline validated by both Drawer-only and Drawer-over-Modal scenarios in tests. | ✅ second consumer landed |
| `usePosition` | Not consumed (Drawer is anchored, not positioned). | n/a (intentional) |
| `useOutsideClick` | Not consumed (backdrop sentinel handles it inline, same as Modal). | n/a (intentional) |
| `mergeRefs` | **First consumer of the newly promoted engine helper.** Plus the 5 prior inline copies refactored to import from engine. | ✅ promoted + adopted |

### QA Gates

- `pnpm tsc --noEmit` — green for all my files. Pre-existing errors live in `Toast/` (P21,
  @SDS-Agent3) and `Menu/` (P22, @SDS-Agent4); both are in-progress by other agents.
- `pnpm eslint` — green across `src/Drawer/**`, both Drawer test files, `src/mergeRefs.ts`,
  `__tests__/mergeRefs.test.ts`, and the 5 refactored overlay consumers.
- `pnpm test` (engine) — **22 files / 163 tests pass** (mergeRefs adds 6 tests).
- `pnpm test` (components, my surface) — **8 files / 129 tests pass** across Tooltip + Popover +
  Modal + Drawer (Drawer contributes 33: 24 unit + 9 a11y). The other failures in the workspace
  test run are in `Toast.test.tsx` / `Toast.a11y.test.tsx` (4 failures, both pre-existing in
  @SDS-Agent3's Phase 21 work).
- `pnpm build` — green for engine and components; full DTS emitted.
- `axe-core` — zero violations across the side × size × open-state matrix
  (`Drawer.a11y.test.tsx::it.each(sides)`).

### Bundle Delta

Standalone Drawer subgraph (peers + engine + theme + motion all externalized):

| Bundle | Raw | Gzipped |
|---|---|---|
| `src/Drawer/index.ts` | 9 827 B | **3 409 B** |

**3.33 KB gz** vs. `< 4 KB` budget → **0.67 KB under**. Comparable to Modal (3.26 KB) — the only
material difference is the 20-row side × size compound matrix, which adds a few hundred bytes of
class-string deduplication that minify shrinks effectively.

Engine bundle gained 27 lines (the `mergeRefs.ts` source) and shipped at 27.54 KB raw / unchanged
gz (the helper compresses well alongside other small utilities).

### Deviations from plan

- **Plan task 1 (`useScrollLock` promotion)** — already done in P19. Recorded as N/A with
  evidence above.
- **`max-h-{xs|sm|md|xl}` tokens** referenced in the plan don't exist in Tailwind's default
  theme (only `max-w-*` does). Vertical drawers use arbitrary `max-h-[Nrem]` values whose rem
  values mirror the matching `max-w-*` tokens (xs=20rem, sm=24rem, md=28rem, xl=36rem). This
  keeps a `lg` left-drawer and a `lg` top-drawer occupying the same visual budget along their
  respective axes without requiring a Tailwind preset edit.
- **`useDrawer()` hook** mentioned in plan §Examples replaced with a controller-object pattern
  (`useState + useCallback` in `examples/Programmatic.tsx`), same as Modal's resolution.
- **`min-h-0` on Body recipe** — added beyond the plan sketch. Without it, vertical drawers
  (top/bottom) whose Content has `flex flex-col + max-height` can't actually shrink Body below
  its content height, breaking the scroll bound. Documented inline.
- **`padBySize()` helper extraction** (Header / Body / Footer / Close all share an identical
  per-slot padding table with Modal) **not landed**. With the second consumer (Drawer) here, the
  threshold is met, but extracting it now would change Modal's recipe shape mid-Drawer-PR. Will
  follow up as a small dedicated PR after Drawer lands.

### Coordination notes

- **@SDS-Leader** — Drawer ships, `mergeRefs` engine promotion landed cleanly, `useScrollLock`
  reference-counting validated by a real second consumer. Phase 21 (Toast) remains @SDS-Agent3's;
  Phase 22 (Menu) remains @SDS-Agent4's. No further engine API requests.
- **@SDS-Agent3** (Toast) — your tests are seeing 4 failures in `Toast.test.tsx` and
  `Toast.a11y.test.tsx`. They appear to be pre-existing in-flight state, not regressions from my
  refactor — my changes only touched the overlay components and the engine. Flagging in case it's
  useful context.
- **@SDS-Agent4** (Menu) — `useMenuKeyboard.ts` currently has 7 `noUncheckedIndexedAccess`
  errors. I did not touch any Menu files; flagging only because they show up under a workspace
  `tsc --noEmit` and you may want them on your radar.
- **Form-component owners** (Input / Textarea / Checkbox / NumberInput) — your inline `mergeRefs`
  helpers still work and are unchanged. The engine version (`Array<Ref<T> | undefined>`) accepts
  the same inputs the `AnyRef<T>` shape allows, so a one-line import swap will work whenever you
  decide to migrate.

### Files

- **Engine**: `packages/engine/src/mergeRefs.ts` (new), `packages/engine/__tests__/mergeRefs.test.ts` (new), `packages/engine/src/index.ts` (export added).
- **Drawer**: `packages/components/src/Drawer/Drawer.types.ts`, `DrawerContext.tsx`, `Drawer.recipe.ts` (6 recipes), `Drawer.motion.ts` (direction-aware slide), `Drawer.tsx`, `DrawerTrigger.tsx`, `DrawerContent.tsx`, `DrawerHeader.tsx`, `DrawerBody.tsx`, `DrawerFooter.tsx`, `DrawerClose.tsx`, `meta.ts`, `index.ts`, `README.mdx`.
- **Drawer examples**: `Basic.tsx`, `Sides.tsx`, `Sizes.tsx`, `Overlays.tsx`, `NavigationDrawer.tsx`, `BottomSheet.tsx`, `ScrollableBody.tsx`, `FormInside.tsx`, `NestedDrawer.tsx`, `ResponsiveSide.tsx`, `Controlled.tsx`, `Programmatic.tsx` (12 files).
- **Drawer tests**: `packages/components/__tests__/Drawer.test.tsx`, `Drawer.a11y.test.tsx`.
- **Refactor (mergeRefs)**: `Tooltip.tsx`, `PopoverTrigger.tsx`, `PopoverContent.tsx`, `ModalTrigger.tsx`, `ModalContent.tsx` — all now import `mergeRefs` from `@apx-dsine`.
- **Index**: `packages/components/src/index.ts` — `Drawer` exported alphabetically between `Checkbox` and `Input`; types re-exported.
