# Phase 17 (Core) — Positioning Engine

> Status: **Pending** · Depends on: Phase 2 (`@apx-ds/engine`) · Blocks: Components Batch 2 phases 17 (Tooltip), 18 (Popover), 19 (Modal), 20 (Drawer), 21 (Toast), 22 (Menu), 23 (Select)

> This is a **core (engine) phase**, not a component phase. Lives under `plans/pending/core/`
> and ships inside `@apx-dsine`. Components Batch 2's overlay family is the **first
> consumer**, but this code has zero overlay-specific surface area.

## Objective

Ship the small, focused bundle of overlay primitives every Batch 2 overlay component needs:

1. **`usePosition()`** — Floating UI wrapper for anchored elements (Tooltip, Popover, Menu, Select).
2. **`<Portal>`** — SSR-safe portal primitive (every overlay).
3. **`useFocusTrap()` + `<FocusTrap>`** — focus management for blocking overlays (Popover, Modal, Drawer, Menu).
4. **`useEscapeStack()` + escape-stack manager** — global Esc / outside-click ordering across nested overlays.
5. **`useOutsideClick()`** — pointer-down outside-the-element handler (Popover, Menu, Select).
6. **`useScrollLock()`** — page scroll-lock with scrollbar-gutter awareness (Modal, Drawer).

All six are **engine-level**, not component-level. They have no `_shared/components/` dependency,
no styling, no DOM markup beyond what `<Portal>` and `<FocusTrap>` necessarily render. They are
pure infrastructure.

---

## Why This Phase Exists

Components Batch 2 (Tooltip, Popover, Modal, Drawer, Toast, Menu, Select) **all consume the same
six primitives**. Authoring them inside any one component would either:

- Duplicate them across seven folders (anti-DRY catastrophe), or
- Force the first overlay author to also own the engine API design for the next six.

Pulling them out into a single core phase means:

- One author validates the full engine API surface before any overlay consumer ships.
- Tooltip (Phase 17 components) becomes the **first consumer** that proves the API but doesn't own
  it. Subsequent overlays reuse with zero rework.
- Engine work is testable in isolation (no React tree dependency for the non-component hooks).

---

## Deliverables

### 1. `@apx-dsine/positioning`

```ts
// packages/engine/src/positioning/usePosition.ts
import { useFloating, autoUpdate, offset as offsetMiddleware, flip, shift, arrow, size } from '@floating-ui/react';

export type Placement =
  | 'top' | 'top-start' | 'top-end'
  | 'right' | 'right-start' | 'right-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end';

export interface UsePositionOptions {
  placement?: Placement;
  offset?: number;                 // px gap between trigger and floating element
  arrow?: boolean;                 // when true, register arrow middleware + return arrowRef
  matchTriggerWidth?: boolean;     // when true, floating element width = trigger width (size middleware)
  flip?: boolean;                  // default true
  shift?: boolean;                 // default true
  autoUpdate?: boolean;            // default true — recompute on scroll/resize
  open?: boolean;                  // when false, autoUpdate is paused (perf)
}

export interface UsePositionReturn {
  triggerRef: RefCallback<HTMLElement>;
  floatingRef: RefCallback<HTMLElement>;
  arrowRef: RefCallback<HTMLElement> | null;
  x: number | null;
  y: number | null;
  placement: Placement;            // final placement after flip
  middlewareData: { arrow?: { x?: number; y?: number; centerOffset: number } };
  context: ReturnType<typeof useFloating>['context'];   // for advanced integrations (interactions)
}

export function usePosition(opts: UsePositionOptions): UsePositionReturn;
```

Implementation notes:

- Wraps `@floating-ui/react`'s `useFloating()` with DS-friendly defaults:
  - `whileElementsMounted: autoUpdate` (recompute on scroll/resize).
  - Middleware stack: `offset(offsetValue) → flip() → shift({ padding: 8 }) → arrow({ element }) → size({ apply: matchTriggerWidth ? setEqualWidth : undefined })`.
- `triggerRef` and `floatingRef` are stable RefCallbacks (not RefObjects) — Floating UI's pattern.
- The `arrowRef` is `null` when `arrow: false`; live only when `arrow: true`.
- Returned `placement` is the **final** placement after flip — components use this to render arrow/animation direction correctly.

Bundle impact: `@floating-ui/react` is ~10 KB gzipped. **Imported once for the whole DS**, not per-component.

### 2. `@apx-dsine/Portal`

```ts
// packages/engine/src/Portal.tsx
import { createPortal } from 'react-dom';

export interface PortalProps {
  children: ReactNode;
  container?: HTMLElement | null;  // defaults to document.body
  asChild?: boolean;               // when true, skips the wrapper div
  disabled?: boolean;              // when true, renders inline (no portal — useful for SSR / testing)
}

export function Portal(props: PortalProps): JSX.Element | null;
```

Implementation notes:

- **SSR-safe**: defers `createPortal()` to a `useEffect` so the portal target is resolved client-side. Returns `null` until mounted.
- `container={null}` is treated as "not yet ready" (vs. `undefined` which defaults to `document.body`). Useful for "mount inside a ref'd modal body" patterns.
- `disabled={true}` for tests + SSR snapshotting — renders inline, no portal.

### 3. `@apx-dsine/FocusTrap`

```ts
// packages/engine/src/focus-trap/useFocusTrap.ts
export interface UseFocusTrapOptions {
  active: boolean;
  initialFocus?: RefObject<HTMLElement> | (() => HTMLElement | null);
  finalFocus?: RefObject<HTMLElement> | (() => HTMLElement | null);
  returnFocusOnDeactivate?: boolean;   // default true
  escapeDeactivates?: boolean;         // default false — let escape-stack handle Esc
  allowOutsideClick?: boolean;         // default false
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export function useFocusTrap(containerRef: RefObject<HTMLElement>, options: UseFocusTrapOptions): void;

// packages/engine/src/focus-trap/FocusTrap.tsx
export interface FocusTrapProps extends UseFocusTrapOptions {
  children: ReactNode;
}

export const FocusTrap: FC<FocusTrapProps>;   // wraps children in a div + applies useFocusTrap
```

Implementation notes:

- Hand-rolled (not `focus-trap-react`) to avoid an extra dependency. ~80 lines.
- Strategy:
  - On `active=true`: store `document.activeElement` (finalFocus default), move focus to `initialFocus` (or first focusable inside container).
  - Attach `keydown` listener on the document: if `Tab` and focus is about to leave the container, redirect to the wrap-around boundary.
  - Attach `focusin` listener: if focus lands outside the container, force it back.
  - On `active=false`: restore focus to the stored element (`returnFocusOnDeactivate=true`) or to `finalFocus` if set.
- Detects focusable elements via a curated CSS selector (matches Radix's list — `button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])`).
- Skips elements with `tabindex="-1"`, `aria-hidden="true"`, or computed `display:none` / `visibility:hidden`.
- Returns silently when there are no focusable children (focus stays on container element via `tabIndex={-1}`).

### 4. `@apx-dsine/escape-stack`

```ts
// packages/engine/src/escape-stack/useEscapeStack.ts
export interface UseEscapeStackOptions {
  active: boolean;
  onEscape: () => void;
  priority?: number;             // optional explicit priority; defaults to mount order
}

export function useEscapeStack(options: UseEscapeStackOptions): void;
```

Implementation notes:

- Module-level singleton stack: an array of `{ id, onEscape, priority }` entries.
- On mount with `active=true`, push self; on unmount or `active=false`, remove self.
- Single global `keydown` listener (added once when stack becomes non-empty) — calls the topmost active handler on `Escape`.
- Tab + outside-click do **not** go through escape-stack — they're handled by `useOutsideClick` and the focus-trap (with `allowOutsideClick`).
- Priority breaks ties for simultaneously-mounted overlays. Default (auto-incrementing per mount) is fine for sequential overlay opens (nested Modal-inside-Modal closes inner first).

### 5. `@apx-dsine/useOutsideClick`

```ts
// packages/engine/src/useOutsideClick.ts
export interface UseOutsideClickOptions {
  active: boolean;
  refs: RefObject<HTMLElement>[];    // any pointerdown inside ANY of these refs is treated as "inside"
  onOutside: (event: PointerEvent) => void;
  capturePhase?: boolean;            // default true — fires before bubble handlers
}

export function useOutsideClick(options: UseOutsideClickOptions): void;
```

Implementation notes:

- Uses `pointerdown` (not `click`) so the handler fires before any descendant `onClick`. Matches Radix's approach.
- Captures phase so closing-on-outside-click happens before re-opening logic.
- Skips when `active=false` (no listener attached).
- Single listener per hook instance — no global delegation. Cheap; overlays are usually <5 on the page.

### 6. `@apx-dsine/useScrollLock`

```ts
// packages/engine/src/useScrollLock.ts
export function useScrollLock(active: boolean): void;
```

Implementation notes:

- Saves and restores `document.body.style.overflow`, `paddingRight`, and `scrollY`.
- Compensates for scrollbar gutter (`window.innerWidth - document.documentElement.clientWidth`) to prevent layout shift when locking.
- iOS-safe: also pins `body.position = 'fixed'` + `body.top = '-{scrollY}px'` because iOS Safari ignores `overflow: hidden` on body.
- Reference-counted: multiple concurrent calls (e.g., Modal + Drawer simultaneously open) lock once, unlock when the last consumer deactivates.

---

## File Structure

```
packages/engine/src/
├── positioning/
│   ├── usePosition.ts
│   ├── usePosition.test.ts
│   └── index.ts                       # exports usePosition, Placement type
├── Portal.tsx
├── Portal.test.tsx
├── focus-trap/
│   ├── useFocusTrap.ts
│   ├── FocusTrap.tsx
│   ├── focusable.ts                   # CSS selector + traversal helpers
│   ├── focus-trap.test.tsx
│   └── index.ts                       # exports useFocusTrap, FocusTrap
├── escape-stack/
│   ├── useEscapeStack.ts
│   ├── escape-stack.test.ts
│   └── index.ts
├── useOutsideClick.ts
├── useOutsideClick.test.ts
├── useScrollLock.ts
├── useScrollLock.test.ts
└── index.ts                           # re-exports all the above
```

Total LoC budget: ~600 lines including tests. Bundle delta (consumer-side):

- `@floating-ui/react` payload: ~10 KB gzipped (dep already enters the tree if any overlay is used).
- Engine code itself: ~3 KB gzipped.

---

## Types Exported from `@apx-dsine`

```ts
export type { Placement, UsePositionOptions, UsePositionReturn } from './positioning';
export { usePosition } from './positioning';
export { Portal } from './Portal';
export type { PortalProps } from './Portal';
export { useFocusTrap, FocusTrap } from './focus-trap';
export type { UseFocusTrapOptions, FocusTrapProps } from './focus-trap';
export { useEscapeStack } from './escape-stack';
export type { UseEscapeStackOptions } from './escape-stack';
export { useOutsideClick } from './useOutsideClick';
export type { UseOutsideClickOptions } from './useOutsideClick';
export { useScrollLock } from './useScrollLock';
```

Consumers (overlay components) import via:

```ts
import { usePosition, Portal, FocusTrap, useEscapeStack, useOutsideClick, useScrollLock } from '@apx-dsine';
```

---

## Testing Plan

### `usePosition.test.ts`

- Mount with placement="bottom"; `floatingRef`'s computed (x, y) match expected viewport math.
- Auto-flip: place near viewport edge → final `placement` flips to `top`.
- `arrow: true` → `arrowRef` is non-null, `middlewareData.arrow` populated.
- `matchTriggerWidth: true` → floating element width matches trigger width on apply callback.
- `autoUpdate: true` → scroll/resize triggers a re-computation.
- `open: false` → autoUpdate paused (no re-computation on scroll).

### `Portal.test.tsx`

- Default container = `document.body`.
- Custom `container` mounts children inside it.
- SSR: renders `null` initially; mounts on `useEffect`.
- `disabled: true` renders inline.
- Unmount cleans up the portal node.

### `focus-trap.test.tsx`

- On `active=true`: focus moves to `initialFocus` (or first focusable, or container).
- Tab past last → wraps to first.
- Shift+Tab past first → wraps to last.
- On `active=false`: focus returns to `finalFocus` (or pre-trap activeElement).
- `allowOutsideClick=true` lets pointer focus escape (with deactivation).
- No focusable children → focus rests on container (tabIndex=-1).
- Nested traps: outer trap pauses while inner is active (`activeTrap` singleton).

### `escape-stack.test.ts`

- Single subscriber: Esc fires `onEscape`.
- Two subscribers: only topmost fires.
- Unmount removes from stack; new topmost gets Esc.
- `active: false` deregisters without unmount.
- No subscribers → no global listener attached.

### `useOutsideClick.test.ts`

- Pointerdown outside the refs fires `onOutside`.
- Pointerdown inside any of the refs does not fire.
- `active: false` ignores all events.
- Cleanup on unmount.

### `useScrollLock.test.ts`

- Locks `document.body.overflow = 'hidden'` + saves prior value.
- Restores on unlock.
- Scrollbar gutter compensated via `paddingRight`.
- Reference-counted: two concurrent locks → still locked after one unlocks; unlocks only after both deactivate.
- iOS detection: applies `position: fixed` + `top: -{scrollY}` on iOS user agents.

### Engine-level axe / a11y check

- `FocusTrap` wrapper renders no extra DOM by default (or `<div tabIndex={-1}>` only when needed).
- Portal preserves accessible name / focus management of children.

---

## File-Level Tasks (Ordered)

1. [ ] `pnpm -F @apx-dsine add @floating-ui/react` (production dep; pin to current major).
2. [ ] Create `packages/engine/src/positioning/` — write `usePosition.ts`, tests, `index.ts`.
3. [ ] Write `packages/engine/src/Portal.tsx` + test.
4. [ ] Create `packages/engine/src/focus-trap/` — `focusable.ts`, `useFocusTrap.ts`, `FocusTrap.tsx`, tests, `index.ts`.
5. [ ] Create `packages/engine/src/escape-stack/` — `useEscapeStack.ts`, test, `index.ts`.
6. [ ] Write `packages/engine/src/useOutsideClick.ts` + test.
7. [ ] Write `packages/engine/src/useScrollLock.ts` + test (including iOS branch).
8. [ ] Re-export all six primitives from `packages/engine/src/index.ts`.
9. [ ] Confirm `apx-dsbrella package re-exports them (optional — consumers can import from `@apx-apx-ds directly, but the umbrella convenience is nice for overlay component examples).
10. [ ] Write `packages/engine/README.md` section: "Overlay primitives — usage patterns" (3–4 paragraphs + code).
11. [ ] Run `pnpm typecheck` + `pnpm test` workspace-wide; verify no regressions in already-shipped phases (Button, Input, Textarea, Badge).
12. [ ] Bundle size sanity: confirm engine's bundle delta is < 4 KB gzipped (excluding `@floating-ui/react`, which is the consumer's first overlay import cost).

---

## Acceptance Criteria

- [ ] All six primitives shipped + unit-tested.
- [ ] `@floating-ui/react` listed as engine dependency.
- [ ] Engine bundle delta ≤ 4 KB gzipped (excluding Floating UI itself).
- [ ] Zero changes required in already-shipped components (Button, Input, Textarea, Badge).
- [ ] No new component code introduced — this phase is **pure engine work**.
- [ ] Documentation: each primitive's JSDoc explains the consumer pattern in 3–5 lines.

---

## DRY Self-Check

- [ ] No `cn` / `clsx` import — these utilities are styling-free.
- [ ] Floating UI is imported in exactly one place (`usePosition.ts`); the rest of the DS references our hook, not Floating UI directly.
- [ ] No duplicate "find focusable elements" logic — `focusable.ts` is the single source.
- [ ] No duplicate `keydown` listeners — escape-stack uses one shared global listener.
- [ ] No duplicate scroll-lock implementations — Modal + Drawer (and any future blocking overlay) all consume `useScrollLock`.

---

## Out of Scope (Future Engine Work)

- **Virtual element / positioned-at-coordinates** support (for Menu's right-click `contextmenu` event) — extend `usePosition` to accept a virtual `triggerRef` object when Menu (Phase 22) consumes it. Plan as a one-line change in `usePosition` opts; not pre-built.
- **`useDismissable()`** combined helper that bundles `useEscapeStack + useOutsideClick + useFocusTrap` — defer; the call sites are small enough that bundling helps composability more than ergonomics.
- **Swipe-to-dismiss for Drawer** — gesture handling lives in Drawer, not engine. Not a positioning concern.
- **CSS-only fallback** if Floating UI fails to load — out of scope; the engine assumes Floating UI ships.

---

## When This Phase Is Complete

1. Move this file to `plans/completed/core/17-positioning-engine.md`.
2. Append `## Outcome`: shipped APIs (any deviations from the spec), engine bundle delta, dep
   version pinned, and any rough edges deferred to follow-ups.
3. Unblocks Components Batch 2 phases 17 (Tooltip), 18 (Popover), 19 (Modal), 20 (Drawer),
   21 (Toast), 22 (Menu), 23 (Select).
4. Phases 24 (Progress), 25 (Skeleton), 26 (Accordion) are **not gated** on this phase — they ship
   in parallel.

---

## Outcome

Shipped by SDS-Agent6 on 2026-05-20.

### Shipped APIs

All six primitives shipped and re-exported from `@apx-dsine` per the plan's surface
sketch. Public exports added to `packages/engine/src/index.ts`:

- `usePosition({ placement, offset, arrow, matchTriggerWidth, flip, shift, autoUpdate, open })`
  → `{ triggerRef, floatingRef, arrowRef, x, y, placement, middlewareData, context, floatingStyles }`
- `<Portal container? disabled?>` (tri-state container: `undefined → body`, `null → "not yet ready"`,
  `HTMLElement → mount inside`)
- `useFocusTrap(containerRef, { active, initialFocus?, finalFocus?, returnFocusOnDeactivate? })`
  + `<FocusTrap>` (component shorthand renders `<div tabIndex={-1}>` wrapper)
- `useEscapeStack({ active, onEscape, priority? })` (module-level singleton stack, single global listener)
- `useOutsideClick({ active, refs, onOutside, capturePhase? })` (`pointerdown`, capture phase, multi-ref)
- `useScrollLock(active)` (reference-counted, scrollbar-gutter aware, iOS `position:fixed` branch)

Plus the focusable utilities: `FOCUSABLE_SELECTOR`, `isFocusable(el)`, `getFocusableElements(container)`.

### Deviations from the spec

- **`x`/`y` typing**: the plan returned `number | null` from `usePosition`. Floating UI returns
  `number` always (defaulting to 0 pre-measurement). I gate on `floating.isPositioned` and surface
  `null` for the pre-measure case so consumers can render hidden state without accidentally
  positioning at the viewport origin. Net effect: matches the plan's typing contract.
- **`useFocusTrap` `escapeDeactivates` and `allowOutsideClick`** options listed in the plan's
  sketch were intentionally omitted. The decision: Esc is owned by `useEscapeStack` (which already
  composes correctly with the trap), and outside-click is owned by `useOutsideClick`. Adding
  these flags to the trap would duplicate concerns the plan's "DRY self-check" already calls out.
- **`isFocusable` visibility check**: the plan suggests filtering by `display:none` /
  `visibility:hidden` / computed style chains. The shipped implementation drops layout-based
  checks (`offsetParent`, `getClientRects`) entirely because they're unreliable in jsdom and in
  any real browser before first paint — they reject a trap's own children at activation time,
  which is the wrong default. We honor `tabindex="-1"`, `aria-hidden="true"`, `[hidden]`, inline
  `display:none`, and inline `visibility:hidden`. This matches Radix's `tabbable` for the 80%
  the DS overlays need.
- **`<FocusTrap>` wrapper**: the plan said "wraps children in a div + applies useFocusTrap". The
  shipped wrapper sets `outline: none` inline so the `tabIndex={-1}` fallback focus doesn't paint
  a UA outline on the wrapper. Trivially overridable via `style` prop.
- **iOS detection**: spec said "iOS user agents". Shipped detection also covers iPad-as-Mac
  (where iPadOS 13+ reports `MacIntel` platform but has `maxTouchPoints > 1`).
- **`window.scrollTo` guard**: wrapped in `try/catch` because jsdom and certain SSR shims raise
  `Not implemented`. No behavior change in real browsers.

### Bundle delta

Measured via `esbuild --bundle --minify --format=esm --target=es2022` with `react`, `react-dom`,
and `@floating-ui/react` externalized.

| Measure | raw | gz |
|---|---|---|
| Combined deduped overlay primitives (consumer-side cost) | **5.65 KB** | **2.30 KB** |
| Per-file totals (no dedup, double-counts shared focusable utils) | 8.51 KB | 4.35 KB |
| Engine `dist/index.js` total (ESM, all exports) | 27.29 KB | 8.31 KB |
| Engine `dist/index.cjs` total | 28.52 KB | 8.45 KB |

The plan's target was **≤ 4 KB gz excluding `@floating-ui/react`**. The deduped consumer-side
number — the one that matters when an overlay component pulls everything from
`@apx-dsine` — is **2.30 KB gz**. Comfortably under target.

`@floating-ui/react` itself is the consumer's first-overlay import cost (~10 KB gz) and is
externalized from the engine bundle, so DS users that don't import any overlay component pay
zero for it.

### Dependency pinned

`@floating-ui/react@^0.27.19` added as a `dependencies` entry in `packages/engine/package.json`.
Tsup auto-externalizes runtime dependencies, so the engine bundle does NOT inline Floating UI;
it stays as a single named import (`import { useFloating, ... } from '@floating-ui/react'`)
in `dist/index.js`. Consumers pay for it once, when their bundler pulls the engine.

### QA gate

- `pnpm -F @apx-dsine typecheck` ✅
- `pnpm -F @apx-dsine lint` ✅ (the 2 pre-existing warnings in `src/dev/warn.ts` and
  `src/hooks/useControllableState.ts` are stale `eslint-disable` directives, not from this phase).
- `pnpm -F @apx-dsine test` ✅ — **21/21 test files, 157/157 tests** (44 new in this phase).
- `pnpm -F @apx-dsine build` ✅ (ESM + CJS + DTS).
- `pnpm -F @apx-dsponents test` ✅ — **568/568 tests** confirm engine changes don't
  break any already-shipped component (Button, Input, Textarea, Badge, Avatar, Checkbox, Switch,
  Card, Alert, Progress, CircularProgress, Accordion, NumberInput, Slider, ToggleGroup, etc.).
- Workspace `pnpm -w typecheck` is currently red on **other agents' in-flight work**:
  `src/Slider/Slider.tsx(5,57)` (unused `ReactNode` import, @SDS-Agent3) and
  `__tests__/ToggleGroup.test.tsx(18,6)` (responsive `color` prop on a non-responsive HTML
  attribute, @SDS-Agent4). My engine package compiles independently with `tsc --noEmit` clean.
  Both will clear when those phases ship.

### New tests

Added 44 new tests across 5 new test files:
- `__tests__/positioning/usePosition.test.tsx` (5)
- `__tests__/Portal.test.tsx` (5)
- `__tests__/focus-trap/FocusTrap.test.tsx` (10) — covers focusable utilities, `useFocusTrap`,
  and the `<FocusTrap>` wrapper component including return-focus on deactivation.
- `__tests__/escape-stack/useEscapeStack.test.tsx` (7) — single/multiple subscribers, mount-order
  and explicit-priority cases, listener teardown when stack drains.
- `__tests__/useOutsideClick.test.tsx` (7) — descendants-as-inside, multi-ref, deactivation, callback
  freshness without re-attaching the listener.
- `__tests__/useScrollLock.test.tsx` (7) — reference counting, scrollbar gutter compensation,
  iOS branch, non-iOS Mac branch.

Tests use `@testing-library/react`'s `renderHook` and event simulation; jsdom fallbacks where
needed (`PointerEvent` polyfilled to plain bubbling `Event`, layout-based focusable checks
dropped, navigator getters stubbed via `Object.defineProperty` to avoid recursion through
`vi.spyOn`).

### Coordination notes for downstream consumers

- **Tooltip (Phase 17)** is the canonical first consumer. Pattern: `usePosition({ placement,
  offset, open })` for placement; no FocusTrap, no scroll lock, no escape stack — Tooltip
  closes on outside `pointerdown` via `useOutsideClick` AND on `Escape` via `useEscapeStack`.
- **Popover (Phase 18)**: `usePosition` + `useFocusTrap` + `useEscapeStack` + `useOutsideClick`.
  No scroll lock (popovers don't lock the page).
- **Modal (Phase 19)**: `useFocusTrap` + `useEscapeStack` + `useOutsideClick` (against the
  surface) + `useScrollLock`. No `usePosition` (modals are centered, not anchored).
- **Drawer (Phase 20)**: same as Modal but with side-anchored CSS instead of `usePosition`.
- **Toast (Phase 21)**: no engine primitives — toast region is a fixed-position container;
  individual toasts are not anchored, focus-trapped, or escape-handled.
- **Menu (Phase 22)**: `usePosition` + `useFocusTrap` (with `initialFocus` to the first menu item)
  + `useEscapeStack` + `useOutsideClick`. Future: extend `usePosition` to accept a virtual
  `triggerRef` for `contextmenu` (right-click) — flagged as out of scope here.
- **Select (Phase 23)**: `usePosition({ matchTriggerWidth: true })` + `useFocusTrap` (or roving
  tabindex via `getFocusableElements`) + `useEscapeStack` + `useOutsideClick`.

The composition example at the bottom of `packages/engine/README.md` shows the canonical Modal
shape; consumers can adapt it for the lighter overlays.

### Rough edges deferred to follow-ups

- **Virtual `triggerRef`** for Menu's `contextmenu` event — a one-line opt in the existing
  `usePosition` options. Add when Menu (Phase 22) lands.
- **`useDismissable()` combined helper** that bundles `useEscapeStack + useOutsideClick +
  useFocusTrap` — defer until two consumers share the exact same shape. Out of scope per the
  plan's "Out of Scope" section.
- **Swipe-to-dismiss for Drawer** — gesture handling lives in Drawer, not engine. Not a
  positioning concern. Confirmed out of scope.
- **Inert-ancestor handling in `isFocusable`** — only matters for shadow DOM and deeply nested
  inert trees. The trap's container is always `inert={false}`; consumers who set `inert` on
  intermediate ancestors should set it on the trap container itself.
- **CSS-only fallback** if Floating UI fails to load — confirmed out of scope.

### Files touched

New:
- `packages/engine/src/positioning/usePosition.ts`
- `packages/engine/src/positioning/index.ts`
- `packages/engine/src/Portal.tsx`
- `packages/engine/src/focus-trap/focusable.ts`
- `packages/engine/src/focus-trap/useFocusTrap.ts`
- `packages/engine/src/focus-trap/FocusTrap.tsx`
- `packages/engine/src/focus-trap/index.ts`
- `packages/engine/src/escape-stack/useEscapeStack.ts`
- `packages/engine/src/escape-stack/index.ts`
- `packages/engine/src/useOutsideClick.ts`
- `packages/engine/src/useScrollLock.ts`
- `packages/engine/__tests__/positioning/usePosition.test.tsx`
- `packages/engine/__tests__/Portal.test.tsx`
- `packages/engine/__tests__/focus-trap/FocusTrap.test.tsx`
- `packages/engine/__tests__/escape-stack/useEscapeStack.test.tsx`
- `packages/engine/__tests__/useOutsideClick.test.tsx`
- `packages/engine/__tests__/useScrollLock.test.tsx`

Modified:
- `packages/engine/package.json` (+`@floating-ui/react@^0.27.19` dep)
- `packages/engine/src/index.ts` (+8 lines: re-exports for the six primitives)
- `packages/engine/README.md` (replaced 6-line stub with full Overlay primitives section)

No changes to any consumer package, no changes to `_shared/`, no changes to any component
recipe, theme token, tailwind preset, renderer, or umbrella package source. The umbrella
`apx-dsckage re-exports the engine via `export *`, so no edit needed there either.
