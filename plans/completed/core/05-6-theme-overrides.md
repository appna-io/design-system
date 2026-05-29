# Phase 5.6 — Live Theme Overrides

> Status: **Completed** · Depends on: Phase 3, 5, 5.5 · Blocks: Phase 6

## Objective

Add a **runtime override layer** to `ThemeProvider` and a **Theme Studio** drawer in the
renderer, so any palette color or engine token can be edited live and the entire surface
re-paints with the new look — no rebuild, no reload.

Outputs of this phase:

1. `<ThemeProvider>` accepts and exposes mutable `overrides: ThemeOverride`.
2. New `useThemeOverrides()` hook with `setOverrides`, `patchOverrides`, `resetOverrides`.
3. New engine utility `deriveColorRole(main)` — takes a single hex and derives the full
   `{ main, hover, active, contrast, subtle, border }` role so the Studio can ask the user for
   _one_ color and fill in the rest.
4. Renderer: a slide-out **Theme Studio** drawer with three tabs:
   - **Palette** — per-role color pickers (mode-aware: edits in light mode write to
     `palette.light`, edits in dark mode write to `palette.dark`).
   - **Radii** — sliders for the radius scale.
   - **Motion** — sliders for `duration.fast / normal / slow`.
5. **Copy as code** — outputs the current overrides as a `defineTheme({ … })` snippet so
   consumers can pin a look they liked into their own app.

---

## Architecture

### 1. Provider override layer (`@apx-ds/theme`)

`ThemeProvider` gains a fourth piece of state (alongside `mode`, `variant`, `dir`, `platform`):

```ts
overrides: ThemeOverride;   // existing DeepPartial<ThemeShape> from mergeTheme
```

Effective theme becomes:

```ts
effectiveTheme = mergeTheme(baseTheme.withVariant, overrides)
```

`<style data-apx-dsme>` re-serializes whenever overrides change → every CSS var that
the override touches updates → every component using those vars re-paints. No component code
changes needed.

Persisted under `${storageKey}-overrides` as JSON. Loaded in the same hydration effect that
reads mode / variant / platform, so the runtime override survives reloads.

Context gains:

| Field             | Type                                     | Purpose                                  |
| ----------------- | ---------------------------------------- | ---------------------------------------- |
| `overrides`       | `ThemeOverride`                          | Current diff on top of `baseTheme`.      |
| `setOverrides`    | `(o: ThemeOverride) => void`             | Replace whole override object.           |
| `patchOverrides`  | `(p: ThemeOverride) => void`             | Deep-merge a patch onto current.         |
| `resetOverrides`  | `() => void`                             | Clear back to `{}`.                      |

### 2. Color derivation (`@apx-dsine`)

```ts
import { deriveColorRole } from '@apx-dsine';

deriveColorRole('#4f46e5')
// → { main: '#4f46e5', hover: '#3f37c4', active: '#332ca0',
//     contrast: '#ffffff', subtle: '#eef0fe', border: '#c8c5f4' }
```

Algorithm (HSL-based, no third-party color library):

- `hover` = main lightness − 8%
- `active` = main lightness − 16%
- `subtle` = mix(main, white, 92%) — light tint background
- `border` = mix(main, white, 65%) — lighter than main, still recognizable
- `contrast` = white if luminance(main) < 0.55 else `#111827`

The Studio calls this whenever the user picks a `main` color, fills the five derived slots
into the override patch, and applies. Users can still override any derived slot manually via
the "Copy as code" snippet.

### 3. New hook

```tsx
const { overrides, setOverrides, patchOverrides, resetOverrides } = useThemeOverrides();
```

### 4. Renderer — `<ThemeStudio>` drawer

Slides in from the right edge of the viewport. Z-index above everything else. Trigger is a new
icon button in the chrome `TopBar` next to `VariantSelect`.

Tabs (Radix-style segmented control we already own):

- **Palette** — seven role rows (`primary` → `neutral`). Each row:
  - Big swatch (color input — native `<input type="color">`)
  - Five tiny read-only derived swatches showing the auto-computed hover / active / contrast /
    subtle / border
  - "Reset role" mini-button
  - All edits scope to the currently-active mode (`palette.light` or `palette.dark`).
- **Radii** — six labelled range sliders for `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`.
- **Motion** — three range sliders for `duration.fast`, `normal`, `slow`.

Drawer footer:

- **Reset all** — calls `resetOverrides()`.
- **Copy as code** — opens a modal showing a serialized `defineTheme(...)` snippet for the
  current overrides, with a Copy button.
- **Close** — collapses the drawer (overrides remain).

### 5. "Copy as code" output

A small `serializeOverridesToTs(overrides)` helper formats the override object as a
copy-pasteable TypeScript snippet:

```ts
import { defineTheme } from 'apx-ds';
export const myTheme = defineTheme({
  palette: {
    light: { primary: { main: '#ff5722', hover: '#e64a19', /* ... */ } },
  },
  radius: { md: '0.5rem' },
  motion: { duration: { fast: 120 } },
});
```

---

## File-level tasks

### Engine

1. [ ] `packages/engine/src/color/deriveColorRole.ts` — `deriveColorRole(main)` returning a full `ColorRole`. Includes hex parse / HSL transform / luminance / hex format helpers.
2. [ ] `packages/engine/src/color/index.ts` — re-export.
3. [ ] `packages/engine/src/index.ts` — export `deriveColorRole` + helpers.
4. [ ] `packages/engine/__tests__/deriveColorRole.test.ts` — coverage for hover/active darken, white-vs-black contrast pick on near-white and near-black inputs, edge cases (3-digit hex, uppercase).

### Theme

5. [ ] `packages/theme/src/context.ts` — add `overrides`, `setOverrides`, `patchOverrides`, `resetOverrides` to `ThemeContextValue`.
6. [ ] `packages/theme/src/ThemeProvider.tsx` — overrides state, persistence, merge into `effectiveTheme`, hydrate from storage on mount.
7. [ ] `packages/theme/src/hooks/useThemeOverrides.ts` — new hook + return type.
8. [ ] `packages/theme/src/hooks/index.ts` — export.
9. [ ] `packages/theme/src/index.ts` — re-export hook + return type.
10. [ ] `packages/theme/__tests__/ThemeProvider.test.tsx` — assertions for: `setOverrides` re-renders, `patchOverrides` merges deeply, `resetOverrides` clears, overrides round-trip through localStorage, overrides change the emitted CSS.

### Renderer

11. [ ] `apps/renderer/src/components/studio/ThemeStudio.tsx` — drawer shell.
12. [ ] `apps/renderer/src/components/studio/PaletteEditor.tsx` — role rows + color pickers.
13. [ ] `apps/renderer/src/components/studio/RadiusEditor.tsx` — sliders.
14. [ ] `apps/renderer/src/components/studio/MotionEditor.tsx` — sliders.
15. [ ] `apps/renderer/src/components/studio/CopyAsCode.tsx` — modal + serializer.
16. [ ] `apps/renderer/src/components/studio/serialize.ts` — TS-snippet generator.
17. [ ] `apps/renderer/src/components/chrome/TopBar.tsx` — Studio trigger button.

### Plans

18. [ ] Update `plans/README.md` with Phase 5.6 entry.

---

## Acceptance criteria

- [ ] Open the renderer → click "Theme Studio" → drawer slides in.
- [ ] Pick a new color for `primary` → every Button, focus ring, and primary surface on the
      page updates instantly without reload.
- [ ] Move the `radius.md` slider → buttons / cards reshape live.
- [ ] Move a `duration` slider → hover / press animations re-time live.
- [ ] Refresh the page → the overrides survive (loaded from `localStorage` during the same
      hydration pass as mode/variant).
- [ ] Click "Reset all" → overrides clear → DS returns to its defaults instantly.
- [ ] Click "Copy as code" → modal shows a `defineTheme({ … })` snippet covering exactly the
      diff currently applied. Pasting that into a consumer's app reproduces the same look.
- [ ] Switching mode (light ↔ dark) flips which `palette.{light|dark}` slot the Studio edits.
- [ ] Switching variant / platform still works; overrides layer on top of whatever variant +
      platform are active.
- [ ] No hydration warnings on first load.

---

## DRY self-check

- `deriveColorRole` is the single function the Studio uses to expand a `main` color into a
  role. Used by both palette tab and the "auto-derive" button on Copy-as-code.
- `mergeTheme` (existing) is reused for the `baseTheme → variant → overrides` chain — no new
  merge helper needed.
- `themeToCssVars` (existing) is reused — the override pipeline only feeds it a different
  `ThemeShape`. No new CSS serialization path.
- Persistence reuses the same `${storageKey}-…` convention as mode/variant/platform/dir.

---

## When this phase is complete

1. Move this file to `plans/completed/05-6-theme-overrides.md`.
2. Append `## Outcome` with: shipped API, derivation algorithm, Studio screenshots, copy-as-code
   sample for a custom palette, deferred items.
3. Resume Phase 6 — Button variants (`outline`, `ghost`).

---

## Outcome

### What shipped

**Engine — `@apx-dsine/color`** (new submodule):

- `deriveColorRole(main: string): ColorRole` — single-color → full role expansion.
- Underlying primitives also exported for advanced callers: `parseHex`, `rgbToHex`, `rgbToHsl`,
  `hslToRgb`, `relativeLuminance`, `mixRgb`, `shiftLightness`.
- 18 unit tests covering hex parsing (`#rgb`, `#rrggbb`, uppercase, leading-`#` optional),
  HSL round-trips on six samples, mix linearity, lightness clamping, contrast pick on
  white/black/near-black mains, and graceful fallback for unparseable inputs (CSS vars, named
  colors).

Final derivation algorithm (HSL-based, no third-party color lib):

```
hover    = main, L − 8%
active   = main, L − 16%
subtle   = mix(main, white, 92%)
border   = mix(main, white, 65%)
contrast = luminance(main) < 0.55 ? white : #111827
```

**Theme — `@apx-dsme`**:

- `ThemeProvider` gained `defaultOverrides` prop + a fifth piece of state, persisted under
  `${storageKey}-overrides`.
- Context now exposes `overrides`, `setOverrides`, `patchOverrides`, `resetOverrides` alongside
  the existing mode/variant/platform/dir surface.
- `effectiveTheme = mergeTheme(baseTheme + variant, overrides)` — overrides win against every
  other layer (variant tokens, platform overrides, base theme).
- Hydration: overrides are read from `localStorage` in the same single-pass mount effect that
  reads mode / variant / platform / dir, so refresh restores the look without any flicker.
- New hook: `useThemeOverrides()` returns `{ overrides, setOverrides, patchOverrides,
  resetOverrides, hasOverrides }`.
- 6 new tests (17 total `ThemeProvider` tests): patch-merges-deep, set-replaces-wholesale,
  reset-clears, localStorage round-trip, persisted-load-on-mount, defaultOverrides honored.

**Renderer — Theme Studio drawer** (`apps/renderer/src/components/studio/`):

- Right-side slide-in panel (400 px wide, `translate-x-full` ↔ `translate-x-0`, 300 ms ease).
- Trigger: `<Palette />` icon button in the TopBar, with a primary-colored dot indicator when
  any override is active.
- Four Radix tabs:
  - **Palette** — seven role rows with `<input type="color">` for `main` and five derived
    swatches (hover / active / contrast / subtle / border) rendered as small color tiles.
    Mode-aware: edits write to `palette.light` or `palette.dark` based on the active mode.
  - **Radii** — six range sliders (sm → 3xl), 0–48 px, value displayed in both px and rem.
    Multi-value forms (e.g. katana's `8px 0px`) are surfaced verbatim.
  - **Motion** — three range sliders (`duration.fast`, `normal`, `slow`) in ms.
  - **Code** — live snippet of `defineTheme({ … })` reflecting current overrides, with a
    one-click clipboard copy.
- Each editor row exposes a per-leaf reset button (a small `<RotateCcw />`) that prunes that
  single override without touching the others.
- Drawer header has a "Reset all" action driven by `resetOverrides()`.
- Closes on `Escape`; non-modal (designers want to interact with the page while editing).

**Copy-as-code serializer** — `serializeOverridesToTs(overrides)` formats arbitrary nested
overrides as a `defineTheme({…})` TypeScript snippet with identifier-style keys, single-quoted
strings, and 2-space indent — i.e. looks like hand-written code, not `JSON.stringify`. Example
output for a single primary tweak:

```ts
import { defineTheme } from 'apx-ds';
export const myTheme = defineTheme({
  palette: {
    light: {
      primary: {
        main: '#ff5722',
        hover: '#e64a19',
        active: '#cc4115',
        contrast: '#ffffff',
        subtle: '#fde6dc',
        border: '#ffc4ad',
      },
    },
  },
});
```

### Verification

- `pnpm -w typecheck` — 12/12 packages pass.
- `pnpm -w lint` — 12/12 packages pass.
- `pnpm -w test` — engine 116/116, theme 57/57 (incl. 6 new override tests), tokens 5/5,
  components 27/27.
- `pnpm -w build` — 11/11 packages built (engine, theme, tokens, components, apx-ds
- Live renderer (`pnpm --filter @apx-dsderer dev`) — Studio button renders in the
  top-bar, drawer slides open, palette edits update Button colors immediately, radius edits
  reshape corners immediately, refresh restores the look, reset clears it.
- No hydration warnings on first load (overrides are read inside the same mount effect that
  was rewritten in Phase 5.5).

### DRY check

- `mergeTheme` is the single merge path — base → variant → overrides, all through one helper.
- `deriveColorRole` is shared between PaletteEditor and any future "auto-suggest" code paths.
- `themeToCssVars` serialization is untouched — the override layer feeds it a different
  `ThemeShape`, that's the only entry point.
- Persistence reuses the same `${storageKey}-…` convention as mode / variant / platform / dir.

### Deferred (not blocking Phase 6)

- **Shadow editor** — exposing the 8-step shadow scale as visual swatches needs UX design.
- **Typography editor** — font-family picker + size scale.
- **Spacing editor** — eight-step spacing scale.
- **WCAG contrast warnings** — flag role pairs where `main` vs `contrast` fails AA. Will fit
  naturally into the planned "smart color constraint handler" (Phase 7+).
- **Preset library** — save / load named overrides (`'brand-marketing'`, `'brand-product'`).
- **Per-mode sync** — checkbox to mirror edits into the inactive mode automatically.
- **Side-by-side preview** — render the same component with and without overrides for
  quick A/B comparison.

### Public API surface added this phase

```ts
// From @apx-dsine / apx-apx-ds
export function deriveColorRole(main: string): ColorRole;
export function parseHex(input: string): { r: number; g: number; b: number } | null;
export function rgbToHex(rgb: { r: number; g: number; b: number }): string;
// + rgbToHsl, hslToRgb, mixRgb, shiftLightness, relativeLuminance

// From @apx-dsme / apx-apx-ds
export interface ThemeProviderProps {
  // …existing props…
  defaultOverrides?: ThemeOverride;
}
export interface UseThemeOverridesReturn {
  overrides: ThemeOverride;
  setOverrides(overrides: ThemeOverride): void;
  patchOverrides(patch: ThemeOverride): void;
  resetOverrides(): void;
  hasOverrides: boolean;
}
export function useThemeOverrides(): UseThemeOverridesReturn;
```

### Resume

Phase 6 (Button variants — `outline`, `ghost`) — the variant system can now be exercised
against a living theme that the operator can re-paint in real time.

