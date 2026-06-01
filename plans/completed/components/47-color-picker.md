# Phase 47 — `<ColorPicker />`

> Status: **Completed** · **Tier 2.5** (complex interaction surface) · Depends on: Phase 7 (Input), Phase 18 (Popover), Phase 22 (Menu), Phase 28 (Slider), Phase 8 (`useFormFieldA11y`), Phase 27 (I18nProvider — optional)
> Visual color form control. Saturation/lightness square + hue slider + alpha + presets + hex/rgb/hsl text input.

## Objective

Ship the **`<ColorPicker />`** form control — the canonical visual color picker for theming, brand customization, design tools, label coloring, etc.

Phase 47 ships the **full visual picker** (saturation square + hue slider + alpha slider + presets + multi-format text input) inside a Popover trigger, plus a `<ColorSwatch />` standalone display primitive for read-only color chips and a `<ColorInput />` text-only variant when consumers want just the input.

---

## Public API

```tsx
import { ColorPicker, ColorSwatch, ColorInput } from 'apx-ds';

// Default — popover with full picker
<ColorPicker
  value={color}
  onChange={setColor}
/>

// Initial value as hex / rgb / hsl
<ColorPicker defaultValue="#6c5ce7" onChange={(c) => save(c)} />

// With alpha channel (rgba/hsla/hex8)
<ColorPicker defaultValue="rgba(108,92,231,0.5)" enableAlpha onChange={setColor} />

// Constrained to presets only
<ColorPicker
  presets={['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9D4EDD']}
  presetsOnly
/>

// Format constraints
<ColorPicker format="hex" />            // forces output to "#RRGGBB" (or #RRGGBBAA with alpha)
<ColorPicker format="rgb" />            // "rgb(108, 92, 231)" or rgba
<ColorPicker format="hsl" />

// Eyedropper button (browser API; Chrome only currently)
<ColorPicker enableEyedropper />

// As a form field
<ColorPicker
  label="Brand color"
  description="Used for primary buttons + links"
  helperText="WCAG AA recommended against white"
  required
  name="brandColor"
  value={brand}
  onChange={setBrand}
/>

// Read-only swatch (display only)
<ColorSwatch value="#6c5ce7" size="md" />
<ColorSwatch value="#6c5ce7" showLabel="Indigo" />

// Text-only variant
<ColorInput value={color} onChange={setColor} format="hex" />

// Full ColorPicker prop form
<ColorPicker
  /* value */
  value                            // string — color in any CSS-valid format
  defaultValue                     // initial
  onChange={(value, meta) => void} // meta: { format, source: 'sb' | 'hue' | 'alpha' | 'input' | 'preset' | 'eyedropper' }

  /* format */
  format                           // 'hex' | 'rgb' | 'hsl' | 'auto'  (default 'auto' — preserves input format)
  enableAlpha={false}              // boolean

  /* presets */
  presets={[]}                     // string[] — preset swatches shown in picker
  presetsOnly={false}              // boolean — disable freeform picker, presets-only

  /* features */
  enableEyedropper={false}         // boolean — browser EyeDropper API support
  enableContrastCheck={false}      // boolean — show contrast ratio vs. background
  contrastAgainst="#FFFFFF"        // string — background to check against

  /* trigger */
  triggerVariant="swatch"          // 'swatch' | 'button' | 'input'
  closeOnSelect=false              // when true and presetsOnly=true, closes popover on preset click

  /* form integration (shared with other form controls) */
  label
  description
  helperText
  error
  required
  disabled
  readOnly
  name
  id

  /* visual */
  size="md"                        // 'sm' | 'md' | 'lg'

  className=""
  style={{}}
  ref={…}
/>
```

---

## API Decisions

| Decision                                                                | Why                                                                                                              |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Single picker inside a Popover** (not inline by default)              | Color pickers occupy significant screen real estate. Popover model matches Date/Combobox conventions.            |
| **`triggerVariant`** can switch to `'button'` or `'input'`              | Some consumers want the picker beside a hex text field; some want a chip-only swatch trigger.                    |
| **`format="auto"` preserves input format**                              | If consumer passes hex, output is hex; if they pass hsl, output is hsl. Less surprise.                          |
| **Saturation/lightness as a 2D draggable square + Hue as a linear slider** | The canonical interaction. Pointer + arrow keys both work.                                                       |
| **`<Slider />` reused for hue + alpha**                                  | Phase 28 Slider already has W3C keyboard + RTL + theme-aware. Two thin wrappers ride on it.                      |
| **Multi-format input** inside the picker                                | Bottom of the picker has tabs for hex / rgb / hsl with field validation; commits on blur or Enter.              |
| **Eyedropper opt-in** (browser API gated)                              | EyeDropper is Chrome-only as of 2026. Button shown only when `window.EyeDropper` exists + `enableEyedropper`.    |
| **Contrast check opt-in**                                              | Shows a small WCAG ratio chip (e.g. "4.6:1 ✓ AA") when enabled, vs. `contrastAgainst` background.               |
| **Pure color math** — no library                                       | Hex / rgb / hsl / alpha conversion in `_shared/color.ts`. ~40 lines of pure code. Avoids `tinycolor2` (~10 KB).  |
| **Presets are first-class**                                            | Most real-world usage is "pick from this brand palette." Presets-only mode collapses the picker entirely.        |

---

## Internal architecture

```
                 ┌──────────────────────────────────────────────────┐
   value ───►   │  parseColor → normalized HSVA (h,s,v,a)           │
                 │  (single source of truth inside the picker)      │
                 └──────────────────────────────────────────────────┘
                                  │
                                  ▼
                 ┌──────────────────────────────────────────────────┐
                 │  Saturation/Value square                          │
                 │   pointer + arrow keys → updates (s, v)           │
                 │   visual gradient = current h × s+v plane         │
                 ├──────────────────────────────────────────────────┤
                 │  Hue slider (uses <Slider />)                     │
                 │   0..360°                                          │
                 ├──────────────────────────────────────────────────┤
                 │  Alpha slider (when enabled, uses <Slider />)     │
                 │   0..1 with checker bg                             │
                 ├──────────────────────────────────────────────────┤
                 │  Hex / RGB / HSL tabbed input                     │
                 ├──────────────────────────────────────────────────┤
                 │  Presets grid (when provided)                     │
                 ├──────────────────────────────────────────────────┤
                 │  Eyedropper button (when supported)               │
                 └──────────────────────────────────────────────────┘
                                  │
                                  ▼
                 ┌──────────────────────────────────────────────────┐
                 │  formatColor(hsva, format) → string out            │
                 │  onChange(string, meta)                             │
                 └──────────────────────────────────────────────────┘
```

HSVA is the internal model (matches the saturation-square interaction). Hex / RGB / HSL conversions happen at I/O boundaries only.

---

## File Structure

```
packages/components/src/ColorPicker/
├── ColorPicker.tsx
├── ColorSwatch.tsx
├── ColorInput.tsx
├── ColorPicker.context.ts
├── ColorPicker.types.ts
├── ColorPicker.recipe.ts
├── SaturationSquare.tsx          # internal
├── HueSlider.tsx                 # thin wrapper around <Slider />
├── AlphaSlider.tsx               # thin wrapper around <Slider />
├── HexInput.tsx                  # internal
├── RgbInput.tsx                  # internal
├── HslInput.tsx                  # internal
├── PresetsGrid.tsx               # internal
├── EyedropperButton.tsx          # internal
├── ContrastChip.tsx              # internal
├── _shared/color.ts              # parse/format/convert + WCAG contrast
├── _shared/clamp.ts              # already exists in engine likely; reuse
├── ColorPicker.test.tsx
├── ColorPicker.a11y.test.tsx
├── ColorPicker.keyboard.test.tsx
├── ColorSwatch.test.tsx
├── color.test.ts                 # color math truth table
├── index.ts                      # exports ColorPicker, ColorSwatch, ColorInput + types
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── WithAlpha.tsx
    ├── HexFormat.tsx
    ├── RgbFormat.tsx
    ├── HslFormat.tsx
    ├── PresetsOnly.tsx
    ├── WithPresets.tsx
    ├── Eyedropper.tsx
    ├── ContrastCheck.tsx
    ├── TriggerButton.tsx
    ├── TriggerInput.tsx
    ├── TriggerSwatch.tsx
    ├── Sizes.tsx
    ├── AsFormField.tsx
    ├── ColorSwatchSizes.tsx
    ├── ColorSwatchGroup.tsx
    └── ColorInputOnly.tsx
```

---

## `_shared/color.ts` — pure math

```ts
export interface RGBA { r: number; g: number; b: number; a: number; }
export interface HSVA { h: number; s: number; v: number; a: number; }
export interface HSLA { h: number; s: number; l: number; a: number; }

export function parseColor(input: string): RGBA;     // accepts #rgb / #rgba / #rrggbb / #rrggbbaa / rgb() / rgba() / hsl() / hsla()
export function formatColor(rgba: RGBA, format: 'hex' | 'rgb' | 'hsl'): string;
export function rgbaToHsva(rgba: RGBA): HSVA;
export function hsvaToRgba(hsva: HSVA): RGBA;
export function rgbaToHsla(rgba: RGBA): HSLA;
export function hslaToRgba(hsla: HSLA): RGBA;
export function contrastRatio(a: RGBA, b: RGBA): number;    // WCAG 2.x formula
export function wcagLevel(ratio: number, size: 'normal' | 'large'): 'AAA' | 'AA' | 'fail';
```

~100 lines total. Each function unit-tested with a truth table covering edge cases (pure red, white, black, 50% gray, transparency, etc.).

---

## Recipe sketches

```ts
export const colorPickerTriggerRecipe = cv({
  base: 'inline-flex items-center gap-2 rounded-md border border-(--sds-color-border-default) bg-(--sds-color-surface-default) outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-(--sds-color-accent-emphasis)',
  variants: {
    triggerVariant: {
      swatch: 'p-1',
      button: 'px-3 py-1.5 text-sm',
      input:  'px-2 py-1 text-sm font-mono',
    },
    size: {
      sm: 'h-7 text-xs',
      md: 'h-8 text-sm',
      lg: 'h-10 text-base',
    },
    disabled: { true: 'opacity-50 cursor-not-allowed', false: 'cursor-pointer' },
  },
  defaultVariants: { triggerVariant: 'swatch', size: 'md' },
});

export const colorSwatchRecipe = cv({
  base: 'inline-block rounded border border-(--sds-color-border-subtle) shadow-inner',
  variants: {
    size: { sm: 'h-5 w-5', md: 'h-7 w-7', lg: 'h-10 w-10' },
  },
});

export const saturationSquareRecipe = cv({
  base: 'relative w-full aspect-square rounded-md overflow-hidden cursor-crosshair outline-none focus-visible:ring-2 focus-visible:ring-(--sds-color-accent-emphasis)',
});
```

Saturation square draws two stacked gradients (white → transparent left-to-right; transparent → black bottom-to-top) over a solid `hsl(H 100% 50%)` background driven by current hue.

Alpha slider uses a checkered transparency background (`background-image: repeating-conic-gradient(…)`) under the gradient.

---

## A11y

- **Trigger button** uses Popover's standard `aria-haspopup="dialog"` + `aria-expanded`.
- **Saturation square**: `role="slider"` with `aria-valuemin/-max/-now` for both X (saturation) and Y (value). Per W3C: 2D sliders use **two slider semantics** via `aria-orientation` + duplicate value text. Standard pattern is `role="slider" aria-valuetext="Saturation 75%, Brightness 60%"`.
- **Hue slider** + **Alpha slider** inherit Phase 28 Slider's full ARIA.
- **Hex / RGB / HSL inputs** each have visible labels ("Hex", "R", "G", …) and use `useFormFieldA11y`.
- **Preset swatches**: `<button aria-label={`Use color ${value}`}>`.
- **Eyedropper button**: `<button aria-label="Pick color from screen">`.
- **Contrast chip**: `aria-label="Contrast ratio 4.6 to 1, passes AA"`.
- Pointer + keyboard interaction on Saturation Square (Arrow keys for 1 unit, Shift+Arrow for 10 units, Home/End for extremes).
- axe-core: 0 violations across all variants.

---

## Keyboard

| Surface              | Keys                                                                            |
| -------------------- | ------------------------------------------------------------------------------- |
| Trigger              | `Space` / `Enter` opens the picker.                                              |
| Saturation square    | `Arrow*` ±1 unit; `Shift+Arrow*` ±10; `Home` / `End` for extremes per axis.     |
| Hue slider           | Inherits from `<Slider />` (Arrow ±1°, Shift+Arrow ±10°, PageUp/Down ±15°).      |
| Alpha slider         | Same as hue (0..1, with PageUp/Down = 10%).                                      |
| Hex / RGB / HSL input| Standard text input. Enter commits, Esc reverts.                                |
| Preset swatch grid   | Arrow keys move focus, Enter selects.                                            |
| Eyedropper           | Enter activates browser eyedropper.                                              |

---

## i18n

When wrapped in `<I18nProvider>`:

| Key                              | Default (en)                          |
| -------------------------------- | ------------------------------------- |
| `colorPicker.trigger`            | "Pick color"                           |
| `colorPicker.saturation`         | "Saturation"                            |
| `colorPicker.brightness`         | "Brightness"                            |
| `colorPicker.hue`                | "Hue"                                   |
| `colorPicker.alpha`              | "Transparency"                          |
| `colorPicker.hex`                | "Hex"                                   |
| `colorPicker.eyedropper`         | "Pick color from screen"                 |
| `colorPicker.presets`            | "Color presets"                          |
| `colorPicker.contrast`           | "Contrast ratio {{ratio}}:1 — {{level}}"  |
| `colorPicker.contrastPass`       | "passes"                                |
| `colorPicker.contrastFail`       | "fails"                                 |

Bundles en / he / ar.

---

## RTL

- Saturation gradients are direction-agnostic (saturation grows left-to-right *visually* — in RTL we **don't** flip, since the conventional color-picker mental model is universal; X-axis is saturation, not text reading direction).
- Hue / Alpha sliders use `<Slider />` which handles RTL natively for the **value** semantics; the visual gradient direction stays canonical (low hue on left).
- Picker popover anchored via Popover (Phase 18) which already handles RTL positioning.

Documenting in MDX: "Color pickers are visual instruments — saturation increases rightward regardless of document direction."

---

## Performance

- Color math is sub-microsecond per call.
- Saturation square uses a single `requestAnimationFrame`-throttled pointermove handler.
- Bundle target: **< 7 KB gz** (excluding Popover + Slider which are pulled by reference).

---

## Testing

- Parse + format: comprehensive truth table over hex / rgb / hsl with + without alpha.
- HSV ↔ RGB conversions round-trip cleanly within ε for all 6 vertices + midpoints.
- Saturation square pointer interaction updates color.
- Saturation square keyboard interaction updates color.
- Hue / Alpha slider drag + keyboard.
- Hex input accepts both `#abc` and `#aabbcc`; rejects invalid.
- RGB input clamps 0..255; HSL clamps 0..360 / 0..100.
- Presets click sets value + (if `closeOnSelect`) closes popover.
- Eyedropper: jsdom mock of `window.EyeDropper`; button hidden when API missing.
- Contrast chip updates as color changes; tests cover AA / AAA / fail thresholds.
- `format="hex"` / `"rgb"` / `"hsl"` produce correct output strings.
- Form integration: `name` produces hidden input; `required` blocks form submit when empty.
- axe-core: 0 violations in all modes (picker open / closed / presetsOnly / triggerVariant=input).
- RTL snapshot.

---

## Acceptance Criteria

- [ ] `<ColorPicker>`, `<ColorSwatch>`, `<ColorInput>` exported.
- [ ] Pure `_shared/color.ts` covers hex / rgb / hsl + WCAG contrast.
- [ ] Saturation square 2D pointer + keyboard interaction works.
- [ ] Hue + Alpha sliders reuse `<Slider />`.
- [ ] Hex / RGB / HSL tabbed text input works with validation + clamping.
- [ ] Presets grid with keyboard navigation.
- [ ] Eyedropper opt-in + gated on API availability.
- [ ] Contrast check opt-in + accurate against `contrastAgainst`.
- [ ] Form integration via `useFormFieldA11y` + hidden input.
- [ ] i18n bundle en / he / ar.
- [ ] axe-core: 0 violations.
- [ ] Bundle < 7 KB gz (picker), < 0.5 KB (Swatch), < 1 KB (Input).

---

## DRY Self-Check

- [ ] Reuses Popover, Slider, Input, Checkbox-style focus rings, `useFormFieldA11y`, `useControllableState`.
- [ ] No external color library — `_shared/color.ts` is ~100 LoC pure.
- [ ] No external date library; no animation library.
- [ ] WCAG contrast formula not duplicated elsewhere — promote to engine if Toast / Alert reuse.
- [ ] Saturation square keyboard handler stays component-local.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/47-color-picker.md`.
2. Outcome notes: bundle delta, perf measurements on pointer interaction, decision on promoting `_shared/color.ts` → `@apx-dsine/color` if Theme Studio (Phase 5.6 — already shipped) and ColorPicker share enough.
3. Document the three canonical patterns: "brand color customization", "label color picker", "theme studio integration".

---

## Outcome notes

### What shipped

- `<ColorPicker />`, `<ColorSwatch />`, `<ColorInput />` exported from `apx-ds
- Pure `_shared/color.ts` covers hex (3/4/6/8 digit) / rgb() / rgba() / hsl() / hsla() parsing, formatting in all three formats, HSV ↔ RGB ↔ HSL conversions with round-trip stability, sRGB-linearized relative luminance, WCAG 2.x contrast ratio, and `wcagLevel` classification (AAA / AA / fail per text size).
- Saturation/value square as a single `role="slider"` with `aria-valuetext` describing both axes; pointer capture; full keyboard (Arrow ±1%, Shift+Arrow ±10%, Home/End for saturation, PageUp/PageDown for value).
- Hue + alpha sliders are a small custom `GradientSlider` rather than reusing `<Slider />` directly — Slider's track background is locked to `bg-bg-subtle` via its recipe, which would mask the gradients. `GradientSlider` keeps the W3C Slider pattern (Arrow ±step, Shift+Arrow ±pageStep, Home/End, PageUp/Down) and RTL arrow flipping; ~80 LoC.
- Hex / RGB / HSL tabbed input with Enter to commit, Esc to revert, channel clamping (`r/g/b ∈ [0, 255]`, `h ∈ [0, 360)`, `s/l ∈ [0, 100]`, `a ∈ [0, 100]`).
- Presets grid as `role="listbox"` with arrow-key + Home/End focus movement, Enter/Space to select; `closeOnSelect` only fires inside `presetsOnly`.
- Eyedropper gated on `window.EyeDropper` via a `useEffect` so SSR + first client render agree on visibility.
- Contrast chip recolors via the recipe's `level` variant; announces ratio + level via `aria-label` so colorblind users still hear pass/fail.
- i18n bundles for `en` / `he` / `ar`; `useColorPickerTranslations` follows the same three-layer precedence the DataGrid + Scheduler hooks use (props → provider → English).

### Decisions

- **Picker inside Popover, not inline.** Matches Date / Combobox conventions; the picker is heavy real-estate.
- **`format="auto"` preserves the incoming format.** Hex stays hex, rgb stays rgb, hsl stays hsl. The detection lives in `_shared/color.ts:detectFormat`.
- **HSVA is the internal model.** Picker math (saturation square interaction, hue isolation) is cleaner in HSV. RGBA is the I/O boundary; HSL is exposed at the user-facing input only.
- **Saturation hue preservation on greyscale.** When `s === 0`, the picker keeps the previous hue intact rather than letting it snap to 0 — the cursor walking through the greyscale column stops surprising the user on the way back out.
- **Custom `GradientSlider` instead of overriding `<Slider />`.** Slider's track recipe paints `bg-bg-subtle`; overriding that from the outside would require new public APIs on Slider. A 80-line custom slider is the simpler trade; the W3C Slider pattern stays single-sourced via Slider for every other consumer.
- **Pure color math, no library.** `_shared/color.ts` is ~120 LoC; `tinycolor2` would be ~10 KB gz for the same surface.

### Bundle + perf

- `<ColorSwatch />` adds ≈ 0.4 KB gz (single recipe slot, no math).
- `<ColorInput />` adds ≈ 0.9 KB gz (one Field-like wrapper + parse/format).
- `<ColorPicker />` adds ≈ 6.3 KB gz including the saturation square, two gradient sliders, three format inputs, presets grid, eyedropper button, contrast chip, and English i18n bundle. Under the 7 KB target.
- Color math is sub-microsecond per call (parsed + formatted in a tight `for` loop over the 9 vertex colors averaged ~110 ns per call on M2 Pro under Vitest).

### Promotion candidates

- `_shared/color.ts` is the strongest promotion candidate seen so far. Theme Studio (Phase 5.6) already uses the engine's `parseHex`/`rgbToHsl`/`hslToRgb` helpers, but those are 6-digit hex only and don't carry alpha. If a third surface needs full color math (e.g. Toast / Alert wanting a contrast hint), lift this file to `@apx-dsine/color/full.ts` and keep the current 6-digit subset as the convenience layer.
- `GradientSlider` is intentionally **not** promoted. It's a workaround for Slider's locked track background; if Slider grows a `trackBackground` prop, this file disappears in favor of `<Slider />` again. Not worth lifting in its current form.

### Test coverage

- `__tests__/ColorPicker.color.test.ts` — 32 cases over `parseColor` / `formatColor` / `detectFormat` / round-trips / `contrastRatio` / `wcagLevel` / `rgbaEquals`.
- `__tests__/ColorPicker.test.tsx` — render variants, open/close, value commit through presets + hex input, format preservation + override, alpha gating, contrast chip data attributes, `<ColorSwatch />` + `<ColorInput />` smoke + interaction.
- `__tests__/ColorPicker.a11y.test.tsx` — 7 axe-core sweeps (default closed / open with alpha / presetsOnly / triggerVariant=input / label+helper / ColorSwatch / ColorInput). All pass with 0 violations.
- Full suite: 2699 / 2699 passing.

### Canonical patterns

1. **Brand color customization** — `<ColorPicker label="Brand color" name="brandColor" presets={brandPalette} enableContrastCheck contrastAgainst="#FFFFFF" />`. Theme Studio sets the brand swatch; the contrast chip warns when a chosen brand color is unreadable against white surfaces.
2. **Label color picker** — `<ColorPicker triggerVariant="swatch" presets={LABEL_COLORS} presetsOnly closeOnSelect />`. Used in DataGrid / Sidebar / Carousel labelling flows; chip-only trigger pairs with a small grid.
3. **Theme studio integration** — `<ColorInput value={tokens.primary.main} onChange={(next) => updateToken('primary.main', next)} format="hex" />` for the token row; `<ColorPicker />` as the visual picker behind a "Customize" button. The pair lets users type a hex code or drag the saturation square against the same single source of truth.