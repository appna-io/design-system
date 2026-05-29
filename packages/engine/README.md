# @apx-ds/engine

Core engine primitives, utilities, and types for `apx-ds`. Provides class composition,
variant resolution, slot pattern, direction context, polymorphism helpers, and shared types.

This package is bundled into the root `apx-ds` package and not intended for direct consumption.

## Overlay primitives

Phase 17 (Core) shipped a small bundle of infrastructure used by every overlay component
(Tooltip, Popover, Modal, Drawer, Toast, Menu, Select). All six primitives live under
`@apx-ds/engine` and are imported once per consumer — there is no per-component duplication.

### `usePosition()` — anchored positioning

`@floating-ui/react` wrapper with DS-friendly defaults: `offset → flip → shift → arrow? → size?`
middleware stack pre-baked, `autoUpdate` paused while the floating element is closed for free
perf. `triggerRef` and `floatingRef` are stable RefCallbacks; pass them straight to the trigger
and floating elements. `placement` returned from the hook is the **final** placement after
`flip()` resolves — read it for arrow direction and animation origin.

```tsx
import { usePosition } from '@apx-ds/engine';

function Tooltip({ open }: { open: boolean }) {
  const { triggerRef, floatingRef, floatingStyles, placement } = usePosition({
    placement: 'top',
    offset: 8,
    open,           // pause autoUpdate when closed
  });
  return (
    <>
      <button ref={triggerRef as React.Ref<HTMLButtonElement>}>Hover</button>
      {open && (
        <div ref={floatingRef as React.Ref<HTMLDivElement>} style={floatingStyles} data-side={placement.split('-')[0]}>
          Tooltip
        </div>
      )}
    </>
  );
}
```

`arrow: true` opts into the arrow middleware and returns a non-null `arrowRef` you can attach to
the arrow node; `matchTriggerWidth: true` syncs the floating element's width to the trigger's
(used by Select).

### `<Portal>` — SSR-safe portal

Defers `createPortal` until a client-side mount via `useEffect`, so the server output is `null`
and there is no hydration mismatch. `container={null}` is the explicit "not yet ready" signal
(renders nothing); `container={undefined}` falls back to `document.body`. `disabled={true}`
renders inline — useful for SSR snapshotting or tests that assert co-located markup.

```tsx
import { Portal } from '@apx-ds/engine';

<Portal container={modalBodyRef.current}>
  <div role="dialog">…</div>
</Portal>
```

### `useFocusTrap()` + `<FocusTrap>` — focus management

Hand-rolled trap (no `focus-trap-react` dep). Stores `document.activeElement` on activation,
moves focus to `initialFocus` (or first focusable child, or the container itself for empty
overlays), then intercepts `Tab` / `Shift+Tab` to wrap focus around the container's boundaries.
On deactivation, focus is restored to the saved element (or `finalFocus` if provided). The
component variant renders a `<div tabIndex={-1}>` wrapper — most overlay components will prefer
the hook attached to their existing root element instead.

```tsx
import { useFocusTrap, FocusTrap } from '@apx-ds/engine';

function Modal({ open }: { open: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, { active: open });
  return <div ref={ref} role="dialog" tabIndex={-1}>…</div>;
}
```

The `FOCUSABLE_SELECTOR`, `isFocusable(el)`, and `getFocusableElements(container)` utilities are
also exported for advanced consumers (e.g. roving-tabindex implementations that don't need the
full trap).

### `useEscapeStack()` — Escape ordering

Module-level singleton stack with a single global `keydown` listener. Only the topmost active
entry receives Escape, so nested overlays (Modal → Popover → Tooltip) close in the right order
without per-component coordination. `active: false` deregisters without unmounting; `priority`
is optional — mount order is correct for the common nested case.

```tsx
import { useEscapeStack } from '@apx-ds/engine';

useEscapeStack({ active: open, onEscape: () => setOpen(false) });
```

### `useOutsideClick()` — outside pointer-down detection

Listens for `pointerdown` (not `click`) so the close handler fires before any descendant
`onClick`, matching Radix's pattern. Capture-phase by default. Multiple "inside" refs are
supported — pass the trigger AND the portalled floating element together so a click on either
counts as inside.

```tsx
import { useOutsideClick } from '@apx-ds/engine';

useOutsideClick({
  active: open,
  refs: [triggerRef, floatingRef],
  onOutside: () => setOpen(false),
});
```

### `useScrollLock()` — page scroll lock

Reference-counted: two concurrent locks (e.g. Modal + Drawer) collapse into a single body
mutation, restored when the last consumer releases. Compensates the scrollbar gutter via
`paddingRight` so layout doesn't shift right when the page locks. iOS Safari is handled via a
`position: fixed` + negative `top: -{scrollY}` pin because `overflow: hidden` on `<body>` is
ignored on iOS.

```tsx
import { useScrollLock } from '@apx-ds/engine';

useScrollLock(open);
```

### Composition example

The four hooks compose cleanly inside a single overlay implementation. Below is the canonical
shape an overlay consumer will follow (Modal-style; Tooltip would skip the trap + lock + outside
click hooks).

```tsx
function Dialog({ open, onClose, children }: DialogProps) {
  const triggerRef = useRef<HTMLElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);

  useFocusTrap(surfaceRef, { active: open });
  useEscapeStack({ active: open, onEscape: onClose });
  useOutsideClick({ active: open, refs: [surfaceRef], onOutside: onClose });
  useScrollLock(open);

  if (!open) return null;
  return (
    <Portal>
      <div ref={surfaceRef} role="dialog" tabIndex={-1}>{children}</div>
    </Portal>
  );
}
```
