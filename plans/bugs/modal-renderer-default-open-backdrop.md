# `<Modal />` — example auto-opens; backdrop is too subtle to read as "the page is blocked"

> Status: Resolved · Reported: 2026-05-21 · Component: `packages/components/src/Modal` (renderer examples + recipe) · Severity: Critical (renders the Modal docs page unusable)

Two distinct defects affecting the Modal docs page in the renderer. They surface together because
both happen inside the same `/components/modal` route and one (auto-open) makes it impossible to
visually evaluate the other.

---

## Bug 1 — `Modal/WithoutTrigger` auto-opens on page load

### Symptom

Navigating to `/components/modal` starts mounting all examples (Basic, Sizes, Placements, …
WithoutTrigger). About 1.5 seconds after mount, a Modal pops up unprompted and steals focus +
locks scroll. Closing it via the X button or Escape works once — but **1.5 seconds later it
auto-opens again** because the example's `useEffect` re-fires the `setTimeout` whenever `open`
flips back to `false`.

The page is effectively unusable: every interaction with any other example (Tooltip, Popover,
Drawer, Slider, etc. on adjacent routes that share renderer state) is interrupted by the modal
re-appearing on a 1.5 second loop.

### Repro

1. `pnpm --filter renderer dev`.
2. Navigate to `/components/modal`.
3. Wait ~1.5 seconds. Modal opens.
4. Press Escape or click the X. Modal closes.
5. Wait ~1.5 seconds. Modal opens **again**.

Expected: Modals only open in response to user input (clicking a trigger or an example's "Open
modal" button). The "without trigger" pattern can be demonstrated with a button-driven example
that calls `setOpen(true)` after a delay **once user action occurs**.

### Root cause

`packages/components/src/Modal/examples/WithoutTrigger.tsx` runs:

```tsx
useEffect(() => {
  if (!open) {
    const id = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(id);
  }
  return undefined;
}, [open]);
```

This is a "page-load auto-open" pattern. It demonstrates the without-trigger API, but it does so
by mounting the Modal *open* (effectively) the moment the renderer page loads. There is no way for
the user to opt out short of refreshing the page during the first 1.5 seconds.

### Fix

Rewrite the example to be **user-action driven**. The pattern the example was meant to teach —
"the parent component owns when to open, no `Modal.Trigger` needed" — is preserved by using a
button outside the Modal that calls `setOpen(true)` (with or without a delay).

```tsx
// New shape
const [open, setOpen] = useState(false);
const handleOpenWithDelay = () => {
  setTimeout(() => setOpen(true), 1500);
};

return (
  <>
    <Button onClick={handleOpenWithDelay}>Show welcome in 1.5s</Button>
    <Modal open={open} onOpenChange={setOpen}>
      <Modal.Content>…</Modal.Content>
    </Modal>
  </>
);
```

This keeps the without-trigger semantic (no `<Modal.Trigger>` in the tree, the Modal has a
controlled `open` prop driven by a parent button) while making the example renderer-safe.

### Verification

- Land the new shape in `WithoutTrigger.tsx`.
- Re-run `vitest`'s Modal suite to make sure none of the existing tests assumed the auto-open
  shape (none should — the test file uses `defaultOpen` directly).
- Visual: Ahmad refreshes `/components/modal`; nothing should auto-open.

---

## Bug 2 — Modal backdrop too subtle to clearly de-emphasize the page behind

### Symptom

When a Modal is open, the page behind it remains visually competitive: the backdrop's tint is
faint enough that text and components behind the dialog stay readable, which undermines the
"the rest of the page is blocked" affordance.

The current recipe ships:

```ts
overlay: {
  dimmed: 'bg-fg-default/40',   // ~40% opacity of the foreground color
  blur: 'bg-fg-default/30 backdrop-blur-sm',
  transparent: 'bg-transparent',
}
```

`bg-fg-default/40` resolves to ~40% black/dark on light themes, ~40% white/light on dark themes.
On the renderer's bg-paper (which is already a soft tint, not pure white), 40% does not produce
a strong enough contrast.

### Fix

Bump the default `dimmed` opacity from `/40` to `/60`. This matches the dim level Radix Dialog,
Mantine Modal, MUI Dialog, and Chakra Modal use — all of which sit at `0.5–0.6` opacity. Same for
`blur` (raise from `/30` to `/50` — keeping it slightly lighter because `backdrop-blur-sm` already
de-emphasizes content). `transparent` stays as-is (it's an opt-in escape hatch).

### Verification

- Visual: Ahmad refreshes Modal page, opens any Modal; the page behind should clearly read as
  "blocked / inactive".
- Tests: existing Modal tests don't snapshot the backdrop class; no test changes needed.
- A11y: Modal's `aria-modal="true"` was already correct; this is purely a visual contrast fix.

### Out of scope

- The `blur` overlay's `backdrop-blur-sm` value remains at `sm`. Bumping it to `md` is a
  separate decision — the dim is the headline issue, blur is a stylistic accent.
- Drawer ships the same backdrop recipe shape (`drawerBackdropRecipe`); applying the same fix
  there for consistency lands in this PR.

---

## Resolution

Both fixes land in this PR alongside the Popover positioning + Tooltip wiring fixes.

- `WithoutTrigger.tsx` rewritten to a user-action shape (button → `setTimeout` → `setOpen(true)`).
- `modalBackdropRecipe.dimmed`: `bg-fg-default/40` → `bg-fg-default/60`.
- `modalBackdropRecipe.blur`: `bg-fg-default/30 backdrop-blur-sm` → `bg-fg-default/50 backdrop-blur-sm`.
- `drawerBackdropRecipe.dimmed`: same bump (`/40` → `/60`) for the same readability reason.
- `drawerBackdropRecipe.blur`: same bump (`/30` → `/50`).
- All existing `Modal.test.tsx` / `Modal.a11y.test.tsx` / `Drawer.test.tsx` / `Drawer.a11y.test.tsx`
  assertions stay passing.

---

## Fixer Resolution — 2026-05-21 — `SDS-Fixer`

> Status: **Resolved at the source.** Renderer-visible after dist rebuild + hard refresh.

### Why Ahmad was still seeing the bug

The component source had Agent6's fix from the moment it was edited — but the renderer was
still consuming a **stale `packages/apx-ds/dist/index.js`**. The umbrella package
inlines `@apx-dsponents` via `tsup`'s `noExternal: [/^@apx-apx-dso the
`/40` → `/60` backdrop bump and the user-action `WithoutTrigger.tsx` shape never reached
the renderer's bundle until the dist was rebuilt.

Compounding factors:

- The renderer's example registry imports examples from
  `@apx-dsponents/src/<dir>/examples/<id>.tsx` (live source), but those examples
  `import { Modal } from 'apx-ds and **`apx-apx-dshe dist-served umbrella.
- The renderer dev server had also accumulated `.next/` manifest corruption (multiple
  `ENOENT: routes-manifest.json` / `app-paths-manifest.json` / `9555.js MODULE_NOT_FOUND`
  errors in the terminal), so even live source edits weren't getting through cleanly.

### What Fixer ran

1. `pnpm --filter @apx-dsponents build` — fresh dist (266 KB → 671 KB; missing
   Timeline / Toolbar / Stepper / Field / etc. exports now included).
2. `pnpm --filter apx-dsld` — fresh umbrella dist (488 KB → 902 KB). DTS build
   failed with a pre-existing duplicate-`detectPlatform` ambiguity between `@apx-dsme`
   and `@apx-dsponents/CommandPalette/headless/platformKey.ts` (out of scope for
   this bug; surfaced separately to Leader). **The runtime `.js` / `.cjs` builds succeeded
   and contain `bg-fg-default/60` × 2 and zero matches for `bg-fg-default/40`.**
3. Verified the new dist exports `toast`, `Timeline`, `HoverCard`, `Stepper`, `Toolbar`,
   `TagsInput`, `CommandPalette`, `Field`, `Rating`, `Combobox`, `Kbd` and the Popover
   `positionReferenceRef` architecture.
4. Confirmed Next.js recompiled (`✓ Compiled in 10.4s (3050 modules)` — the module count
   jumped from 1226 because the larger dist pulled in the full component surface) and
   subsequent `GET /components/accordion 200` / `GET /components/breadcrumbs 200` succeeded.

### Files Fixer touched

None — the fix was purely a dist rebuild. Agent6's source / recipe / example changes
were already correct; they just needed a fresh build of the umbrella so the renderer
would pick them up.

### Gates

- Modal vitest: **23 / 23 ✅** (`__tests__/Modal.test.tsx`).
- Drawer vitest: still green (not re-run by Fixer; Agent6 already validated).

### What Ahmad should do

1. Hard refresh `/components/modal` (Cmd-Shift-R / Ctrl-Shift-R) so the browser drops the
   stale Modal page chunk.
2. Confirm: page does **not** auto-open anything; clicking "Show welcome in 1.5s" in the
   `WithoutTrigger` example is the only path that opens a Modal.
3. Open any Modal example (`Basic`, `Sizes`, `Placements`, `Overlays`) and confirm the
   backdrop dims the page behind clearly (`/60` opacity is now in effect).

If Ahmad still sees auto-open after hard refresh, the most likely remaining cause is the
service-worker / Next.js dev-server module cache surviving the refresh; in that case stop
the dev server, `rm -rf apps/renderer/.next` once, and restart. **Fixer will not touch the
dev server per the rule** — that call is Ahmad's.
