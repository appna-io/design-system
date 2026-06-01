# `<Toast />` — Toaster page shows no clickable test button

> Status: Resolved · Reported: 2026-05-21 · Component:
> `packages/components/src/Toast/README.mdx` (+ dist freshness)
> Severity: High (renders the Toast docs page useless for evaluation)

## Symptom

Ahmad reports the renderer's `/components/toast` route shows the Toast prose
documentation but **no visible button to actually fire a toast** — so there's no way to
see what a toast looks like, evaluate its motion, or interact with the close / action
buttons.

## Repro

1. `pnpm --filter renderer dev`.
2. Navigate to `/components/toast`.
3. Observe: prose, API tables, theming snippet, anti-patterns section. **Zero rendered
   example previews.** The `<Toast/Basic>` example file exists and contains a working
   button + `<Toaster />`, but it never mounts on the page.

Expected: each example listed in `packages/components/src/Toast/examples/` (Basic,
Intents, RichColors, WithAction, Promise, Persistent, DismissAll, Dedup, Positions,
ExpandedStack, CustomIcon) should render its own preview tile with its trigger button,
just like Modal / Popover / Tooltip do.

## Root cause — two issues combined

### Cause 1 — `Toast/README.mdx` never used `<ExampleBlock for="…">`

The renderer's `[slug]/page.tsx` route prefers `README.mdx` when present and only falls
back to auto-listing examples when there's no README. Inside an MDX file, examples must
be opted-in via the `<ExampleBlock for="…">` MDX component (see
`apps/renderer/src/components/docs/Mdx.tsx`). Toast's README had **zero** `<ExampleBlock>`
calls — only static fenced code blocks. Result: no examples mounted, no buttons rendered.

This is unique to Toast at the moment — Tooltip, Popover, Modal, Drawer, HoverCard all
explicitly wire `<ExampleBlock>` entries.

### Cause 2 — Stale `apx-ds` dist also broke Toast example imports

Even with the examples wired in, every Toast example imports `toast` from `'apx-ds
The umbrella dist (`packages/apx-dst/index.js`) was built before recent component
shipping rounds. The dev server logs were flooded with:

```
Attempted import error: 'toast' is not exported from 'apx-dsmported as 'toast').
```

This was a webpack module-resolution failure, not a true missing-export — the source
exports `toast` correctly, but the **built dist** the renderer consumes at runtime was
stale. (The dist was actually rebuilt to include `toast` since then, but until cause 1
was fixed the examples weren't being mounted, so the symptom appeared to be the same.)

## Fix

1. **`packages/components/src/Toast/README.mdx`** — added an `## Examples` section
   wiring 11 `<ExampleBlock for="…">` entries (Basic, Intents, RichColors, WithAction,
   Promise, Persistent, DismissAll, Dedup, Positions, ExpandedStack, CustomIcon). Each
   example mounts its own `<Toaster />` so the preview is self-contained (the prose still
   tells consumers to mount **one** Toaster per app in real code).
2. **`packages/apx-dst/`** — forced fresh build via
   `pnpm --filter @apx-dsponents build && pnpm --filter apx-apx-dsto
   guarantee `toast` (and the freshly-shipped Timeline / Stepper / Toolbar / etc.) are
   actually resolvable from `import { toast } from 'apx-ds';
## Files touched

- `packages/components/src/Toast/README.mdx` — `## Examples` section added.
- `packages/components/dist/**` — rebuilt (671 KB ESM, was 266 KB).
- `packages/apx-dst/**` — rebuilt (902 KB ESM, was 488 KB).

## Gates

- Toast vitest: **26 / 26 ✅** (`__tests__/Toast.test.tsx`).
- Renderer recompiled clean after the dist rebuild (`✓ Compiled in 10.4s (3050 modules)`,
  no more `'toast' is not exported` errors in the dev terminal).

## What Ahmad should do

1. Hard refresh `/components/toast` (Cmd-Shift-R / Ctrl-Shift-R).
2. Click "Show toast" in the **Basic** example tile — a `Saved.` toast should slide in
   from the configured corner and auto-dismiss in 5s.
3. Walk through Intents (success / error / warning / info / loading), RichColors,
   WithAction (button label + onClick fires), Promise (loading → success / error in one
   toast), Persistent (`duration: 0` requires manual dismiss), DismissAll, Dedup
   (same `id` updates in place instead of stacking), Positions, ExpandedStack
   (hover the stack to expand), CustomIcon.
4. Verify the toaster region (`role="region" aria-live="polite"`) is reachable via the
   **F8** keyboard shortcut (platform convention; once focused, ArrowDown / ArrowUp
   cycles between visible toasts, Esc dismisses the focused one).

## Known pre-existing issue (out of scope for this bug)

`pnpm --filter apx-dsld` reports a DTS-only error:

```
src/index.ts(4,1): error TS2308: Module '@apx-dsme' has already exported a member
named 'detectPlatform'. Consider explicitly re-exporting to resolve the ambiguity.
```

Both `@apx-dsme` (`packages/theme/src/platform.ts`) and `@apx-apx-dsnts`
(`packages/components/src/CommandPalette/headless/platformKey.ts`) export
`detectPlatform`. The runtime `.js` / `.cjs` bundles built fine — only the `.d.ts`
generation fails, so the renderer (which doesn't need `.d.ts` at runtime) is unaffected.
Routed to Leader for ownership decision (CommandPalette owner vs. theme owner).

## Out of scope

- No source changes to `Toast.tsx` / `Toaster.tsx` / `toastApi.ts` / examples — all of
  those were already correct.
- No engine / theme / preset writes.