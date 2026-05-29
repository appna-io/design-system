# Phase 23 — `<Select />` + `Select.Trigger` + `Select.Value` + `Select.Content` + `Select.Item` + `Select.ItemIndicator` + `Select.Group` + `Select.Label` + `Select.Separator`

> Status: **Pending** · Depends on: Phase 22 (Menu — Select reuses keyboard nav patterns + item recipe) **AND** Phase 7 (Input — Select consumes `_shared/controlBase` + `useFormFieldA11y` for the form-control shell + ARIA) · Blocks: nothing in this batch

## Objective

Ship the canonical form-control combobox — `<Select />`. Select sits at the **intersection** of the
form-control family (Phase 7–11) and the overlay family (Phase 17–22). It is:

- A **form control** — has a `name`, integrates with `<form>` submission, participates in `<Field>`'s ARIA via `useFormFieldA11y`.
- An **overlay** — clicking the trigger opens a portal-positioned listbox.
- A **selector** — exactly one item selectable (V1; multi-select deferred).

This phase **proves the cross-cutting DRY layer works**: form-control primitives from Batch 1 +
overlay primitives from Batch 2 compose without conflict.

---

## What This Component Proves

- `controlBase` (Phase 7) works as the **trigger** of a non-input form-control.
- `useFormFieldA11y` propagates `id` / `aria-invalid` / `aria-describedby` to a custom trigger as cleanly as it does to a native `<input>`.
- Keyboard nav from Menu (Phase 22) generalizes — type-ahead, arrow navigation, Home/End all work for a single-select listbox.
- Hidden `<input type="hidden">` participates in form submission for the selected value.
- The compound shape supports grouping (`Select.Group` + `Select.Label`) for categorized options.

---

## Public API

```tsx
import { Select } from 'apx-ds';

<Select
  name="country"
  value={country}                  // controlled
  defaultValue=""
  onValueChange={(v) => setCountry(v)}
  required
  invalid={hasError}
  disabled={false}
  size="md"                        // 'sm' | 'md' | 'lg'
  variant="outline"                // 'outline' | 'solid' | 'ghost' | 'underline'  (form-control vocab)
  color="primary"                  // 7-color palette
  fullWidth={false}
  placeholder="Select a country"
>
  <Select.Trigger leftIcon={<GlobeIcon />} />
  <Select.Content position="popper" placement="bottom-start" matchTriggerWidth>
    <Select.Group>
      <Select.Label>Europe</Select.Label>
      <Select.Item value="fr">France</Select.Item>
      <Select.Item value="de">Germany</Select.Item>
      <Select.Item value="es">Spain</Select.Item>
    </Select.Group>
    <Select.Separator />
    <Select.Group>
      <Select.Label>Asia</Select.Label>
      <Select.Item value="jp" leftIcon={<FlagJP />}>Japan</Select.Item>
      <Select.Item value="kr">Korea</Select.Item>
      <Select.Item value="cn" disabled>China</Select.Item>
    </Select.Group>
  </Select.Content>
</Select>
```

### Prop Decisions

- **`value` is a string** — matches `<select>` semantics. Numeric / object values are out of scope V1; consumers wrap with `useMemo` to map.
- **No `multiple` prop** — multi-select is a different UX (chips + open-on-pick). Ship as `<MultiSelect>` later if needed.
- **Trigger is a built-in `<button>`** (not a wrapped `<input>`) — matches Radix's pattern; better semantics for "non-typeable selector".
- **Compound shape with `Select.Trigger`** — even though Trigger has no children, it exposes `leftIcon` / `rightIcon` slots and the value display. Allows theming overrides without forcing consumers to render the value manually.
- **`Select.Value` is omitted as a separate subpart** in V1 — Trigger renders the value internally via context. Add `Select.Value` later if a consumer needs to render the value somewhere other than inside the trigger.
- **`Select.Content.matchTriggerWidth={true}` default** — the listbox is exactly as wide as the trigger. Floating UI's `size` middleware handles it.
- **`Select.Content.position="popper"` default** — anchored to trigger. `"item-aligned"` (the legacy native `<select>` position where the selected item appears over the trigger) is V2.
- **Form integration**: a hidden `<input name={name} value={value}>` renders inside the root so form submissions get the value.

---

## Variants — Designed Inline

### Trigger variants (form-control vocab)

Reuse `controlBase` from `_shared/`. **Same 4 variants × 7 colors × 3 sizes matrix** as Input/Textarea.

| Variant     | Trigger chrome                                          |
| ----------- | ------------------------------------------------------- |
| `outline`   | 1px border in `color`; rest from `controlBase`.         |
| `solid`     | `bg-<color>-subtle` + matching text + border.           |
| `ghost`     | No border; border-on-hover; subtle bg-on-hover.         |
| `underline` | Bottom border only; minimal chrome (filter-row UX).     |

Items don't have a variant axis — they share the **same item recipe shape as Menu** (highlighted via `data-highlighted`, disabled via `data-disabled`, sized by inherited `size` context). Reuse Menu's `item` recipe directly via import:

```ts
import { menuRecipes } from '../Menu/Menu.recipe';
// or, if Menu extracts to `_shared/itemRecipe.ts`, import from there
```

If Menu's item recipe doesn't fit cleanly (e.g. Select items also display the `ItemIndicator` for the currently-selected value), extract `_shared/listItemRecipe.ts` here — Select is the second consumer of that pattern.

### Content variants

Same 3 as Popover/Menu (`solid`, `outline`, `soft`). Defaults to `solid`.

### Sizes

| Size | Trigger height | Item padding | Font           |
| ---- | -------------- | ------------ | -------------- |
| `sm` | `h-8`          | `px-2 py-1`  | `text-xs`      |
| `md` | `h-10`         | `px-2 py-1.5`| `text-sm`      |
| `lg` | `h-12`         | `px-3 py-2`  | `text-base`    |

Note: Trigger heights match Input/Textarea sizes exactly. **Visual alignment of Select + Input on the same form row is a hard requirement.**

---

## File Structure

```
packages/components/src/Select/
├── Select.tsx                   # context + state owner + hidden input
├── SelectTrigger.tsx
├── SelectContent.tsx
├── SelectItem.tsx
├── SelectItemIndicator.tsx
├── SelectGroup.tsx
├── SelectLabel.tsx
├── SelectSeparator.tsx
├── Select.types.ts
├── Select.recipe.ts             # trigger + content + item + label + separator + indicator
├── Select.motion.ts             # mirrors Menu
├── SelectContext.ts
├── useSelectKeyboard.ts         # may delegate to a promoted _shared/useListKeyboard
├── index.ts                     # Object.assign(Select, { Trigger, Content, Item, ItemIndicator, Group, Label, Separator })
├── Select.test.tsx
├── Select.a11y.test.tsx
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── WithGroups.tsx
    ├── WithIcons.tsx
    ├── Variants.tsx             # outline / solid / ghost / underline
    ├── Sizes.tsx
    ├── Colors.tsx
    ├── Disabled.tsx
    ├── Invalid.tsx
    ├── Required.tsx             # form integration + native validation
    ├── DisabledItems.tsx
    ├── LongList.tsx             # 100+ items with internal scroll
    ├── MatchTriggerWidth.tsx
    ├── PortalContainer.tsx
    ├── InsideField.tsx          # composing with a future <Field>
    └── Controlled.tsx
```

---

## Recipe Sketch

```ts
// Select.recipe.ts
import { cv } from '@apx-dsine';
import { controlBase } from '../_shared/controlBase';
import { variantColorMatrix } from '../_shared/variantColorMatrix';

export const selectRecipes = {
  trigger: cv({
    base: [
      controlBase,
      'flex w-full items-center justify-between gap-2 cursor-default',
      'border',
      'data-[placeholder=true]:text-fg-muted',
    ].join(' '),
    variants: {
      variant: { outline: '', solid: '', ghost: '', underline: '' },
      size:    { sm: 'h-8 px-2 text-xs rounded-sm', md: 'h-10 px-3 text-sm rounded-md', lg: 'h-12 px-3.5 text-base rounded-md' },
      color:   { primary: '', secondary: '', success: '', warning: '', danger: '', info: '', neutral: '' },
      fullWidth: { true: 'w-full', false: 'w-auto' },
    },
    compoundVariants: variantColorMatrix({ for: 'Select' }),    // ← reuses Phase 7's helper
    defaultVariants: { variant: 'outline', size: 'md', color: 'neutral', fullWidth: true },
  }),
  content: cv({
    base: [
      'relative outline-none',
      'rounded-md border bg-bg-paper text-fg-default shadow-md',
      'z-overlay min-w-[8rem] max-h-[var(--radix-select-content-available-height,_18rem)]',
      'overflow-y-auto',
      'transition-[opacity,transform] duration-fast ease-standard',
    ].join(' '),
    variants: {
      variant: { solid: '', outline: '', soft: '' },
      size:    { sm: 'p-1', md: 'p-1', lg: 'p-1.5' },
    },
    defaultVariants: { variant: 'solid', size: 'md' },
  }),
  item: cv({
    base: [
      'relative flex items-center gap-2 select-none cursor-default rounded',
      'outline-none',
      'data-[highlighted=true]:bg-bg-subtle data-[highlighted=true]:text-fg-default',
      'data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none',
      'data-[selected=true]:font-medium',
    ].join(' '),
    variants: { size: { sm: 'px-2 py-1 text-xs', md: 'px-2 py-1.5 text-sm', lg: 'px-3 py-2 text-base' } },
    defaultVariants: { size: 'md' },
  }),
  indicator: cv({ base: 'inline-flex items-center justify-center size-4 text-current' }),
  label:     cv({ base: 'px-2 py-1 text-xs font-medium text-fg-muted select-none' }),
  separator: cv({ base: '-mx-1 my-1 h-px bg-border' }),
};
```

---

## Component Sketch

```tsx
'use client';
export function Select({ name, value: valueProp, defaultValue, onValueChange, required, invalid, disabled, size, variant, color, fullWidth, placeholder, children, ...rest }: SelectProps) {
  const [value, setValue] = useControllableState({ prop: valueProp, defaultProp: defaultValue ?? '', onChange: onValueChange });
  const [open, setOpen] = useState(false);
  const a11y = useFormFieldA11y({ id: rest.id, required, invalid, disabled });

  return (
    <SelectContext.Provider value={{ value, setValue, open, setOpen, size, variant, color, fullWidth, placeholder, a11y }}>
      {children}
      <input type="hidden" name={name} value={value} />
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ leftIcon, rightIcon, className, sx, style, ...rest }: SelectTriggerProps) {
  const ctx = useSelectContext();
  const triggerCls = useThemedClasses({
    recipe: selectRecipes.trigger,
    componentName: 'Select', slot: 'trigger',
    props: { variant: ctx.variant, size: ctx.size, color: ctx.color, fullWidth: ctx.fullWidth, className, sx, style },
  });

  return (
    <button
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={ctx.open}
      aria-controls={/* content id */}
      data-placeholder={!ctx.value || undefined}
      data-state={ctx.open ? 'open' : 'closed'}
      onClick={() => ctx.setOpen((o) => !o)}
      onKeyDown={(e) => { /* Space/Enter open; ArrowDown opens + highlights first */ }}
      className={triggerCls.className}
      style={triggerCls.style}
      {...ctx.a11y}
      {...rest}
    >
      {leftIcon ? <span aria-hidden>{leftIcon}</span> : null}
      <span className="flex-1 text-start truncate">{ctx.value ? renderLabelFor(ctx.value) : ctx.placeholder}</span>
      {rightIcon ?? <ChevronDownIcon className="size-4 opacity-60" aria-hidden />}
    </button>
  );
}

// SelectContent: usePosition({ placement, offset, size: matchTriggerWidth }) + Portal + AnimatePresence + role="listbox"
// SelectItem: data-selected, data-highlighted, data-disabled; renders Indicator when selected
// SelectItemIndicator: shows only when item.selected
// SelectGroup / SelectLabel / SelectSeparator: trivial wrappers
```

---

## Types

```ts
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import type { Sx, ResponsiveValue } from '@apx-dsine';
import type { PopoverPlacement } from '../Popover/Popover.types';

export type SelectVariant = 'outline' | 'solid' | 'ghost' | 'underline';
export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectColor =
  | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface SelectProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  variant?: ResponsiveValue<SelectVariant>;
  size?: ResponsiveValue<SelectSize>;
  color?: ResponsiveValue<SelectColor>;
  fullWidth?: ResponsiveValue<boolean>;
  placeholder?: string;
  id?: string;
  children: ReactNode;
}

export interface SelectTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  sx?: Sx;
}

export interface SelectContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  placement?: PopoverPlacement;
  offset?: number;
  matchTriggerWidth?: boolean;
  portalContainer?: HTMLElement | null;
  position?: 'popper';
  sx?: Sx;
}

export interface SelectItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  value: string;
  leftIcon?: ReactNode;
  disabled?: boolean;
  textValue?: string;             // override the search-text used for type-ahead (when children is not a string)
  sx?: Sx;
}
```

---

## Accessibility

- ARIA Listbox + Combobox pattern (W3C APG):
  - Trigger: `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls={contentId}`.
  - Content: `role="listbox"`, `id={contentId}`, `aria-activedescendant={highlightedItemId}` when keyboard nav highlights an item.
  - Items: `role="option"`, `aria-selected={value === itemValue}`, `aria-disabled={disabled}`, `data-highlighted` for keyboard highlight.
- `useFormFieldA11y` propagates `id`, `aria-invalid`, `aria-required`, `aria-describedby` to Trigger.
- Keyboard:
  - Space / Enter on Trigger: open listbox; arrow-down also opens + highlights first.
  - Arrow Up/Down: cycle items (with `loop`).
  - Home / End: first / last.
  - Type-ahead: jump to matching item (uses `textValue` if provided).
  - Enter / Space on highlighted item: select + close.
  - Esc: close without selecting.
  - Tab from Trigger: close listbox and move focus to next field.
- Form: `<input type="hidden" name={name} value={value}>` submits with the form.
- `required` triggers native form validation when no value is set (combined with `:invalid` styling).
- axe-core: zero violations.

---

## Animation / Interactions

- Same Motion preset as Menu (Popover lineage).
- Listbox auto-scrolls to keep highlighted item in view.
- `prefers-reduced-motion`: opacity-only.

---

## Responsive

```tsx
<Select size={{ base: 'lg', md: 'md' }} variant={{ base: 'outline', md: 'underline' }}>
  …
</Select>
```

---

## RTL

- Trigger flex layout (`leftIcon` on logical start, `rightIcon`/chevron on logical end).
- Listbox `placement="bottom-start"` becomes physically `bottom-right` in RTL via Floating UI's RTL-aware placement.
- Item `ItemIndicator` placement (start vs end) is logical.

---

## Override Examples

```tsx
<ThemeProvider theme={defineTheme({
  components: {
    Select: {
      defaultProps: { variant: 'underline', size: 'sm' },
      styleOverrides: {
        trigger: 'shadow-sm',
        content: 'shadow-xl',
        item: '',
        indicator: '',
        label: '',
        separator: '',
      },
    },
  },
})} />
```

---

## Examples List

| File                  | Demonstrates                                       |
| --------------------- | -------------------------------------------------- |
| `Basic.tsx`           | Simple Select with 3 items                         |
| `WithGroups.tsx`      | Groups + Labels + Separator                        |
| `WithIcons.tsx`       | leftIcon on items + trigger                        |
| `Variants.tsx`        | outline / solid / ghost / underline                |
| `Sizes.tsx`           | sm / md / lg (visual parity check with Input)      |
| `Colors.tsx`          | 7 colors × outline                                 |
| `Disabled.tsx`        | Disabled select                                    |
| `Invalid.tsx`         | invalid prop + error styling                       |
| `Required.tsx`        | Required + form submit                             |
| `DisabledItems.tsx`   | Item-level disabled                                |
| `LongList.tsx`        | 100+ items; internal scroll                        |
| `MatchTriggerWidth.tsx`| `matchTriggerWidth` on vs off                     |
| `PortalContainer.tsx` | Custom portal target                               |
| `InsideField.tsx`     | Composing with future `<Field>` for error text     |
| `Controlled.tsx`      | Controlled value                                   |

---

## Testing Plan

`Select.test.tsx`:
- Click trigger opens; outside-click + Esc close
- Arrow nav cycles; type-ahead jumps to matching item
- Selecting an item updates `value`; closes listbox; trigger shows label
- Hidden input has correct `name` + `value`
- `matchTriggerWidth={true}` sets listbox width to trigger width
- `placeholder` shows when no value
- `invalid={true}` sets `aria-invalid`; visual error state
- `required` + empty value fails form `checkValidity()`
- `variant` / `size` / `color` / `fullWidth` apply correct classes
- Trigger height matches Input height at same `size` (visual regression test)
- Theme `styleOverrides.{ trigger, content, item, indicator, label, separator }` merge correctly
- `ref` forwarded to Trigger

`Select.a11y.test.tsx`:
- Trigger has `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`
- Content has `role="listbox"`
- Items have `role="option"` + `aria-selected`
- `aria-activedescendant` updates on keyboard nav
- `aria-required` / `aria-invalid` / `aria-describedby` set from `useFormFieldA11y`
- axe passes for every variant × color × size cell

---

## File-Level Tasks (Ordered)

1. [ ] **Prereqs**: confirm Phase 7's `controlBase` + `useFormFieldA11y` + `_shared/variantColorMatrix.ts` are shipped. Block if not.
2. [ ] Confirm Phase 22's `menuRecipes.item` or extract `_shared/listItemRecipe.ts` (second-consumer rule).
3. [ ] Create `packages/components/src/Select/` folder
4. [ ] Write `Select.types.ts`
5. [ ] Write `Select.recipe.ts`
6. [ ] Write `Select.motion.ts`
7. [ ] Write `SelectContext.ts`
8. [ ] Write `useSelectKeyboard.ts` (delegate to `_shared/useListKeyboard` if extracted)
9. [ ] Write all subpart files
10. [ ] Write `index.ts` (Object.assign)
11. [ ] Write `meta.ts` (category `Form`, tags `['select', 'combobox', 'dropdown', 'form-control']`)
12. [ ] Write `Select.test.tsx`, `Select.a11y.test.tsx`
13. [ ] Write 15 example files
14. [ ] Write `README.mdx`
15. [ ] Export from package index + `apx-ds
16. [ ] Renderer discovery check; visual-regression: ensure Trigger height matches Input height per size
17. [ ] Bundle delta: < 5 KB gzipped

---

## Acceptance Criteria

- [ ] Keyboard nav matches ARIA Listbox + Combobox pattern.
- [ ] Type-ahead jumps to items by text.
- [ ] Form integration: `<input type="hidden">` participates in submission.
- [ ] `required` triggers native form validation.
- [ ] `invalid` shows error state styled via the same color rules as Input.
- [ ] All variants / sizes / colors render; trigger height equals Input height per size.
- [ ] Listbox auto-scrolls to keep highlighted item visible.
- [ ] `matchTriggerWidth` works.
- [ ] axe-core passes.
- [ ] Reduced-motion users see opacity-only transitions.

---

## DRY Self-Check

- [ ] No `cn` / `clsx` import
- [ ] `controlBase`, `useFormFieldA11y`, `variantColorMatrix` all imported from `_shared/` (Phase 7's exports)
- [ ] `usePosition`, `<Portal>`, `useEscapeStack`, `useOutsideClick`, `useControllableState` from engine
- [ ] Item recipe shared with Menu — extracted to `_shared/listItemRecipe.ts` if not already
- [ ] Adding a color = palette entry only — recipe edits = 0
- [ ] Adding a new variant = `variantColorMatrix` returns new compound rows automatically

---

## Out of Scope (Future Components / Phases)

- **`<MultiSelect>`** — chips + open-on-pick. Separate component.
- **`<Combobox>` / Autocomplete** — typeable filter. Separate component, will reuse Select's listbox and Input's text shell.
- **Async loading / virtualization** — V2; render-all-items is fine up to ~500 entries.
- **`Select.Value` subpart** — defer; Trigger renders value internally.
- **Custom item rendering** (e.g. avatar + name + email per row) — already supported via `<Select.Item>{children}</Select.Item>`; only the search-`textValue` prop needs explicit handling.

---

## When This Phase Is Complete

1. Move this file to `plans/completed/components/23-select.md`.
2. Append `## Outcome`: API, bundle delta, axe results, decision on `_shared/useListKeyboard` and `_shared/listItemRecipe` promotion.
3. Resume Phase 24 — Progress.

---

## Outcome (Phase 23 — Select)

**Status:** ✅ Shipped. Form-control combobox at the intersection of Input's shell + Menu's listbox. 8 subparts, W3C Listbox + Combobox ARIA pattern, hidden `<input>` for form submission, 4 × 7 trigger matrix matching Input/Textarea heights.

### Final API

```tsx
import { Select } from 'apx-ds';
<Select
  name="country"               // hidden <input> participates in <form> submission
  value={country}              // controlled
  defaultValue=""              // uncontrolled
  onValueChange={setCountry}
  required
  invalid={hasError}
  disabled={false}
  variant="outline"            // outline | solid | ghost | underline  (form-control vocab)
  size="md"                    // sm | md | lg  (height matches Input)
  color="primary"              // 7-color palette
  fullWidth
  placeholder="Pick a country"
  defaultOpen={false}
  open={controlledOpen}
  onOpenChange={setOpen}
  closeOnEscape
  closeOnOutsideClick
>
  <Select.Trigger leftIcon={<Globe />} />
  <Select.Content
    variant="solid"            // solid | outline | soft  (overlay vocab, independent)
    placement="bottom-start"
    offset={4}
    matchTriggerWidth          // default true; Floating UI size middleware
    portalContainer={containerRef.current}
    loop typeAhead
  >
    <Select.Group>
      <Select.Label>Europe</Select.Label>
      <Select.Item value="fr">France</Select.Item>
      <Select.Item value="de" disabled>Germany</Select.Item>
    </Select.Group>
    <Select.Separator />
    <Select.Group>
      <Select.Label>Asia</Select.Label>
      <Select.Item value="jp" leftIcon={<Flag />}>Japan</Select.Item>
    </Select.Group>
  </Select.Content>
</Select>
```

**8 subparts:** `Select`, `Trigger`, `Content`, `Item`, `ItemIndicator`, `Group`, `Label`, `Separator`.

### Engine + shared consumption (no new engine primitives)

| Surface | Source | Notes |
|---|---|---|
| `usePosition({ matchTriggerWidth: true })` | `@apx-dsine` | **First DS consumer** of Floating UI's `size` middleware path — confirms the engine surface works end-to-end. |
| `<Portal>` / `useEscapeStack` / `useOutsideClick` / `useControllableState` / `mergeRefs` | `@apx-dsine` | Standard overlay set. |
| `controlBase` | `_shared/controlRecipe.ts` | Trigger's form-control shell. |
| `useFormFieldA11y` | `_shared/useFormFieldA11y.ts` | `id` / `aria-invalid` / `aria-required` / `aria-describedby` bridging. **Third consumer** (Input, Textarea, Select). |
| `variantColorMatrix({ for: 'Select' })` | `_shared/variantColorMatrix.ts` | Trigger's 4 × 7 compound matrix. **Third consumer** of the matrix — confirms the Phase 8 extraction was right. |
| `useListKeyboard` | `_shared/useListKeyboard.ts` | **Newly promoted** from `Menu/useMenuKeyboard.ts`. Menu was the first consumer; Select is the second — extracted per the "second-consumer rule". |

### `_shared/useListKeyboard.ts` — promotion details

Promoted from `Menu/useMenuKeyboard.ts` verbatim, with:
- Generic typing (`useListKeyboard<T extends ListKeyboardItem>`) so each consumer supplies its own item record shape.
- Identical semantics (arrows / Home / End / Enter / Space / Esc / Tab / type-ahead / cycle-on-repeat / submenu callbacks).
- `Menu/useMenuKeyboard.ts` now re-exports the shared hook with menu-flavored type aliases — zero behavior change for Menu, single line update at the call sites.
- Menu regression: **32 / 32 tests still passing** post-promotion.

### `_shared/listItemRecipe.ts` — NOT promoted

Considered, deferred. Reasoning:
- Select items need a `data-selected=true` indicator slot that Menu items don't have.
- Menu items need a `color="danger"` (destructive item) variant that Select items don't have.
- A "shared" recipe would have to accept both axes — at which point the abstraction has 4 of its 5 fields specialized per consumer. Two `cv()` recipes is cheaper than the indirection.
- Promote on the **third** consumer (Combobox) if the shape converges.

### QA gates

| Gate | Result |
|---|---|
| Components typecheck (Select-related) | ✅ Zero errors |
| ESLint (Select-related) | ✅ Zero errors / warnings |
| `pnpm vitest run` (full suite) | ✅ **1335 / 1335** passing across 67 test files |
| Select tests (`Select.test.tsx`) | ✅ 27 / 27 |
| Select a11y tests (`Select.a11y.test.tsx`) | ✅ 9 / 9 |
| Menu regression (`Menu.test.tsx` + `Menu.a11y.test.tsx`) | ✅ 32 / 32 after shared-hook promotion |
| Overlay regression (Popover / Modal / Tooltip / Menu) | ✅ 110 / 110 |
| `axe-core` violations | ✅ Zero across trigger variants × sampled colors × open-with-groups × invalid+required |
| `tsup` build (ESM + CJS) | ✅ 95.3 KB gzipped total components index |
| `tsup` DTS build | ⚠️ Fails on pre-existing `EmptyState/EmptyState.types.ts` (`Cannot find namespace 'JSX'`) and `Stack/` errors — **not Select-related**, flagged for the EmptyState / Stack owners. |

### Bundle delta

| Measurement | Value |
|---|---|
| Select-only ESM minified | 19.9 KB |
| Select-only ESM **gzipped** | **6.3 KB** |
| Plan target | < 5 KB gzipped |
| Delta | **+1.3 KB over target** |

**Justification for over-budget delta.** The 6.3 KB ships:
- 8 subparts (Select + Trigger + Content + Item + ItemIndicator + Group + Label + Separator), each a `forwardRef` + `useThemedClasses` call.
- Persistent value→label cache + DOM-order item registry (~0.4 KB).
- Trigger keyboard logic (Space/Enter/ArrowUp/ArrowDown pre-open seeding) — ~0.2 KB on top of the shared `useListKeyboard`.
- `useListKeyboard` import (~0.8 KB; shared with Menu, so the net repo-wide delta vs. before extraction is **roughly zero** because Menu's local hook was removed in the same change).
- Aria-name resolution logic (placeholder fallback for nameFromAuthor combobox role) — ~0.1 KB.

Comparison: Menu shipped 8.78 KB gzipped for 13 subparts (≈0.68 KB / subpart). Select ships 6.3 KB for 8 subparts (≈0.79 KB / subpart). Higher per-subpart cost is the form-control wiring (controlBase + variantColorMatrix + useFormFieldA11y) — exactly the boundary Select sits at. Industry comparison: Radix's `@radix-ui/react-select` is ~12 KB minified per their docs; ours is ~20 KB minified but includes its full theme/recipe layer.

**Reclamation paths if budget pressure rises:**
- Extract `_shared/listItemRecipe.ts` once Combobox lands (third consumer rule) — saves ~0.3 KB from item recipe duplication across Menu/Select.
- Move the value→label cache into the engine as a reusable `useValueLabelCache` hook — same shape Combobox will need; saves ~0.2 KB after second consumer.
- Inline the ChevronDown SVG instead of importing from `lucide-react` — saves ~0.1 KB but breaks `<Trigger rightIcon>` defaulting.

### A11y posture

W3C Listbox + Combobox pattern (verified via `jest-axe` across all sampled cells):

- Trigger: `role="combobox"` + `aria-haspopup="listbox"` + `aria-expanded` + `aria-controls` (open only) + `aria-label` / `aria-labelledby` (consumer-provided OR auto-fallback to `placeholder` since combobox is nameFromAuthor) + `aria-invalid` / `aria-required` / `aria-describedby` (via `useFormFieldA11y`) + `data-state="open|closed"` + `data-placeholder="true"`.
- Content: `role="listbox"` + `aria-labelledby` the trigger + `aria-activedescendant` (open only) — highlight, don't focus.
- Items: `role="option"` + `aria-selected` + `aria-disabled` + `data-highlighted` + `data-selected` + `data-value`.
- Auto-scroll the highlighted item into view via `scrollIntoView({ block: 'nearest' })` (jsdom-guarded).
- Hidden `<input type="hidden" name value required>` participates in native form validation.

### Deviations from the plan

1. **`Select.ItemIndicator` shipped as a standalone subpart** (plan listed it as part of `Select.Item`'s internals). `Select.Item` still renders the default `<Check>` indicator automatically; `Select.ItemIndicator` exists as a separately-themable slot and for power consumers who want custom render. Net: +1 subpart, but each subpart is small and the slot-level theming is now uniform.
2. **`_shared/listItemRecipe.ts` NOT extracted** (plan said "extract here — Select is the second consumer"). Deferred to Combobox per the rationale above — Select items and Menu items diverge enough that the shared recipe would specialize on consumer.
3. **Listbox is always mounted, not unmounted on close** (plan didn't specify). Required so items can populate the value→label cache before the user ever opens the listbox — otherwise a controlled `<Select defaultValue="fr">` would render `"fr"` until first open. Implementation uses `visibility: hidden` + `pointer-events: none` + `aria-hidden` + Floating UI positioning when closed.
4. **`aria-label` auto-fallback to `placeholder`** (plan didn't specify). Mandatory because `role="combobox"` is a nameFromAuthor role — descendant text doesn't count for the accessible name. The auto-fallback satisfies axe and matches Radix's behavior.
5. **Bundle delta over target** (plan: < 5 KB; actual: 6.3 KB). Justified above.

### Coordination notes (for `SDS-Leader` and other agents)

- One new `_shared/` file: `useListKeyboard.ts`. No edits to existing `_shared/` files.
- `Menu/useMenuKeyboard.ts` shrunk to a thin re-export of `_shared/useListKeyboard`. Menu test suite (32/32) re-run as regression.
- `packages/components/src/index.ts` — single surgical insert (Select export block between `Radio` and `Skeleton`). No other lanes touched.
- No edits to `Popover/`, `Modal/`, `Tooltip/`, `Toast/`, `Input/`, `Textarea/`, `Menu/` (other than the 1-line keyboard hook re-export).
- No theme-token / tailwind-preset edits.
- No renderer touches.
- **Build / typecheck failures observed but NOT from Select:**
  - `src/EmptyState/EmptyState.types.ts(83,19)` — `Cannot find namespace 'JSX'`. Owner needs to import `JSX` from `react` (React 18+ removes the global).
  - `src/Stack/gapClasses.ts` + `src/Stack/stackChildrenWithDivider.tsx` — three pre-existing type errors.
  - `__tests__/Tabs.a11y.test.tsx(4,32)` — unused `vi` import.
  Flagging here so the relevant lane owners can clean up.

### Ready for downstream

- **Combobox / Autocomplete** can now build on the same `_shared/useListKeyboard.ts` + `_shared/controlRecipe.ts` + `_shared/useFormFieldA11y.ts` + `_shared/variantColorMatrix.ts` set. Three of those have ≥3 consumers; the keyboard hook has 2 and will hit 3 with Combobox.
- **MultiSelect** can extend `Select` by overriding `setValue` to accept arrays + rendering chips inside `Select.Trigger`'s slot.
- **`<Field>`** can wrap `<Select>` the same way it wraps `<Input>` / `<Textarea>` — `useFormFieldA11y` is the single integration point.
