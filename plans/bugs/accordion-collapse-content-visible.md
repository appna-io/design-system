# `<Accordion />` — collapsed content visible + general "looks bad"

> Status: **🟢 Fixed** · Reported: 2026-05-21 by Ahmad · Component:
> `packages/components/src/Accordion` · Severity: Medium (UI degraded but a11y / state
> correctness intact) · Fix shipped: 2026-05-21 by SDS-Agent5

## Symptom

Ahmad reported: *"Accordion, looks bad and buggy, not working as expected (UI -> looks
bad, UX -> the text on collapse still visible)"*.

Reproduced live in the renderer (`/components/accordion`, `Basic` example):

- The first item ("What does apx-ds give me?") is open and shows its content (correct).
- The second item ("How is the bundle size?") is closed (chevron rotated down,
  `aria-expanded="false"`) **but its body text "Each primitive lands under a strict budget…"
  was still visible as a ~16 px sliver under the trigger**.
- Same leak on the third item ("Can I rebrand it?") — closed, but
  "Yes. Define a theme once, override component defaults + per-slot classNames" still
  visible.
- Verified across all 13 Accordion examples (single mode, multiple mode, collapsible,
  controlled, all variants, all sizes, soft × 7 colors, leading icons, chevron-start,
  per-item disable, rich content, FAQ, nested). The leak reproduced everywhere because
  the recipe is the single source of truth for the collapse animation.

`getBoundingClientRect` confirmed: the gap between a closed trigger's bottom edge and the
next trigger's top edge was **17 px** (1 px border + 16 px of leaked content) for every
size with `pb-4` (`md`), not the expected **1 px** (border only).

## Root cause

The original recipe relied on the modern CSS-only auto-height pattern:

```css
/* outer */
display: grid;
grid-template-rows: 0fr;
transition: grid-template-rows;
overflow: hidden;

/* inner */
min-height: 0;
padding-bottom: 1rem; /* size=md */
```

That pattern *should* collapse the row to zero because `grid-template-rows: 0fr` plus
`min-height: 0` on the grid item is supposed to let the track shrink past the inner's
min-content size. **In practice, in Chromium 137 (the renderer's environment), the row
track resolves to the inner's `padding-bottom` as a floor**, not zero, so closed content
keeps a ~`pb-{size}` band of paint underneath the trigger. The outer's `overflow-hidden`
clips beyond that band but the band itself is visible.

The previous investigator (Fixer) recreated the symptom only against `data-state` flips
in jsdom (where layout isn't computed) and concluded "no bug reproducible". The bug *is*
reproducible — in a real browser, where `grid-template-rows: 0fr` doesn't actually
collapse to zero against a padded grid item.

## Fix

Two-layer wrapper in `Accordion.recipe.ts`:

```ts
export const accordionContentRecipe = cv({
  base: [
    // Smooth animation — drives the open/close transition.
    'grid grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]',
    // Hard clip — guarantees zero visible chrome when closed, regardless of the
    // grid track's min-content floor.
    'max-h-0 data-[state=open]:max-h-screen',
    'transition-[grid-template-rows,max-height] duration-normal ease-standard',
    'motion-reduce:duration-[120ms]',
    'overflow-hidden',
  ].join(' '),
});

export const accordionContentInnerRecipe = cv({
  // `min-h-0` lets the grid track shrink past the inner's intrinsic min-content height.
  // `overflow-hidden` clips the inner's own children during the close transition.
  base: 'min-h-0 overflow-hidden text-fg',
  variants: { size: { sm: 'px-3 pb-3 text-sm', md: 'px-4 pb-4 text-base', lg: 'px-5 pb-5 text-base' } },
  defaultVariants: { size: 'md' },
});
```

Why both `grid-template-rows: 0fr → 1fr` AND `max-h-0 → max-h-screen`:

- The grid-rows trick is what produces the **smooth** animated transition between zero and
  the inner's intrinsic height. We keep it because it's CSS-only, no JS measurement, no
  ResizeObserver, and supports asynchronously-resizing content.
- The `max-h` layer is what produces the **correct** end state. When closed,
  `max-height: 0` + `overflow-hidden` collapses the wrapper to exactly zero pixels in
  every browser, regardless of how the grid algorithm decides the row floor.
- `max-h-screen` (`max-height: 100vh`) on open is a cap that's well above any realistic
  disclosure content; the grid-rows track size animates freely under it.
- `transition-[grid-template-rows,max-height]` includes both properties in the transition
  so they animate in lockstep on open/close.
- `min-h-0` on the inner stays — without it the grid-rows transition would never reach
  zero even with the `max-h` cap, and the close would snap rather than animate.
- `overflow-hidden` on the inner stays — clips the inner's own children during the
  transient zero-height state.

## Verification

Live browser repro after the fix (Chromium 137 in the renderer's MCP harness):

- Basic example: closed items show **zero pixels** of content under their triggers (gap
  is exactly 1 px = border-b only).
- Click the second trigger: animation runs smoothly from 0 → full content height on open,
  full → 0 on close. No flicker, no snap, no leftover chrome.
- Multiple example: same — Warranty (closed) hides its body fully, Returns (open) shows
  full content.
- All other examples (Variants / Sizes / Colors / Icons / Nested) verified visually clean.

## What Fixer (this pass) ran

- `pnpm --filter @apx-dsponents build` — fresh components dist.
- `pnpm --filter apx-dsld` — fresh umbrella dist (both `.js` and `.d.ts` clean
  this time; the pre-existing `detectPlatform` ambiguity that bit the previous Fixer
  resolved itself once the dependency graph was up to date).
- `pnpm --filter @apx-dsponents exec vitest run __tests__/Accordion` —
  **40 / 40 ✅** (33 unit + 7 a11y, including **2 new regression tests** added in this
  fix that assert the `max-h-0` cap and `min-h-0 overflow-hidden` inner contract).
- Live verification against the running renderer at `localhost:3000/components/accordion`
  with `getBoundingClientRect` measurements — closed gap shrank from 17 px → 1 px.

## Files changed

- `packages/components/src/Accordion/Accordion.recipe.ts` — added `max-h-0` /
  `data-[state=open]:max-h-screen` to the outer wrapper; added `overflow-hidden` to the
  inner; updated the recipe doc comments to capture the two-layer contract and tie back to
  this bug report.
- `packages/components/__tests__/Accordion.test.tsx` — two new regression tests under
  `Accordion — content visibility transition state`:
    - `content wrapper carries the max-h-0 + overflow-hidden hard-clip when closed`
    - `content inner carries min-h-0 + overflow-hidden (regression: pb-N leak)`

## Bundle impact

Negligible. Adding `max-h-0 data-[state=open]:max-h-screen` plus the second token in
`transition-[grid-template-rows,max-height]` adds ~60 bytes raw / ~30 bytes gz to the
Accordion class string. Tailwind's `max-h-0` and `max-h-screen` utilities were already
in the renderer's CSS (used by other components), so no new CSS rules are emitted.

## On the second complaint ("UI looks bad")

Without a specific element callout from Ahmad we can't action that part. The collapse fix
already removes the dominant visual defect on the page (closed items now render as clean
collapsed strips instead of half-rendered text blocks). If anything else still looks off
after the next refresh, please point at the specific example + element and we'll land a
follow-up — spacing, border, hover, focus ring, chevron rotation, prose color, variant
chrome are all in scope.