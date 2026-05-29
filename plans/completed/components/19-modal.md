# Phase 19 — `<Modal />` + `Modal.Trigger` + `Modal.Content` + `Modal.Header` + `Modal.Body` + `Modal.Footer` + `Modal.Close`

> Status: **Pending** · Depends on: Phase 18 (Popover — establishes the focus-trap + portal + escape-stack patterns) · Blocks: Phase 20 (Drawer — Modal cousin, shares backdrop + focus-trap)

## Objective

Ship the canonical blocking-overlay primitive — `<Modal />` (a.k.a. Dialog). Modal differs from
Popover in three ways:

1. **Centered, viewport-anchored** — not anchored to a trigger element. Floating UI is not used.
2. **Always modal** — backdrop captures pointer events; focus is fully trapped; the page scroll is locked.
3. **Compound API with semantic regions** — `Header / Body / Footer / Close`. Modal is the prototype for the "structured dialog" UX.

Modal is the second compound overlay in the batch (after Popover), and the first to establish the
**scroll-lock + backdrop** pattern reused by Drawer.

---

## What This Component Proves

- The engine handles full page-scroll locking without losing scroll position or causing layout shift (scrollbar-gutter aware).
- `useFocusTrap` works on a non-positioned (centered) overlay.
- Modal's Header / Body / Footer compound is ergonomic for the common cases (confirmation, form, content viewer).
- Backdrop click / Esc / Close button all wire to the same close action.

---

## Public API

```tsx
import { Modal, Button } from 'apx-ds';

<Modal>
  <Modal.Trigger asChild>
    <Button>Open settings</Button>
  </Modal.Trigger>
  <Modal.Content>
    <Modal.Header
      title="Profile settings"
      description="Update your display name and avatar."
    />
    <Modal.Body>
      <form>…</form>
    </Modal.Body>
    <Modal.Footer align="end">
      <Modal.Close asChild><Button variant="ghost">Cancel</Button></Modal.Close>
      <Button>Save</Button>
    </Modal.Footer>
  </Modal.Content>
</Modal>

<Modal
  open={open}                     // controlled
  defaultOpen={false}
  onOpenChange={(v) => setOpen(v)}
  closeOnEscape={true}            // default true
  closeOnBackdropClick={true}     // default true
  trapFocus={true}                // default true
  initialFocus={ref}              // element to focus on open
  finalFocus={ref}                // element to focus on close (defaults to trigger)
  preventScroll={true}            // default true — locks document scroll while open
>
  <Modal.Trigger asChild>…</Modal.Trigger>
  <Modal.Content
    size="md"                     // 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'fit'
    placement="center"            // 'center' (default) | 'top' (anchored to top of viewport)
    overlay="dimmed"              // 'dimmed' (default) | 'blur' | 'transparent'
    portalContainer={null}
    className=""
    style={{}}
    sx={{}}
  >
    …
  </Modal.Content>
</Modal>
```

### Prop Decisions

- **`size="md"` defaults**, with `full` for fullscreen and `fit` for content-driven sizing.
- **`placement="center"` defaults** — `top` is the alternative ("Slack-style top dialog") for very tall content where center-anchoring would overflow viewport.
- **`overlay="dimmed"`** = `bg-overlay` (semi-transparent black). `blur` adds `backdrop-blur`. `transparent` lets the page show through without dimming (rare).
- **`closeOnBackdropClick={true}` defaults** — matches platform; consumers opt out for destructive-confirm modals.
- **`finalFocus` defaults to the trigger** that opened the Modal (if there was one), else falls back to `document.body` for programmatic opens.
- **No `variant` axis on the root** — Modal is a structural overlay, not a stylistic primitive. Theming happens via Content's `variant` axis below.

### Content variants

`Modal.Content`'s `variant` axis exists because some modals want elevated paper look, some want a heavier surface:

| Variant   | Background     | Border               | Shadow      | When to use                                |
| --------- | -------------- | -------------------- | ----------- | ------------------------------------------ |
| `solid`   | `bg-bg-paper`  | `border-transparent` | `shadow-2xl`| **Default.** Most modals.                  |
| `outline` | `bg-bg-paper`  | `border-border` 1px  | `shadow-xl` | Quieter visual; nests inside dimmer backdrops. |

(Only two variants — Modals don't benefit from the 4-variant explosion. We keep the axis for parity with the DS, but small.)

---

## Variants — Designed Inline

### Sizes (Modal.Content)

| Size   | Max-width   | Padding (Header/Body/Footer per slot) |
| ------ | ----------- | ------------------------------------- |
| `sm`   | `max-w-sm`  | `p-4`                                 |
| `md`   | `max-w-md`  | `p-5`                                 |
| `lg`   | `max-w-lg`  | `p-6`                                 |
| `xl`   | `max-w-2xl` | `p-6`                                 |
| `full` | `max-w-none w-full h-full` | `p-6`                |
| `fit`  | `max-w-fit` | `p-5`                                 |

### Placements

```ts
variants: {
  placement: {
    center: 'items-center',
    top:    'items-start mt-[10vh]',
  },
}
```

The Backdrop is `flex` and centers/aligns the Content based on this prop.

### Overlay (Backdrop)

```ts
variants: {
  overlay: {
    dimmed:      'bg-overlay backdrop-blur-0',
    blur:        'bg-overlay/40 backdrop-blur-sm',
    transparent: 'bg-transparent',
  },
}
```

---

## File Structure

```
packages/components/src/Modal/
├── Modal.tsx                    # context + state owner
├── ModalTrigger.tsx
├── ModalBackdrop.tsx            # internal — backdrop layer
├── ModalContent.tsx
├── ModalHeader.tsx
├── ModalBody.tsx
├── ModalFooter.tsx
├── ModalClose.tsx
├── Modal.types.ts
├── Modal.recipe.ts              # six recipes: backdrop, content, header, body, footer, close
├── Modal.motion.ts              # backdrop fade + content slide-in
├── ModalContext.ts
├── useScrollLock.ts             # local hook for scroll-lock + scrollbar-gutter
├── index.ts                     # Object.assign(Modal, { Trigger, Content, Header, Body, Footer, Close })
├── Modal.test.tsx
├── Modal.a11y.test.tsx
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Sizes.tsx                # sm → full
    ├── Placements.tsx           # center vs top
    ├── Overlays.tsx             # dimmed / blur / transparent
    ├── ConfirmDelete.tsx        # destructive confirmation pattern
    ├── ScrollableBody.tsx       # long content; body scrolls, header/footer stay
    ├── FormInside.tsx           # focus trap + initial-focus on first input
    ├── NestedModal.tsx          # Modal inside Modal (escape-stack)
    ├── Controlled.tsx
    ├── Programmatic.tsx         # imperative `useModal().open()` API demo
    └── WithoutTrigger.tsx       # no Modal.Trigger; controlled-only
```

---

## Recipe Sketch

```ts
// Modal.recipe.ts
import { cv } from '@apx-dsine';

export const modalRecipes = {
  backdrop: cv({
    base: 'fixed inset-0 z-modal flex justify-center transition-opacity duration-fast',
    variants: {
      overlay: { dimmed: 'bg-overlay', blur: 'bg-overlay/40 backdrop-blur-sm', transparent: 'bg-transparent' },
      placement: { center: 'items-center', top: 'items-start mt-[10vh]' },
    },
    defaultVariants: { overlay: 'dimmed', placement: 'center' },
  }),
  content: cv({
    base: [
      'relative outline-none',
      'w-full mx-4',
      'rounded-lg shadow-2xl',
      'bg-bg-paper text-fg-default',
      'flex flex-col max-h-[calc(100vh-4rem)]',
      'transition-[opacity,transform] duration-normal ease-emphasized',
    ].join(' '),
    variants: {
      variant: { solid: '', outline: 'border border-border shadow-xl' },
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl',
        full: 'max-w-none w-full h-full m-0 rounded-none',
        fit: 'max-w-fit',
      },
    },
    defaultVariants: { variant: 'solid', size: 'md' },
  }),
  header: cv({
    base: 'flex items-start gap-3 border-b border-border-subtle',
    variants: { size: { sm: 'p-4', md: 'p-5', lg: 'p-6', xl: 'p-6', full: 'p-6', fit: 'p-5' } },
    defaultVariants: { size: 'md' },
  }),
  body: cv({
    base: 'overflow-y-auto text-fg-default',
    variants: { size: { sm: 'p-4', md: 'p-5', lg: 'p-6', xl: 'p-6', full: 'p-6', fit: 'p-5' } },
    defaultVariants: { size: 'md' },
  }),
  footer: cv({
    base: 'flex items-center gap-2 border-t border-border-subtle',
    variants: {
      size: { sm: 'p-4', md: 'p-5', lg: 'p-6', xl: 'p-6', full: 'p-6', fit: 'p-5' },
      align: { start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between' },
    },
    defaultVariants: { size: 'md', align: 'end' },
  }),
  close: cv({
    base: 'absolute end-3 top-3 inline-flex items-center justify-center size-7 rounded text-fg-muted hover:text-fg-default hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2',
  }),
};
```

---

## Component Sketches

```tsx
// Modal.tsx (root)
'use client';
export function Modal({
  open: openProp, defaultOpen, onOpenChange,
  closeOnEscape = true, closeOnBackdropClick = true,
  trapFocus = true, preventScroll = true,
  initialFocus, finalFocus,
  children,
}: ModalProps) {
  const [open, setOpen] = useControllableState({ prop: openProp, defaultProp: defaultOpen, onChange: onOpenChange });
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const titleId = useId(); const descId = useId();

  useScrollLock(open && preventScroll);
  useEscapeStack({ active: open && closeOnEscape, onEscape: () => setOpen(false) });

  return (
    <ModalContext.Provider value={{ open, setOpen, triggerRef, contentRef, titleId, descId, trapFocus, initialFocus, finalFocus, closeOnBackdropClick }}>
      {children}
    </ModalContext.Provider>
  );
}

// ModalContent.tsx — portal + backdrop + focus-trap + animation
export function ModalContent(props: ModalContentProps) {
  const ctx = useModalContext();
  // …
  return (
    <Portal container={portalContainer}>
      <AnimatePresence>
        {ctx.open ? (
          <motion.div className={backdropCls.className} {...backdropMotion}
            onPointerDown={(e) => {
              if (ctx.closeOnBackdropClick && e.target === e.currentTarget) ctx.setOpen(false);
            }}
          >
            <FocusTrap active={ctx.trapFocus} initialFocus={ctx.initialFocus} finalFocus={ctx.finalFocus ?? ctx.triggerRef}>
              <motion.div
                ref={ctx.contentRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={ctx.titleId}
                aria-describedby={ctx.descId}
                className={contentCls.className}
                {...contentMotion}
              >
                {children}
              </motion.div>
            </FocusTrap>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Portal>
  );
}

// ModalHeader.tsx — accepts title + description as props, both wired to context ids for ARIA
// ModalBody.tsx — direct passthrough with body recipe
// ModalFooter.tsx — direct passthrough with align variant
// ModalClose.tsx — a <button> that calls ctx.setOpen(false); supports asChild
```

`FocusTrap` is exported from `@apx-dsine` (the focus-trap sub-phase).

---

## `useScrollLock` (engine-local helper)

```ts
// useScrollLock.ts
export function useScrollLock(active: boolean) {
  useIsomorphicLayoutEffect(() => {
    if (!active) return;
    const body = document.body;
    const scrollY = window.scrollY;
    const overflow = body.style.overflow;
    const paddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      body.style.overflow = overflow;
      body.style.paddingRight = paddingRight;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}
```

~15 lines. Promotes to `@apx-dsine` once Drawer (Phase 20) consumes it (second-consumer rule).

---

## Types

```ts
import type { HTMLAttributes, ReactNode, ReactElement, RefObject } from 'react';
import type { Sx } from '@apx-dsine';

export type ModalVariant = 'solid' | 'outline';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'fit';
export type ModalPlacement = 'center' | 'top';
export type ModalOverlay = 'dimmed' | 'blur' | 'transparent';

export interface ModalProps {
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

export interface ModalContentProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ModalVariant;
  size?: ModalSize;
  placement?: ModalPlacement;
  overlay?: ModalOverlay;
  portalContainer?: HTMLElement | null;
  sx?: Sx;
}

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  description?: ReactNode;
  avatar?: ReactNode;
  action?: ReactNode;
  sx?: Sx;
}

export interface ModalBodyProps   extends HTMLAttributes<HTMLDivElement> { sx?: Sx; }
export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end' | 'between';
  sx?: Sx;
}
export interface ModalCloseProps  extends React.ButtonHTMLAttributes<HTMLButtonElement> { asChild?: boolean; }
```

---

## Accessibility

- `Modal.Content` has `role="dialog"`, `aria-modal="true"`, `aria-labelledby={titleId}`, `aria-describedby={descId}` (when title/description provided).
- Focus management:
  - On open: focus moves to `initialFocus` if provided, else to the first focusable in Content, else to Content itself.
  - On close: focus returns to `finalFocus` (or trigger, or body).
  - Focus trap fully active when `trapFocus={true}`.
- Esc closes when `closeOnEscape={true}` and Modal is on top of escape-stack.
- Backdrop click closes when `closeOnBackdropClick={true}`. Clicks **inside** Content don't bubble to backdrop (sentinel via `e.target === e.currentTarget`).
- Page scroll locked while open; scrollbar gutter preserved to prevent layout shift.
- Nested modals: the inner Modal pushes onto the escape-stack; closing inner restores focus to outer Content; closing outer restores to trigger.
- `Modal.Header`'s `title` renders inside the element marked by `titleId` so ARIA association is automatic.
- axe-core: zero violations.

---

## Animation / Interactions

- Backdrop: opacity fade, 200ms.
- Content: slide-up + scale-up enter, slide-down + scale-down exit. ~280ms with `ease-emphasized`.
- `prefers-reduced-motion`: backdrop opacity-only; Content opacity-only (no scale, no slide).

---

## Responsive

```tsx
<Modal>
  <Modal.Content size={{ base: 'full', md: 'lg' }} placement={{ base: 'top', md: 'center' }}>
    …
  </Modal.Content>
</Modal>
```

Mobile-first: `full` on small screens, `lg` centered on desktop — the canonical "responsive modal" UX.

---

## RTL

- Header `action` and Close button sit at logical end (`end-*`).
- Footer `align="start"` / `"end"` are logical.
- Body content inherits parent direction.

---

## Override Examples

```tsx
<ThemeProvider theme={defineTheme({
  components: {
    Modal: {
      defaultProps: { /* none — Modal is stateful, no visual defaults */ },
      styleOverrides: {
        backdrop: 'bg-overlay/60 backdrop-blur-md',
        content: 'rounded-2xl shadow-2xl',
        header: 'border-b-0',
        footer: 'bg-bg-subtle/50',
        close: 'text-fg-default',
      },
    },
  },
})} />
```

---

## Examples List

| File                  | Demonstrates                                       |
| --------------------- | -------------------------------------------------- |
| `Basic.tsx`           | Default Modal with Header / Body / Footer          |
| `Sizes.tsx`           | sm → full                                          |
| `Placements.tsx`      | center / top                                       |
| `Overlays.tsx`        | dimmed / blur / transparent                        |
| `ConfirmDelete.tsx`   | Destructive confirmation pattern                   |
| `ScrollableBody.tsx`  | Long content with internal Body scroll             |
| `FormInside.tsx`      | Inputs/Textarea inside (focus trap stress)         |
| `NestedModal.tsx`     | Modal inside Modal (escape-stack)                  |
| `Controlled.tsx`      | Parent owns open                                   |
| `Programmatic.tsx`    | Imperative open via `useModal()` hook              |
| `WithoutTrigger.tsx`  | Controlled-only, no Trigger subpart                |

---

## Testing Plan

`Modal.test.tsx`:
- Trigger click opens; Esc / backdrop / Close button close
- Focus moves to first focusable inside Content on open
- `initialFocus` honored
- Focus returns to trigger on close; `finalFocus` honored when set
- Tab cycles inside Content (focus trap)
- Scroll lock applied on open, restored on close
- `preventScroll={false}` allows page scroll
- `closeOnEscape={false}` prevents Esc-close
- `closeOnBackdropClick={false}` prevents backdrop-close
- Nested modals: inner opens above outer; inner closes restore focus to outer
- `size` / `placement` / `overlay` apply correct classes
- Theme `styleOverrides.{ backdrop, content, header, body, footer, close }` merge correctly
- `Modal.Header title="…"` renders in the title slot with ARIA id wired
- `Modal.Close asChild` works
- `ref` forwarded to Content

`Modal.a11y.test.tsx`:
- `role="dialog"` + `aria-modal="true"` on Content
- `aria-labelledby` + `aria-describedby` set when Header provides title + description
- Focus trap traps Tab + Shift+Tab
- Esc closes
- axe passes for every size / overlay cell

---

## File-Level Tasks (Ordered)

1. [ ] **Prereq**: engine's `FocusTrap` is shipped (Phase 17/18 might have only exposed `useFocusTrap` — confirm or add the component wrapper).
2. [ ] Create `packages/components/src/Modal/` folder
3. [ ] Write `Modal.types.ts`
4. [ ] Write `Modal.recipe.ts` (six recipes)
5. [ ] Write `Modal.motion.ts`
6. [ ] Write `ModalContext.ts`
7. [ ] Write `useScrollLock.ts`
8. [ ] Write all subpart files (`Modal.tsx`, `ModalTrigger.tsx`, `ModalContent.tsx`, `ModalHeader.tsx`, `ModalBody.tsx`, `ModalFooter.tsx`, `ModalClose.tsx`)
9. [ ] Write `index.ts` (Object.assign)
10. [ ] Write `meta.ts` (category `Overlays`, tags `['modal', 'dialog', 'overlay']`)
11. [ ] Write `Modal.test.tsx`, `Modal.a11y.test.tsx`
12. [ ] Write 11 example files
13. [ ] Write `README.mdx`
14. [ ] Export from package index + `apx-ds
15. [ ] Renderer discovery check
16. [ ] Bundle delta: < 5 KB gzipped

---

## Acceptance Criteria

- [ ] Open / close via Trigger, Esc, backdrop, Close button.
- [ ] Focus moves correctly on open + close.
- [ ] Tab cycles inside Content.
- [ ] Page scroll locks without layout shift.
- [ ] Nested modals push/pop the escape stack correctly.
- [ ] All sizes × placements × overlays render correctly.
- [ ] `Modal.Header`'s title + description wire through ARIA.
- [ ] RTL: action + close button on logical end; Body Body content correct.
- [ ] axe-core passes.
- [ ] Reduced-motion users see opacity-only transitions.
- [ ] **No new engine work invented** — `FocusTrap`, `escape-stack`, `Portal` all reused.

---

## DRY Self-Check

- [ ] No `cn` / `clsx` import
- [ ] `useControllableState`, `Portal`, `useEscapeStack`, `FocusTrap` all imported from engine
- [ ] `Object.assign(Modal, { Trigger, Content, Header, Body, Footer, Close })` follows Card's pattern
- [ ] `useScrollLock` lives locally; promoted to engine once Drawer consumes it
- [ ] Recipe map mirrors Card's six-recipe shape
- [ ] Adding a new size = one recipe row across all four padded slots (header/body/footer/close); no component changes

---

## Out of Scope (Future Components / Phases)

- **`AlertDialog`** (destructive-confirmation specialization) — composition; document pattern in `ConfirmDelete.tsx` but don't ship a new component.
- **Multi-step / wizard modals** — composition; consumers use Tabs inside Modal.Body.
- **Bottom-sheet modal on mobile** — that's Drawer territory (Phase 20).
- **Persistent header** while Body scrolls — already in scope via flex layout + Body's `overflow-y-auto`. No special prop needed.

---

## When This Phase Is Complete

1. Move this file to `plans/completed/components/19-modal.md`.
2. Append `## Outcome`: API, bundle delta, axe results, `useScrollLock` promotion decision (engine vs local).
3. Resume Phase 20 — Drawer.

---

## Outcome

> Status: ✅ **Shipped** · Owner: SDS-Agent6 · Closes: Phase 17 Core overlay-primitive consumer audit (`useScrollLock` first-consumer landed).

### Delivered API

Compound primitive ships as the canonical Object.assign root + 6 subparts:

```tsx
import { Modal, Button } from 'apx-ds';
<Modal>
  <Modal.Trigger asChild>
    <Button>Open settings</Button>
  </Modal.Trigger>
  <Modal.Content size="md" placement="center" overlay="dimmed" variant="solid">
    <Modal.Close />
    <Modal.Header title="Settings" description="Update your details." />
    <Modal.Body>…</Modal.Body>
    <Modal.Footer align="end">
      <Modal.Close asChild><Button variant="ghost">Cancel</Button></Modal.Close>
      <Button>Save</Button>
    </Modal.Footer>
  </Modal.Content>
</Modal>
```

- Root behavior props: `open` / `defaultOpen` / `onOpenChange`, `closeOnEscape` (default `true`), `closeOnBackdropClick` (default `true`), `trapFocus` (default `true`), `preventScroll` (default `true`), `initialFocus` / `finalFocus`.
- Content visual axes: `variant ∈ {solid, outline}`, `size ∈ {sm, md, lg, xl, full, fit}`, `placement ∈ {center, top}`, `overlay ∈ {dimmed, blur, transparent}`. All `ResponsiveValue<>` aware.
- Footer: `align ∈ {start, center, end, between}` (default `end`).
- Trigger: `asChild` (default `true`) — clones single child + merges click/ARIA/ref; `asChild={false}` renders inline `<button>`.
- Close: `asChild` (default `false`) — renders an inline icon `<button aria-label="Close">`; `asChild={true}` clones a single child and merges `onClick → setOpen(false)`.

### Engine Validation Report (Phase 17 Core sweep — closed)

| Primitive | Modal’s consumption | Status |
|---|---|---|
| `<Portal>` | Backdrop + Content tree portal-rendered to `document.body` (or `portalContainer`). | ✅ re-validated |
| `useEscapeStack` | `active: open && closeOnEscape`; nested-Modal unwind ordering tested (escape closes innermost first). | ✅ re-validated |
| `useFocusTrap` | `active: open && trapFocus`; first-focusable / `initialFocus` / Tab-cycle / return-focus all green; works on a non-positioned (centered) overlay. | ✅ re-validated |
| `useScrollLock` | **First consumer.** `useScrollLock(open && preventScroll)` — declarative boolean shape, reference-counted, restores body styles on close. iOS pin path covered by the engine; jsdom path validated by Modal's lock/restore tests. | ✅ **first consumer landed** |
| `usePosition` | Not consumed — Modal is centered, not anchored. | n/a (intentional) |
| `useOutsideClick` | Not consumed — Modal handles backdrop clicks inline via `e.target === e.currentTarget` sentinel (cheaper, no listeners, no portal-traversal corner cases). | n/a (intentional) |

The `useScrollLock(active: boolean)` shape made wiring trivial. **No engine changes requested.** Confirmed the hook restores `body.style.overflow`, `paddingRight`, `position`, `top`, and `width` — verified directly in tests.

### QA Gates

- `pnpm tsc --noEmit` — green on `@apx-dsponents`.
- `pnpm eslint` — green across `src/Modal/**` + both Modal test files.
- `pnpm test` — **41 files / 803 tests pass** (Modal contributes 30: 23 in `Modal.test.tsx`, 7 in `Modal.a11y.test.tsx`). No regressions in any prior component.
- `pnpm build` — green; full DTS emitted; CJS + ESM bundles unchanged in shape.
- `axe-core` — zero violations across the variant × size × open-state matrix (`Modal.a11y.test.tsx::it.each(variants)`).

### Bundle Delta

Standalone Modal subgraph (peers + engine + theme + motion all externalized — true incremental cost a consumer pays once Tooltip/Popover already ship):

| Bundle | Raw | Gzipped |
|---|---|---|
| `src/Modal/index.ts` | 8 894 B | **3 343 B** |

**3.26 KB gz** vs. `< 5 KB` budget → **1.74 KB under budget**. Comparable to Popover (3.29 KB) despite shipping 6 subparts vs. Popover's 4, because Modal does not pull in `usePosition` / Floating UI middleware.

### Deviations from plan

- **Imperative `useModal()` hook** (mentioned in plan §Examples) **not shipped.** Replaced with a controller-object pattern in `examples/Programmatic.tsx` (`useState` + `useCallback` returning `{ open, openModal, closeModal, setOpen }`). The hook can land in a later phase if a real consumer asks; shipping it speculatively would be a hook-surface that escapes the engine's existing `useControllableState` shape.
- **`mergeRefs` is now duplicated in three components** (Tooltip trigger, Popover trigger + content, Modal trigger + content). Threshold for engine promotion crossed; flagged to leadership in the room. Modal will not promote it — that's a Phase 20 (Drawer) move so the engine PR has a fresh consumer to verify the shape against.
- **Six recipes (one per slot)** chosen over a god-recipe so theme `styleOverrides.{ backdrop, content, header, body, footer, close }` are 1:1 with the structural compound. Cost: same `size` token table appears in 4 size-padded slots. Lifting to a shared `padBySize()` helper will be the Drawer phase's call (then the threshold of two consumers is met).
- **`MotionStyle` cast** — same `as never` workaround Tooltip + Popover use for motion's narrower `style` typing under `exactOptionalPropertyTypes`. Documented inline.

### Coordination notes

- @SDS-Leader — Modal ships, Phase 17 Core overlay primitive audit closes (all 6 hooks now have first consumers). Phase 20 (Drawer) and Phase 21 (Toast) are both unblocked. Drawer should be the next item — it inherits Modal's backdrop + scroll-lock + focus-trap setup, and is the right consumer to drive the `mergeRefs` engine promotion.
- @ engine — no API requests. `useScrollLock(active: boolean)` is the right shape; reference counting + iOS pin both work end-to-end. Recommend keeping the test-only `__scrollLockInternals` for internal regression tests.
- `mergeRefs` engine promotion: **flagged, not landed.** Three duplicates in components, one obvious shape (`Array<Ref<T> | undefined> => (node: T | null) => void`). Leave to Drawer phase.

### Files

- `packages/components/src/Modal/Modal.types.ts`, `ModalContext.tsx`, `Modal.recipe.ts` (6 recipes), `Modal.motion.ts`, `Modal.tsx`, `ModalTrigger.tsx`, `ModalContent.tsx`, `ModalHeader.tsx`, `ModalBody.tsx`, `ModalFooter.tsx`, `ModalClose.tsx`, `meta.ts`, `index.ts`, `README.mdx`.
- `packages/components/src/Modal/examples/`: `Basic.tsx`, `Sizes.tsx`, `Placements.tsx`, `Overlays.tsx`, `ConfirmDelete.tsx`, `ScrollableBody.tsx`, `FormInside.tsx`, `NestedModal.tsx`, `Controlled.tsx`, `Programmatic.tsx`, `WithoutTrigger.tsx`.
- `packages/components/__tests__/Modal.test.tsx`, `Modal.a11y.test.tsx`.
- `packages/components/src/index.ts` — `Modal` exported alphabetically between `Input` and `NumberInput`; types re-exported.
