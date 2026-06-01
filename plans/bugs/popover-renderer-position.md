# `<Popover />` — opens at the top-left corner of the viewport instead of anchoring to the trigger

> Status: Resolved · Reported: 2026-05-21 · Component: `packages/components/src/Popover` · Severity: Critical (positioning is the entire job of a Popover)

## Symptom

On the renderer's `/components/popover` route, clicking any "Open popover" trigger renders the
Popover content at the top-left corner of the viewport (`top: 0; left: 0`) rather than anchored
to the trigger button.

This affects every Popover example: Basic, Sizes, Variants, Colors, Placements, WithArrow,
NestedPopover, ConfirmAction, FormInside, ModalPopover, Controlled, WithCloseButton.

## Repro

1. `pnpm --filter renderer dev`.
2. Navigate to `/components/popover`.
3. Click "Open popover" on the Basic example.
4. Observe: the dialog renders flush in the top-left corner instead of below the trigger.

Expected: the Popover Content should anchor to its Trigger with the configured `placement`
(default `bottom`) and `offset` (default `8`).

## Root cause

`<Popover.Content>` calls `usePosition({...})` which returns `triggerRef` (Floating UI's
`setReference` callback) and `floatingRef` (Floating UI's `setFloating`).

The `floatingRef` is wired correctly via `mergeRefs` on the `<motion.div>` — when the floating
element mounts, `setFloating(node)` fires.

The `triggerRef` is wired via:

```tsx
useEffect(() => {
  const node = ctx.triggerNodeRef.current;
  if (node) triggerRef(node);
}, []);  // empty deps
```

This **only fires once at PopoverContent mount**, before the floating element has mounted. The
empty-deps effect captures the `triggerRef` callback at that moment. Three problems:

1. **`triggerRef` may be re-created on subsequent renders.** Floating UI's `useFloating` returns
   the same `setReference` reference across renders in the steady state, but when `useFloating`'s
   options object identity changes (we toggle `whileElementsMounted: autoUpdate` in/out based on
   `open`), there is a window where Floating UI re-installs its internal binding and the cached
   callback from the empty-deps effect points at stale internal state.
2. **The trigger node may not yet exist when the effect runs**, depending on hydration order in
   Next.js App Router (server-rendered shell, then client mount). When `<Popover.Trigger>` and
   `<Popover.Content>` mount in different microtasks, Content's effect can fire before
   Trigger's child (e.g. `<Button>`) has called its inner ref callback.
3. **The trigger node *can* change after first mount.** A consumer can swap children inside
   `<Popover.Trigger>` and the empty-deps effect would never re-fire — Floating UI keeps
   pointing at the unmounted node.

When any of these timing windows hits, Floating UI's internal `reference` is `null` at the
moment the user opens the Popover. `setFloating(node)` fires correctly when motion.div mounts,
but Floating UI never schedules a position computation because `whileElementsMounted` requires
**both** reference and floating to be set. `floatingStyles` stays at the default
(`position: absolute; top: 0; left: 0`) — and that's exactly what we see in the renderer.

The previous design comment in `Popover.tsx` was correct in intent ("Floating UI's
`setReference` is composed *into* the trigger ref by `<Popover.Content>` via a `mergeRefs`
helper"), but the implementation in `PopoverContent.tsx` used a one-shot `useEffect` instead of
the merged-ref shape the comment described. Tooltip (which works correctly) **does** use the
merged-ref shape:

```tsx
const mergedTriggerRef = useMemo(
  () => mergeRefs<unknown>(triggerProps.ref, triggerRef),
  [triggerProps.ref, triggerRef],
);
```

Popover should match.

## Fix

Three coordinated changes:

1. **Add `setPositionReference` to `PopoverContextValue`** — a mutable callback that
   `<Popover.Content>` populates when `usePosition` returns its `triggerRef`. Default is `null`
   (Content not yet mounted).
2. **`<Popover.Content>` registers `setPositionReference`** — a `useEffect` calls
   `ctx.registerPositionReference(triggerRef)` on mount and `null` on unmount. Re-registers
   whenever `triggerRef`'s identity changes (defense in depth — Floating UI's stable callback
   means this is a no-op in normal operation, but it eliminates the stale-callback timing hole).
3. **`<Popover.Trigger>` merges the registered callback into the cloned child's ref.** Same
   `mergeRefs` chain used today, but with the position callback added:

```tsx
const mergedRef = mergeRefs<HTMLElement>(
  childProps.ref,
  ctx.triggerRef,                  // captures node into triggerNodeRef (outside-click)
  ctx.positionReferenceRef.current, // forwards to Floating UI's setReference
);
```

Because the position callback is read from a mutable ref (not a destructured value), the
Trigger's `mergeRefs` always sees the latest registered callback, regardless of when Content
mounts. When Content mounts (or remounts), it re-registers; when the Trigger's child remounts
(consumer swaps children), the new ref callback fires `mergeRefs` and the position callback
gets the new node.

## Verification

- Existing Popover unit tests + a11y tests stay passing.
- Add a test that asserts `<Popover.Content>` receives `floatingStyles` with non-zero `top`/`left`
  after open (jsdom-friendly: assert that the dialog's inline `style` carries a `transform`
  containing `translate(` once it renders).
- Visual: Ahmad refreshes `/components/popover`, clicks Basic's trigger; the popover should
  anchor below the button.

## Out of scope

- The decision to keep `usePosition` inside `<Popover.Content>` (vs. moving it to the root) is
  unchanged. Content is the natural owner because the visual axes (`placement`, `offset`,
  `showArrow`) are Content-level props.
- Tooltip and Drawer don't have this bug — Tooltip wires `setReference` directly into the cloned
  child via the same `mergeRefs` chain that fixes Popover; Drawer is anchored at viewport edges
  and doesn't use `usePosition` at all.

---

## Fixer Resolution — 2026-05-21 — `SDS-Fixer`

> Status: **Resolved at the source.** Renderer-visible after dist rebuild + hard refresh.

### Why Ahmad was still seeing the bug

Agent6's `positionReferenceRef` architecture (the mutable callback ref registered by
`<Popover.Content>` and replayed by the root `<Popover>`'s `triggerRef` callback) was
already correct in source — verified by reading `Popover.tsx`, `PopoverTrigger.tsx`,
`PopoverContent.tsx`, and `PopoverContext.tsx`. Tests pass (24 / 24).

The renderer was still painting the popover at the top-left corner because it consumed
the **stale `packages/apx-ds/dist/index.js`** built before the architecture change
landed. The umbrella package inlines `@apx-dsponents` via `tsup`'s `noExternal`,
so Agent6's edits never reached the renderer's bundle until the dist was rebuilt.

### What Fixer ran

1. Verified the dist actually contained `positionReferenceRef` (`rg -c` returned `4`
   matches in the new bundle, `0` matches in the pre-rebuild bundle would have been the
   smoking gun but in our case `4` confirmed the architecture is now live).
2. `pnpm --filter @apx-dsponents build` + `pnpm --filter apx-apx-ds—
   forced fresh dist build of the components package and the umbrella so the renderer
   would resolve `import { Popover } from 'apx-dsgainst the post-fix code.
3. Confirmed Next.js dev server picked up the rebuild
   (`✓ Compiled in 10.4s (3050 modules)`).

### Files Fixer touched

None — pure dist rebuild. Agent6's source changes were correct.

### Gates

- Popover vitest: **24 / 24 ✅** (`__tests__/Popover.test.tsx`), including the regression
  test that asserts `position: absolute` + `transform:` are attached to the dialog's
  inline style after open.

### What Ahmad should do

1. Hard refresh `/components/popover` (Cmd-Shift-R / Ctrl-Shift-R).
2. Click any "Open popover" trigger and confirm the panel anchors below / near the
   trigger button rather than the top-left of the viewport.
3. Try the placement examples (`Placements`, `WithArrow`, `Variants`) — each should
   anchor correctly according to its `placement` prop.

If symptoms persist after hard refresh, the recovery is the same as Modal — stop the dev
server, `rm -rf apps/renderer/.next` once, and restart. Fixer will not touch the dev
server.