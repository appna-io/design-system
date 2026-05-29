# Phase 9 — `<Checkbox />`

> Status: **Completed** · Depends on: Phase 7 (`useFormFieldA11y` — shipped) · Blocks: Phase 11 (Radio shares the boolean-control conventions established here)

## Objective

Ship the canonical boolean control — `<Checkbox />` — that hides the native checkbox and paints a
custom indicator while preserving full native semantics (form participation, keyboard, screen-reader
behavior).

Checkbox introduces a pattern reused by Switch (Phase 10) and Radio (Phase 11):

1. **Visually-hidden native input** drives state + form participation.
2. **Custom-painted indicator** as a sibling `<span>`, styled via the recipe.
3. **Label slot** as a sibling text node, optionally with a description below.

If we get Checkbox right, Switch and Radio are 80%-done by symmetry.

---

## What This Component Proves

- Engine handles **tri-state** components (`unchecked` / `checked` / `indeterminate`) cleanly via the recipe's compound-variant rows.
- The recipe paints a custom indicator without the component code touching class strings.
- `useThemedClasses` `slot` argument (added in Phase 7) gracefully theme-overrides sub-parts (`root`, `control`, `label`).
- Form participation: a `<Checkbox name="…" value="…">` inside `<form>` submits exactly like a native checkbox.

---

## Public API

```tsx
import { Checkbox } from 'apx-ds';

<Checkbox>Accept terms</Checkbox>

<Checkbox
  variant="solid"                 // 'solid' (default) | 'outline' | 'soft'
  size="md"                       // 'sm' | 'md' | 'lg'
  color="primary"                 // 7-color palette — drives the checked fill / outline color
  shape="square"                  // 'square' (default) | 'rounded' | 'circle' — affects the box

  checked={checked}               // controlled
  defaultChecked={false}
  indeterminate={false}           // visual + aria-checked="mixed"
  onCheckedChange={(c) => setChecked(c)}

  name="terms"
  value="on"
  required={false}
  disabled={false}
  invalid={false}

  description="You can change this later."    // optional secondary text under the label
  labelPosition="right"           // 'right' (default) | 'left' — for RTL or icon-first layouts

  id="terms"
  className=""
  style={{}}
  sx={{}}
>
  Accept the terms of service
</Checkbox>
```

### Prop Decisions

- **`onCheckedChange(checked)` is the canonical handler** (Radix convention). Native `onChange` still works (preserved) but it carries the verbose `ChangeEvent` shape; `onCheckedChange` gets the boolean directly.
- **`indeterminate` is a separate prop, not a third state of `checked`.** Native HTML matches this. `aria-checked="mixed"` is set automatically when `indeterminate && !checked`. (Per ARIA spec, indeterminate can coexist with either checked or unchecked; we follow the native checkbox behavior.)
- **`shape` is new** — not on Button, not on Input. Some products want pill-shaped checkboxes (think gamified UIs). Three values: `square` (default), `rounded` (slight pill curve), `circle` (full pill — looks like a tiny switch). Defaults to `square` so consumers who don't care get the conventional look.
- **`description` is a built-in slot** rather than asking consumers to wrap manually. Renders below the label, smaller and muted. Consumers needing more layout flexibility opt out (`<Checkbox>` with no description prop + manual JSX below).

---

## Variants — Designed Inline

Three variants. Each defines how the **checked** indicator looks. Unchecked is consistent across
variants (an outlined box).

| Variant   | Checked appearance                                  | When to use                                          |
| --------- | --------------------------------------------------- | ---------------------------------------------------- |
| `solid`   | Filled `bg-<color>` with `text-<color>-contrast` check glyph | **Default.** Most common. High visibility.   |
| `outline` | Transparent bg, `border-<color>` 2px, `text-<color>` check   | Lighter, for surfaces where solid would feel heavy.  |
| `soft`    | `bg-<color>-subtle` tint, `text-<color>` check               | Editorial/forms-heavy contexts where many checkboxes don't shout. |

### Variant × color matrix

Compound rows fill the 3 × 7 = 21 cells. The pattern is the same as Button's compound rules,
applied to the **indicator** node, not the wrapper:

```ts
compoundVariants: [
  // solid
  { variant: 'solid', color: 'primary',
    class: 'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-contrast data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary' },
  // …6 more solid colors
  // outline
  { variant: 'outline', color: 'primary',
    class: 'data-[state=checked]:border-primary data-[state=checked]:text-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary' },
  // …6 more outline colors
  // soft
  { variant: 'soft', color: 'primary',
    class: 'data-[state=checked]:bg-primary-subtle data-[state=checked]:border-primary/40 data-[state=checked]:text-primary data-[state=indeterminate]:bg-primary-subtle data-[state=indeterminate]:border-primary/40 data-[state=indeterminate]:text-primary' },
  // …6 more soft colors
]
```

**Invalid** state takes precedence over color (compound rule keyed by `{ invalid: true }` flips the
border + ring to `danger` regardless of `color`).

### Sizes

| Size | Box       | Check glyph | Label font  | Gap between box and label |
| ---- | --------- | ----------- | ----------- | ------------------------- |
| `sm` | `size-3.5`| `size-2.5`  | `text-sm`   | `gap-1.5`                 |
| `md` | `size-4`  | `size-3`    | `text-sm`   | `gap-2`                   |
| `lg` | `size-5`  | `size-3.5`  | `text-base` | `gap-2.5`                 |

### Shapes

```ts
variants: {
  shape: {
    square:  'rounded-xs',
    rounded: 'rounded-md',
    circle:  'rounded-full',
  },
}
```

### Indeterminate glyph

`indeterminate` renders a horizontal-bar glyph (`<svg><line>…</line></svg>`) instead of the check.
Both glyphs are inline SVGs in the component file — never inlined twice (the same icon constants
are reused for Radio + Switch where relevant).

---

## File Structure

```
packages/components/src/Checkbox/
├── Checkbox.tsx
├── Checkbox.types.ts
├── Checkbox.recipe.ts        # the indicator recipe (the control box)
├── Checkbox.icons.tsx        # CheckIcon, MinusIcon — local SVGs
├── Checkbox.test.tsx
├── Checkbox.a11y.test.tsx
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── Shapes.tsx
    ├── Indeterminate.tsx     # parent-checkbox-of-children pattern
    ├── WithDescription.tsx
    ├── Disabled.tsx
    ├── Invalid.tsx
    ├── Group.tsx             # cluster of Checkboxes (manual, no CheckboxGroup yet)
    └── Controlled.tsx
```

> No `CheckboxGroup` in this phase — multiple checkboxes are independent. A `Group` wrapper is a
> separate, smaller component that ships when `<Field>` does (so it can share label/error wiring).

---

## Recipe Sketch

Checkbox has **three** recipe slots — `root`, `control`, `label`. The engine extension from Phase 7
(`useThemedClasses({ slot })`) lets consumers theme-override each independently.

```ts
// Checkbox.recipe.ts
import { cv } from '@apx-dsine';

export const checkboxRecipes = {
  root: cv({
    base: 'inline-flex items-start cursor-pointer select-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50',
    variants: {
      size: {
        sm: 'gap-1.5 text-sm',
        md: 'gap-2 text-sm',
        lg: 'gap-2.5 text-base',
      },
      labelPosition: {
        right: 'flex-row',
        left: 'flex-row-reverse',
      },
    },
    defaultVariants: { size: 'md', labelPosition: 'right' },
  }),
  control: cv({
    base: [
      'relative shrink-0 inline-flex items-center justify-center',
      'border border-border bg-bg-paper',
      'transition-[background-color,border-color,color,box-shadow] duration-fast ease-standard',
      'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg',
      'data-[invalid=true]:border-danger data-[invalid=true]:peer-focus-visible:ring-danger',
    ].join(' '),
    variants: {
      variant: { solid: '', outline: 'border-2', soft: '' },
      size: {
        sm: 'size-3.5 rounded-xs',
        md: 'size-4 rounded-sm',
        lg: 'size-5 rounded-md',
      },
      shape: {
        square:  '',
        rounded: '!rounded-md',
        circle:  '!rounded-full',
      },
      color: { primary: '', secondary: '', success: '', warning: '', danger: '', info: '', neutral: '' },
    },
    compoundVariants: [
      /* see "Variant × color matrix" above */
    ],
    defaultVariants: { variant: 'solid', size: 'md', shape: 'square', color: 'primary' },
  }),
  label: cv({
    base: 'leading-tight',
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: { size: 'md' },
  }),
};
```

The three-recipe pattern becomes the template for any component with a custom-painted indicator
(Radio, Switch). Promote to `_shared/` if a fourth consumer appears.

---

## Component Sketch

```tsx
'use client';
import { forwardRef, warn } from '@apx-dsine';
import { useThemedClasses } from '@apx-dsme';
import { useFormFieldA11y } from '../_shared/useFormFieldA11y';
import { CheckIcon, MinusIcon } from './Checkbox.icons';
import { checkboxRecipes } from './Checkbox.recipe';
import type { CheckboxProps } from './Checkbox.types';

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(props, ref) {
  const {
    variant, size, color, shape, labelPosition,
    checked, defaultChecked, indeterminate,
    invalid, disabled, required, name, value,
    description, children,
    onCheckedChange, onChange,
    className, style, sx,
    ...rest
  } = props;

  const a11y = useFormFieldA11y({ id: props.id, invalid, required });
  const state = indeterminate && !checked ? 'indeterminate' : checked ? 'checked' : 'unchecked';

  // Two-axis warning: no label content AND no aria-label
  warn(
    Boolean(children) || Boolean(rest['aria-label']) || Boolean(rest['aria-labelledby']),
    '<Checkbox> requires label content (children) or an `aria-label`/`aria-labelledby`.',
    'CHECKBOX_NO_LABEL',
  );

  const rootCls = useThemedClasses({
    recipe: checkboxRecipes.root,
    componentName: 'Checkbox',
    slot: 'root',
    props: { size, labelPosition, className, sx, style },
  });
  const controlCls = useThemedClasses({
    recipe: checkboxRecipes.control,
    componentName: 'Checkbox',
    slot: 'control',
    props: { variant, size, color, shape, invalid },
  });
  const labelCls = useThemedClasses({
    recipe: checkboxRecipes.label,
    componentName: 'Checkbox',
    slot: 'label',
    props: { size },
  });

  return (
    <label className={rootCls.className} style={rootCls.style} data-disabled={disabled || undefined}>
      <input
        ref={mergeRefs(ref, indeterminateRef(indeterminate))}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        name={name}
        value={value}
        aria-checked={indeterminate && !checked ? 'mixed' : undefined}
        {...a11y}
        {...rest}
        onChange={(e) => {
          onChange?.(e);
          onCheckedChange?.(e.target.checked);
        }}
      />
      <span
        aria-hidden="true"
        className={controlCls.className}
        data-state={state}
        data-invalid={invalid || undefined}
      >
        {state === 'checked' ? <CheckIcon /> : null}
        {state === 'indeterminate' ? <MinusIcon /> : null}
      </span>
      {children || description ? (
        <span className="flex flex-col">
          {children ? <span className={labelCls.className}>{children}</span> : null}
          {description ? (
            <span className="text-xs text-fg-muted leading-snug mt-0.5">{description}</span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
}, 'Checkbox');
```

`indeterminateRef` is a tiny ref callback that sets `el.indeterminate = boolean` (a DOM property, not
an HTML attribute, so it can't be set declaratively).

---

## Types

```ts
import type { InputHTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-dsine';

export type CheckboxVariant = 'solid' | 'outline' | 'soft';
export type CheckboxSize = 'sm' | 'md' | 'lg';
export type CheckboxColor =
  | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type CheckboxShape = 'square' | 'rounded' | 'circle';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'color' | 'size' | 'type' | 'onChange'> {
  variant?: ResponsiveValue<CheckboxVariant>;
  size?: ResponsiveValue<CheckboxSize>;
  color?: ResponsiveValue<CheckboxColor>;
  shape?: CheckboxShape;
  labelPosition?: 'left' | 'right';
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  invalid?: boolean;
  description?: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sx?: Sx;
}
```

---

## Accessibility

- Renders a real `<input type="checkbox">` inside a `<label>` — clicking the label toggles state natively.
- Visually-hidden input via `sr-only` (Tailwind) — focus + form participation preserved.
- `aria-checked="mixed"` set automatically when indeterminate without checked.
- Focus ring on the **control box** via `peer-focus-visible:ring-*` — the styled box reacts to the hidden input's focus.
- Keyboard: Space toggles; Enter does **not** (matches native and Radix convention).
- `invalid` sets `aria-invalid` and `data-invalid` on the control box.
- Dev-warn (`CHECKBOX_NO_LABEL`) fires when neither `children` nor `aria-label`/`aria-labelledby` is provided.
- axe-core: zero violations across the variant × color × state matrix.

---

## Animation / Interactions

- Check glyph fade-in: `motion/react`'s `motion.svg` with `initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.12 }}`. **Only when state actually changes** (not on first paint of `defaultChecked`).
- Indeterminate glyph slides in: simpler `opacity` transition.
- Background-color transition: CSS, 120ms — matches the glyph timing so they read as one event.
- `prefers-reduced-motion`: scale-in disabled, opacity kept (so the change is still perceptible).

---

## Responsive

```tsx
<Checkbox size={{ base: 'sm', md: 'md', lg: 'lg' }}>Subscribe</Checkbox>
```

Recipe handles it via `resolveResponsive`. Per-slot responsive resolution shares the same engine pass.

---

## RTL

- `labelPosition` is logical — `right` means **end** in LTR and **start** in RTL. The recipe maps to `flex-row` / `flex-row-reverse` based on direction.
- The check glyph itself is centered and doesn't need flipping.
- Description text inherits the parent direction.

---

## Override Examples

```tsx
<ThemeProvider theme={defineTheme({
  components: {
    Checkbox: {
      defaultProps: { variant: 'outline', shape: 'rounded' },
      styleOverrides: {
        root: 'gap-3',
        control: 'shadow-xs',
        label: 'font-medium',
      },
    },
  },
})} />

<Checkbox className="text-lg" sx={{ radius: 'lg' }} style={{ accentColor: '#0ea5e9' }}>
  Override me
</Checkbox>
```

The `slot` argument on `useThemedClasses` (introduced in Phase 7) is exercised here at full strength.

---

## Examples List

| File                  | Demonstrates                                          |
| --------------------- | ----------------------------------------------------- |
| `Basic.tsx`           | Default with text label                               |
| `Variants.tsx`        | solid / outline / soft                                |
| `Sizes.tsx`           | sm / md / lg                                          |
| `Colors.tsx`          | All 7 checked colors                                  |
| `Shapes.tsx`          | square / rounded / circle                             |
| `Indeterminate.tsx`   | Parent-of-children tri-state pattern                  |
| `WithDescription.tsx` | label + description slot                              |
| `Disabled.tsx`        | Disabled (both checked and unchecked)                 |
| `Invalid.tsx`         | Invalid state with helper text below                  |
| `Group.tsx`           | Manual cluster (preview of future CheckboxGroup)      |
| `Controlled.tsx`      | Controlled vs uncontrolled side-by-side               |

---

## Testing Plan

`Checkbox.test.tsx`:
- Renders default unchecked
- `checked` prop reflects on the underlying input
- `defaultChecked` works for uncontrolled
- Clicking the label toggles
- `onCheckedChange` called with the new boolean
- `onChange` still fires (native event preserved)
- `indeterminate` sets the DOM property + `aria-checked="mixed"`
- `disabled` blocks toggling + sets `data-disabled` on the root
- `invalid` sets `data-invalid` on the control + `aria-invalid` on the input
- `variant` / `color` / `shape` / `size` apply correct classes per slot
- `description` renders only when provided
- `labelPosition="left"` reverses the flex direction
- Form participation: `<form><Checkbox name="x" value="on" defaultChecked /></form>` serializes correctly
- `ref` is forwarded to the underlying `<input>`
- Theme `styleOverrides.{ root, control, label }` all merge correctly

`Checkbox.a11y.test.tsx`:
- axe passes for every variant × state combo (checked / unchecked / indeterminate / disabled / invalid)
- Tab focuses the checkbox (ring shows on the control box)
- Space toggles; Enter is a no-op
- Dev-warn fires when no label content + no aria-label

---

## File-Level Tasks (Ordered)

1. [ ] Create `packages/components/src/Checkbox/` folder
2. [ ] Write `Checkbox.icons.tsx` (CheckIcon, MinusIcon — pure SVG, ~10 lines each)
3. [ ] Write `Checkbox.types.ts`
4. [ ] Write `Checkbox.recipe.ts` (three-recipe map)
5. [ ] Write `Checkbox.tsx`
6. [ ] Write `meta.ts` (category `Inputs`, tags `['form', 'selection', 'boolean']`)
7. [ ] Write `Checkbox.test.tsx`
8. [ ] Write `Checkbox.a11y.test.tsx`
9. [ ] Write 11 example files
10. [ ] Write `README.mdx`
11. [ ] Export from `packages/components/src/index.ts` + `apx-ds
12. [ ] Renderer discovery check + props table population
13. [ ] Bundle delta: < 3 KB gzipped (the two SVG icons + recipe constitute most of the addition)

---

## Acceptance Criteria

- [ ] Renders a real `<input type="checkbox">`; form-participation works as native.
- [ ] All 3 variants × 7 colors × 3 shapes render in both modes (63 visual states).
- [ ] `indeterminate` sets the DOM property and `aria-checked="mixed"`.
- [ ] Click on label toggles; keyboard Space toggles; Enter is a no-op.
- [ ] Focus ring appears around the control box, not just the hidden input.
- [ ] Theme overrides via `styleOverrides.{ root, control, label }` work independently.
- [ ] RTL: `labelPosition="right"` swaps visually to start.
- [ ] axe-core passes for every cell.
- [ ] Dev-warn for missing label fires correctly.

---

## DRY Self-Check

- [ ] No `cn` / `clsx` import in `Checkbox.tsx`
- [ ] `useFormFieldA11y` imported from `_shared/` — not re-implemented
- [ ] The three-slot recipe pattern documented at the top of `Checkbox.recipe.ts` so Radio + Switch can copy-paste-modify it
- [ ] CheckIcon + MinusIcon live in one file; if Radio needs CheckIcon (it doesn't), promote to `_shared/`
- [ ] Adding a new color works without component changes (test asserts this)
- [ ] Adding a new variant (`gradient`-pattern hypothetical) = one recipe entry + 7 compound rows, zero component changes

---

## Out of Scope (Future Components / Phases)

- `<CheckboxGroup>` — ships with `<Field>`.
- Animated check-draw morph (path-by-path SVG animation) — performance not worth the lines.
- "Toggle-button" variant (a checkbox that looks like a button) — separate `<ToggleButton>` component.
- Tristate cycling on click (unchecked → indeterminate → checked) — opinionated UX; we leave it for consumers.

---

## When This Phase Is Complete

1. Move this file to `plans/completed/components/09-checkbox.md`.
2. Append `## Outcome`: API, bundle delta, axe results, deviations, screenshots of all 63 visual states.
3. Resume Phase 10 — Switch (which reuses the three-slot recipe pattern and the hidden-input technique).

---

## Outcome

**Shipped.** Plan executed with one deviation (description-id auto-wiring beyond what the plan
sketched). Phase 11 (Radio) is now unblocked.

### Final public API

```tsx
<Checkbox
  variant?         // 'solid' | 'outline' | 'soft' — default 'solid'
  size?            // 'sm' | 'md' | 'lg' — default 'md'  (responsive)
  color?           // 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' — default 'primary'  (responsive)
  shape?           // 'square' | 'rounded' | 'circle' — default 'square'
  labelPosition?   // 'left' | 'right' — default 'right'  (logical: 'right' = end side)
  checked?         // controlled boolean
  defaultChecked?  // uncontrolled initial boolean
  indeterminate?   // tri-state visual; sets aria-checked="mixed" when !checked
  invalid?         // sets aria-invalid + data-invalid
  disabled?
  required?
  description?     // ReactNode rendered below label, auto-wired via aria-describedby
  onCheckedChange? // (next: boolean) => void
  onChange?        // native ChangeEvent handler (preserved alongside onCheckedChange)
  asChild?         // not implemented — Checkbox is fundamentally an <input>; would defeat semantics
  className?  sx?  style?  id?  name?  value?  ...all native InputHTMLAttributes
>
  {label}
</Checkbox>
```

### Component matrix shipped

- **3 variants × 7 colors × 3 sizes × 3 shapes = 189 visual cells**, plus the orthogonal axes:
  `unchecked` / `checked` / `indeterminate` × `invalid` × `disabled` × `labelPosition`.
- Three independently overridable slots: `root`, `control`, `label`. Theme override targets:
  `theme.components.Checkbox.styleOverrides.{root, control, label}`.

### File layout

```
packages/components/src/Checkbox/
  Checkbox.tsx              # forwardRef + useControllableState + useFormFieldA11y + indeterminate-ref
  Checkbox.types.ts         # CheckboxProps + variant/size/color/shape/labelPosition unions
  Checkbox.recipe.ts        # three slots, 21 focus-ring + 21 state compound rows (flat, scanner-friendly)
  Checkbox.icons.tsx        # CheckIcon (12×12) + MinusIcon (12×12), currentColor stroke
  meta.ts                   # category: 'Inputs', tags: ['form','selection','boolean','checkbox']
  README.mdx                # overview + 11 examples + props + a11y + theming + RTL + do/don't
  examples/
    Basic.tsx
    Variants.tsx
    Sizes.tsx
    Colors.tsx
    Shapes.tsx
    Indeterminate.tsx       # parent-of-children pattern, real-world use case
    WithDescription.tsx
    Disabled.tsx
    Invalid.tsx
    Group.tsx               # fieldset + legend, controlled state
    Controlled.tsx          # side-by-side controlled vs uncontrolled
packages/components/__tests__/
  Checkbox.test.tsx         # 28 unit + interaction + form-participation tests
  Checkbox.a11y.test.tsx    # 9 jest-axe + keyboard + ARIA + dev-warning tests
packages/components/src/index.ts  # alphabetical insert between Button and Input
```

### Acceptance criteria check

- [x] Native `<input type="checkbox">` inside `<label>` — clicking label toggles, form participation natively.
- [x] Three slots (`root`, `control`, `label`) independently overridable via `useThemedClasses({ slot })`.
- [x] Tri-state with correct ARIA: `aria-checked="mixed"` when `indeterminate && !checked` (not when both true).
- [x] DOM `indeterminate` property mirrored from prop via a ref-callback (HTML attribute won't work).
- [x] Variant × color matrix (21 cells) painted via flat `compoundVariants` (Tailwind scanner sees every utility literally — no template-literal generation).
- [x] Focus ring lands on the *control box* (`peer-focus-visible:ring-*`) and matches the active color for every cell.
- [x] `useFormFieldA11y` consumed correctly — flat spread-ready return (kebab `aria-describedby`), matches @SDS-Agent4's Phase 7 contract.
- [x] `description` slot rendered with an auto-id and merged into `aria-describedby` (preserves any consumer-supplied describedby).
- [x] Dev-warns (one-shot) when no children + no `aria-label` + no `aria-labelledby` — code `CHECKBOX_NO_LABEL`.
- [x] Controlled (`checked`) ↔ uncontrolled (`defaultChecked`) via `useControllableState`.
- [x] `labelPosition` logical (`right` → end in LTR / start in RTL via `flex-row` ↔ `flex-row-reverse`).
- [x] 11 example files matching plan §Examples.
- [x] axe-core clean across the variant × color matrix + indeterminate + disabled + invalid + description states.
- [x] Typecheck clean (`pnpm typecheck` → 0 errors).
- [x] Lint clean (`pnpm lint` → 0 errors).
- [x] Tests: **37/37 Checkbox tests pass**; full suite **257/257 pass** (15 test files).
- [x] Bundle delta: **+2.24 KB gz** (2,292 bytes) — measured by building with vs without the Checkbox export, back-to-back. Within plan budget.

### Deviations from the plan-as-written

1. **`description`-id merging.** The plan §Component Sketch passes `'aria-describedby'` straight
   to `useFormFieldA11y`. In practice, when a consumer *also* supplies their own
   `aria-describedby`, the two ids need to be merged — otherwise the consumer's id is lost.
   Added a tiny `mergeDescribedBy()` helper in `Checkbox.tsx` that space-joins + dedups before
   passing to the hook. Hook itself stays pass-through (matches @SDS-Agent4's Q3 disposition —
   merging belongs in consumers until `<Field>` ships and centralizes it).

2. **No template-literal generation of compound rows.** The plan §Component Sketch shows
   `data-[state=checked]:bg-${color}` in commentary. Following @SDS-Agent4's Phase 7 lesson
   (Tailwind's content scanner is a literal string matcher), all 42 compound rows are written
   out flat (21 focus-ring cells + 21 state cells = 42 total). No `variantColorMatrix.ts`
   extracted — Checkbox is the third consumer pattern-wise but its color rules differ enough
   from Input's that flat-writing is still clearer here. Extraction can happen when Switch
   (Phase 10) and Radio (Phase 11) land and we see what's actually shared.

3. **`asChild` deliberately omitted.** Checkbox is fundamentally an `<input>`; rendering as a
   `<button>` or `<a>` would lose form participation, native keyboard handling, and the `:checked`
   pseudo-class. The plan didn't ask for it; not adding it.

4. **No new shared files.** `_shared/` was not touched. `useFormFieldA11y` consumed read-only.

### Coordination notes for downstream phases

- **Phase 10 (Switch — same author, SDS-Agent3):** Will mirror this three-slot structure with
  `root`, `track`, `thumb` (no `label` slot? — TBD per Switch plan). The hidden-input pattern is
  identical. Indeterminate doesn't apply.
- **Phase 11 (Radio — SDS-Agent2):** The boolean-control conventions land here. Specifically:
  - Hidden-input + custom-indicator + label, with `<label>` as the click target.
  - `useFormFieldA11y` consumption pattern (with kebab `aria-describedby`).
  - Three-slot recipe (`root`, `control`, `label`).
  - `data-state` attribute on the control for state-driven compound rules.
  - Description-id auto-wiring with describedby-merging.
  RadioGroup will own the `aria-required` / single-selection logic at the group level — per-Radio
  `required` is intentionally not respected (matches native `<input type="radio">` semantics).

### Smoke test (renderer)

The Checkbox folder is `Checkbox/` (no underscore prefix) so @SDS-Agent4's `discover.ts` filter
doesn't affect it. Examples render through the existing example pipeline; no new renderer wiring
needed.
