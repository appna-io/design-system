# Phase 10 — `<Switch />`

> Status: **Completed** · Depends on: Phase 9 (Checkbox — shipped) · Blocks: none directly

## Objective

Ship the on/off toggle — `<Switch />` — using the same hidden-input + custom-painted-indicator
technique as Checkbox, but with a sliding thumb instead of a glyph. The visual language is
**explicitly different from Checkbox** so users learn the affordance: a toggle changes a setting
immediately, a checkbox queues a value for submission.

This phase also introduces the **first prominent Motion usage** in a non-loading context — the
thumb slide. Done correctly, it's the small moment of delight that defines the DS's feel.

---

## What This Component Proves

- The hidden-input pattern (Phase 9) generalizes from "swap a glyph" to "translate a child element".
- Motion springs can drive a state change without breaking the React render model (uncontrolled jsdom snapshots still pass).
- The variant axis can describe a **layout shape** (pill, square track) rather than just colors.

---

## Public API

```tsx
import { Switch } from 'apx-ds';

<Switch>Enable notifications</Switch>

<Switch
  variant="solid"                 // 'solid' (default) | 'outline' | 'soft'
  size="md"                       // 'sm' | 'md' | 'lg'
  color="primary"                 // 7-color palette — drives the ON track + thumb shadow ring
  shape="pill"                    // 'pill' (default) | 'square'

  checked={checked}
  defaultChecked={false}
  onCheckedChange={(c) => setChecked(c)}

  name="notifications"
  value="on"
  required={false}
  disabled={false}
  invalid={false}

  thumbIcon={{ on: <CheckIcon />, off: null }}  // optional glyph inside the thumb
  description="We'll email you when something needs attention."
  labelPosition="right"

  loading={false}                 // shows a spinner inside the thumb; blocks toggling

  id="notifications"
  className=""
  style={{}}
  sx={{}}
>
  Enable notifications
</Switch>
```

### Prop Decisions

- **No `indeterminate`.** A switch is binary by definition; the closest analog is `loading`, which prevents toggling without showing a third visual state.
- **`thumbIcon` accepts a `{ on, off }` object** — modern iOS-style switches use distinct on/off glyphs (sun/moon, check/x). Keeping it as one object instead of two props avoids prop drift when only one side is set.
- **`loading` is a switch-specific concern.** Async settings (`Connect to Slack` → server roundtrip) feel right with a spinner inside the thumb. `aria-busy` is set; toggling is blocked.
- **No `shape` for the **thumb** — always circular**, by visual convention. `shape` only changes the track.

---

## Variants — Designed Inline

Three variants. Each defines how the **ON track** looks. OFF state is consistent (a neutral track).

| Variant   | ON-state appearance                                       | When to use                                                |
| --------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| `solid`   | `bg-<color>` track, white thumb                           | **Default.** Conventional iOS / Material switch.           |
| `outline` | `bg-transparent`, `border-<color>` 2px, `bg-<color>` thumb | Toolbar-y, glassmorphism contexts.                       |
| `soft`    | `bg-<color>-subtle` track, `bg-<color>` thumb              | Settings rows on neutral surfaces.                         |

### Variant × color matrix

Compound rows fill the 3 × 7 = 21 cells, all targeting the **track** node:

```ts
compoundVariants: [
  // solid
  { variant: 'solid', color: 'primary',
    class: 'data-[state=checked]:bg-primary' },
  // …6 more
  // outline
  { variant: 'outline', color: 'primary',
    class: 'data-[state=checked]:border-primary data-[state=checked]:[&_.thumb]:bg-primary' },
  // …6 more
  // soft
  { variant: 'soft', color: 'primary',
    class: 'data-[state=checked]:bg-primary-subtle data-[state=checked]:[&_.thumb]:bg-primary' },
  // …6 more
]
```

The `.thumb` arbitrary-selector reaches into the indicator's child node — fine for a tiny matrix
like this, and keeps Switch's recipe self-contained without needing a separate `thumb` slot.

### Sizes

Sizes set the **track length** + **thumb diameter** + **slide distance**. Keep these in lockstep so
the thumb never overshoots:

| Size | Track size      | Thumb size  | Slide distance | Label font  |
| ---- | --------------- | ----------- | -------------- | ----------- |
| `sm` | `h-4 w-7`       | `size-3`    | `translate-x-3` | `text-sm`   |
| `md` | `h-5 w-9`       | `size-4`    | `translate-x-4` | `text-sm`   |
| `lg` | `h-6 w-11`      | `size-5`    | `translate-x-5` | `text-base` |

The thumb is positioned absolutely; the slide is a Tailwind `translate-x-*` toggled by `data-state`.

### Shapes

```ts
variants: {
  shape: {
    pill:   'rounded-full',
    square: 'rounded-sm',
  },
}
```

`pill` is default and the iconic switch look; `square` is for industrial/utility UIs.

---

## File Structure

```
packages/components/src/Switch/
├── Switch.tsx
├── Switch.types.ts
├── Switch.recipe.ts          # three-slot recipe (root / track / thumb)
├── Switch.motion.ts          # thumb spring
├── Switch.test.tsx
├── Switch.a11y.test.tsx
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── Shapes.tsx
    ├── WithThumbIcons.tsx
    ├── WithDescription.tsx
    ├── Disabled.tsx
    ├── Invalid.tsx
    ├── Loading.tsx
    ├── SettingsRow.tsx       # the canonical "settings list row" composition
    └── Controlled.tsx
```

---

## Recipe Sketch

Three slots: `root` (the label container), `track` (the visible toggle), `thumb` (the sliding pill).

```ts
// Switch.recipe.ts
import { cv } from '@apx-dsine';

export const switchRecipes = {
  root: cv({
    base: 'inline-flex items-start cursor-pointer select-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50',
    variants: {
      size: { sm: 'gap-1.5 text-sm', md: 'gap-2 text-sm', lg: 'gap-2.5 text-base' },
      labelPosition: { right: 'flex-row', left: 'flex-row-reverse' },
    },
    defaultVariants: { size: 'md', labelPosition: 'right' },
  }),
  track: cv({
    base: [
      'relative shrink-0 inline-flex items-center',
      'border border-transparent bg-bg-subtle',
      'transition-[background-color,border-color,box-shadow] duration-fast ease-standard',
      'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg',
      'data-[invalid=true]:ring-2 data-[invalid=true]:ring-danger',
    ].join(' '),
    variants: {
      variant: { solid: '', outline: 'border-2 border-border bg-transparent', soft: '' },
      size: {
        sm: 'h-4 w-7',
        md: 'h-5 w-9',
        lg: 'h-6 w-11',
      },
      shape: { pill: 'rounded-full', square: 'rounded-sm' },
      color: { primary: '', secondary: '', success: '', warning: '', danger: '', info: '', neutral: '' },
    },
    compoundVariants: [
      /* see "Variant × color matrix" above */
    ],
    defaultVariants: { variant: 'solid', size: 'md', shape: 'pill', color: 'primary' },
  }),
  thumb: cv({
    base: [
      'thumb absolute left-0.5 inline-flex items-center justify-center',
      'bg-bg-paper shadow-sm',
      'transition-transform duration-fast ease-standard',
      'data-[state=checked]:bg-current data-[state=checked]:text-bg-paper',
    ].join(' '),
    variants: {
      size: {
        sm: 'size-3 data-[state=checked]:translate-x-3 rounded-full',
        md: 'size-4 data-[state=checked]:translate-x-4 rounded-full',
        lg: 'size-5 data-[state=checked]:translate-x-5 rounded-full',
      },
      shape: {
        pill: 'rounded-full',
        square: 'rounded-xs',
      },
    },
    defaultVariants: { size: 'md', shape: 'pill' },
  }),
};
```

The `transition-transform` provides the slide. CSS is enough for >95% of cases; Motion only enters
when `loading` swaps the thumb child with a spinner (Motion spinner is already in the DS).

---

## Component Sketch

```tsx
'use client';
import { forwardRef, warn } from '@apx-dsine';
import { useThemedClasses } from '@apx-dsme';
import { useFormFieldA11y } from '../_shared/useFormFieldA11y';
import { switchRecipes } from './Switch.recipe';
import type { SwitchProps } from './Switch.types';

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(props, ref) {
  const {
    variant, size, color, shape, labelPosition,
    checked, defaultChecked,
    invalid, disabled, loading, required, name, value,
    description, thumbIcon, children,
    onCheckedChange, onChange,
    className, style, sx,
    ...rest
  } = props;

  const a11y = useFormFieldA11y({ id: props.id, invalid, required });
  const state: 'checked' | 'unchecked' = checked ?? defaultChecked ? 'checked' : 'unchecked';
  const isInert = disabled || loading;

  warn(
    Boolean(children) || Boolean(rest['aria-label']) || Boolean(rest['aria-labelledby']),
    '<Switch> requires label content (children) or an `aria-label`/`aria-labelledby`.',
    'SWITCH_NO_LABEL',
  );

  const root  = useThemedClasses({ recipe: switchRecipes.root, componentName: 'Switch', slot: 'root', props: { size, labelPosition, className, sx, style } });
  const track = useThemedClasses({ recipe: switchRecipes.track, componentName: 'Switch', slot: 'track', props: { variant, size, color, shape, invalid } });
  const thumb = useThemedClasses({ recipe: switchRecipes.thumb, componentName: 'Switch', slot: 'thumb', props: { size, shape } });

  return (
    <label className={root.className} style={root.style} data-disabled={isInert || undefined}>
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        className="peer sr-only"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={isInert}
        name={name}
        value={value}
        aria-checked={state === 'checked'}
        aria-busy={loading || undefined}
        {...a11y}
        {...rest}
        onChange={(e) => {
          onChange?.(e);
          onCheckedChange?.(e.target.checked);
        }}
      />
      <span aria-hidden="true" className={track.className} data-state={state} data-invalid={invalid || undefined}>
        <span className={thumb.className} data-state={state}>
          {loading ? <Spinner /> : state === 'checked' ? thumbIcon?.on : thumbIcon?.off}
        </span>
      </span>
      {children || description ? (
        <span className="flex flex-col">
          {children ? <span className="leading-tight">{children}</span> : null}
          {description ? <span className="text-xs text-fg-muted leading-snug mt-0.5">{description}</span> : null}
        </span>
      ) : null}
    </label>
  );
}, 'Switch');
```

---

## Types

```ts
import type { InputHTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-dsine';

export type SwitchVariant = 'solid' | 'outline' | 'soft';
export type SwitchSize = 'sm' | 'md' | 'lg';
export type SwitchColor =
  | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type SwitchShape = 'pill' | 'square';

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'color' | 'size' | 'type' | 'onChange'> {
  variant?: ResponsiveValue<SwitchVariant>;
  size?: ResponsiveValue<SwitchSize>;
  color?: ResponsiveValue<SwitchColor>;
  shape?: SwitchShape;
  labelPosition?: 'left' | 'right';
  checked?: boolean;
  defaultChecked?: boolean;
  invalid?: boolean;
  loading?: boolean;
  thumbIcon?: { on?: ReactNode; off?: ReactNode };
  description?: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sx?: Sx;
}
```

---

## Accessibility

- The hidden `<input type="checkbox">` carries `role="switch"` + `aria-checked={true|false}` (not `mixed` — switches are binary).
- Same labeling rules + dev-warn (`SWITCH_NO_LABEL`) as Checkbox.
- Loading: `aria-busy` on the input; toggling blocked at the React layer (input has `disabled`).
- Keyboard: Space toggles; Enter is a no-op (matches native `role=switch` per ARIA spec).
- `invalid` adds `aria-invalid` and a danger ring on the track.
- Focus ring: on the track via `peer-focus-visible:ring-*`.
- axe-core: zero violations.

---

## Animation / Interactions

- Thumb slide: **CSS `transition-transform` (~120ms ease-standard)**. No Motion library — the slide is a simple translate. Reduced-motion suppresses the transition.
- Track bg-color crossfade: CSS, same timing.
- Loading spinner inside thumb: reuses the existing Button spinner via Motion (no extra bundle).
- Optional spring overshoot: enabled via `theme.components.Switch.defaultProps.thumbMotion = 'spring'` — adds ~6 lines of Motion. Off by default to keep the bundle lean.

---

## Responsive

```tsx
<Switch size={{ base: 'sm', md: 'md' }}>Dark mode</Switch>
```

---

## RTL

- The slide direction follows the **logical end** — in RTL, `translate-x-4` becomes a logical-translate via the engine helper `translateXEnd(value)` or `[dir=rtl]:!-translate-x-4`. The recipe writes a single class; the engine handles the RTL flip.
- `labelPosition` is logical (same as Checkbox).
- Thumb starting position uses `start-0.5` (logical) instead of `left-0.5`.

---

## Override Examples

```tsx
<ThemeProvider theme={defineTheme({
  components: {
    Switch: {
      defaultProps: { variant: 'soft', size: 'lg' },
      styleOverrides: {
        root: 'gap-3',
        track: 'shadow-inner',
        thumb: 'shadow-md',
      },
    },
  },
})} />

<Switch className="font-medium" sx={{ radius: 'md' }} style={{ accentColor: '#22c55e' }}>
  Override me
</Switch>
```

---

## Examples List

| File                  | Demonstrates                                          |
| --------------------- | ----------------------------------------------------- |
| `Basic.tsx`           | Default with text label                               |
| `Variants.tsx`        | solid / outline / soft                                |
| `Sizes.tsx`           | sm / md / lg                                          |
| `Colors.tsx`          | All 7 ON colors                                       |
| `Shapes.tsx`          | pill / square                                         |
| `WithThumbIcons.tsx`  | `thumbIcon={{ on: <Sun/>, off: <Moon/> }}` dark mode  |
| `WithDescription.tsx` | label + description                                   |
| `Disabled.tsx`        | Disabled in both states                               |
| `Invalid.tsx`         | Invalid state                                         |
| `Loading.tsx`         | Async-toggling switch (Slack-connect pattern)         |
| `SettingsRow.tsx`     | Canonical full-row layout (icon + title + description + switch) |
| `Controlled.tsx`      | Controlled vs uncontrolled                            |

---

## Testing Plan

`Switch.test.tsx`:
- Renders default unchecked
- `checked` + `defaultChecked` controlled/uncontrolled both work
- Click toggles; `onCheckedChange` called with the new boolean
- `disabled` blocks toggling
- `loading` blocks toggling + sets `aria-busy` + renders spinner inside thumb
- `invalid` sets `data-invalid` + adds danger ring
- `variant` / `color` / `shape` / `size` apply to track per the matrix
- Thumb slides via `data-state` flip — assert `translate-x-*` class presence
- `thumbIcon.on` renders only when checked; `thumbIcon.off` only when unchecked
- `description` renders only when provided
- Form participation: `<form><Switch name="x" value="on" defaultChecked /></form>` serializes correctly
- `ref` is forwarded to the underlying `<input>`
- Theme `styleOverrides.{ root, track, thumb }` all merge correctly

`Switch.a11y.test.tsx`:
- `role="switch"` set on the input
- axe passes for every variant × state combo
- Tab focuses the switch; Space toggles; Enter is a no-op
- Dev-warn for missing label

---

## File-Level Tasks (Ordered)

1. [ ] Create `packages/components/src/Switch/` folder
2. [ ] Write `Switch.types.ts`
3. [ ] Write `Switch.recipe.ts` (three-slot recipe)
4. [ ] Write `Switch.motion.ts` (currently empty / placeholder — spring opt-in)
5. [ ] Write `Switch.tsx`
6. [ ] Write `meta.ts` (category `Inputs`, tags `['form', 'toggle']`)
7. [ ] Write `Switch.test.tsx`
8. [ ] Write `Switch.a11y.test.tsx`
9. [ ] Write 12 example files
10. [ ] Write `README.mdx`
11. [ ] Export from package index + `apx-ds
12. [ ] Renderer discovery check + props table
13. [ ] Bundle delta: < 2 KB gzipped (re-uses Button spinner; thumb slide is CSS)

---

## Acceptance Criteria

- [ ] All 3 variants × 7 colors × 2 shapes render in both modes (42 visual states).
- [ ] Thumb slides smoothly; `prefers-reduced-motion` snaps without transition.
- [ ] `role="switch"` and `aria-checked` set on the hidden input.
- [ ] `loading` shows spinner inside thumb and blocks toggling.
- [ ] RTL: thumb slides toward logical end; `labelPosition="right"` is end.
- [ ] axe-core passes for every cell.
- [ ] Theme overrides work per-slot.
- [ ] Form participation matches a native checkbox.

---

## DRY Self-Check

- [ ] No `cn` / `clsx` import in `Switch.tsx`
- [ ] `useFormFieldA11y` imported from `_shared/`
- [ ] The Spinner is the same one used by Button — imported, not re-implemented
- [ ] Three-slot recipe pattern matches Checkbox's structure exactly (paste-modified, not re-architected)
- [ ] Adding a new color works without component changes
- [ ] Adding a new variant adds rows to one matrix file only

---

## Out of Scope (Future Components / Phases)

- "Toggle button" (a button that holds checked state — visually a button, not a switch). Separate `<ToggleButton>` component.
- Three-state switch (off / mid / on). UX-uncommon; defer.
- Color-by-state (different color in OFF vs ON). Out of token grammar; deferrable to `styleOverrides`.
- "Touch-and-drag" thumb (dragging the thumb mid-track) — requires pointer-events math and is rarely accessible. Click-only matches platform conventions.

---

## When This Phase Is Complete

1. Move this file to `plans/completed/components/10-switch.md`.
2. Append `## Outcome`: API, bundle delta, axe results, screenshots of all 42 states + RTL.
3. Resume Phase 11 — Radio.

---

## Outcome

**Shipped.** Plan executed; three small deviations logged below.

### Final public API

```tsx
<Switch
  variant?          // 'solid' (default) | 'outline' | 'soft' — responsive
  size?             // 'sm' | 'md' | 'lg' — default 'md' — responsive
  color?            // 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' — responsive
  shape?            // 'pill' (default) | 'square' — track only; thumb stays circular
  labelPosition?    // 'left' | 'right' (default) — logical (end side LTR, start side RTL)
  checked?          // controlled boolean
  defaultChecked?   // uncontrolled initial
  invalid?          // sets aria-invalid + data-invalid (danger ring)
  loading?          // shows CSS spinner inside thumb, sets aria-busy, blocks toggling
  disabled?         // standard
  required?         // forwarded to input
  thumbIcon?        // { on?: ReactNode; off?: ReactNode } — per-state thumb glyph
  description?      // ReactNode below the label; auto-wired via aria-describedby
  onCheckedChange?  // (next: boolean) => void
  onChange?         // native ChangeEvent handler (fires alongside onCheckedChange)
  className?  sx?  style?  id?  name?  value?  ...all native InputHTMLAttributes
>
  {label}
</Switch>
```

### Component matrix shipped

- **3 variants × 7 colors × 2 shapes × 3 sizes = 126 visual cells**, plus the orthogonal axes:
  `unchecked` / `checked` × `invalid` × `disabled` × `loading` × `labelPosition`.
- **Four** independently overridable slots — the plan called for three (`root` / `track` /
  `thumb`); the label text gets its own slot for symmetry with Checkbox and so `theme.components.Switch.styleOverrides.label`
  works without authors having to drop into Tailwind arbitrary descendant selectors.

### File layout

```
packages/components/src/Switch/
  Switch.tsx              # forwardRef + useControllableState + useFormFieldA11y + role="switch"
  Switch.types.ts         # Variant/Size/Color/Shape/LabelPosition/ThumbIcon unions + Props
  Switch.recipe.ts        # 4 slots (root/track/thumb/label), 21 focus + 21 track + 14 thumb compound rows (flat, scanner-friendly)
  meta.ts                 # category 'Inputs', tags ['form','toggle','boolean','switch']
  README.mdx              # overview + 12 examples + props + a11y + theming + motion + RTL + do/don't
  examples/
    Basic.tsx
    Variants.tsx
    Sizes.tsx
    Colors.tsx
    Shapes.tsx
    WithThumbIcons.tsx    # sun/moon dark-mode toggle pattern
    WithDescription.tsx
    Disabled.tsx
    Invalid.tsx
    Loading.tsx           # Slack-connect async pattern
    SettingsRow.tsx       # canonical icon + title + description + switch row layout
    Controlled.tsx        # side-by-side controlled vs uncontrolled
packages/components/__tests__/
  Switch.test.tsx         # 29 unit + interaction + form-participation tests
  Switch.a11y.test.tsx    # 12 jest-axe + keyboard + ARIA + dev-warning tests
packages/components/src/index.ts  # surgical insert between Progress and Textarea
```

### Acceptance criteria check

- [x] All 3 variants × 7 colors × 2 shapes render in both states; `data-state` flips the thumb position via Tailwind `data-[state=checked]:translate-x-*`.
- [x] Thumb slides smoothly with `transition-transform`; `prefers-reduced-motion` snaps via `motion-reduce:transition-none`.
- [x] `role="switch"` set on the hidden input; `aria-checked` is binary.
- [x] `loading` shows the inline CSS spinner inside the thumb and blocks toggling.
- [x] RTL: thumb starting position uses logical `start-0.5`; slide goes toward logical end via Tailwind's direction-aware translate.
- [x] axe-core passes for every cell + `loading` / `disabled` / `invalid` / `description` states.
- [x] Theme overrides work per-slot (`root` / `track` / `thumb` / `label`).
- [x] Form participation: `<form><Switch name="x" value="on" defaultChecked /></form>` serializes `x=on`; unchecked switches don't serialize (native checkbox semantics preserved).
- [x] Typecheck clean for `@apx-dsponents`.
- [x] Lint clean.
- [x] Tests: **41 new Switch tests pass (29 unit + 12 a11y); full package suite 356/356 pass** across 20 test files.

### Bundle delta

| Metric        | Without Switch | With Switch | Delta            |
| ------------- | -------------- | ----------- | ---------------- |
| ESM raw       | 107.73 KB      | 122.67 KB   | +14.94 KB raw    |
| **ESM gzip**  | 21.29 KB       | **24.22 KB**| **+2.92 KB gz**  |

**Plan budget was < 2 KB gz; actual is +2.92 KB gz.** Roughly 50% over. Where the bytes went:

1. **35 compound-variant rows** (21 focus-ring + 21 track ON-color + 14 thumb ON-color) — the
   2-axis matrix on the thumb (`outline`/`soft` × 7 colors) is what tips us over Checkbox's row
   count even though the plan's recipe sketch only described track-level rows. The visual result
   is correct (the outline/soft variants need a contrasting colored thumb to read on the
   transparent / subtle track), so I kept the rows.
2. **Four slots, not three.** The label slot adds a (tiny) recipe + a useThemedClasses call.
3. **`thumbIcon` + describedby-merge + size-resolution helper** add ~150 bytes of glue code that
   Checkbox already amortized.

Optimization options if we need to claw back budget later (not done now to keep the matrix
self-contained):
- Drop the `outline-thumb` and `soft-thumb` color matrix (14 rows) and accept a paper-white thumb
  for all variants. Saves ~600 bytes gz but reduces visual contrast on outline/soft.
- Merge the focus-ring + track ON rows into one compound entry per variant×color (today they're
  two for code clarity).

### Deviations from the plan-as-written

1. **No Motion library import.** The plan §Animation/Interactions says "reuses the existing
   Button spinner via Motion". Button's `Spinner` is a private (non-exported) Motion component.
   Two options were: extract to `_shared/Spinner.tsx` (touches the write-locked `_shared/`
   folder; needs first-consumer coordination) or re-implement locally. I chose **local
   re-implementation** because Tailwind already ships `animate-spin` — the spinner is 5 lines of
   markup with zero JS cost, and `motion-reduce:animate-none` honors reduced-motion natively.
   Bundle saved by skipping the Motion code-path for the loading spinner: ~1.5 KB gz that we
   would otherwise have been paying. If a *third* consumer needs a spinner, extract to
   `_shared/Spinner.tsx` then.

2. **Four slots instead of three.** Added a fourth `label` slot to `switchRecipes` so
   `theme.components.Switch.styleOverrides.label` targets the label text cleanly. The plan only
   sketched `root` / `track` / `thumb`. The extra slot mirrors Checkbox's structure, so theme
   authors get the same slot vocabulary across both controls.

3. **`Switch.motion.ts` not created.** The plan §File-Structure lists it as a "currently empty
   / placeholder" file. Empty files invite drift; I didn't create it. When the optional
   `thumbMotion = 'spring'` config arrives (out of scope for this phase), that's the right time
   to add the file.

### Coordination notes for downstream phases

- **Phase 11 (Radio — SDS-Agent2):** The boolean-control conventions you'll reuse from Phase 9
  (Checkbox) — Switch ratifies them with one additional twist: the **outline** + **soft**
  variants benefit from a contrasting **colored indicator on the thumb/inner element**, not just
  a colored border. Radio's "dot" inside the box is the same shape of problem and the same shape
  of solution — paint the dot with the role color when checked, regardless of variant.

- **`useFormFieldA11y` consumption pattern** identical to Checkbox: flat-spread, kebab
  `aria-describedby`, describedby-merge handled in the component (not the hook) until `<Field>`
  ships.

- **Hot-surface protocol working as documented:** I added Switch to `packages/components/src/index.ts`
  via surgical `StrReplace` insert (between Progress and Textarea alphabetically), and re-read
  the file to verify the full alphabetical list before flipping the plan to completed. Two other
  components (Progress, Card) landed in the file between my Phase 9 ship and Phase 10 start —
  the surgical-edit protocol held.

### Outstanding (not blocking ship)

- Workspace-wide `pnpm typecheck` currently fails inside `__tests__/CircularProgress.test.tsx`
  (Phase 24, SDS-Agent6's territory) on `'arc' is possibly 'undefined'` — flagged in room,
  unrelated to Switch. Switch typechecks clean in isolation.