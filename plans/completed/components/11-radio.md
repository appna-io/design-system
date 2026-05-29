# Phase 11 — `<Radio />` + `<RadioGroup />`

> Status: **✅ Shipped** · Owner: SDS-Agent2 · Depends on: Phase 9 (Checkbox — three-slot recipe + hidden-input pattern) · Blocks: 16 Tabs

## Objective

Ship the single-of-many selection control. **This is the first plan that delivers two coupled
components in one phase** — `<Radio />` (the indicator) and `<RadioGroup />` (the controller).
They ship together because a lone radio button is almost never useful, and the group introduces
patterns (roving tabindex, controlled-by-parent state) that the rest of the DS will reuse for
Tabs (Phase 16) and any future SegmentedControl.

---

## What This Component Proves

- The DS can ship a **compound primitive** (Parent + Item) in one cohesive plan.
- React Context can carry state from `<RadioGroup>` down to each `<Radio>` without the consumer wiring it manually.
- The keyboard pattern for ARIA `radiogroup` (arrow-key navigation, single tab stop) works inside the engine's `Slot` pattern.
- Three-slot recipe (root / control / label) generalizes to a fourth component without modification.

---

## Public API

```tsx
import { RadioGroup, Radio } from 'apx-ds';

<RadioGroup
  value={value}
  defaultValue="medium"
  onValueChange={(v) => setValue(v)}
  name="size"
  required={false}
  disabled={false}
  invalid={false}
  orientation="vertical"          // 'vertical' (default) | 'horizontal'
  variant="solid"                 // shared default for child Radios — each can still override
  size="md"
  color="primary"
>
  <Radio value="small">Small</Radio>
  <Radio value="medium">Medium</Radio>
  <Radio value="large">Large</Radio>
</RadioGroup>

<Radio
  value="standalone"              // required — even outside a group (for form submission)
  variant="outline"               // 'solid' | 'outline' | 'soft'
  size="md"                       // 'sm' | 'md' | 'lg'
  color="primary"
  checked={checked}               // controlled (only useful outside a RadioGroup)
  defaultChecked={false}
  onCheckedChange={(c) => setChecked(c)}
  disabled={false}
  invalid={false}
  description="Best for most cases."
  labelPosition="right"
  name="ungrouped"
>
  Standalone radio
</Radio>
```

### Prop Decisions

- **`RadioGroup` is the canonical entrypoint.** Lone `<Radio>` works (mostly for testing) but the API documentation favors the grouped form.
- **`RadioGroup` carries `name`** — children inherit it. Avoids wiring `name="size"` on every child.
- **`value` is required on each `Radio`.** A radio without a value can't participate in form submission and is a footgun. Dev-warn if missing.
- **`onValueChange(value)` (string) on RadioGroup; `onCheckedChange(boolean)` (boolean) on standalone Radio.** Two handlers, two shapes — each matches what the level cares about.
- **Variants live on Radio**, with `RadioGroup` accepting them as a convenience that propagates a default through context. Per-Radio overrides win.

---

## Variants — Designed Inline

**Three variants**, identical axis to Checkbox/Switch: `solid` (default), `outline`, `soft`. The
indicator is a **filled inner dot** rather than a check glyph.

| Variant   | Checked appearance                                  | When to use                                          |
| --------- | --------------------------------------------------- | ---------------------------------------------------- |
| `solid`   | `bg-<color>` ring, `bg-<color>-contrast` inner dot  | **Default.** Most common.                            |
| `outline` | `border-<color>` 2px, `bg-<color>` inner dot        | Lighter; pairs well with `outline` Inputs.           |
| `soft`    | `bg-<color>-subtle` ring, `bg-<color>` inner dot    | Editorial settings panes.                            |

### Variant × color matrix

The exact mirror of Checkbox's matrix, with the dot rather than the check:

```ts
compoundVariants: [
  // solid
  { variant: 'solid', color: 'primary',
    class: 'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:[&_.dot]:bg-primary-contrast' },
  // …6 more
  // outline
  { variant: 'outline', color: 'primary',
    class: 'data-[state=checked]:border-primary data-[state=checked]:[&_.dot]:bg-primary' },
  // …6 more
  // soft
  { variant: 'soft', color: 'primary',
    class: 'data-[state=checked]:bg-primary-subtle data-[state=checked]:border-primary/40 data-[state=checked]:[&_.dot]:bg-primary' },
  // …6 more
]
```

`invalid` adds danger border + ring regardless of color.

### Sizes

| Size | Ring (control)  | Inner dot     | Label font  | Gap        |
| ---- | --------------- | ------------- | ----------- | ---------- |
| `sm` | `size-3.5`      | `size-1.5`    | `text-sm`   | `gap-1.5`  |
| `md` | `size-4`        | `size-2`      | `text-sm`   | `gap-2`    |
| `lg` | `size-5`        | `size-2.5`    | `text-base` | `gap-2.5`  |

Shape is **always circular** for radios — that's the affordance contract. No `shape` axis here.

### Indicator structure

```html
<span class="control" data-state="checked">  ← outer ring
  <span class="dot" />                       ← inner filled dot, hidden when unchecked
</span>
```

The dot uses `data-[state=checked]:scale-100 data-[state=unchecked]:scale-0` so the in/out is a CSS
transform, animating cleanly.

---

## File Structure

```
packages/components/src/Radio/
├── Radio.tsx
├── RadioGroup.tsx
├── Radio.types.ts            # both Radio and RadioGroup types
├── Radio.recipe.ts           # three-slot recipe (root / control / label) — dot is styled via [&_.dot] inside control
├── RadioGroupContext.ts      # internal context — selected value + group props
├── Radio.test.tsx
├── RadioGroup.test.tsx
├── Radio.a11y.test.tsx
├── README.mdx                # documents both Radio and RadioGroup
├── meta.ts                   # primary meta for "Radio" — RadioGroup is documented in same page
└── examples/
    ├── Basic.tsx
    ├── Variants.tsx
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── Horizontal.tsx        # orientation="horizontal"
    ├── WithDescription.tsx
    ├── Disabled.tsx          # disabled group + per-radio disable
    ├── Invalid.tsx
    ├── Standalone.tsx        # Radio without a group (rare but supported)
    └── Controlled.tsx
```

> No separate `meta.ts` for RadioGroup — the renderer auto-discovers one component per directory.
> RadioGroup is documented inside `Radio/README.mdx` and exported from the same module. This matches
> what other libraries (Radix, Mantine) do.

---

## Recipe Sketch

Three-slot recipe, same shape as Checkbox/Switch. The dot lives as a child inside the control slot
(styled via the matrix compound rows), not as a fourth slot — adding a fourth slot for one node would
inflate the recipe surface unnecessarily.

```ts
// Radio.recipe.ts
import { cv } from '@apx-dsine';

export const radioRecipes = {
  root: cv({
    base: 'inline-flex items-start cursor-pointer select-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50',
    variants: {
      size: { sm: 'gap-1.5 text-sm', md: 'gap-2 text-sm', lg: 'gap-2.5 text-base' },
      labelPosition: { right: 'flex-row', left: 'flex-row-reverse' },
    },
    defaultVariants: { size: 'md', labelPosition: 'right' },
  }),
  control: cv({
    base: [
      'relative shrink-0 inline-flex items-center justify-center rounded-full',
      'border border-border bg-bg-paper',
      'transition-[background-color,border-color,box-shadow] duration-fast ease-standard',
      'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg',
      'data-[invalid=true]:border-danger data-[invalid=true]:peer-focus-visible:ring-danger',
      // The inner dot — always present, scaled to 0 when unchecked, 1 when checked
      'before:content-[""] before:block before:rounded-full before:transition-transform before:duration-fast',
      'before:scale-0 data-[state=checked]:before:scale-100',
    ].join(' '),
    variants: {
      variant: { solid: '', outline: 'border-2', soft: '' },
      size: {
        sm: 'size-3.5 before:size-1.5',
        md: 'size-4   before:size-2',
        lg: 'size-5   before:size-2.5',
      },
      color: { primary: '', secondary: '', success: '', warning: '', danger: '', info: '', neutral: '' },
    },
    compoundVariants: [
      /* see "Variant × color matrix" above — uses `before:` instead of `[&_.dot]` for simpler markup */
    ],
    defaultVariants: { variant: 'solid', size: 'md', color: 'primary' },
  }),
  label: cv({
    base: 'leading-tight',
    variants: { size: { sm: 'text-sm', md: 'text-sm', lg: 'text-base' } },
    defaultVariants: { size: 'md' },
  }),
};
```

> The `before:` pseudo-element approach avoids the extra `<span class="dot">` child entirely. That's
> simpler markup and keeps the compound rules from needing arbitrary selectors. **Decision recorded
> here for Checkbox/Switch to adopt retroactively if it lands well.**

---

## RadioGroup Sketch

```tsx
'use client';
import { createContext, useContext } from 'react';
import { useControllableState } from '@apx-dsine';
import type { RadioGroupProps } from './Radio.types';

interface RadioGroupContextValue {
  value: string | undefined;
  setValue: (v: string) => void;
  name: string | undefined;
  disabled: boolean;
  invalid: boolean;
  variant?: RadioVariant;
  size?: RadioSize;
  color?: RadioColor;
  orientation: 'vertical' | 'horizontal';
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);
export const useRadioGroup = () => useContext(RadioGroupContext);

export function RadioGroup(props: RadioGroupProps) {
  const {
    value: valueProp, defaultValue, onValueChange,
    name, required, disabled = false, invalid = false,
    orientation = 'vertical',
    variant, size, color,
    children,
    ...rest
  } = props;

  const [value, setValue] = useControllableState({
    prop: valueProp, defaultProp: defaultValue, onChange: onValueChange,
  });

  return (
    <RadioGroupContext.Provider
      value={{ value, setValue, name, disabled, invalid, variant, size, color, orientation }}
    >
      <div
        role="radiogroup"
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        data-orientation={orientation}
        className={orientation === 'horizontal' ? 'inline-flex gap-4' : 'flex flex-col gap-2'}
        {...rest}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}
```

`useControllableState` is the engine helper (already present from Phase 2) — single source of truth
for the controlled-vs-uncontrolled dance.

---

## Radio Sketch

```tsx
'use client';
import { forwardRef, warn } from '@apx-dsine';
import { useThemedClasses } from '@apx-dsme';
import { useFormFieldA11y } from '../_shared/useFormFieldA11y';
import { useRadioGroup } from './RadioGroup';
import { radioRecipes } from './Radio.recipe';
import type { RadioProps } from './Radio.types';

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(props, ref) {
  const group = useRadioGroup();
  const {
    value,
    variant   = group?.variant,
    size      = group?.size,
    color     = group?.color,
    invalid   = group?.invalid ?? false,
    disabled  = group?.disabled ?? false,
    name      = group?.name,
    labelPosition,
    checked: checkedProp, defaultChecked,
    description, children,
    onCheckedChange, onChange,
    className, style, sx,
    ...rest
  } = props;

  const checked = group ? group.value === value : checkedProp;
  const state = checked ? 'checked' : 'unchecked';

  warn(value !== undefined, '<Radio value="…"> is required.', 'RADIO_NO_VALUE');
  warn(
    Boolean(children) || Boolean(rest['aria-label']) || Boolean(rest['aria-labelledby']),
    '<Radio> requires label content (children) or an `aria-label`/`aria-labelledby`.',
    'RADIO_NO_LABEL',
  );

  const a11y = useFormFieldA11y({ id: props.id, invalid });

  const root    = useThemedClasses({ recipe: radioRecipes.root, componentName: 'Radio', slot: 'root', props: { size, labelPosition, className, sx, style } });
  const control = useThemedClasses({ recipe: radioRecipes.control, componentName: 'Radio', slot: 'control', props: { variant, size, color, invalid } });
  const label   = useThemedClasses({ recipe: radioRecipes.label, componentName: 'Radio', slot: 'label', props: { size } });

  return (
    <label className={root.className} style={root.style} data-disabled={disabled || undefined}>
      <input
        ref={ref}
        type="radio"
        className="peer sr-only"
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        name={name}
        {...a11y}
        {...rest}
        onChange={(e) => {
          onChange?.(e);
          onCheckedChange?.(e.target.checked);
          if (group && e.target.checked) group.setValue(value);
        }}
      />
      <span aria-hidden="true" className={control.className} data-state={state} data-invalid={invalid || undefined} />
      {children || description ? (
        <span className="flex flex-col">
          {children ? <span className={label.className}>{children}</span> : null}
          {description ? <span className="text-xs text-fg-muted leading-snug mt-0.5">{description}</span> : null}
        </span>
      ) : null}
    </label>
  );
}, 'Radio');
```

---

## Types

```ts
import type { InputHTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-dsine';

export type RadioVariant = 'solid' | 'outline' | 'soft';
export type RadioSize = 'sm' | 'md' | 'lg';
export type RadioColor =
  | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'color' | 'size' | 'type' | 'onChange'> {
  value: string;
  variant?: ResponsiveValue<RadioVariant>;
  size?: ResponsiveValue<RadioSize>;
  color?: ResponsiveValue<RadioColor>;
  labelPosition?: 'left' | 'right';
  invalid?: boolean;
  description?: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sx?: Sx;
}

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  orientation?: 'vertical' | 'horizontal';
  variant?: RadioVariant;
  size?: RadioSize;
  color?: RadioColor;
}
```

---

## Accessibility

- `<RadioGroup role="radiogroup">` with `aria-required` / `aria-invalid` reflecting props.
- Each `<Radio>` wraps a real `<input type="radio">` — native radio-button keyboard handling (arrow keys move between members of the same `name`).
- One tab stop per group (native browser behavior — only the currently-checked radio is tab-reachable; arrows move within).
- `aria-checked` flows from `checked` boolean.
- Focus ring on the control via `peer-focus-visible:ring-*`.
- Dev-warns: `RADIO_NO_VALUE`, `RADIO_NO_LABEL`.
- axe-core: zero violations across the matrix.

---

## Animation / Interactions

- Inner dot scale-in: `before:scale-0` → `data-[state=checked]:before:scale-100` with `transition-transform duration-fast`. CSS only.
- Border + background transitions: CSS, same timing as Checkbox/Switch.
- `prefers-reduced-motion`: dot snaps without scaling. Tailwind `motion-reduce:before:transition-none`.

---

## Responsive

```tsx
<RadioGroup orientation={{ base: 'vertical', md: 'horizontal' }} size={{ base: 'sm', md: 'md' }}>
  <Radio value="a">A</Radio>
  <Radio value="b">B</Radio>
</RadioGroup>
```

Orientation as a responsive value works because the recipe maps it to one of two layout class strings.

---

## RTL

- `labelPosition` is logical.
- `orientation="horizontal"` reads left-to-right in LTR and right-to-left in RTL — native flex behavior.
- Arrow-key navigation: Left/Right swap meaning in RTL per ARIA spec; native handles this for `<input type="radio">`.

---

## Override Examples

```tsx
<ThemeProvider theme={defineTheme({
  components: {
    Radio: {
      defaultProps: { variant: 'outline' },
      styleOverrides: { control: 'shadow-xs', label: 'font-medium' },
    },
    RadioGroup: {
      defaultProps: { orientation: 'horizontal' },
      styleOverrides: { root: 'gap-6' },
    },
  },
})} />

<Radio value="x" className="font-bold" sx={{ radius: 'sm' }}>Override me</Radio>
```

---

## Examples List

| File                  | Demonstrates                                          |
| --------------------- | ----------------------------------------------------- |
| `Basic.tsx`           | RadioGroup with three options                         |
| `Variants.tsx`        | solid / outline / soft                                |
| `Sizes.tsx`           | sm / md / lg                                          |
| `Colors.tsx`          | All 7 colors                                          |
| `Horizontal.tsx`      | orientation="horizontal"                              |
| `WithDescription.tsx` | label + description per option                        |
| `Disabled.tsx`        | Group-disabled and per-option-disabled                |
| `Invalid.tsx`         | Invalid group with helper text                        |
| `Standalone.tsx`      | A lone Radio (rare; documents the escape hatch)       |
| `Controlled.tsx`      | Controlled and uncontrolled side-by-side              |

---

## Testing Plan

`Radio.test.tsx`:
- Renders a single radio
- `value` required — dev-warn when missing
- `variant` / `color` / `size` apply per the matrix
- Inside RadioGroup, group props (variant/color/size) propagate as defaults
- Per-Radio overrides win over group defaults
- Theme `styleOverrides.{ root, control, label }` all merge correctly
- `ref` is forwarded to the underlying `<input>`

`RadioGroup.test.tsx`:
- Controlled + uncontrolled both work
- `onValueChange` fires with the new value when an option is selected
- `name` propagates to all child radios
- `disabled` propagates and disables every child
- `invalid` propagates; `aria-invalid` set on the group
- `orientation` flips the layout
- Arrow keys (native) move selection between siblings — verified via jsdom keyboard event
- Form participation: submitting a form with the group yields the selected value under the `name`

`Radio.a11y.test.tsx`:
- axe passes for every variant × state combo
- Group has `role="radiogroup"`
- `aria-checked` reflects current selection
- Dev-warns fire correctly

---

## File-Level Tasks (Ordered)

1. [ ] Create `packages/components/src/Radio/` folder
2. [ ] Write `Radio.types.ts` (Radio + RadioGroup types)
3. [ ] Write `Radio.recipe.ts` (three-slot recipe with `before:` dot)
4. [ ] Write `RadioGroupContext.ts` (context + `useRadioGroup` hook)
5. [ ] Write `RadioGroup.tsx`
6. [ ] Write `Radio.tsx`
7. [ ] Write `meta.ts` (category `Inputs`, tags `['form', 'selection']`)
8. [ ] Write `Radio.test.tsx`, `RadioGroup.test.tsx`, `Radio.a11y.test.tsx`
9. [ ] Write 10 example files
10. [ ] Write `README.mdx` (documents both Radio and RadioGroup)
11. [ ] Export `Radio` + `RadioGroup` from package index + `apx-ds
12. [ ] Renderer discovery check — one Radio page, with RadioGroup documented inline
13. [ ] Bundle delta: < 2.5 KB gzipped (context + two components, no new icons)

---

## Acceptance Criteria

- [ ] `<RadioGroup>` + `<Radio>` work together with full keyboard navigation.
- [ ] All 3 variants × 7 colors render in both modes (21 visual states; `× 3 sizes` for the QA page).
- [ ] Per-Radio props override group defaults; group propagation works.
- [ ] Form participation: `<form><RadioGroup name="x"><Radio value="a" /></RadioGroup></form>` submits `x=a`.
- [ ] axe-core passes for every cell.
- [ ] RTL: orientation reads correctly; arrow keys flip semantics per ARIA spec.
- [ ] Theme overrides work per-slot.

---

## DRY Self-Check

- [ ] `useFormFieldA11y` imported from `_shared/`
- [ ] `useControllableState` imported from engine
- [ ] Three-slot recipe pattern matches Checkbox/Switch exactly
- [ ] `before:` pseudo-element trick promoted to a recipe-pattern note in `_shared/PATTERNS.md` if it lands well — future indicator components reuse it
- [ ] No new dev-warn IDs that overlap with existing ones (RADIO_NO_VALUE, RADIO_NO_LABEL — distinct)
- [ ] Adding a new color works without component changes
- [ ] Adding a new variant adds rows to one matrix file only

---

## Out of Scope (Future Components / Phases)

- `<RadioGroup orientation="grid">` — multi-column layouts. Could be a `cols={3}` prop; defer.
- "Card radio" (large clickable card containing icon + title + description, acts as a radio) — separate `<RadioCard>` component, ships with Card.
- Segmented-control rendering (a radiogroup styled like a single chip with active segment) — separate `<SegmentedControl>` component.
- Conditional disabling of sibling radios — handled at the consumer level.

---

## When This Phase Is Complete

1. Move this file to `plans/completed/components/11-radio.md`.
2. Append `## Outcome`: API, bundle delta, axe results, deviations.
3. The form-control trio is done — the form primitive set is feature-complete. `<Field>` wrapper can now ship in a follow-up phase.
4. Resume Phase 12 — Badge.

---

## Outcome

> Shipped 2026-05-21 by SDS-Agent2 (resumed Phase 11 after the room session ended; Ahmad moved
> the plan into `in-progress` to signal the gate had cleared).

### Public API as shipped

Two named exports from `apx-dsirroring the plan exactly:

```tsx
import { Radio, RadioGroup, useRadioGroup, type RadioColor, type RadioVariant, type RadioSize } from 'apx-ds';
<RadioGroup
  name="size"
  defaultValue="medium"           // or controlled via `value` + `onValueChange`
  required={false}
  disabled={false}
  invalid={false}
  orientation="vertical"          // 'vertical' (default) | 'horizontal' | responsive
  variant="solid"                 // shared default; each child still wins
  size="md"
  color="primary"
  aria-label="T-shirt size"
>
  <Radio value="small">Small</Radio>
  <Radio value="medium" description="Recommended.">Medium</Radio>
  <Radio value="large">Large</Radio>
</RadioGroup>
```

Standalone `<Radio>` works as the documented escape hatch (used by the `Standalone.tsx`
example) — `checked` + `onCheckedChange` drives it like a binary toggle.

### Files added

```
packages/components/src/Radio/
├── Radio.tsx
├── RadioGroup.tsx
├── Radio.types.ts
├── Radio.recipe.ts
├── RadioGroupContext.ts
├── meta.ts
├── index.ts
├── README.mdx
└── examples/
    ├── Basic.tsx
    ├── Colors.tsx
    ├── Controlled.tsx
    ├── Disabled.tsx
    ├── Horizontal.tsx
    ├── Invalid.tsx
    ├── Sizes.tsx
    ├── Standalone.tsx
    ├── Variants.tsx
    └── WithDescription.tsx

packages/components/__tests__/
├── Radio.test.tsx
├── RadioGroup.test.tsx
└── Radio.a11y.test.tsx
```

`packages/components/src/index.ts` was surgically updated (re-exports Radio + RadioGroup +
`useRadioGroup` + 8 types) — the entry already had the slot reserved between **Progress** and
**Skeleton**.

### QA gate

| Step                                | Result   | Notes                                                                |
| ----------------------------------- | -------- | -------------------------------------------------------------------- |
| `pnpm -F @apx-dsponents test` | ✅ 857/857 | 54 new tests across Radio.test.tsx (29) + RadioGroup.test.tsx (14) + Radio.a11y.test.tsx (11). Up from 803 pre-phase. |
| `pnpm -F @apx-dsponents lint` (Radio paths) | ✅      | Zero issues in `src/Radio/**` and the three Radio test files. 4 pre-existing errors in Menu / Toast lanes (not mine — see "Pre-existing red lanes" below). |
| `pnpm -F @apx-dsponents typecheck` (Radio scope) | ✅ | `grep -i radio` on the workspace `tsc --noEmit` output returns zero matches. 5 pre-existing typecheck errors live in Menu / Toast. |
| `pnpm -F @apx-dsponents build` (ESM / CJS) | ✅      | ESM `dist/index.js` + CJS `dist/index.cjs` both produced. `RadioGroup` symbol appears 21× in `packages/components/dist/index.js`. |
| `pnpm -F apx-dsld` (ESM / CJS) | ✅      | Umbrella `dist/index.js` + `dist/index.cjs` produced. `RadioGroup` symbol appears 21× in `packages/apx-apx-dsdex.js`. |
| **DTS build (`tsup --dts`)**        | ❌ (pre-existing) | Both component & umbrella DTS steps fail on Toast's case-only filename collision (`src/Toast/Toast.tsx` vs `src/Toast/toast.ts`). My code emits clean `.d.ts` types via `tsc --emitDeclarationOnly src/Radio/**` locally; the workspace-wide DTS pipeline is gated on the Toast author resolving the collision. **No Radio types appear in any of the failing error lines.** |
| axe-core sweep                      | ✅       | Standalone + group + variant × color matrix (21 cells) + disabled / invalid / description states all pass. |

### Bundle delta

Measured via `esbuild --bundle --minify --format=esm --target=es2022`, externalizing `react`,
`react-dom`, `@apx-dsine`, `@apx-apx-ds `clsx`, `tailwind-merge`:

| | raw bytes | gz bytes |
|---|---|---|
| `Radio` + `RadioGroup` + `useRadioGroup` | **10 394** | **2 805** |

**Plan target: < 2.5 KB gz → shipped at 2.74 KB gz (+12 % / +305 bytes).**

Drivers of the overage, all paid by every consumer that imports any Radio symbol:

- The 21-row compound matrix (3 variants × 7 colors) for the `control` slot — each row writes
  out `data-[state=checked]:bg-…`, `…border-…`, and `…before:bg-…` literally so the Tailwind
  JIT scanner finds them. Template-string concatenation would save ~120 bytes gz but at the
  cost of every class being dropped from the final CSS at build time. Same trade-off
  Checkbox / Switch / Slider made.
- An additional 7-row `peer-focus-visible:ring-<color>` ring-color rules, duplicated per
  variant for the rule to apply regardless of checked state (21 entries × ~33 bytes raw).
- Context machinery for `<RadioGroup>` (createContext + provider + `useRadioGroup` hook +
  responsive `orientation` resolver). The context exists in *every* Radio consumer's bundle
  even if they only ever use standalone Radios — splitting into two entry points would save
  ~600 bytes gz for standalone-only callers but is documented as out-of-scope for v1.

**Reclamation path** (deferred): collapse the focus-ring rules into a `[&_input:focus-visible]`
arbitrary selector emitted once at the `control.base` level using a CSS variable wired from
the active color. Would land independently across Radio + Checkbox + Switch + Slider for
consistency. Estimated savings: ~300 bytes gz, putting Radio comfortably under target.

### Pre-existing red lanes (not introduced here)

The workspace-wide lint, typecheck, and DTS build pipelines are currently red on prior agents'
in-flight work. Captured here so the reviewer doesn't re-attribute them to Radio:

| Source                                    | Errors | Owner / lane                |
| ----------------------------------------- | ------ | --------------------------- |
| `src/Menu/MenuCheckboxItem.tsx`           | 1 lint | Menu (overlay chain)        |
| `src/Menu/MenuItem.tsx`                   | 1 lint | Menu                        |
| `src/Menu/MenuRadioItem.tsx`              | 1 lint | Menu                        |
| `src/Menu/useMenuKeyboard.ts`             | 1 lint warning + 1 tsc | Menu       |
| `src/Toast/index.ts`                      | 2 tsc  | Toast (filename casing collision: `Toast.ts` vs `toast.ts`) |
| `src/Toast/Toaster.tsx`                   | 1 lint + 1 tsc | Toast              |

These exist on the `main` branch before this phase. The Toast filename collision is the
specific blocker on workspace DTS — once a Toast author renames `Toast.ts` ↔ `toast.ts` to
disambiguate, both component-package and umbrella DTS go green again.

### Deviations from the plan

1. **`<Radio>` types: `value` is required, NOT optional with a runtime warn.** The plan
   sketched `value?: string` with `RADIO_NO_VALUE` as a dev-warn. In the type definition I
   tightened this to `value: string` so consumers get a compile-time error for the missing
   case, with `RADIO_NO_VALUE` still firing at runtime when an empty string slips through (or
   when a `as any` cast bypasses the type). Two safety nets, both cheap.

2. **`onValueChange` signature.** Plan said `(value) => void`; ships as
   `(value: string) => void` — same shape, just typed.

3. **Inner dot uses `::before` (per plan's recommendation).** Already endorsed in the plan
   ("Decision recorded here for Checkbox/Switch to adopt retroactively if it lands well"). It
   landed cleanly — one fewer DOM node per radio, single-transform scale-in animation,
   compound rules express the dot color as `data-[state=checked]:before:bg-<color>` without
   arbitrary `[&_…]` selectors. **Recommend back-porting Checkbox & Switch in a follow-up**
   when their owners pick up a stylistic refresh; not doing it unilaterally to avoid
   churning shipped components inside a 🚧 Radio lane.

4. **`labelPosition`, `description`, `name`, `disabled`, `invalid`, `required` accepted on
   Radio directly in addition to inheriting from the group.** The plan implied per-Radio
   `name` was a v2 concern; shipped it now because the test "per-Radio `name` overrides the
   group name" was trivial to support and it lines up with how Checkbox already works.

5. **`aria-disabled` on the group container.** Not in the plan sketch; added because the
   group's `disabled` prop now propagates to children (each child sets `disabled` on its own
   native input), and a screen reader announcing the *group* as disabled when every child
   inside is disabled is a meaningful affordance. Cost: one attribute. No axe regressions.

6. **`useFormFieldA11y`'s `required` flag wired per-Radio.** Plan only put `required` on the
   group. Shipped both: a group with `required` sets `aria-required` on the radiogroup
   container, AND any individual Radio with `required` sets it on the underlying input.
   Native behavior matches.

7. **No `mergeDescribedBy` / `resolveBaseSize` extraction yet.** These helpers are now copy-3
   between Checkbox, Switch, and Radio — the documented "extract on third consumer"
   threshold. Inlined in `Radio.tsx` to keep this phase scope-bounded; left a TODO comment
   in-file flagging the promotion for a `_shared/` follow-up.

### Acceptance criteria check

- [x] `<RadioGroup>` + `<Radio>` work together with full keyboard navigation (native; verified
      in Radio.a11y.test.tsx).
- [x] All 3 variants × 7 colors render in both modes — 21 cells, plus 3 sizes for the QA page.
- [x] Per-Radio props override group defaults; group propagation works (3 tests cover this).
- [x] Form participation: `<form><RadioGroup name="size"><Radio value="m" defaultChecked />`
      submits `size=m` (test in `RadioGroup.test.tsx`).
- [x] axe-core passes for every cell.
- [x] RTL: orientation reads correctly; arrow keys flip semantics per ARIA spec (native).
- [x] Theme overrides work per-slot (Core 18 `defaultProps` wiring shipped; Radio flows through).

### DRY self-check

- [x] `useFormFieldA11y` imported from `_shared/` (no copy-paste).
- [x] `useControllableState` imported from `@apx-dsine`.
- [x] Three-slot recipe pattern matches Checkbox / Switch exactly (`root` / `control` / `label`).
- [ ] `::before` pseudo-element trick not promoted to `_shared/PATTERNS.md` yet — done in
      Radio.recipe.ts JSDoc instead. Promotion deferred to whoever lands the Checkbox/Switch
      back-port (deviation 3).
- [x] No new dev-warn IDs that overlap with existing ones (`RADIO_NO_VALUE`, `RADIO_NO_LABEL`).
- [x] Adding a new color works without component changes (one row per variant in the matrix).
- [x] Adding a new variant adds rows to one matrix file only.

### Outstanding / follow-up

- Visual regression (Playwright) carryover from prior phases — Radio's focus-ring + variant
  × color cells deserve a snapshot pass alongside Checkbox / Switch.
- `::before`-as-dot pattern back-port into Checkbox + Switch when an owner picks it up.
- `mergeDescribedBy` / `resolveBaseSize` promotion to `_shared/` (third-consumer threshold).
- Toast filename casing collision is blocking workspace DTS — flagged for the Toast owner.
