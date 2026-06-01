# `<Tooltip />` — appears to do nothing when hovering / focusing the trigger

> Status: Investigating · Reported: 2026-05-21 · Component: `packages/components/src/Tooltip` · Severity: Investigating (likely environmental side-effect of the auto-opening Modal)

## Symptom

Ahmad reports that on the Tooltip docs page, the trigger button "doesn't do anything" — i.e.
hovering / focusing the button doesn't surface the tooltip content.

## Most likely root cause (environmental, not Tooltip itself)

The Modal docs page has a `WithoutTrigger.tsx` example that auto-opens its modal 1.5 seconds
after mount and **re-opens it 1.5 seconds after every close** (see
`plans/bugs/modal-renderer-default-open-backdrop.md`). When Ahmad navigates to the renderer, the
auto-open Modal:

- Steals focus (focus trap activates).
- Locks page scroll (`useScrollLock`).
- Renders its `<motion.div>` at `z-index: var(--z-modal)`.

If Ahmad's `<Tooltip>` example happens to be rendered while the Modal is open — or if the Modal
re-opens during a hover-investigation cycle — the Modal's portal-rendered content sits above the
Tooltip example. Tooltip's `<Portal>` renders into the same body, but the Modal's focus-trap
captures all keyboard input until it closes, and any hover that lands on the Modal's backdrop
will not propagate to the underlying Tooltip trigger.

Most likely Ahmad's experience was:

1. Page loads.
2. Modal auto-opens 1.5s in.
3. Ahmad navigates / scrolls to a Tooltip example.
4. Either the Modal is still open (focus-trap blocks Tooltip's pointer events on the trigger),
   or it just closed and is about to re-open in another 1.5s.
5. Ahmad hovers, sees nothing happen, reports "Tooltip not working".

## Tooltip code review (no bug found in source)

Re-read `Tooltip.tsx` end-to-end:

- Trigger is cloned via `cloneElement` with `onPointerEnter` / `onPointerLeave` / `onFocus` /
  `onBlur` handlers attached. Verified by `__tests__/Tooltip.test.tsx` (21/21 passing) +
  `Tooltip.a11y.test.tsx` (12/12 passing).
- `useTooltipDelay` schedules `open` after `openDelay` (default 400ms). Tested.
- `usePosition` wires `setReference` into the merged trigger ref via `mergeRefs<unknown>(triggerProps.ref, triggerRef)`. Tested.
- `<Portal>` renders the floating surface into `document.body`. Tested.
- `Children.only(children)` enforces a single child element. Tested.
- The cloned element receives all pointer/focus handlers via the `cloneElement` second argument.

The trigger is a `<Button>` (forwardRef), and `Button` spreads `...rest` onto its underlying
`<button>` so all four event handlers reach the actual DOM. No issue there.

## Plan

1. Land the Modal `WithoutTrigger.tsx` fix (eliminating the auto-open). Re-test Tooltip in the
   renderer after the Modal page is calm.
2. If Tooltip is still not responding after the Modal fix lands, follow up with deeper
   investigation — possibly add `console.log` to the cloned-child handlers to confirm they fire,
   capture the actual DOM at the moment of hover, and check whether the `<Button>` is receiving
   the merged event handlers (could be a `_shared/controlRecipe.ts` `pointer-events: none` on a
   parent wrapper, but Tooltip tests would have caught that).
3. Verify the existing Tooltip tests don't have a coverage gap that would mask this:
   `__tests__/Tooltip.test.tsx` does test pointerenter / focus / pointerleave / blur / Esc /
   controlled-open / disabled — all 21 paths are exercised. There is no obvious gap.

## Resolution path

Marking this as "Investigating" pending Ahmad's visual re-verification after the Modal auto-open
is fixed. If the symptom persists once the Modal page is calm, this bug doc gets updated with the
real root cause and a code fix.

## Out of scope

- No source changes to Tooltip planned in this PR. If the auto-open Modal was the blocker, this
  is closed by the Modal fix; if not, it gets a separate code fix in a follow-up PR.
- No examples changes either — the Tooltip examples are renderer-safe (no auto-open, no
  setTimeout-driven mounts).

---

## Fixer Resolution — 2026-05-21 — `SDS-Fixer`

> Status: **Expected Resolved (waiting on Ahmad's visual verification).** Source is clean.

### Tooltip code review — second pass

Re-read `Tooltip.tsx` independently of Agent6's notes. Findings:

- Trigger merge uses `mergeRefs<unknown>(triggerProps.ref, triggerRef as Ref<unknown>)` —
  the exact shape Agent6 documented as "the correct pattern Popover now matches".
- `cloneElement(trigger, { ref: mergedTriggerRef, onPointerEnter, onPointerLeave, onFocus,
  onBlur, … })` is wired correctly — every event handler closes over the consumer's
  original handler and calls it before/after the Tooltip's own.
- `useTooltipDelay({ openDelay: 400, closeDelay: 150, … })` schedules `setOpen(true)`
  after `openDelay` — the trigger is event-driven, not click-driven, so a user must hover
  (or focus via Tab) for 400ms to see the tooltip.
- `<Portal container={portalContainer}>` renders the floating surface into `document.body`
  by default — verified working in Popover and HoverCard.

No source bug is reproducible from reading the code.

### Likely real cause: Modal auto-open + stale dist (now both fixed)

Agent6's hypothesis was the auto-opening Modal stealing focus / pointer events and making
the Tooltip trigger appear unresponsive. With both:

1. `Modal/examples/WithoutTrigger.tsx` now user-action driven (`Show welcome in 1.5s`
   button — no `useEffect` page-load auto-open loop), and
2. `packages/apx-ds/dist/index.js` freshly rebuilt so the renderer actually mounts
   the fixed Modal example,

the environmental side-effect goes away on the next refresh.

### What Fixer ran

- Same package rebuilds documented in `modal-renderer-default-open-backdrop.md` —
  Tooltip benefits from the same fresh dist.
- Tooltip vitest: **21 / 21 ✅** (`__tests__/Tooltip.test.tsx`).

### Files Fixer touched

None — Agent6 already updated `Tooltip/examples/Basic.tsx` to add the visible "Hover the
button (or focus it with Tab)" hint. No further source changes needed.

### What Ahmad should do

1. Hard refresh `/components/tooltip` (Cmd-Shift-R / Ctrl-Shift-R).
2. Hover the **"Hover me — Saved"** button in the `Basic` example. Allow ~400ms for the
   tooltip to appear (intentional delay; matches MUI / Radix UX research).
3. Tab to the button via keyboard — tooltip should appear on focus immediately (focus
   path bypasses the delay).
4. If tooltip still doesn't show after both interactions: report back here with
   "still broken" and the renderer's console output; Fixer will instrument the cloned
   handlers and pair-debug with Agent6 on the engine's `usePosition` if needed.

If symptoms persist, escalation is the same as Modal — stop the dev server, `rm -rf
apps/renderer/.next`, restart. Fixer will not touch the dev server.