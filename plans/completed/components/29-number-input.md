# Phase 29 — `<NumberInput />`

> Status: **Pending** · Depends on: Phase 7 (Input — `controlBase` + `controlRecipe` + `useFormFieldA11y`) · Blocks: nothing
> Independent of the positioning engine.

## Objective

Ship the canonical numeric form control — `<NumberInput />`. A drop-in replacement for `<Input type="number">` that fixes its long list of UX defects:

- Native `<input type="number">` accepts arbitrary scientific notation (`1e5`), silently rejects bad input on blur, lacks formatting (no thousand separators), and renders ugly browser-vendored spinners.
- `<NumberInput />` ships **typed value** (`number | null`), **formatted display** (locale-aware), **step controls** (mouse + keyboard + scroll wheel opt-in), **clamping** (min/max), **precision** rounding, and full a11y.

---

## What This Component Proves

- The Input infrastructure (`controlBase`, `controlRecipe`, `useFormFieldA11y`, hidden-input pattern from Checkbox) scales to a "display-and-value-diverge" pattern.
- Locale-aware number formatting via `Intl.NumberFormat` works in concert with parsing.
- Mouse-hold + keyboard repeat-rate work without jank.

---

## Public API

```tsx
import { NumberInput } from 'apx-ds';

// Basic
<NumberInput defaultValue={42} min={0} max={100} step={1} onChange={(n) => …} />

// Currency
<NumberInput
  value={amount}
  onChange={setAmount}
  min={0}
  max={1_000_000}
  step={0.01}
  precision={2}
  format={{ style: 'currency', currency: 'USD' }}
  locale="en-US"
/>

// Full prop form
<NumberInput
  /* value */
  value={42}                         // number | null (controlled)
  defaultValue={42}                  // uncontrolled
  onChange={(n: number | null) => …} // null when input cleared
  onChangeEnd={(n: number | null) => …} // fires on blur / Enter / commit
  /* range */
  min={0}
  max={100}
  step={1}
  largeStep={10}                     // Shift+Arrow / Shift+wheel
  precision={2}                      // decimal places (rounded on commit)
  clampOnBlur={true}                 // (default) snap out-of-range values into range
  allowNegative={true}
  allowDecimals={true}
  /* formatting */
  locale="en-US"                     // any BCP-47
  format={{ style: 'decimal' }}      // Intl.NumberFormatOptions — controls display
  parse={(s) => parseFloat(s)}       // optional custom parser; default is locale-aware
  /* controls */
  hideStepperButtons={false}         // hide the +/− buttons
  enableScrollWheel={false}          // wheel-to-change (off by default — opt-in, focused only)
  stepperPosition="end"              // 'start' | 'end' | 'split' (split = − on start, + on end)
  /* visual */
  variant="outline"                  // 'outline' | 'filled' | 'underline' (inherited from Input)
  size="md"                          // 'sm' | 'md' | 'lg'
  color="primary"                    // 7-color palette
  /* state */
  disabled={false}
  invalid={false}
  readOnly={false}
  /* a11y */
  label="Quantity"
  hint="Pick a number between 0 and 100"
  errorMessage="Required"
  /* form */
  name="quantity"
  required
  /* misc */
  className=""
  sx={{}}
/>
```

---

## API Decisions

| Decision                                                | Why                                                                                       |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **`value: number \| null`** (not string)                | Component owns the type. `null` = empty input. Consumers never deal with `'42'` strings.  |
| **Always renders `<input type="text">` under the hood** | Native `type=number` has too many UX defects (scroll-changes-value, locale-broken parsing). |
| **Hidden `<input type="hidden">` with numeric value**   | Form submission gets the canonical numeric string (no thousands separator), regardless of display. |
| **`format` is `Intl.NumberFormatOptions` directly**     | No proprietary format DSL — use the platform.                                              |
| **`parse` defaults to locale-aware**                    | Handles `1,234.56` (en-US) vs `1.234,56` (de-DE) vs `١٬٢٣٤٫٥٦` (ar) automatically.        |
| **`precision` is decimal-places, not significant figures** | Matches how money is specified; significant-figures is a niche we don't need in v1.    |
| **`clampOnBlur` defaults `true`**                       | Users who type `999` in a 0–100 field expect snap-to-max, not silent rejection.          |
| **Scroll-wheel is opt-in**                              | Surprise behavior; matches modern UX guidance.                                            |
| **`stepperPosition="split"`** as a third option         | Common for "spinbutton" feel in financial UIs.                                            |

---

## Variants

Inherits Input's `variant` × `size` × `color` from Phase 7's `controlBase` / `controlRecipe` — **no new recipe slots beyond stepper buttons**. The `+` / `−` buttons are `<button>` elements styled via a local `stepperButtonRecipe` (3 sizes × 4 variants × 7 colors, but the variants here are tinted *consistent with the parent input variant*).

| Stepper layout    | Layout                                                       | Notes                                |
| ----------------- | ------------------------------------------------------------ | ------------------------------------ |
| `'end'`           | Vertical stacked `+` (top) / `−` (bottom) on logical end     | **Default.** Compact.                |
| `'start'`         | Same stacked layout on logical start                         | RTL-friendly when number is leading. |
| `'split'`         | Single `−` button on logical start, single `+` on logical end | Spinbutton style.                    |

All button positions use logical inset properties — RTL flips automatically.

---

## File Structure

```
packages/components/src/NumberInput/
├── NumberInput.tsx
├── NumberInput.types.ts
├── NumberInput.recipe.ts            # stepperButton slot only — root/input reused from Input
├── useNumberInputState.ts           # parse + format + clamp + step
├── useStepperHold.ts                # mouse-hold repeat-rate (accelerating)
├── parseLocalizedNumber.ts          # pure: locale-aware parser
├── formatNumber.ts                  # pure: thin Intl.NumberFormat wrapper with caching
├── clampToRange.ts                  # pure
├── NumberInput.test.tsx
├── NumberInput.a11y.test.tsx
├── NumberInput.parse.test.ts        # locale parse round-trips for en-US, de-DE, ar-EG, he-IL
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Range.tsx
    ├── Step.tsx                     # step + largeStep
    ├── Currency.tsx                 # format: { style: 'currency' }
    ├── Percentage.tsx               # format: { style: 'percent' }
    ├── Precision.tsx
    ├── LocaleDe.tsx                 # de-DE display (1.234,56)
    ├── LocaleAr.tsx                 # ar-EG with Arabic-Indic digits
    ├── ScrollWheel.tsx
    ├── StepperPositions.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── HiddenSteppers.tsx
    ├── Disabled.tsx
    ├── Invalid.tsx
    ├── WithLabel.tsx
    └── FormSubmission.tsx
```

---

## Parsing & Formatting

```ts
// parseLocalizedNumber.ts (excerpt)
export function parseLocalizedNumber(input: string, locale: string): number | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;

  // Probe formatter to discover the locale's decimal + group separators
  const probe = new Intl.NumberFormat(locale).formatToParts(12345.6);
  const groupSep = probe.find((p) => p.type === 'group')?.value ?? ',';
  const decimalSep = probe.find((p) => p.type === 'decimal')?.value ?? '.';

  // Normalize Arabic-Indic / Persian digits to ASCII
  const normalized = trimmed
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .split(groupSep).join('')
    .replace(decimalSep, '.');

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
```

The formatter caches `Intl.NumberFormat` instances by `(locale, JSON.stringify(options))` since instantiating is non-trivial cost on hot keystrokes.

---

## Interaction Logic

Two layers of state:

- `displayValue: string` — what the user sees + types into.
- `committedValue: number | null` — the canonical value emitted via `onChange`.

Display ≠ value during typing (e.g. typing `1` mid-edit shouldn't apply currency formatting). Display is re-formatted on `blur` / `Enter` / programmatic value change.

### Stepper buttons

- Click: `value += step` (clamped).
- Mouse-down hold: `useStepperHold` triggers an accelerating repeat (300ms initial delay, then 60/min ramping to 240/min over 2s). Releases on `mouseup` / `mouseleave` / `pointercancel`.
- Touch: same `useStepperHold` via pointer events.

### Keyboard

| Key             | Action                              |
| --------------- | ----------------------------------- |
| Arrow Up        | `value += step`                     |
| Arrow Down      | `value -= step`                     |
| Shift + Arrow   | `value ± largeStep` (default `step * 10`) |
| PageUp / PageDown | `value ± largeStep`               |
| Home            | `value = min` (if `min` defined)    |
| End             | `value = max` (if `max` defined)    |
| Enter           | Commit + format display             |
| Esc             | Revert to last committed value      |

### Scroll wheel (opt-in)

Only when `enableScrollWheel={true}` **and** the input is focused. Wheel-up = `+step`, wheel-down = `-step`. `preventDefault` on the wheel event to stop page scroll.

---

## A11y

- Input has `role="spinbutton"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext` (formatted), `aria-invalid`, `aria-required`.
- Stepper buttons have `aria-label="Increment"` / `"Decrement"` (translatable), `tabIndex={-1}` (skip in tab order — keyboard users use arrow keys on the input itself).
- `useFormFieldA11y` consumed read-only (kebab `aria-describedby`) — hint + error wired automatically.
- axe-core: 0 violations.

---

## Testing

- Pure: locale parse round-trips for en-US / de-DE / ar-EG / he-IL / fr-FR (`NumberInput.parse.test.ts`).
- Integration: type / blur / Enter / Esc; stepper click + hold + accelerate; clamp; precision; null state.
- A11y: spinbutton ARIA, axe, focus.
- Bundle target: < 3.5 KB gz (excluding `Intl` which is platform).

---

## Acceptance Criteria

- [ ] Value type is `number | null` end-to-end.
- [ ] Locale-aware formatting via `Intl.NumberFormat` with cached instances.
- [ ] Locale-aware parsing including Arabic-Indic / Persian digits.
- [ ] Step + largeStep + Shift modifier.
- [ ] Stepper buttons with mouse-hold accelerating repeat.
- [ ] Three stepper positions: `start` / `end` / `split` (RTL-flipping).
- [ ] Scroll-wheel opt-in.
- [ ] Clamp-on-blur (defaults on, opt-out).
- [ ] Precision rounding on commit.
- [ ] Hidden `<input type="hidden">` for form submission with canonical (un-formatted) value.
- [ ] Inherits Input's variant × size × color recipes — no new visual surface.
- [ ] `useFormFieldA11y` integration; hint + error work.
- [ ] axe-core: 0 violations.
- [ ] RTL: stepper positions flip correctly.
- [ ] Bundle < 3.5 KB gz.

---

## DRY Self-Check

- [ ] Reuses `controlBase` + `controlRecipe` + `inputRecipe` from Input (no new recipe for the field itself).
- [ ] Reuses `useFormFieldA11y` read-only.
- [ ] `_shared/controlRecipe.ts` untouched.
- [ ] No `clsx` import.
- [ ] Number helpers (`parseLocalizedNumber`, `formatNumber`, `clampToRange`) are pure — tested without DOM.
- [ ] `useStepperHold` is reusable (future Spinner / Quantity-stepper components can consume it).

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/29-number-input.md`.
2. Append `## Outcome`: bundle delta, locale-parse round-trip coverage, deviations.

---

## Outcome

**Status: Shipped 2026-05-20** by SDS-Agent5.

### What landed

- `packages/components/src/NumberInput/` — full numeric form control built on top of the shipped Input infrastructure:
  - `NumberInput.tsx` — root component. `role="spinbutton"` over a text-mode `<input>`, full ARIA value triad (`aria-valuemin` / `aria-valuemax` / `aria-valuenow` / `aria-valuetext`), `useFormFieldA11y` wired identically to Input, dev-only `NUMBER_INPUT_NO_LABEL` warning.
  - `NumberInput.types.ts` — discriminated `value: number | null` API. Re-exports `InputVariant` / `InputSize` / `InputColor` so the visual axes literally are Input's.
  - `NumberInput.recipe.ts` — two **new** recipes (`stepperGroupRecipe` + `stepperButtonRecipe`) for the +/− controls. **Zero** new input-frame recipe — the wrapper consumes `inputRecipe` + `inputInnerRecipe` from Input untouched.
  - `parseLocalizedNumber.ts` — pure locale-aware parser. Probes `Intl.NumberFormat.formatToParts` for the active locale's group + decimal separators, normalizes Arabic-Indic (`\u0660`–`\u0669`) and Persian (`\u06F0`–`\u06F9`) digits to ASCII, rejects scientific notation deliberately, normalizes non-ASCII minus signs.
  - `formatNumber.ts` — cached `Intl.NumberFormat` wrapper (per `(locale, JSON.stringify(options))`). `__resetFormatterCache()` exported for tests.
  - `clampToRange.ts` — pure `clampToRange` + `roundToPrecision`. Reusable by future Slider / NumberRange.
  - `useStepperHold.ts` — generic press-and-hold hook with an accelerating repeat (350 ms initial delay → 120 ms tick → ramps to 40 ms floor via `× 0.85` per tick). Captures the pointer so a hold survives drift off the button. Stays NumberInput-local until a second consumer arrives.
- Public API: typed `value: number | null`, controlled + uncontrolled, locale-aware formatting + parsing, `step` + `largeStep` + `precision` + `clampOnBlur` + `allowNegative` + `allowDecimals`, three `stepperPosition` modes (`end` / `start` / `split`), opt-in scroll wheel, hidden `<input type="hidden">` for HTML form submission.
- Keyboard: ArrowUp/Down (step), Shift+Arrow / PageUp / PageDown (largeStep), Home / End (min / max), Enter (commit), Esc (revert). Stepper buttons are `tabIndex={-1}` — keyboard users operate on the input itself; pointer-only users get the buttons.
- `name` prop renders a hidden input carrying the canonical numeric string (`1234.56` for a `$1,234.56` USD display) so form submissions never have to deal with locale glyphs.

### QA gate

- **Tests: 65/65 new ✅** (`NumberInput.test.tsx` 33 + `NumberInput.parse.test.ts` 24 + `NumberInput.a11y.test.tsx` 8). Full components suite: 566/568 pass — the 2 failures are in `__tests__/ToggleGroup.test.tsx` (SDS-Agent4's in-flight Phase 30 WIP, not introduced by this phase).
- **Locale parse round-trips covered**: `en-US`, `de-DE`, `ar-EG` (Arabic-Indic digits), `fr-FR` (narrow-no-break-space group separator), `he-IL`. All round-trip through `Intl.NumberFormat.format` → `parseLocalizedNumber` cleanly.
- **Typecheck ✅** for `src/NumberInput/**` + tests. Pre-existing Accordion/Progress/Toggle WIP errors in sibling agents' code are not introduced here.
- **Lint ✅** for `src/NumberInput/**` + `__tests__/NumberInput*.{ts,tsx}`.
- **axe-core ✅** across the default render, the min/max/invalid + paired-label case, all three `stepperPosition` modes, `hideStepperButtons`, and `disabled` + `readOnly`.
- **Build ✅** — `@apx-dsponents` + `apx-apx-dsboth carry `NumberInput`.

### Bundle delta

- Measured back-to-back with esbuild minify + level-9 gzip, externalizing peers (`react`, `react-dom`, `@apx-dsine`, `@apx-apx-ds `motion`, `motion/react`, `lucide-react`):
  - Input-only baseline: 8993 bytes raw / 2707 bytes gz.
  - Input + NumberInput: 19992 bytes raw / 5821 bytes gz.
  - **Delta: +3114 bytes gz / +10999 bytes raw → ~3.04 KB gz**. Comfortably under the < 3.5 KB gz target from the plan.

### Deviations from the plan

1. **Hidden submission input rendered inline** — the plan envisioned a `<input type="hidden">` sibling. Implementation places the hidden input inside the wrapper `<div>` so a wrapping `<form>` still picks it up via descendant FormData walking. Functionally identical, doesn't require a portal.
2. **Wheel handler runs only when the input is the active element** — the plan called for "focused only". Used `document.activeElement === event.currentTarget` to match exactly (some platforms emit wheel events to the focused element's wrapper, which would have triggered surprise value-changes on hover).
3. **Stepper-button focus styling is local rather than via `_shared`** — the plan implied possibly factoring the stepper button into `_shared/`. Kept local per the DS rule "extract on the second consumer" — there isn't a second yet. `useStepperHold` is similarly local for the same reason.
4. **`largeStep` default = `step * 10`** (as planned) but is treated as a pure number, not as an explicit `keyof Largestep` enum. Lets consumers pass a real `largeStep={5}` for non-base-10 contexts (e.g. clock hours).
5. **Inline glyph SVGs** instead of `lucide-react` — same approach Avatar took for its user icon. Saves a `lucide-react` import and keeps NumberInput tree-shakable down to just the parts the consumer actually uses.
6. **Dev-only `NUMBER_INPUT_NO_LABEL` warning** — mirrors Input's `INPUT_NO_LABEL`. Not explicitly in the plan but the natural twin and zero bundle cost (warn-cached).

### Coordination notes for downstream

- **`packages/components/src/index.ts`**: NumberInput block inserted alphabetically between `Input` and `Progress` via surgical `StrReplace`. The file now contains: Alert, Avatar, Badge, Button, Card, Checkbox, Input, **NumberInput**, Progress + CircularProgress, Switch, Textarea.
- **No `_shared/` writes**. NumberInput is a single-component overlay on top of Input's already-shared `controlBase` + `variantColorMatrix` + `useFormFieldA11y`.
- **Future Spinner / Quantity-stepper / Slider**: consume `useStepperHold` directly. The hook's `step()` callback is generic — works for any "press and hold to repeat" UX. When a second consumer lands, promote to `_shared/useStepperHold.ts`.
- **Future DatePicker / FileSize / Duration formatters**: copy the `formatNumber.ts` caching pattern (key = `(locale, JSON.stringify(options))`). The cost of instantiating `Intl.*` formatters is real on hot keystroke paths; the cache pays for itself by the second character.
- **`parseLocalizedNumber`** is exported from `./NumberInput` (as a re-export) for consumers who want to parse user input without mounting the component. Future DataGrid filter parsers will lean on it.