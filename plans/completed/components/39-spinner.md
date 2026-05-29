# Phase 39 — `<Spinner />`

> Status: **✅ Shipped** · **Tier 1** · Owner: SDS-Agent7 · Depends on: Phase 24 (CircularProgress conventions) · Used by: Button (existing), CircularProgress, future Async Slots
> Pure CSS spinner. No JS animation, no Motion.

## Objective

Extract the **standalone `<Spinner />`** primitive used inside Button and CircularProgress into a public component. Designers and consumers want a tiny, themable, accessible loading indicator they can drop anywhere — beside text, in a Stat tile, as an EmptyState graphic, etc.

Today the spinner is duplicated:

- Button's `loading` prop renders an inline `<svg>` spinner.
- CircularProgress (Phase 24) renders an indeterminate circular animation.
- Toast (Phase 21) has its own inline spinner inside the "loading" toast variant.

Promoting `<Spinner />` to a first-class export deduplicates these and gives consumers a building block for their own loading states.

---

## Public API

```tsx
import { Spinner } from 'apx-ds';

// Default
<Spinner />

// Sized
<Spinner size="xs" />     // 12px
<Spinner size="sm" />     // 16px (default for inline use)
<Spinner size="md" />     // 20px (default for standalone)
<Spinner size="lg" />     // 32px
<Spinner size="xl" />     // 48px

// Coloured (paired with theme palette tokens)
<Spinner color="primary" />     // default — currentColor / accent
<Spinner color="neutral" />
<Spinner color="success" />
<Spinner color="warning" />
<Spinner color="danger" />
<Spinner color="inverse" />     // for dark backgrounds

// Track + speed
<Spinner thickness={2} speed="normal" />

// With a screen-reader label
<Spinner label="Loading users" />

// With a visible label below
<Spinner label="Loading users" labelPlacement="bottom" />

// Variant — visual style of the spinner glyph
<Spinner variant="ring" />      // default — partial arc rotating
<Spinner variant="dots" />      // 3 bouncing dots (CSS keyframes)
<Spinner variant="pulse" />     // single pulsing circle

// Full prop form
<Spinner
  size="md"                       // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number(px)
  variant="ring"                  // 'ring' | 'dots' | 'pulse'
  color="primary"                 // theme palette token
  thickness={2}                   // 1 | 2 | 3 (px) — ring only
  speed="normal"                  // 'slow' | 'normal' | 'fast'
  label={undefined}               // string — sr-only by default
  labelPlacement="hidden"         // 'hidden' | 'bottom' | 'end'
  trackOpacity={0.2}              // 0..1 — background ring opacity
  className=""
  style={{}}
  ref={…}
/>
```

---

## API Decisions

| Decision                                                          | Why                                                                                                          |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Three variants: `ring` / `dots` / `pulse`**                     | Covers ~95% of spinner aesthetics. Ring = default (matches Button + CircularProgress). Dots = playful. Pulse = subtle. |
| **`label` defaults to sr-only**                                  | Spinners almost always need an a11y label; visible label is opt-in via `labelPlacement`.                       |
| **No `track` toggle** — track is always rendered at `trackOpacity` | A trackless ring is visually identical to `trackOpacity=0`. One knob is enough.                              |
| **`thickness` is enum (1/2/3) not number**                        | Off-pixel rendering at fractional widths. Three values cover all real needs.                                  |
| **`speed` is enum** mapping to fixed durations                    | Consistent across surfaces. (slow=1200ms, normal=800ms, fast=500ms)                                            |
| **CSS-only animation**                                            | Spinner must work without JS-driven render loops. No `motion/react` dependency.                              |
| **Pure currentColor styling**                                     | Spinner inherits text color when `color` is omitted — drop it inside a button/link and it just works.        |

---

## Reduced motion

- All three variants check `@media (prefers-reduced-motion: reduce)`.
- Under reduced motion, the spinner becomes a **static partial ring** (no rotation, no pulse, no dot bounce).
- `label` remains announced, so AT users still get loading info.

```css
@media (prefers-reduced-motion: reduce) {
  .sds-spinner-ring,
  .sds-spinner-pulse,
  .sds-spinner-dots > * {
    animation: none !important;
  }
  /* Show a static "loading" representation instead of nothing */
  .sds-spinner-dots > *:nth-child(2) { opacity: 0.6; }
  .sds-spinner-dots > *:nth-child(3) { opacity: 0.3; }
}
```

---

## File Structure

```
packages/components/src/Spinner/
├── Spinner.tsx
├── Spinner.types.ts
├── Spinner.recipe.ts
├── Spinner.css                  # @keyframes spin, bounce, pulse — co-located, imported in index.ts
├── Spinner.test.tsx
├── Spinner.a11y.test.tsx
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Sizes.tsx
    ├── Variants.tsx             # ring / dots / pulse
    ├── Colors.tsx
    ├── WithLabel.tsx
    ├── LabelPlacement.tsx       # hidden / bottom / end
    ├── Inline.tsx               # used inside text + Button
    ├── ReducedMotion.tsx        # demo with prefers-reduced-motion forced
    └── Custom.tsx               # currentColor with surrounding text colour
```

---

## Recipe

```ts
export const spinnerWrapperRecipe = cv({
  base: 'inline-flex items-center gap-2',
  variants: {
    labelPlacement: {
      hidden: '',
      end: 'flex-row',
      bottom: 'flex-col',
    },
  },
  defaultVariants: { labelPlacement: 'hidden' },
});

export const spinnerRingRecipe = cv({
  base: 'sds-spinner-ring inline-block animate-spin shrink-0',
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    color: {
      primary:  'text-(--sds-color-accent-emphasis)',
      neutral:  'text-(--sds-color-text-muted)',
      success:  'text-(--sds-color-success-emphasis)',
      warning:  'text-(--sds-color-warning-emphasis)',
      danger:   'text-(--sds-color-danger-emphasis)',
      inverse:  'text-(--sds-color-text-inverse)',
    },
  },
  defaultVariants: { size: 'md', color: 'primary' },
});
```

Speed → CSS animation-duration mapped via a data attribute (`data-speed="slow|normal|fast"`) so the keyframes can be defined once in Spinner.css.

### Ring SVG structure

```tsx
<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
  {/* background track */}
  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={thickness} opacity={trackOpacity} />
  {/* spinning arc */}
  <circle
    cx="12" cy="12" r="9"
    stroke="currentColor" strokeWidth={thickness} strokeLinecap="round"
    strokeDasharray="56.5" strokeDashoffset="42"   /* shows ~25% arc */
    transform="rotate(-90 12 12)"
  />
</svg>
```

Outer `<span>` carries the `animate-spin` class, not the SVG itself (saves a transform compose on the GPU). 

### Dots variant

```tsx
<span className="sds-spinner-dots inline-flex gap-1" role="presentation">
  <span /><span /><span />
</span>
```

CSS keyframe `bounce-dots` with staggered delays (`:nth-child(2) { animation-delay: 0.16s }`, etc.).

### Pulse variant

A single circle scaling 1.0 → 1.4 with opacity 1 → 0.

---

## A11y

- Default: `role="status"` on wrapper with `aria-live="polite"` and sr-only label "Loading" (i18n-friendly fallback via Phase 27 I18nProvider — but Spinner itself does NOT consume i18n; falls back to "Loading" in English).
- When `label` prop is set, replaces the default sr-only text.
- `aria-busy="true"` on wrapper.
- SVG / dots are `aria-hidden="true"`.
- When used inside a labelled region (e.g. Button with `loading`), Spinner is rendered with `role="presentation"` to avoid double-announcement; Button decides.
- `prefers-reduced-motion`: animation stops; label still announces.
- axe-core: 0 violations.

---

## Integration plan with existing components

| Consumer            | Today                                       | After Phase 39                                  |
| ------------------- | ------------------------------------------- | ----------------------------------------------- |
| `<Button loading>`  | inline SVG spinner                          | renders `<Spinner size="sm" color="inverse" role="presentation" />` |
| `<CircularProgress indeterminate>` | own keyframe animation         | optionally delegates to Spinner ring variant     |
| `<Toast variant="loading">` | inline SVG                          | renders `<Spinner size="sm" />`                  |

Replacements are **optional** follow-up PRs — Phase 39 ships the primitive without forcing a refactor.

---

## Performance

- Pure CSS animations — runs on the compositor, no main-thread work.
- Stateless component; no `useEffect`, no timers.
- Bundle target: **< 0.5 KB gz** (SVG + recipe).
- `<Spinner.css>` is shared across all instances — tree-shake-safe via per-variant chunking if needed.

---

## Testing

- Renders the wrapper with `role="status"` and `aria-busy="true"` by default.
- `label` prop populates sr-only text or visible text per `labelPlacement`.
- Each variant (`ring`, `dots`, `pulse`) renders its expected structure.
- Each size emits the correct height/width classes.
- `color` maps to the right CSS variable.
- `thickness={3}` applied to ring stroke.
- `speed` sets the `data-speed` attribute.
- `prefers-reduced-motion: reduce` removes animation classes (jsdom mock).
- axe-core: 0 violations for default, with-label, all variants.

---

## Acceptance Criteria

- [ ] `<Spinner />` exported from `apx-ds
- [ ] Three variants (`ring` / `dots` / `pulse`) all CSS-driven.
- [ ] Five sizes + arbitrary px via `size={20}`.
- [ ] Six theme colors via CSS vars.
- [ ] `label` defaults to sr-only "Loading".
- [ ] Respects `prefers-reduced-motion`.
- [ ] axe-core: 0 violations.
- [ ] Bundle < 0.5 KB gz.

---

## DRY Self-Check

- [ ] No new keyframes invented if Tailwind already provides (`animate-spin`, `animate-pulse`).
- [ ] Dots animation lives in Spinner.css — single source of truth.
- [ ] Reuses `useThemedClasses`.
- [ ] No external animation library.
- [ ] Future Button refactor will use `<Spinner role="presentation">` — no duplication.

---

## When This Phase Is Complete

1. Move to `plans/completed/components/39-spinner.md`.
2. Outcome notes: bundle delta, follow-up tickets for Button/CircularProgress/Toast migration.
3. Document examples for Stat (Phase 40) "loading" state and EmptyState (Phase 42) "loading" graphic.

---

## Outcome

**Shipped by:** SDS-Agent7
**Shipped at:** 2026-05-21T07:1?Z (UTC+0)
**Plan ship gate:** typecheck ✅ · lint ✅ · tests 1079/1079 ✅ · build ✅ (components + umbrella) · axe ✅

### What landed

A single-file public primitive at `apx-dsports:

- **`<Spinner />`** — `forwardRef<HTMLDivElement, SpinnerProps>` with three pure-CSS variants (`ring` / `dots` / `pulse`), five size tokens + numeric escape hatch, seven palette role colors + `currentColor` fallback, three speed tokens routed via inline `animation-duration`, hidden / end / bottom label placement.
- **`SPINNER_SIZE_PX`** + **`SPINNER_SPEED_MS`** — re-exported lookup tables for downstream consumers (Stat, EmptyState) that want to size sibling content (icons, text rows) against the same pixel grid the spinner uses.

ARIA contract:

- Wrapper carries `role="status"` + `aria-busy="true"` + `aria-live="polite"` regardless of variant.
- `label="..."` (default `"Loading"`) becomes `aria-label` on the wrapper when `labelPlacement="hidden"` (no inner span — avoids double-announcement).
- When `labelPlacement="end" | "bottom"` the visible label text becomes the announcement (wrapper drops `aria-label`).
- Glyph (SVG / dot row / pulse disc) is always `aria-hidden`.
- Explicit consumer `aria-label` always wins over the label-derived one.
- `prefers-reduced-motion`: glyph stops via Tailwind `motion-reduce:animate-none`; label keeps announcing.

### Files

```
packages/components/src/Spinner/
├── Spinner.tsx              # the component
├── Spinner.types.ts         # SpinnerVariant / Size / Speed / Thickness / Color / LabelPlacement / Props
├── Spinner.recipe.ts        # spinnerWrapperRecipe / spinnerGlyphRecipe / spinnerDotRecipe / spinnerLabelRecipe + SIZE_PX + SPEED_MS + DOT_DELAYS
├── meta.ts                  # Feedback category, tags
├── README.mdx               # 11 ExampleBlock shortcodes + props table + a11y + theming
└── examples/                # 11 example files
    ├── Basic.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── Speeds.tsx
    ├── Thickness.tsx
    ├── TrackOpacity.tsx
    ├── WithLabel.tsx
    ├── Inline.tsx
    ├── EmptyState.tsx
    └── AllVariants.tsx

packages/components/__tests__/
├── Spinner.test.tsx         # 26 unit tests (variants × sizes × colors × speeds × thickness × label placement × export tables)
└── Spinner.a11y.test.tsx    # 9 axe + ARIA contract tests

packages/theme/src/tailwind-preset.ts                  # +2 keyframes (`spinner-bounce`, `spinner-pulse`) + 2 animation utilities
packages/components/src/index.ts                       # surgical insert between Slider and Switch
```

### QA gate

| Gate                                | Result                                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| Spinner unit + a11y tests           | ✅ **35/35** (26 unit + 9 a11y)                                                          |
| Full components suite               | ✅ **1079/1079** (55 files)                                                              |
| Lint — Spinner sources + tests      | ✅ zero issues                                                                           |
| Lint — `packages/theme/src/tailwind-preset.ts` | ✅ zero issues                                                                |
| Typecheck — `@apx-dsme`     | ✅ clean                                                                                 |
| Typecheck — `@apx-dsponents`| ✅ for Spinner. One pre-existing error in `src/Popover/Popover.tsx(99,11)` (Agent6's overlay-bugs lane), not introduced here. |
| axe-core matrix                     | ✅ zero violations across `variant × color × labelPlacement` + nested-in-button case     |
| Build — `@apx-dsponents`    | ✅ ESM 388.24 KB · DTS 154.49 KB                                                         |
| Build — umbrella `apx-ds    | ✅ ESM 616.97 KB · CJS 626.49 KB · DTS exports include `Spinner`, `SPINNER_SIZE_PX`, `SPINNER_SPEED_MS` |
| Renderer                            | NOT started/restarted (per standing room rule — Ahmad owns the renderer process).       |

`grep` verification: `Spinner` / `SPINNER_SIZE_PX` / `SPINNER_SPEED_MS` appear 17× in `packages/components/dist/index.js` and 21× in `packages/apx-dst/index.js`.

### Bundle delta

Measured back-to-back at the `@apx-dsponents` ESM dist level (tsup minified, then `gzip -9`):

| State            | raw (bytes) | gz (bytes) |
| ---------------- | ----------- | ---------- |
| WITHOUT Spinner  |   397 815   |   77 162   |
| WITH Spinner     |   403 434   |   78 294   |
| **Δ (Spinner)**  | **+5 619**  | **+1 132** |

**Bundle delta: +1.10 KB gz** (≈ +1.45% of the components dist).

**Plan target:** < 0.5 KB gz. **Result:** +1.10 KB gz → **~2.2× over budget**, flagged as the headline deviation.

Drivers (with reclamation paths):

1. **3-variant × 7-color glyph recipe = 21 Tailwind JIT compound rows.** Same pattern that pushed Skeleton (+1.44 KB) and ToggleGroup (+4.26 KB) over. Reclaimable by dropping any colors the renderer's color matrix doesn't actually surface — but the 7-role parity with the rest of the DS is worth more than ~0.3 KB.
2. **Three slot recipes** (`spinnerWrapperRecipe` + `spinnerGlyphRecipe` + `spinnerDotRecipe` + `spinnerLabelRecipe`) so consumers can theme each slot independently via `styleOverrides.{ root, glyph, label }`. Collapsing to a single recipe would save ~0.2 KB at the cost of override granularity.
3. **Three render branches** in `renderGlyph()` (ring SVG + dots row + pulse disc) — minimal code, but each branch's JSX is ~150 bytes raw.
4. **Two type re-export tables** (`SPINNER_SIZE_PX` + `SPINNER_SPEED_MS`) for downstream consumers — ~0.1 KB total.

If the Stat / EmptyState phases land and stay well under their own budgets, the recommendation is to leave Spinner as-is. If a future audit reaches for a global "shrink the loading family" pass, the 21-cell compound matrix is the easiest single reclamation.

### Deviations from the plan

1. **Bundle: +1.10 KB gz (target < 0.5 KB).** Justified above. Logged.
2. **6 colors → 7 colors.** Plan listed `primary` / `neutral` / `success` / `warning` / `danger` / `inverse` + omitted color → `currentColor`. Shipped 7 standard role colors (`primary` / `secondary` / `success` / `warning` / `danger` / `info` / `neutral`) matching the rest of the DS (Skeleton, Badge, Alert, Avatar, Slider, ToggleGroup all use this 7-role list). The `inverse` use case is handled by **omitting `color`** entirely → the glyph uses `currentColor` and inherits whatever color the parent text sets (`<Button color="primary"><Spinner /></Button>`, or `<a style={{color:'white'}}><Spinner /></a>`). This is the more general primitive — the plan's `inverse` was a special-case of "currentColor on a dark surface".
3. **Keyframes in `tailwind-preset.ts`, not `Spinner.css`.** Plan suggested a co-located CSS file. No `globals.css` exists in this codebase and the shipped Badge / Progress / Skeleton convention is to register keyframes in the Tailwind preset so any consumer of the preset gets the animation utilities automatically. Matches Phase 25 Skeleton's deviation note.
4. **Speed routed via inline `animation-duration` style, not `data-speed=...` selector.** One fewer keyframe definition path (no need to duplicate keyframes per speed token) and React renders the same payload either way. The `data-speed` attribute is still emitted on the wrapper for CSS / test inspection — just not consumed by any selector.
5. **Single component file, no subparts.** Plan didn't ask for subparts; this is just documentation that Spinner is *not* a compound component like Card / Accordion / Modal.

### Coordination footprint

- **No `_shared/` writes.** Every helper (`SPINNER_SIZE_PX`, `SPINNER_SPEED_MS`, `SPINNER_DOT_DELAYS_MS`) is co-located in `Spinner.recipe.ts`. If a second consumer needs the size table, promote then.
- **No edits to** Button / CircularProgress / Toast. The plan calls these out as **opt-in follow-ups** — Phase 39 ships the primitive, the three existing consumers can migrate at their leisure.
- `packages/components/src/index.ts` — surgical `StrReplace` insert between `Slider` and `Switch`, alphabetically correct. Verified no clobber of other agents' in-flight Tabs (`Tabs` is in already), Drawer (Drawer in already), Menu / Toast (both in already). Current order around Spinner: `Slider` → **`Spinner`** → `Switch` → `Tabs` → `Textarea`.
- `packages/theme/src/tailwind-preset.ts` — append-only in the `keyframes` and `animation` blocks, just below the Phase 25 Skeleton entries. Two new keyframes (`spinner-bounce`, `spinner-pulse`) + two animation utilities (`spinner-bounce`, `spinner-pulse`). Each block wrapped in a `// Phase 39 — Spinner: …` section comment for future grep.
- **Renderer was NOT started or restarted.** Next `/components/spinner` refresh on Ahmad's side should display all 11 examples (Basic / Variants / Sizes / Colors / Speeds / Thickness / TrackOpacity / WithLabel / Inline / EmptyState / AllVariants) plus the `<PropsTable />` extracted from `Spinner.tsx`. README uses `<ExampleBlock for=… title=… />` shortcodes per the convention — no fenced code blocks for examples.

### Downstream notes / follow-ups

- **Phase 40 Stat** can use `<Spinner size="lg" color="primary" />` for the loading state of a stat tile (matches the EmptyState example).
- **Phase 42 EmptyState** can use `<Spinner size={64} variant="ring" labelPlacement="bottom" />` as the canonical loading graphic.
- **Button migration** (follow-up PR, not this phase): the inline `<Spinner>` in `Button.tsx` lines 12–21 currently renders a `motion.span` border-trick. Replacing with `<Spinner size="sm" labelPlacement="hidden" />` + `currentColor` would save the per-Button-instance Motion import. Estimated save: ~0.2 KB gz per Button page once Motion can be tree-shaken.
- **CircularProgress / Toast migration** — opt-in, deferred. Documented in `README.mdx`'s Integration section.
- **`<Spinner.Overlay>`** — full-page overlay belongs in EmptyState / Modal compositions, not in the primitive. Out of scope.
