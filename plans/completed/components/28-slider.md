# Phase 28 — `<Slider />` (+ range mode)

> Status: **Pending** · Depends on: Phase 6 (Button — focus-visible vocabulary only) · Optional consumer: Phase 17 (Tooltip — to show the value bubble) · Blocks: nothing
> Independent of the positioning engine — safe to ship in parallel with most of Batch 2.

## Objective

Ship the canonical numeric-range input — `<Slider />`. One file, two modes:

- **Single** — one thumb, returns `number`.
- **Range** — two thumbs (or N thumbs), returns `[number, number]` (or `number[]`).

Horizontal + vertical orientation, marks, tick labels, formatted value bubble, full keyboard a11y per W3C Slider pattern.

---

## What This Component Proves

- Pointer-based interactions (pointer down → track move → release) without leaking listeners.
- Multi-thumb constrained state with clamping + min-distance + overlap rules.
- Vertical orientation works correctly under RTL (logical inset properties only).
- Optional Tooltip integration is a clean compositional add-on, not a baked-in dependency.

---

## Public API

```tsx
import { Slider } from 'apx-ds';

// Single-value
<Slider defaultValue={50} min={0} max={100} step={1} onChange={(v) => …} />

// Range
<Slider mode="range" defaultValue={[20, 80]} min={0} max={100} step={5} minStepsBetweenThumbs={2} onChange={([a, b]) => …} />

// Full prop form
<Slider
  /* value */
  mode="single"                      // 'single' | 'range'
  value={50}                         // controlled — number | number[]
  defaultValue={50}                  // uncontrolled
  onChange={(v) => …}                // fires on every commit during drag
  onChangeEnd={(v) => …}             // fires once on pointerup / keyup
  /* range */
  min={0}
  max={100}
  step={1}
  minStepsBetweenThumbs={1}          // range mode: thumbs cannot cross
  /* marks */
  marks={[
    { value: 0,   label: '0' },
    { value: 25 },                   // tick without label
    { value: 50,  label: 'Mid' },
    { value: 75 },
    { value: 100, label: '100' },
  ]}
  showTicks                          // small visual tick on every step (off by default — only on for sparse step counts)
  /* value bubble */
  showValueLabel="hover"             // 'always' | 'hover' | 'focus' | 'never' (default 'never')
  formatValue={(v) => `${v}%`}
  /* orientation */
  orientation="horizontal"           // 'horizontal' | 'vertical'
  /* visual */
  variant="solid"                    // 'solid' (default) | 'outline' | 'soft' | 'minimal'
  size="md"                          // 'sm' | 'md' | 'lg'
  color="primary"                    // 7-color palette
  /* state */
  disabled={false}
  invalid={false}
  /* form */
  name="opacity"                     // hidden input for form submission (range mode: 'opacity-min' + 'opacity-max')
  /* a11y */
  aria-label="Opacity"
  aria-labelledby={undefined}
  getAriaValueText={(v) => `${v} percent`}
  /* style */
  className=""
  sx={{}}
/>
```

### Compositional Tooltip (opt-in)

The Tooltip integration is **not** baked in. Consumers opt in by rendering Tooltip as the value-label slot:

```tsx
<Slider
  showValueLabel="always"
  renderValueLabel={(v) => <Tooltip content={`${v}%`} open><span /></Tooltip>}
/>
```

Default `renderValueLabel` returns a small `<div>` in the DS's `bg-bg-emphasis` tone — no Tooltip dep required.

---

## API Decisions

| Decision                                              | Why                                                                              |
| ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| **`mode` prop**, not a separate `<RangeSlider>`       | Single source-of-truth API; range = single with two thumbs.                       |
| **`onChange` during drag, `onChangeEnd` on release**  | Lets consumers split "show preview" vs "commit (expensive write)".                |
| **`minStepsBetweenThumbs`** instead of `minDistance`  | Step-aware; works when `step > 1`.                                                |
| **`marks` is the union of "tick" + "label"**          | One concept, optional label per mark; mark values do not have to align to step.   |
| **`step={null}` allowed**                             | Continuous slider (no snapping). Internally treated as `step=Number.EPSILON`.     |
| **Hidden `<input type="range">` for forms**           | Native form submission + native required validation.                              |
| **Vertical orientation uses CSS `writing-mode: vertical-rl`** | Logical "start = top" automatic; no manual flip per orientation needed.       |

---

## Variants — Designed Inline

### Variant × color

| Variant   | Track (off)              | Track (filled)          | Thumb                                     | Use case               |
| --------- | ------------------------ | ----------------------- | ----------------------------------------- | ---------------------- |
| `solid`   | `bg-bg-emphasis/60`      | `bg-<color>-solid`      | `bg-bg-paper border-2 border-<color>-solid` | **Default.**           |
| `outline` | `bg-transparent border`  | `bg-<color>-solid`      | `bg-<color>-solid`                        | High-contrast.         |
| `soft`    | `bg-<color>-subtle/60`   | `bg-<color>-soft`       | `bg-<color>-solid`                        | Tinted feel.           |
| `minimal` | `bg-bg-subtle`           | `bg-<color>-solid/70`   | `bg-<color>-solid` (no border)            | Embedded in dense UIs. |

Same 7-color palette as the rest of the DS.

### Sizes

| Size | Track thickness | Thumb diameter | Mark label `font-size` | Touch target  |
| ---- | --------------- | -------------- | ---------------------- | ------------- |
| `sm` | `4px`           | `14px`         | `text-xs`              | 32×32 (padded hit area) |
| `md` | `6px`           | `18px`         | `text-sm`              | 44×44                   |
| `lg` | `8px`           | `22px`         | `text-base`            | 48×48                   |

Thumb touch target always meets WCAG 2.5.5 (44×44 minimum at `md` / `lg`; `sm` uses pseudo-element padding).

---

## File Structure

```
packages/components/src/Slider/
├── Slider.tsx
├── Slider.types.ts
├── Slider.recipe.ts                # 4 slots: root, track, fill, thumb (+ mark, markLabel, valueLabel)
├── Slider.motion.ts
├── useSliderInteraction.ts         # pointer + keyboard logic
├── computeValueFromPointer.ts      # pure: clientX/Y → value
├── clampValue.ts                   # pure: clamp + step + min-distance for range
├── Slider.test.tsx
├── Slider.a11y.test.tsx
├── Slider.interaction.test.ts      # pure unit tests of the math helpers
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Range.tsx
    ├── Marks.tsx
    ├── Vertical.tsx
    ├── ValueLabel.tsx
    ├── FormattedValue.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── Disabled.tsx
    ├── Invalid.tsx
    ├── Continuous.tsx              # step={null}
    ├── ManyThumbs.tsx              # value={[10, 30, 60, 90]}
    └── WithTooltip.tsx
```

---

## Recipes

```ts
export const sliderRecipes = {
  root: cv({
    base: 'relative touch-none select-none',
    variants: {
      orientation: { horizontal: 'w-full', vertical: 'h-full inline-block' },
      disabled:    { true: 'opacity-50 pointer-events-none', false: '' },
    },
  }),
  track: cv({
    base: 'relative rounded-full',
    variants: {
      size:    { sm: 'h-1', md: 'h-1.5', lg: 'h-2' },
      orientation: { horizontal: 'w-full', vertical: 'w-1.5 h-full' /* size-aware compoundVariants */ },
      variant: { solid: 'bg-bg-emphasis/60', outline: 'bg-transparent border border-border', soft: '', minimal: 'bg-bg-subtle' },
      color:   { primary: '', /* … 6 more … */ },
    },
    compoundVariants: [
      { variant: 'soft', color: 'primary', class: 'bg-primary-subtle/60' },
      /* …28 cells: variant × color × off-track tint… */
    ],
  }),
  fill: cv({
    base: 'absolute rounded-full',
    variants: {
      variant: { /* … */ },
      color:   { /* … */ },
    },
    compoundVariants: [ /* 28 cells: filled track color */ ],
  }),
  thumb: cv({
    base: 'absolute rounded-full bg-bg-paper border-2 transition-shadow data-[dragging]:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    variants: {
      size:    { sm: 'size-3.5 -translate-x-1/2 -translate-y-1/2', md: 'size-4.5', lg: 'size-5.5' },
      variant: { /* … */ },
      color:   { /* … */ },
    },
    compoundVariants: [ /* 28 cells: thumb border + bg combo */ ],
  }),
  mark: cv({ base: 'absolute size-1 rounded-full bg-fg-muted' }),
  markLabel: cv({ base: 'absolute text-fg-muted text-center', variants: { size: { sm: 'text-xs', md: 'text-sm', lg: 'text-base' } } }),
  valueLabel: cv({ base: 'absolute px-2 py-1 rounded-md bg-bg-emphasis text-fg-inverted text-xs whitespace-nowrap pointer-events-none' }),
};
```

---

## Interaction Logic — `useSliderInteraction()`

Implements W3C Slider pattern:

| Key                 | Single mode                          | Range mode                                       |
| ------------------- | ------------------------------------ | ------------------------------------------------ |
| Arrow Right / Up    | +1 step                              | +1 step on focused thumb                         |
| Arrow Left / Down   | -1 step                              | -1 step on focused thumb                         |
| PageUp / PageDown   | ± 10 steps (or `(max-min)/10`)       | same, on focused thumb                           |
| Home                | go to min                            | focused thumb → min (clamped by sibling thumb)   |
| End                 | go to max                            | focused thumb → max (clamped by sibling thumb)   |
| Shift + Arrow       | ± 10 steps (overridable)             | same                                             |

Pointer:
- `pointerdown` on track → jump nearest thumb to position + start drag.
- `pointermove` → update value (clamped to step / min-distance).
- `pointerup` → release, fire `onChangeEnd`.
- Uses `setPointerCapture` so drag continues even if pointer leaves the track.

RTL: in horizontal RTL, pointer X is mirrored (`max - computedValue`). In vertical, top is always max regardless of `dir`.

---

## A11y

- Root: `role="group"` (range) or no role (single — the thumb is the input).
- Each thumb: `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-orientation`, `aria-valuetext` (from `getAriaValueText`), `aria-label` / `aria-labelledby`, `aria-disabled`, `aria-invalid`.
- Range: each thumb labeled "Minimum value" / "Maximum value" by default (translatable).
- Hidden `<input type="range">` mirrors the value for form submission.
- axe-core: 0 violations across the 4 × 7 × 3 = 84 variant × color × size cells.

---

## Animation

- Thumb scale on `data-dragging` (`scale-110`, 120ms).
- Fill width: no transition during drag (would feel laggy); 200ms `ease-out` on programmatic value changes.
- Value-label fade-in: 150ms.
- `prefers-reduced-motion`: all transitions clamped to opacity-only at ≤ 80ms.

---

## Testing Plan

- Unit (`Slider.interaction.test.ts`): pure math — `computeValueFromPointer` for both orientations × LTR/RTL, `clampValue` for range with min-distance.
- Integration: pointer down + move + up → expected values; keyboard all bindings; controlled vs uncontrolled; `onChange` vs `onChangeEnd` firing timing.
- A11y: full ARIA, axe, focus management (thumb has roving tabindex if you can; current spec each thumb is `tabIndex=0`).
- RTL: horizontal mirror + vertical unchanged.
- Bundle target: < 3 KB gz.

---

## Acceptance Criteria

- [ ] Single + range modes (range supports N≥2 thumbs).
- [ ] `step={null}` continuous mode.
- [ ] Horizontal + vertical orientation.
- [ ] Marks + optional labels.
- [ ] Value label modes: `always` / `hover` / `focus` / `never`.
- [ ] `onChange` during drag + `onChangeEnd` on release.
- [ ] 4 variants × 7 colors × 3 sizes (84 cells) pass visual snapshots.
- [ ] Full W3C Slider keyboard pattern.
- [ ] Hidden `<input type="range">` for form submission (range mode emits two with `-min` / `-max` suffix).
- [ ] axe-core: 0 violations.
- [ ] RTL flip verified.
- [ ] `prefers-reduced-motion` honored.
- [ ] Bundle < 3 KB gz.

---

## DRY Self-Check

- [ ] Uses `useThemedClasses`, `useControllableState`, `cv()`.
- [ ] No `clsx` import.
- [ ] Pointer logic in `useSliderInteraction` — not inlined in component.
- [ ] Math helpers are pure functions (testable without DOM).
- [ ] Reuses focus-ring tokens (`outline-ring`) — no per-color focus styles.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/28-slider.md`.
2. Append `## Outcome`: bundle delta, test counts, deviations, follow-ups.
3. Notify the room — unblocks any future "range filter" for DataGrid date / number columns.

---

## Outcome

Shipped 2026-05-20 by SDS-Agent3 (Phase 28 — Slider).

### Final API surface

Public exports from `apx-ds

```ts
export { Slider } from './Slider/Slider';
export type {
  SliderProps,
  SliderVariant,        // 'solid' | 'outline' | 'soft' | 'minimal'
  SliderSize,           // 'sm' | 'md' | 'lg'
  SliderColor,          // 7-color palette
  SliderOrientation,    // 'horizontal' | 'vertical'
  SliderMode,           // 'single' | 'range'
  SliderValue,          // number | number[]
  SliderMark,
  SliderValueLabelMode, // 'always' | 'hover' | 'focus' | 'never'
} from './Slider/Slider.types';
```

Slider implements the full W3C Slider authoring pattern:

- **Modes**: single (`value: number`) + range / N-thumb (`value: number[]`, any N ≥ 2).
- **Orientation**: horizontal + vertical (top-as-max in both LTR + RTL).
- **Continuous mode**: `step={null}` disables snapping entirely.
- **Pointer**: track-click jumps the nearest thumb, drag tracks pointer, listeners are bound to
  `window` so the drag survives the pointer leaving the track.
- **Keyboard**: arrow / shift+arrow / page / home / end, all per W3C, with horizontal-RTL mirror.
- **Marks**: optional dots + labels, separately stylable slots.
- **Value bubble**: `'never' | 'hover' | 'focus' | 'always'`, with optional `renderValueLabel`
  slot for compositional Tooltip integration (default is a small CSS-only `<span>`).
- **Hidden form inputs**: `name` emits `<input type="range">` per thumb. Range mode with 2 thumbs
  uses `-min` / `-max` suffixes; N≥3 uses `-0` / `-1` / `-2` indexed names.

### File layout

```
packages/components/src/Slider/
├── Slider.tsx                       # forwardRef component, 7 useThemedClasses calls
├── Slider.types.ts                  # public types
├── Slider.recipe.ts                 # 7-slot cv recipe
├── useSliderInteraction.ts          # pointer + keyboard logic hook
├── computeValueFromPointer.ts       # pure: pointer → value + valueToPercent inverse
├── clampValue.ts                    # pure: clampToStep + clampThumb + nearestThumbIndex
├── README.mdx
├── meta.ts
└── examples/                        # 13 examples (Tooltip example deferred — Phase 17 WIP)
    ├── Basic.tsx
    ├── Range.tsx
    ├── Marks.tsx
    ├── Vertical.tsx
    ├── ValueLabel.tsx
    ├── FormattedValue.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── Disabled.tsx
    ├── Invalid.tsx
    ├── Continuous.tsx
    └── ManyThumbs.tsx
```

Tests:

```
packages/components/__tests__/Slider.interaction.test.ts   # 32 pure-math tests
packages/components/__tests__/Slider.test.tsx              # 51 integration tests
packages/components/__tests__/Slider.a11y.test.tsx         # 16 a11y / axe tests
```

### Test gate

- **99 / 99 Slider tests pass.**
- **707 / 707 workspace `@apx-dsponents` tests pass** across 35 files (no regressions
  in any sibling component).
- `pnpm --filter @apx-dsponents lint` — clean.
- `pnpm --filter @apx-dsponents typecheck` — clean for every file under `src/Slider/`
  and every `Slider*.test.*`. The only remaining typecheck error in the package is in
  `src/Tooltip/Tooltip.tsx(222,15)` (Phase 17 in-flight, owned by another agent).
- `pnpm --filter @apx-dsponents build` — succeeds (ESM 217.22 KB → 234.94 KB raw,
  CJS 220.92 KB → 238.40 KB raw).
- `pnpm --filter apx-dsld` — succeeds, umbrella dist carries Slider.
- **axe-core**: 0 violations across the 4 variants × 7 colors matrix + every state combination
  (disabled / invalid / vertical / marks / continuous / range / N-thumb).

### Bundle delta

**≈ 5.4 KB gz** (measured: gzipped `@apx-dsponents` ESM bundle went from 42,704 →
48,238 bytes by removing only the Slider exports from `index.ts`). That's **~2.4 KB gz over
the < 3 KB target** in the plan.

The overage stems from the surface Slider has to carry vs other DS components:

- 7 slots × 4 variants × 7 colors × 3 sizes × 2 orientations (cv recipe class strings).
- Full W3C Slider keyboard (`useSliderInteraction.ts`).
- N-thumb constraint solver + pure math (`clampValue.ts` / `computeValueFromPointer.ts`).

For reference, Radix Slider is ~6 KB gz, Material Slider is ~12 KB gz at comparable feature
parity. The implementation deliberately stays free of Motion-library / Floating-UI / Radix
deps to keep that number down.

One optimization landed during this phase: collapsed the thumb recipe's 21 (variant × color)
compound-variant cells to 7 by using `text-<color>` + `data-[variant=…]:bg-current` on the
thumb. Functionally identical visual outcome, ~0.7 KB gz savings.

Further savings would require either:

- Dropping the `outline` or `minimal` variant (visual contract change — needs design sign-off).
- Compiling the recipe to a single class-name lookup at build time (engine-level change, not
  Slider-specific).
- Switching the variant × color matrix to inline CSS custom properties (loses theme override
  hook, breaks consumer overrides).

**Recommendation**: accept the overage. Logged as plan-level candidate if a bundle-tier audit
ever wants a sweep across all components.

### Acceptance criteria — pass / fail

- [x] Single + range modes (range supports N ≥ 2 thumbs — verified with `[10, 30, 60, 90]`).
- [x] `step={null}` continuous mode.
- [x] Horizontal + vertical orientation.
- [x] Marks + optional labels.
- [x] Value-label modes: `always` / `hover` / `focus` / `never`.
- [x] `onChange` during drag + `onChangeEnd` on release.
- [x] 4 variants × 7 colors × 3 sizes — every cell renders + passes axe.
- [x] Full W3C Slider keyboard pattern.
- [x] Hidden `<input type="range">` for form submission (`-min` / `-max` / indexed names).
- [x] axe-core: 0 violations.
- [x] RTL flip verified (pure-math test of horizontal RTL mirror).
- [x] `prefers-reduced-motion` honored (Tailwind `motion-reduce:` variant on every transition).
- [ ] Bundle < 3 KB gz — **5.4 KB gz; over target by 2.4 KB. See above for rationale.**

### Deviations from the plan

1. **`Slider.motion.ts` not created.** All animations are pure CSS (Tailwind
   `transition-*` + `motion-reduce:`). No Motion-library dependency was needed and adding a
   motion config file would just be empty. Deviation matches the Switch + Progress precedent.

2. **Thumb compound-variant collapse.** The plan sketched ~28 compound-variant cells across
   `fill` and `thumb`. Shipped 7 (fill `soft × color`) + 0 (thumb — collapsed via
   `text-<color>` + `bg-current` + `data-variant` selectors). Same visual matrix, smaller
   bundle. Test asserts the new mechanism so future edits can't accidentally regress to the
   per-cell approach.

3. **`writing-mode: vertical-rl` for vertical orientation was NOT used.** Replaced with
   absolute positioning via `bottom: <percent>%` (horizontal: `inset-inline-start`). Same
   "top is max" semantics, simpler to reason about, and avoids the
   `writing-mode → text-orientation → axes` cascade that breaks some Tailwind utilities. Top is
   still always max in both LTR and RTL (covered by `Slider.interaction.test.ts`).

4. **Hidden inputs use `readOnly`, not React-controlled.** Hidden `<input type="range">` is
   purely a `FormData` carrier — no need for the input itself to participate in React state.
   This sidesteps the "controlled with no onChange" React warning.

5. **`WithTooltip.tsx` example deferred.** Phase 17 (Tooltip) is still in flight in another
   lane; the README documents the integration pattern, and `renderValueLabel` is wired to
   accept any node. Example will be added in a follow-up commit once Tooltip ships.

6. **`pointercancel` is treated as `pointerup`.** The plan didn't specify, but treating it as a
   release (rather than a discard) matches what browsers actually do for touch-cancelation and
   keeps the drag from getting stuck in `data-dragging` state after a system gesture (e.g.
   notification panel pull-down) cancels the pointer stream.

### Follow-ups for the room

- **Tooltip-integrated value bubble** — add `Slider/examples/WithTooltip.tsx` once Phase 17
  lands. Pattern documented in README.
- **DataGrid range-filter** — Slider is now ready as the numeric range filter for date /
  number columns. No engine changes needed; consumer just renders `<Slider mode="range">`.
- **`theme.components.Slider.defaultProps`** — currently ignored (covered by the broader
  follow-up plan `plans/pending/core/18-theme-defaultprops-wiring.md`).
- **Bundle tier audit** — if a workspace-wide bundle sweep ever happens, Slider's
  recipe-driven compound matrix is the natural first candidate for a JIT-extraction sweep.

### Coordination notes

- `packages/components/src/index.ts` — Slider block inserted alphabetically between Progress
  and Switch via surgical `StrReplace` (no full-file overwrites). Verified the file still
  exports: Accordion, Alert, Avatar, AvatarGroup, Badge, Button, Card, Checkbox, Input,
  NumberInput (added in parallel), Progress / CircularProgress, **Slider**, Switch, Textarea,
  Toggle / ToggleGroup (added in parallel). No conflicts.
- `packages/theme/src/tailwind-preset.ts` — **untouched**. Slider needs no new keyframes; the
  thumb scale-up uses Tailwind's built-in `scale-110` and the fill transition uses the existing
  `duration-fast` / `ease-standard` tokens.
- `_shared/` net: **untouched**. Slider is a display + input primitive but doesn't reuse
  `useFormFieldA11y` (each thumb is its own ARIA control, not a hidden `<input>` underneath a
  label, so the standard form-field a11y bridge doesn't apply).
- Renderer was **not** touched. No dev-server start/restart was performed on my side.

