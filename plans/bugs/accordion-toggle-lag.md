# `<Accordion />` — open/close animation lags

> Status: **🟢 Fixed** · Reported: 2026-09-15 (apx-ui-kit AppFAQ) · Component:
> `packages/components/src/Accordion` · Severity: Low (motion quality; state and a11y intact)

## Symptom

Opening and closing an item felt laggy. Measured frame by frame in Chromium on the apx-ui-kit
AppFAQ story (`size="lg"`, one-line answer, 900px viewport, visible panel height in px):

| close, ms after click | 6  | 25 | 41 → 141         | 158 | 191 |
| --------------------- | -- | -- | ---------------- | --- | --- |
| height                | 47 | 28 | **stuck at 20**  | 9   | 0   |

When opening, the panel stayed at 0 for about 40ms, then jumped straight to 20px.

## Root cause

This was a side effect of the fix for [accordion-collapse-content-visible.md](./accordion-collapse-content-visible.md):

1. The grid item (`contentInner`) had `pb-{size}` padding. A box can't be shorter than its
   padding, so `grid-template-rows: 0fr` never collapsed below it (20px for `lg`). In the
   measurements, the computed row size never dropped under `20px`.
2. That band was hidden with `max-h-0 → max-h-screen`. `max-height` transitions over the whole
   viewport height, so when closing it only reaches the 20px band near the end of the
   transition. The panel hangs there until it does. The taller the viewport, the longer the
   stall.

## Fix

Keep padding off the grid item and remove the `max-height` cap:

```
content      grid, grid-rows 0fr → 1fr, overflow-hidden     (slot: content)
└ clip       min-h-0 overflow-hidden, NO padding            (slot: contentClip — new)
  └ region   role="region", px/pb-{size}, consumer sx/class (slot: contentInner)
```

With an unpadded grid item the track collapses to 0. A prototype of this structure in the same
browser measured 0px at rest when closed. Height changed every frame when opening
(0 → 47 in ~170ms) and closing (47 → 0 in ~175ms), with no stall. The region keeps its
`className` / `sx` / `style` / `ref` contract, so consumer padding overrides still apply.

## Regression guard

`__tests__/Accordion.test.tsx`, under "content visibility transition state":

- the content wrapper has no `max-h-*` classes;
- the grid item (the clip) has `min-h-0 overflow-hidden` and no padding classes;
- the padding is on the `role="region"` inside it.
