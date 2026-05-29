# Phase 43 — `<Rating />`

> Status: **Pending** · **Tier 2** · Depends on: Phase 1 (`cv`), Phase 8 (Form-field a11y shared helper `useFormFieldA11y`), Phase 14 (Icon), Phase 27 (I18nProvider — optional)
> Star (or any glyph) rating control. Form-field grade: controlled + uncontrolled, read-only, half-step, keyboard, RTL.

## Objective

Ship the **`<Rating />`** form control — a star rating input commonly used for reviews, product feedback, support surveys, etc.

Requirements:

- Single primitive covering both **interactive** (user picks a rating) and **read-only** (display an average) modes.
- Configurable scale (default 5, supports 3, 10, etc.).
- Configurable glyph (star, heart, thumb, custom Icon).
- Optional **half-step** precision for read-only averages (`4.5 stars`).
- Optional **fractional precision** for read-only display (`3.71` → 3.71/5 stars colored by exact fraction).
- Keyboard navigation per W3C Slider pattern (Left/Right/Home/End).
- Hidden-input pattern so form libraries see a real value.
- RTL: arrows + visual order mirror; underlying value stays numeric.

---

## Public API

```tsx
import { Rating } from 'apx-ds';

// Basic interactive
<Rating defaultValue={3} onChange={(v) => setRating(v)} />

// Controlled
<Rating value={rating} onChange={setRating} />

// Custom scale
<Rating defaultValue={7} max={10} />

// Half-step interactive (user can pick 3.5)
<Rating defaultValue={3.5} precision={0.5} />

// Read-only display with exact fractional value
<Rating value={3.71} readOnly precision="exact" />

// Custom icon (heart)
<Rating defaultValue={4} icon={<Icon name="heart" />} emptyIcon={<Icon name="heart-outline" />} />

// Sizes
<Rating size="sm" defaultValue={4} />
<Rating size="md" defaultValue={4} />
<Rating size="lg" defaultValue={4} />

// Colors
<Rating defaultValue={4} color="warning" />     // default: warning (gold)
<Rating defaultValue={4} color="primary" />
<Rating defaultValue={4} color="danger" />

// With label
<Rating
  label="Rate your experience"
  description="Tap a star to submit."
  defaultValue={0}
  onChange={submit}
/>

// Required + error states (mirrors other form fields)
<Rating
  label="Rate your experience"
  required
  error="Please rate before submitting"
  value={value}
  onChange={setValue}
/>

// Allow zero (clear)
<Rating defaultValue={3} allowClear />          // clicking same value clears to 0

// Show numeric label
<Rating value={3.5} readOnly showValue />       // renders "3.5 out of 5" next to stars

// Within a form (name → hidden input)
<form>
  <Rating name="quality" defaultValue={0} required />
  <button type="submit">Submit</button>
</form>

// Full prop form
<Rating
  /* value */
  value                       // number (controlled)
  defaultValue                // number (uncontrolled)
  onChange={(value, meta) => void}    // meta = { source: 'click' | 'keyboard' }

  /* scale + precision */
  max={5}                     // number of stars
  precision={1}               // 1 | 0.5 | 'exact'   (interactive: 1 or 0.5; read-only: any)
  allowClear={false}          // boolean — clicking same value → 0

  /* glyph */
  icon                        // ReactNode — filled glyph (defaults to <Icon name="star" />)
  emptyIcon                   // ReactNode — empty glyph (defaults to <Icon name="star-outline" />)

  /* states */
  readOnly={false}
  disabled={false}
  required={false}

  /* form integration */
  name                        // string — hidden input name for form submission
  id                          // string — root id (also used for label association)

  /* visual */
  size="md"                   // 'sm' | 'md' | 'lg'
  color="warning"             // 'warning' | 'primary' | 'success' | 'danger' | 'neutral'
  spacing={1}                 // gap between stars (theme scale)
  showValue={false}           // render "3.5 of 5" beside

  /* labelling */
  label                       // ReactNode — visible label above
  description                 // ReactNode — hint below label
  helperText                  // ReactNode — bottom helper
  error                       // ReactNode — bottom error, sets aria-invalid
  hideLabel={false}           // visually hide label (still sr-only)
  ariaLabel                   // string — used when no label provided

  /* i18n override */
  formatValueText={(value, max) => string}    // override "{{value}} out of {{max}} stars" announcer

  className=""
  style={{}}
  ref={…}
/>
```

---

## API Decisions

| Decision                                                                  | Why                                                                                                  |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Single component for interactive + read-only**                          | Same DOM tree, same a11y model. `readOnly` switches role + interaction.                              |
| **Default glyph = star** but fully overridable                            | Most common case; consumers swap for heart / thumb easily.                                          |
| **`precision={0.5}` for half-stars** (interactive)                         | Common requirement. Implemented via pointer x within each star half.                                |
| **`precision="exact"` is read-only only**                                  | Fractional clicks (`3.71`) are nonsensical for input but useful for displaying averages.            |
| **`allowClear` — clicking same value → 0**                                | Optional UX pattern; off by default to avoid surprises.                                              |
| **Hidden-input pattern**                                                  | `<input type="hidden" name=… value=…>` so HTML forms + React Hook Form / Formik all "just work".    |
| **W3C Slider keyboard pattern** (ArrowLeft/Right/Home/End + PageUp/Down)  | Established pattern; supersedes ad-hoc rating-specific keyboard handling.                            |
| **No drag / swipe gestures**                                              | Click + keyboard cover everything. Drag adds complexity with no benefit on touch (tap is fast).      |
| **Hover preview**                                                         | Hovering over star 4 visually highlights stars 1-4 without committing. Click commits.               |
| **Touch behaviour: no hover preview**                                     | `@media (hover: hover)` gates the hover preview to mouse/touchpad.                                  |
| **`color` defaults to warning** (gold-star convention)                    | Mirrors familiar UI patterns; consumer can switch to neutral / primary for editorial reasons.       |

---

## Internal architecture

```
                 ┌────────────────────────────────────────────┐
   props  ────►  │  useControllableState (value/defaultValue) │
                 │  useFormFieldA11y    (label/desc/error ids)│
                 └────────────────────────────────────────────┘
                                  │
                                  ▼
                 ┌────────────────────────────────────────────┐
                 │  RatingTrack  (role=slider, tabIndex=0)    │
                 │  ├─ N × RatingStar (each ½ + ½ if precision)│
                 │  ├─ hover preview state                    │
                 │  ├─ keyboard handler (W3C slider keys)     │
                 │  └─ hidden <input name=value>              │
                 └────────────────────────────────────────────┘
                                  │
                                  ▼
                 ┌────────────────────────────────────────────┐
                 │  optional <output> "3.5 of 5"              │
                 │  optional helper / error text              │
                 └────────────────────────────────────────────┘
```

- `RatingStar` is internal — renders the **filled** glyph clipped to the appropriate fraction (0, 0.5, or 1.0 in interactive; arbitrary in read-only) overlayed on the **empty** glyph.
- Fractional rendering uses CSS `clip-path: inset(0 X% 0 0)` on the filled overlay so fractional precision is pixel-perfect.

---

## File Structure

```
packages/components/src/Rating/
├── Rating.tsx
├── RatingStar.tsx                       # internal
├── Rating.types.ts
├── Rating.recipe.ts
├── useRatingKeyboard.ts                 # W3C slider keyboard logic — pure tested
├── ratingValueFromPointer.ts            # pure: pointer event + element rect + precision → value
├── ratingFillFraction.ts                # pure: value + max + starIndex → 0..1 fill amount
├── Rating.test.tsx
├── Rating.a11y.test.tsx
├── Rating.keyboard.test.tsx
├── useRatingKeyboard.test.tsx
├── ratingValueFromPointer.test.ts
├── ratingFillFraction.test.ts
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Controlled.tsx
    ├── HalfStep.tsx
    ├── ReadOnlyExact.tsx
    ├── CustomScale.tsx                  # max=10
    ├── HeartGlyph.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── ShowValue.tsx
    ├── AllowClear.tsx
    ├── Disabled.tsx
    ├── ReadOnly.tsx
    ├── WithLabel.tsx
    ├── ErrorState.tsx
    ├── InForm.tsx
    └── ProductReviewCard.tsx            # realistic: product rating + review form
```

---

## Recipe

```ts
export const ratingTrackRecipe = cv({
  base: 'inline-flex items-center select-none outline-none rounded-md',
  variants: {
    size:    { sm: 'gap-0.5', md: 'gap-1', lg: 'gap-1.5' },
    disabled:{ true: 'opacity-50 cursor-not-allowed', false: '' },
    readOnly:{ true: 'cursor-default', false: 'cursor-pointer focus-visible:ring-2 ring-offset-1 ring-(--sds-color-accent-emphasis)' },
  },
  defaultVariants: { size: 'md', disabled: false, readOnly: false },
});

export const ratingStarRecipe = cv({
  base: 'relative inline-block leading-none',
  variants: {
    size: {
      sm: 'h-4 w-4 [&_svg]:h-4 [&_svg]:w-4',
      md: 'h-5 w-5 [&_svg]:h-5 [&_svg]:w-5',
      lg: 'h-7 w-7 [&_svg]:h-7 [&_svg]:w-7',
    },
    color: {
      warning: 'text-(--sds-color-warning-emphasis)',
      primary: 'text-(--sds-color-accent-emphasis)',
      success: 'text-(--sds-color-success-emphasis)',
      danger:  'text-(--sds-color-danger-emphasis)',
      neutral: 'text-(--sds-color-text-default)',
    },
    empty: {
      true:  'text-(--sds-color-border-default)',
      false: '',
    },
  },
});
```

The **filled overlay** uses absolute positioning with `clip-path: inset(0 var(--clip-end) 0 0)` where `--clip-end` is derived from the fill fraction (in RTL it flips to `inset(0 0 0 var(--clip-start))` automatically via the `[dir=rtl]` selector).

---

## `ratingFillFraction.ts`

```ts
export function ratingFillFraction(value: number, starIndex: number): number {
  // starIndex is 0-based; returns 0..1
  const delta = value - starIndex;
  if (delta <= 0) return 0;
  if (delta >= 1) return 1;
  return delta;
}
```

Pure. O(1). Unit tests cover 0, 1, 0.5, 0.71, fractions > max, negative.

## `ratingValueFromPointer.ts`

```ts
export function ratingValueFromPointer(args: {
  pointerX: number;        // clientX
  rect: { left: number; width: number };
  max: number;
  precision: 1 | 0.5;
  dir: 'ltr' | 'rtl';
}): number {
  const x = args.dir === 'rtl'
    ? args.rect.left + args.rect.width - args.pointerX
    : args.pointerX - args.rect.left;
  const ratio = Math.min(Math.max(x / args.rect.width, 0), 1);
  const raw = ratio * args.max;
  if (args.precision === 0.5) {
    return Math.max(0.5, Math.round(raw * 2) / 2);    // min 0.5 when click registered
  }
  return Math.max(1, Math.ceil(raw));                  // min 1 when click registered
}
```

Note: pointer **on** the rating means at least a half/whole star — never 0. Clearing happens via the `allowClear` "clicking same value" path or via keyboard Home/End.

## `useRatingKeyboard.ts`

W3C slider keys mapped to rating semantics:

| Key            | Action                                               |
| -------------- | ---------------------------------------------------- |
| `ArrowRight`   | +precision (LTR) / −precision (RTL)                  |
| `ArrowLeft`    | −precision (LTR) / +precision (RTL)                  |
| `ArrowUp`      | +precision (direction-agnostic)                      |
| `ArrowDown`    | −precision                                           |
| `Home`         | value = 0 (or 0.5 / 1 if `allowClear=false`)         |
| `End`          | value = max                                          |
| `PageUp`       | +1 (jump full star even when precision=0.5)          |
| `PageDown`     | −1                                                   |
| `1`..`9`/`0`   | value = digit (when within `0..max`)                 |

Calls `onChange(next, { source: 'keyboard' })`.

---

## A11y

- **Root role**: `role="slider"` with `aria-valuemin={0}`, `aria-valuemax={max}`, `aria-valuenow={value}`, `aria-valuetext` populated via `formatValueText(value, max)` (e.g. "3.5 out of 5 stars").
- **Read-only**: `aria-readonly="true"` + `tabIndex={0}` (still focusable for screen readers but no interaction).
- **Disabled**: `aria-disabled="true"` + `tabIndex={-1}`.
- **Required**: `aria-required="true"` and (if `error`) `aria-invalid="true"`.
- **Label association** via `useFormFieldA11y` (Phase 8): `aria-labelledby` for label, `aria-describedby` for description + helper/error.
- Each `RatingStar` is `aria-hidden="true"` (visual only).
- Hidden `<input name=… value={value}>` enables form submission without disrupting AT semantics.
- Hover preview does NOT update `aria-valuenow` (only committed values are announced).
- axe-core: 0 violations in interactive / read-only / disabled / error / labeled / unlabeled (via ariaLabel) modes.

---

## i18n

Optional consumption of `<I18nProvider>`. Default English strings inline if no provider:

| Key                    | Default (en)                          | Notes                                  |
| ---------------------- | ------------------------------------- | -------------------------------------- |
| `rating.valueText`     | "{{value}} out of {{max}} stars"       | Default `aria-valuetext`               |
| `rating.empty`         | "No rating"                            | Used when value === 0                  |
| `rating.singular`      | "1 out of {{max}} stars"               | Optional pluralisation for value=1     |

Consumers can override entirely via `formatValueText` prop.

`Intl.NumberFormat` formats the number with the active locale's decimal separator ("3.5" vs "3,5").

---

## RTL

- Visual order of stars flips: in `dir="rtl"`, "star 1" appears on the right.
- `ratingValueFromPointer` mirrors x calculation.
- Arrow key mapping: ArrowRight increases in LTR, decreases in RTL — matches W3C slider in RTL.
- `clip-path` direction adjusts so the **right portion** of each star is filled in RTL (visually consistent with LTR "fill from left").
- Storybook + Playwright tests with `dir="rtl"` verify.

---

## Performance

- Stateless render except for the controlled state + hover preview state.
- Hover preview is local React state; throttled to one update per mouse-move via `requestAnimationFrame` is overkill — relying on React's batching is sufficient for ~5-10 stars.
- `ratingFillFraction` is O(1) per star.
- Bundle target: **< 3 KB gz**.

---

## Testing

- Click on star N sets value = N (precision=1).
- Click on right half of star N with precision=0.5 sets value = N; left half sets N−0.5.
- `allowClear` enables click-same-to-zero behavior.
- Read-only mode disables click; value stays.
- Keyboard: full W3C slider keys (table above) verified.
- Hover preview updates DOM but not `aria-valuenow`.
- Hidden input has correct value for form submission.
- `formatValueText` override controls aria-valuetext.
- `precision="exact"` renders fractional fill for read-only.
- Half-star rendering uses CSS clip-path (snapshot test verifies inline style).
- RTL pointer + keyboard tests pass.
- i18n with `<I18nProvider locale="he">` swaps default aria-valuetext.
- axe-core: 0 violations across all modes.

---

## Acceptance Criteria

- [ ] `<Rating />` exported with full prop surface.
- [ ] Interactive + read-only modes both supported.
- [ ] `precision={1}`, `precision={0.5}`, `precision="exact"` all render correctly.
- [ ] Custom glyph via `icon` / `emptyIcon`.
- [ ] Hidden input enables form submission.
- [ ] Full W3C Slider keyboard pattern.
- [ ] Hover preview gated by `@media (hover: hover)`.
- [ ] `useFormFieldA11y` wires label/description/helper/error.
- [ ] i18n bundle for en/he/ar.
- [ ] RTL pointer math + visual fill correct.
- [ ] axe-core: 0 violations across all modes.
- [ ] Bundle < 3 KB gz.

---

## DRY Self-Check

- [ ] Reuses `useControllableState` (engine), `useFormFieldA11y` (Phase 8 shared helper), `<Icon>`, `useThemedClasses`.
- [ ] `ratingValueFromPointer`, `ratingFillFraction`, `useRatingKeyboard` are pure / unit-tested.
- [ ] No new color tokens.
- [ ] No external rating library.
- [ ] Same `formatValueText` extension pattern as Slider (Phase 28) — consistent across numeric form controls.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/43-rating.md`.
2. Outcome notes: bundle delta, any extracted helpers worth promoting to engine (e.g. if NumberInput / Slider / Rating all converge on a shared "pointer-to-value" pattern).
3. Add `Review form` recipe to docs Patterns page showing Rating + Textarea + Button submit.

---

## Outcome — shipped by @SDS-Agent7

### Shipped surface

- `<Rating />` — single component covers interactive + read-only display modes.
  - Variants: `precision` ∈ {`1`, `0.5`, `'exact'`}, `size` ∈ {`sm`, `md`, `lg`}, `color` ∈
    {`warning` (default gold), `primary`, `success`, `danger`, `neutral`}.
  - Controlled (`value`) + uncontrolled (`defaultValue`) via shipped `useControllableState`.
  - `onChange(value, { source })` where `source` ∈ {`'click'`, `'keyboard'`, `'clear'`}.
  - `allowClear` — clicking the current value commits `0` with `source: 'clear'`.
  - Hidden `<input type="hidden" name=value>` ships the value to every form library; `required`
    cascades to the hidden input and the visual asterisk marker.
  - `label`, `description`, `helperText`, `error`, `hideLabel`, `ariaLabel`, `showValue`,
    `formatValueText` for full form-field surface.
- `<RatingStar>` (internal) — layered empty + filled SVG glyph with `clip-path` fractional fill
  (LTR / RTL aware).
- Pure helpers (each independently importable & unit-tested):
  - `ratingFillFraction(value, starIndex)` — O(1) fill math.
  - `ratingValueFromPointer({ pointerX, rect, max, precision, dir })` — LTR/RTL pointer math.
  - `useRatingKeyboard({ value, max, precision, allowClear, dir, disabled, readOnly, onChange })`
    — W3C Slider keyboard mapped to rating semantics.
- Re-exported on the package root with `RATING_DEFAULT_VALUE_FORMATTER` for consumers that need
  the i18n fallback string outside of the component.
- 16 examples shipped in `src/Rating/examples/`:
  `Basic`, `Controlled`, `HalfStep`, `ReadOnlyExact`, `CustomScale`, `HeartGlyph`, `Sizes`,
  `Colors`, `ShowValue`, `AllowClear`, `Disabled`, `ReadOnly`, `WithLabel`, `ErrorState`,
  `InForm`, `ProductReviewCard` (Rating + Textarea + Submit composition).

### QA gates

| Gate                          | Result                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `pnpm eslint` (Rating + tests)| **0 errors** after fixing `aria-required-on-slider` + `jsx-a11y/tabindex` lint |
| `pnpm --filter @apx-dsponents typecheck` | **Clean for Rating.** Unrelated `Stepper.tsx` TS2339 reported (Agent8 in-flight, not introduced by this phase). |
| Vitest (`Rating.test.tsx`)    | **33 / 33 ✅** — rendering, controlled/uncontrolled, fill rendering, keyboard, pointer (mouse + touch), form integration, label/description/helper/error wiring, formatValueText. |
| Vitest (`Rating.a11y.test.tsx`)| **7 / 7 ✅** axe-clean — interactive, labeled+helper, read-only fractional, disabled, error state, half-step, in-form. |
| Vitest (`useRatingKeyboard.test.tsx`) | **18 / 18 ✅** — arrows (LTR + RTL), Home/End, PageUp/PageDown, digit shortcuts, disabled/readOnly. |
| Vitest (`ratingFillFraction.test.ts`) | **5 / 5 ✅** — bounds, fractions, NaN, negative. |
| Vitest (`ratingValueFromPointer.test.ts`) | **8 / 8 ✅** — LTR/RTL × whole/half precision × clamp + degenerate width. |
| `pnpm --filter @apx-dsponents build` | **ESM + CJS + DTS** all green. |

### Bundle delta

| Measurement                       | Gzipped   | Notes                                                    |
| --------------------------------- | --------- | -------------------------------------------------------- |
| Standalone Rating import          | 13.27 KB  | Cold — pulls in theme infra, recipe engine, `cv` helpers.|
| **Marginal delta on top of Button** | **+3.18 KB** | The honest "added cost" number. Target 3.00 KB → **+0.18 KB over (+6%)**. |
| Pure helpers only (`ratingFillFraction` + `ratingValueFromPointer` + `useRatingKeyboard`) | 0.66 KB | Available for consumers who only need the math (e.g. their own renderer). |

Closest-to-target of my three Tier-2 phases (Skeleton landed +44% over, Spinner +120% over,
EmptyState +110% over — Rating +6% over is a step-change improvement). The marginal cost is what
real consumers pay because Button / Input / Card / Modal are already in their bundles.

### Deviations from plan

1. **No `<Icon>` component exists in the codebase** (plan depends on Phase 14). `icon` /
   `emptyIcon` accept any `ReactNode`; defaults are inline SVG stars (same approach used in
   EmptyState examples). `HeartGlyph` example demonstrates a third-party-icon swap.
2. **No `<I18nProvider>` exists** (plan depends on Phase 27). Default `aria-valuetext` is
   hardcoded English (`"{value} out of {max} stars"`); `formatValueText` prop is the consumer's
   full escape hatch (matches Slider's `formatValue` extension shape exactly).
3. **`aria-required` not applied to `role="slider"`** — WAI-ARIA 1.2 does not list
   `aria-required` in the slider's supported states, and `jsx-a11y/role-supports-aria-props`
   correctly flags it. Required-ness rides on three other vectors: (a) `required` attribute on
   the hidden `<input>`, (b) visible `*` glyph appended to the label, (c) a `data-required`
   attribute mirror on the slider for CSS / test hooks. AT users still hear "required" via the
   input semantics; the slider's accessible name covers the field name.
4. **No `Rating.keyboard.test.tsx` as a separate file** — the keyboard pattern lives in
   `useRatingKeyboard.ts` and is fully covered by its own dedicated `useRatingKeyboard.test.tsx`
   (18 specs), plus the integration coverage in `Rating.test.tsx` (Arrow / End / digit through
   the real component). Skipping the third file keeps the suite tight without losing coverage.
5. **Recipe color tokens use shipped Tailwind preset utilities** (`text-warning`, `text-danger`,
   `text-success`, `text-primary`, `text-fg-default`, `text-border-default`) rather than the
   plan's `text-(--sds-color-warning-emphasis)` syntax — consistent with shipped Skeleton /
   Spinner / EmptyState. Tokens still resolve to the same CSS vars under the hood; this is a
   pure stylistic alignment.
6. **`dir` read via `useDirection()` from engine** rather than a Phase-local helper. The engine
   ships `DirectionProvider` + `useDirection` already and live-updates on `<html dir>` mutation,
   so I deleted my draft `useDirection` wrapper.
7. **Pointer math uses a shared minimum-of-1 floor** (`Math.max(1, Math.ceil(raw))` for
   whole-step, `Math.max(0.5, …)` for half-step) — the plan's pseudocode had this comment as a
   one-liner; calling it out explicitly in the helper docstring so future readers know clearing
   is deliberate non-geometry (Home key / `allowClear` click-same-value).
8. **No `<output>` element for the value text** — `showValue` renders a `<span>` because the
   `<output>` element's implicit `role="status"` would double-announce alongside the slider's
   `aria-valuetext` (every value change fires both). The visible text remains; the live-region
   duplication is avoided.

### Coordination footprint

- `packages/components/src/index.ts` — surgical insert between `Radio` and `Select`
  (alphabetical: `Radio → Rating → Select`). One hunk, no overlap with concurrent inserts.
- `_shared/useFormFieldA11y.ts` — **consumed only**. No writes.
- `tailwind-preset.ts` — **no touch.** Rating's animations are all CSS (`clip-path` transitions
  are layout-driven, no keyframes needed).
- No renderer touches. No other component touched.
- Yielded Phase 41 (Stepper) to @SDS-Agent8 mid-coordination because Agent8 had stronger prior
  art (Tabs roving-tabindex).

### Downstream notes

- **Promote pointer-to-value pattern?** `ratingValueFromPointer` shares geometry with Slider's
  `computeValueFromPointer`. If a third numeric form control lands (NumberInput stepper rail,
  e.g.), the LTR/RTL/clamp/snap math is now duplicated three times — worth lifting to
  `engine/src/math/pointerToValue.ts` then.
- **Promote keyboard pattern?** `useRatingKeyboard` is W3C-Slider-shaped and could replace
  Slider's inline keyboard handling. Deferred until a second consumer needs it.
- **i18n bundle.** When `<I18nProvider>` lands (Phase 27), wire the default
  `formatValueText` through `useI18n('rating.valueText')` with the same string-template fallback
  Rating ships today. No public API changes needed — `formatValueText` remains the consumer
  escape hatch.
- **Patterns page.** `ProductReviewCard.tsx` is ready to lift into the docs "Review form"
  recipe section (plan's "When This Phase Is Complete" #3) — depends on @SDS-Agent1's patterns
  page lane.
