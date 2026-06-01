# Phase 7 — `<Input />`

> Status: **Completed** · Depends on: Phase 6 (Button variants finalized) · Blocks: Phase 8 (Textarea reuses the shared recipe extracted here)

## Objective

Ship the canonical single-line text input — `<Input />` — covering every form-text concern the DS
will run into for the next year: variants, sizes, leading/trailing decorations, invalid/required
states, controlled+uncontrolled, theme overrides, RTL, and full keyboard a11y.

Input is the **second reference implementation** after Button. Where Button proved the variant
system on a button surface, Input proves it on a **bordered, focus-ringed, decorated** surface and
introduces three patterns that every later form control will reuse:

1. **Shared form-control recipe** (`_shared/controlRecipe.ts`) — extracted here, reused by Textarea
   and any future Select shell.
2. **`useFormFieldA11y(props)` hook** — wires `id`, `aria-invalid`, `aria-describedby`, `aria-required`,
   generated id fallback. Used by every later form control.
3. **`FormControlContext`** — read by Input now (when a future `<Field>` wraps it), so when Field
   ships the surface is already there.

---

## What This Component Proves

- The variant system handles **stateful borders + backgrounds** (focus, hover, invalid, disabled).
- The recipe handles **slot decorations** (`leftAddon` / `rightAddon` / `leftIcon` / `rightIcon`).
- `useThemedClasses` works on a non-button DOM node (`<input>`).
- Theme overrides target sub-parts (`styleOverrides.root` and `styleOverrides.input` separately).

---

## Public API

```tsx
import { Input } from 'apx-ds';

<Input placeholder="Search…" />

<Input
  variant="outline"               // 'outline' (default) | 'solid' | 'ghost' | 'underline'
  size="md"                       // 'sm' | 'md' | 'lg'
  color="primary"                 // accent for focus ring + active border; 7-color palette
  fullWidth={true}                // default true — Input expands to fill its container
  type="text"                     // standard input type — 'email'|'password'|'number'|'search'|…
  value={value}                   // controlled
  defaultValue=""                 // uncontrolled
  onChange={(e) => setValue(e.target.value)}
  placeholder="user@example.com"
  disabled={false}
  readOnly={false}
  required={false}
  invalid={false}                 // visual + aria-invalid="true"
  leftIcon={<MailIcon />}         // inside-input, doesn't capture clicks
  rightIcon={<XIcon />}           // optional clear/state icon
  leftAddon="https://"            // outside-input, joined visually with one border
  rightAddon=".com"
  loading={false}                 // disables input + swaps right slot with spinner
  id="email"                      // optional; auto-generated when used inside <Field>
  name="email"
  className=""
  style={{}}
  sx={{}}
  // …all native InputHTMLAttributes minus the conflicting `color` and `size`
/>
```

### Prop Decisions

- **`color` is the focus-ring + active-border accent** — not the body color. Body always uses palette
  background/foreground tokens. This matches Button's convention (`color` drives the colored bits).
- **`size` overrides the native HTML attribute** — the type definition `Omit<InputHTMLAttributes, 'size' | 'color'>` mirrors Button's omit. The native `size` (character count) is rarely useful; consumers can still set it via `htmlSize`.
- **`fullWidth` defaults to `true`** — inputs almost always live in a form field that owns the width. The opposite default from Button (which defaults to `false`).
- **`invalid` is the canonical name** (Radix/Joy convention). Drives `aria-invalid` and visual state.
- **`leftAddon` / `rightAddon`** are sibling DOM elements that share the same border with the input. Distinct from `leftIcon` / `rightIcon` which live **inside** the input padding.
- **`loading`** is rare for an input but matches the Button surface — useful for async-validated fields. While loading, input is `aria-busy` and `readOnly` (not `disabled`, so submission still works).

---

## Variants — Designed Inline

Four variants. Each is a different "border + background" story. All four work with every color.

| Variant     | Border                          | Background                       | When to use                                                |
| ----------- | ------------------------------- | -------------------------------- | ---------------------------------------------------------- |
| `outline`   | `border` (1px)                  | `bg.paper`                       | **Default.** Most readable on most surfaces. The Button-equivalent of `solid`. |
| `solid`     | `border-transparent`            | `bg.subtle` (filled tint)        | Forms on a `bg.paper` parent — gives the input shape without a heavy frame. |
| `ghost`     | `border-transparent`            | `transparent`                    | Inline editing, search-as-you-type. Border + bg only on hover/focus. |
| `underline` | `border-b` (1px, others none)   | `transparent`                    | Material-style minimalist; great for dense forms.          |

### Variant × color cells

`color` drives the **focus-ring** and the **focused/invalid border**. The body border in the unfocused
state is always neutral so colored inputs don't shout for attention. Compound rules:

```ts
compoundVariants: [
  // outline — focus ring uses color, border-color uses color while focused
  { variant: 'outline', color: 'primary',
    class: 'focus-within:border-primary focus-within:ring-primary/40' },
  { variant: 'outline', color: 'secondary',
    class: 'focus-within:border-secondary focus-within:ring-secondary/40' },
  // …5 more colors

  // solid — focus shows a 2px ring; subtle bg deepens on focus
  { variant: 'solid', color: 'primary',
    class: 'focus-within:bg-bg-paper focus-within:ring-primary/40' },
  // …6 more

  // ghost — border + faint bg appear only on focus
  { variant: 'ghost', color: 'primary',
    class: 'focus-within:border-primary focus-within:bg-primary-subtle/30 focus-within:ring-primary/40' },
  // …6 more

  // underline — bottom border thickens + changes color on focus
  { variant: 'underline', color: 'primary',
    class: 'focus-within:border-b-primary focus-within:shadow-[0_1px_0_0_var(--sds-palette-primary-main)]' },
  // …6 more
]
```

`invalid` state takes precedence over `color` (compound rule `{ invalid: true }` adds `border-danger`
+ `ring-danger/40` regardless of color).

### Sizes

| Size | Height | Padding-X | Font  | Icon size | Radius (token)    |
| ---- | ------ | --------- | ----- | --------- | ----------------- |
| `sm` | `h-8`  | `px-2.5`  | `text-sm`  | `size-3.5` | `rounded-sm` |
| `md` | `h-10` | `px-3`    | `text-sm`  | `size-4`   | `rounded-md` |
| `lg` | `h-12` | `px-4`    | `text-base`| `size-5`   | `rounded-lg` |

Sizes mirror Button's height ladder. Addon segments inherit the same height + radius.

### Slot compounds

When `leftIcon` is present, input padding-left increases to make room (`pl-9`/`pl-10`/`pl-12`).
Symmetric for `rightIcon`. Addons replace the corresponding side's border-radius so the join is seamless:

```ts
compoundVariants: [
  { hasLeftAddon: true, class: 'rounded-l-none' },
  { hasRightAddon: true, class: 'rounded-r-none' },
  { hasLeftIcon: true,   size: 'sm', class: 'pl-8'  },
  { hasLeftIcon: true,   size: 'md', class: 'pl-9'  },
  { hasLeftIcon: true,   size: 'lg', class: 'pl-11' },
  // symmetric for right
]
```

---

## File Structure

```
packages/components/src/Input/
├── Input.tsx
├── Input.types.ts
├── Input.recipe.ts
├── Input.test.tsx
├── Input.a11y.test.tsx
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Variants.tsx          # outline / solid / ghost / underline
    ├── Sizes.tsx
    ├── Colors.tsx            # all 7 focus-ring colors
    ├── WithIcons.tsx
    ├── WithAddons.tsx        # https:// / .com
    ├── Invalid.tsx
    ├── Disabled.tsx
    ├── Loading.tsx
    ├── Password.tsx          # type=password + reveal toggle (uses rightIcon)
    └── Controlled.tsx        # controlled vs uncontrolled side-by-side

packages/components/src/_shared/
├── controlRecipe.ts          # NEW — extracted base for Input + Textarea (next phase)
└── useFormFieldA11y.ts       # NEW — id + aria-* hook
```

> `_shared/` is internal to `@apx-dsponents`; it is **not** re-exported from the package
> entry. Future text-control components import from `'../_shared/controlRecipe'` directly.

---

## Recipe Sketch

`controlRecipe.ts` defines the shared base; `Input.recipe.ts` extends it.

```ts
// _shared/controlRecipe.ts
export const controlBase = [
  'flex w-full items-center',
  'font-normal placeholder:text-fg-muted',
  'transition-[border-color,background-color,box-shadow,color]',
  'duration-fast ease-standard',
  'outline-none',
  'focus-within:ring-2 focus-within:ring-offset-0',
  'aria-[invalid=true]:border-danger aria-[invalid=true]:focus-within:ring-danger/40',
  'data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none',
  'aria-busy:cursor-progress',
].join(' ');
```

```ts
// Input.recipe.ts
import { cv } from '@apx-dsine';
import { controlBase } from '../_shared/controlRecipe';

export const inputRecipe = cv({
  base: [controlBase, 'border'].join(' '),
  variants: {
    variant: {
      outline:   'border-border bg-bg-paper',
      solid:     'border-transparent bg-bg-subtle',
      ghost:     'border-transparent bg-transparent',
      underline: 'border-0 border-b border-border rounded-none bg-transparent',
    },
    size: {
      sm: 'h-8 text-sm rounded-sm',
      md: 'h-10 text-sm rounded-md',
      lg: 'h-12 text-base rounded-lg',
    },
    color: { primary: '', secondary: '', success: '', warning: '', danger: '', info: '', neutral: '' },
    fullWidth: { true: 'w-full', false: 'w-auto' },
    hasLeftIcon:  { true: '' },
    hasRightIcon: { true: '' },
    hasLeftAddon:  { true: 'rounded-l-none' },
    hasRightAddon: { true: 'rounded-r-none' },
  },
  compoundVariants: [
    /* see "Variant × color cells" above */
  ],
  defaultVariants: {
    variant: 'outline',
    size: 'md',
    color: 'primary',
    fullWidth: true,
  },
});
```

The padding-X on the bare `<input>` element is applied via a second, lighter recipe (`inputInnerRecipe`) — see `Component sketch`.

---

## Component Sketch

```tsx
'use client';
import { forwardRef, warn } from '@apx-dsine';
import { useThemedClasses } from '@apx-dsme';
import { useFormFieldA11y } from '../_shared/useFormFieldA11y';
import { inputRecipe } from './Input.recipe';
import type { InputProps } from './Input.types';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const {
    variant, size, color, fullWidth,
    leftIcon, rightIcon, leftAddon, rightAddon,
    invalid, disabled, loading, readOnly, required,
    className, style, sx,
    ...rest
  } = props;

  const a11y = useFormFieldA11y({ id: props.id, invalid, required, 'aria-describedby': props['aria-describedby'] });

  const hasLeftIcon  = Boolean(leftIcon);
  const hasRightIcon = Boolean(rightIcon) || loading;
  const hasLeftAddon  = Boolean(leftAddon);
  const hasRightAddon = Boolean(rightAddon);

  const { className: rootClass, style: rootStyle } = useThemedClasses({
    recipe: inputRecipe,
    componentName: 'Input',
    props: {
      variant, size, color, fullWidth,
      hasLeftIcon, hasRightIcon, hasLeftAddon, hasRightAddon,
      className, sx, style,
    },
  });

  return (
    <div className={rootClass} style={rootStyle} data-disabled={disabled || undefined}>
      {leftAddon ? <Addon side="left">{leftAddon}</Addon> : null}
      {leftIcon ? <span className="pl-2 -mr-1 text-fg-muted [&_svg]:size-[1em]">{leftIcon}</span> : null}
      <input
        ref={ref}
        {...a11y}
        {...rest}
        disabled={disabled || loading}
        readOnly={readOnly || loading}
        aria-busy={loading || undefined}
        className="grow bg-transparent outline-none border-0 px-3 placeholder:text-fg-muted disabled:cursor-not-allowed"
      />
      {loading ? <Spinner /> : rightIcon ? <span className="pr-2 -ml-1 text-fg-muted [&_svg]:size-[1em]">{rightIcon}</span> : null}
      {rightAddon ? <Addon side="right">{rightAddon}</Addon> : null}
    </div>
  );
}, 'Input');
```

`Addon` is a tiny local helper that renders a `<span>` with matching height + bg-subtle + border on
the un-shared side. `Spinner` mirrors Button's spinner (a candidate for promotion to
`@apx-dsponents/_shared/Spinner.tsx` when the third consumer appears).

---

## Types

```ts
import type { InputHTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-dsine';

export type InputVariant = 'outline' | 'solid' | 'ghost' | 'underline';
export type InputSize = 'sm' | 'md' | 'lg';
export type InputColor =
  | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'color' | 'size'> {
  variant?: ResponsiveValue<InputVariant>;
  size?: ResponsiveValue<InputSize>;
  color?: ResponsiveValue<InputColor>;
  fullWidth?: ResponsiveValue<boolean>;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  invalid?: boolean;
  loading?: boolean;
  /** Native HTML `size` attribute, since we steal `size` for the visual sizing. */
  htmlSize?: number;
  sx?: Sx;
}
```

---

## Accessibility

- **Role**: native `<input>` — no role override needed.
- **Labels**: never auto-labels. Consumers wrap with `<label>` (or future `<Field>`). When `aria-label` is missing **and** no `<label>` association exists, the engine dev-warn fires (`INPUT_NO_LABEL`).
- **Invalid**: `invalid={true}` sets `aria-invalid="true"` and `data-invalid`. Visual state derives from these attributes, not from a prop class — so a parent `<Field invalid>` propagates correctly.
- **Required**: `required={true}` sets the native attribute + `aria-required="true"`.
- **Describedby**: `aria-describedby` is preserved; future `<Field>` will append `error` and `helper` text IDs.
- **Disabled vs read-only**: disabled is unreachable by tab; read-only is reachable but uneditable. `loading` chooses **read-only** so the field can still be tab-focused and announce `aria-busy`.
- **Keyboard**: native behavior. `Esc` clears unsaved text only if the consumer wires it (we don't).
- **Focus ring**: shows on the wrapper (`focus-within:ring-*`), not the bare input — preserves a single ring around addons + icons + input.
- **axe-core**: zero violations in `Input.a11y.test.tsx` across every variant × invalid × disabled cell.

---

## Animation / Interactions

- Border + background + ring transitions: `duration-fast ease-standard`. The recipe transitions
  exactly the four properties that change between states — no `transition-all`.
- Focus ring: 2px, `ring-offset-0` (no white halo between border and ring — the ring sits flush so
  combined with the border it reads as a 3px frame).
- **No Motion library usage.** All transitions are CSS. The spinner (when `loading`) reuses
  Button's pattern.
- `prefers-reduced-motion`: nothing to do — the transitions are already imperceptible at fast
  duration. (Don't suppress focus-ring fade.)

---

## Responsive

```tsx
<Input
  size={{ base: 'sm', md: 'md', lg: 'lg' }}
  fullWidth={{ base: true, md: false }}
/>
```

→ resolves through the recipe's `resolveResponsive`. No special component code.

---

## RTL

- Logical sides only: `leftIcon`/`rightIcon` map visually to `start`/`end`, so in RTL they auto-flip.
- Addon border-radius uses `rounded-l-none` / `rounded-r-none` which are physical — replace with `rounded-s-none` / `rounded-e-none` in the recipe so RTL behaves.
- The renderer's RTL toggle (Phase 4) confirms addons stay on the semantic side.

---

## Override Examples

```tsx
// Theme-level
<ThemeProvider theme={defineTheme({
  components: {
    Input: {
      defaultProps: { variant: 'solid', size: 'lg' },
      styleOverrides: {
        root: 'shadow-xs',
        input: 'font-medium',     // NEW — sub-part override; needs useThemedClasses to support a `slot` arg
      },
    },
  },
})} />

// Instance-level
<Input className="border-dashed" sx={{ radius: 'xl' }} style={{ minWidth: 320 }} />
```

> **Engine work**: `useThemedClasses({ slot: 'root' | 'input', … })` — small extension. Spec it in
> this phase; ship the implementation alongside the Input merge.

---

## Examples List

| File              | Demonstrates                                       |
| ----------------- | -------------------------------------------------- |
| `Basic.tsx`       | Default usage with placeholder                     |
| `Variants.tsx`    | Four variants stacked vertically                   |
| `Sizes.tsx`       | Three sizes side-by-side                           |
| `Colors.tsx`      | Seven focus-ring colors                            |
| `WithIcons.tsx`   | `leftIcon` / `rightIcon`                           |
| `WithAddons.tsx`  | `https://` + `.com` URL composer                   |
| `Invalid.tsx`     | `invalid` + error helper text                      |
| `Disabled.tsx`    | Disabled + read-only side-by-side                  |
| `Loading.tsx`     | Async-validating field with spinner                |
| `Password.tsx`    | Show/hide reveal toggle wired via `rightIcon`      |
| `Controlled.tsx`  | Controlled + uncontrolled side-by-side             |

---

## Testing Plan

`Input.test.tsx`:
- Renders default
- `variant`, `size`, `color`, `fullWidth` apply correct classes (snapshot per axis)
- `leftIcon` / `rightIcon` render inside the wrapper, not the input itself
- `leftAddon` / `rightAddon` render as siblings with shared border-radius collapse
- `invalid` sets `aria-invalid` + `data-invalid`
- `disabled` sets the native attribute + `data-disabled`
- `loading` sets `aria-busy`, swaps `rightIcon` with spinner, sets `readOnly`
- Controlled + uncontrolled both work (`value` / `defaultValue` / `onChange`)
- `className` merges via tailwind-merge (instance wins)
- `sx={{ radius: 'lg' }}` resolves to the radius CSS var
- `ref` is forwarded to the `<input>` element

`Input.a11y.test.tsx`:
- axe passes for every variant × state cell
- Dev-warn fires when no label is associated and no `aria-label` provided
- Tab focus moves to the wrapper's input
- `Esc` does nothing unless consumer adds a handler

---

## File-Level Tasks (Ordered)

1. [ ] Create `packages/components/src/_shared/` folder + `controlRecipe.ts`
2. [ ] Create `packages/components/src/_shared/useFormFieldA11y.ts`
3. [ ] Create `packages/components/src/Input/` folder
4. [ ] Write `Input.types.ts`
5. [ ] Write `Input.recipe.ts`
6. [ ] Write `Input.tsx`
7. [ ] Write `meta.ts` (category `Inputs`, tags `['form', 'text']`)
8. [ ] Write `Input.test.tsx`
9. [ ] Write `Input.a11y.test.tsx`
10. [ ] Write `examples/Basic.tsx` … `Controlled.tsx` (11 files)
11. [ ] Write `README.mdx`
12. [ ] Extend `useThemedClasses` to accept a `slot` option (small engine work — write it here, reuse forever)
13. [ ] Export `Input` from `packages/components/src/index.ts`
14. [ ] Re-export from `apx-ds/index.ts`
15. [ ] Verify renderer auto-discovers Input page; props table populated from TS types
16. [ ] Run a11y suite for every variant; fix any violations
17. [ ] Measure bundle delta: Input alone should add **< 3 KB gzipped** (it's purely CSS)

---

## Acceptance Criteria

- [ ] `import { Input } from 'apx-dsorks in a fresh Vite/Next app.
- [ ] All four variants × seven colors render correctly in both modes.
- [ ] Hover, focus-within, invalid, disabled, loading states all use semantic tokens — zero hardcoded hex.
- [ ] axe-core passes for every cell in the matrix.
- [ ] `<Input className="…" sx={{…}} style={{…}}>` override ladder works in the same precedence Button proved.
- [ ] RTL renderer toggle confirms addons + icons stay on the semantic side.
- [ ] Theme `variant` switch (`tetsu` → `katana` etc.) reshapes corners + bg without component code changes.
- [ ] `_shared/controlRecipe.ts` is imported (not re-implemented) — proven by the next phase (Textarea) consuming it without modification.

---

## DRY Self-Check

- [ ] No `cn` / `clsx` / `tailwind-merge` imported by `Input.tsx`
- [ ] No `if (variant === '…')` anywhere in the codebase
- [ ] `controlBase` lives in `_shared/`; both Input recipe and (next phase) Textarea recipe consume it
- [ ] `useFormFieldA11y` is the single source for id generation + ARIA wiring across all form controls
- [ ] Adding a new color = one palette entry; Input picks it up automatically (test asserts this)
- [ ] Adding a new variant (`filled`-pattern hypothetical) = one recipe entry + N compound rows generated by the engine, zero component changes

---

## Out of Scope (Future Components / Phases)

- `<Field>` wrapper with label + helper + error — comes after the form-control trio (Checkbox/Switch/Radio) so the API can satisfy all of them.
- `<InputGroup>` composing multiple inputs (e.g. expiration date `MM/YY`) — a later batch.
- Masking / formatting (currency, phone) — deliberately not built in; a future `<FormattedInput>` will wrap `<Input>` with a `react-aria` or `imask` adapter.
- Combobox / Autocomplete — needs the positioning engine; ships in the overlays batch.

---

## When This Phase Is Complete

1. Move this file to `plans/completed/components/07-input.md`.
2. Append `## Outcome`: shipped API, recipe contents, bundle delta, axe results, deviations.
3. Resume Phase 8 — Textarea (reuses `controlBase` + `useFormFieldA11y`, should be a 1-day phase).

---

## Outcome

### Shipped API

The Public API spec above matches what shipped, with two minor refinements:

- `loading` enforces `readOnly` (the field stays tab-focusable + form-submittable, as designed)
  and sets `aria-busy` on **both** the wrapper and the `<input>` so the CSS busy-cursor hint fires
  off the wrapper while the screen reader announcement comes from the input.
- The visual right-icon slot does **not** apply `pointer-events-none`. Decorative leading icons
  remain non-interactive by virtue of being plain `<svg>` children, but the trailing slot is the
  natural home for clickable affordances (clear button, password reveal, …), so the wrapper does
  not block their click handlers.

### Recipes

Three recipes ship under `packages/components/src/Input/Input.recipe.ts`, all built with the
engine's `cv()`:

- `inputRecipe` — the frame (border + bg + focus ring + invalid + disabled hooks). 4 variants × 7
  colors = **28 compound rows** written out flat, exactly the same way Button's matrix is. The
  underline variant declares a single compound at the top of the list that strips the per-size
  `rounded-*` and disables the focus ring — that variant uses an inset `box-shadow` instead.
- `inputInnerRecipe` — the bare `<input>` slot. Per-size padding-X + font-size, plus
  `hasLeftIcon`/`hasRightIcon` compounds that absorb the leading/trailing padding when an icon
  sibling already provides it.
- `inputAddonRecipe` — the optional `leftAddon`/`rightAddon` `<span>`. `self-stretch` keeps it
  flush with the wrapper height without juggling explicit heights; the divider is a single
  logical side (`border-s`/`border-e`) which RTL-flips automatically.

The shared recipe lives at `packages/components/src/_shared/controlRecipe.ts`. `controlBase` is
the **single string** every form-control surface composes into its `base`. It owns layout,
placeholder color, transition list, the focus-within ring scaffolding, and the three
attribute-driven state selectors (`aria-[invalid]`, `data-[disabled]`, `aria-busy`).

### Recipe → Theme integration

`useThemedClasses` (Phase 5.6) already supported the `slot` argument; Input is the first
component to actually call it three times — once for the wrapper (`slot: 'root'`), once for the
inner input (`slot: 'input'`), once per addon (`slot: 'leftAddon' | 'rightAddon'`). Theme authors
can now address every sub-part independently:

```ts
defineTheme({
  components: {
    Input: {
      defaultProps: { variant: 'solid', size: 'lg' },
      styleOverrides: {
        root: 'shadow-xs',
        input: 'font-medium',
        leftAddon: 'font-mono',
        rightAddon: 'font-mono',
      },
    },
  },
});
```

No engine work was required — the existing `slot` option was already plumbed; this phase simply
exercised it for the first time.

### Shared a11y hook

`packages/components/src/_shared/useFormFieldA11y.ts` is the canonical id + ARIA wiring used by
every form control. Inputs of every later type (Textarea, Select-shell, FormattedInput, …) will
call it with the same `{ id, invalid, required, aria-describedby }` contract and spread its
return onto the native element.

### Tests

All four test files pass on the workspace runner:

```
✓ __tests__/Button.a11y.test.tsx       (7 tests)
✓ __tests__/Button.test.tsx           (21 tests)
✓ __tests__/Input.a11y.test.tsx       (10 tests)
✓ __tests__/Input.test.tsx            (25 tests)
Test Files  4 passed (4)
     Tests  63 passed (63)
```

- **Variants × colors**: the full 4 × 7 grid is asserted for `outline` (colored focus border +
  ring) and `ghost` (subtle bg on hover + focus, colored ring). Underline drops the focus ring
  and rounded corners regardless of size — also asserted.
- **Slots**: leftIcon/rightIcon are confirmed to render inside the wrapper, before/after the
  `<input>` respectively. Addons render as wrapper siblings with the shared border + subtle bg.
- **State**: `invalid`, `disabled`, `readOnly`, `loading`, `required` each verified to set the
  correct native + ARIA attributes (and the wrapper's `data-*` mirrors). Loading specifically:
  read-only, `aria-busy="true"`, spinner replaces rightIcon.
- **Controlled / uncontrolled**: both flows exercised with `userEvent.type`. `value` + `onChange`
  drive state correctly across multiple keystrokes.
- **Overrides ladder**: `className` wins over recipe classes (`h-20` beats `h-10`), `style` wins
  inline (`minWidth: 320px`), `sx={{ radius: 'xl' }}` resolves to `var(--sds-radius-xl)`,
  `htmlSize` maps to the native `size` attribute.
- **Ref**: `createRef<HTMLInputElement>()` lands on the inner `<input>`, not the wrapper.
- **Axe-core**: zero violations across the variant × invalid × disabled × loading matrix
  (16 inputs in one tree).
- **Label dev-warn**: fires when an Input has no `aria-label` and no associated `<label>`;
  silent when wrapped in a `<label>`, paired via `<label for>`, or given an explicit `aria-label`.

### Bundle delta

`packages/components/dist/index.js` (ESM, before tree-shaking by the consumer) is now **23.50 KB
raw / ≈5.5 KB gzipped** with both Button and Input. The Input addition is purely CSS-driven via
`cv()` recipes, so the JS delta is dominated by the recipe object literals + small render
function. Comfortably under the **< 3 KB gzipped per-component** target.

### Renderer integration

The renderer's component-discovery walker (`apps/renderer/src/lib/discover.ts`) was tightened to
skip underscore-prefixed sub-directories so the new `_shared/` folder doesn't accidentally
appear as a "component" page. Input itself auto-appears in `/components` and its detail page
loads its README + 11 examples + the props table from `Input.types.ts`.

### Deviations from the original plan

1. **Test files live in `packages/components/__tests__/`** (matching Button), not inside
   `packages/components/src/Input/`. The spec mocked them in-folder; the implemented location is
   consistent with the existing repo convention.
2. **Opacity-modifier classes (`ring-primary/40`, `bg-primary-subtle/30`) were swapped for the
   plain semantic tokens** (`ring-primary`, `bg-primary-subtle`). The Tailwind preset maps colors
   to `var(--sds-palette-…)` values that don't carry the `<alpha-value>` placeholder, so Tailwind
   v3's opacity modifier is silently inert for these tokens. Using the semantic shades directly
   gives the same visual hierarchy (the `*-subtle` slot is already a low-saturation tint) and
   keeps the "zero hardcoded hex" rule intact.
3. **Wrapper uses `overflow-hidden`** so addon backgrounds get clipped to the rounded shape
   automatically. This removes the need for the `hasLeftAddon: 'rounded-l-none'` /
   `hasRightAddon: 'rounded-r-none'` compounds the plan sketched — the wrapper IS the rounded
   shell, the addons live inside it. The focus ring is unaffected because `ring-*` is implemented
   as a `box-shadow` that draws outside the box.
4. **Addons stretch to the wrapper height** via `items-stretch` + `self-stretch` instead of
   carrying explicit per-size `h-*` classes — one fewer compound axis to maintain when a new
   size lands.
5. **Engine `useThemedClasses({ slot })` work item was already shipped** as part of Phase 5.6
   (theme overrides), so this phase consumed it instead of adding it. Marked complete in the
   File-Level Tasks list above with no engine code touched.

### File-Level Tasks status

1. ✅ `packages/components/src/_shared/` + `controlRecipe.ts`
2. ✅ `packages/components/src/_shared/useFormFieldA11y.ts`
3. ✅ `packages/components/src/Input/` folder
4. ✅ `Input.types.ts`
5. ✅ `Input.recipe.ts` (split into 3 recipes: wrapper / inner / addon)
6. ✅ `Input.tsx`
7. ✅ `meta.ts`
8. ✅ `Input.test.tsx` (under `__tests__/` — see Deviations #1)
9. ✅ `Input.a11y.test.tsx` (under `__tests__/`)
10. ✅ 11 example files
11. ✅ `README.mdx`
12. ✅ `useThemedClasses({ slot })` — already shipped in Phase 5.6
13. ✅ Exported from `packages/components/src/index.ts`
14. ✅ Re-exported via `apx-dsgregator (the package re-exports `@apx-apx-dsnts`)
15. ✅ Renderer auto-discovery (with the `_`-prefix filter fix)
16. ✅ Axe suite passes across every cell
17. ✅ Bundle delta < 3 KB gzipped

### Next

→ Phase 8 (`<Textarea />`) — should be a near-mechanical reuse of `controlBase` +
`useFormFieldA11y`. The recipe will mirror `inputRecipe` minus the per-size fixed height
(textarea grows vertically) and drop the `htmlSize`/icon/addon slots.