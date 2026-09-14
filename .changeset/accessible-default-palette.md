---
'@apx-ui/tokens': minor
---

Fix WCAG AA contrast failures in the default light and dark palettes.

Three of the seven solid buttons shipped labels below the 4.5:1 AA floor for normal text, in the
values every consumer gets before theming anything:

- **light** `secondary` — a white label on `#0ea5e9` was **2.77:1**, the worst ratio in the DS.
  `success` was 3.30:1, and `warning.active` had fallen to 3.53:1.
- **dark** `primary`, `danger` and `info` collapsed to **1.99 / 1.90 / 1.80:1** at `active`.

The dark failures had a single structural cause: a dark ramp *brightens* on hover/active, so a role
that keeps a white label loses contrast exactly as the user interacts with it. The four dark roles
that were already correct pair a bright fill with dark ink; these three had kept the light palette's
white label. They now follow the same pattern.

**This changes default colours.** Consumers who have not themed `secondary` or `success` will see
them a step darker in light mode, and `primary` / `danger` / `info` labels switch from white to a
dark ink in dark mode. Any theme that overrides these roles is unaffected.

Added `paletteContrast.test.ts`, which asserts the AA floor for every role × interaction state in
both modes, plus the ramp-direction rule that caused the dark failures.
