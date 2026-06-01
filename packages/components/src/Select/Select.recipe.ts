import { cv } from '@apx-ui/engine';

import { controlBase } from '../_shared/controlRecipe';
import { variantColorMatrix } from '../_shared/variantColorMatrix';

/**
 * 7 recipes for the `<Select>` family — `trigger`, `triggerChevron`, `content`, `item`,
 * `itemIndicator`, `label`, `group`, `separator`. The trigger consumes the **form-control** vocab
 * (Input / Textarea variant + color matrix); the content consumes the **overlay** vocab (Popover
 * / Menu solid/outline/soft × 7 colors).
 *
 * Precedence (same chain as Popover + Menu):
 * `recipe → theme.styleOverrides.<slot> → variant prop → sx → style → consumer className`.
 *
 * ### Why two recipe vocabularies in one component
 *
 * Select is the first overlay component that's also a form-control. The trigger has to look like
 * a sibling of `<Input>` (sm=h-8, md=h-10, lg=h-12; same border + focus-ring story; same
 * `aria-invalid` danger paint) so forms read visually consistent. The listbox surface, on the
 * other hand, has to look like a sibling of `<Popover>` / `<Menu>` (paper bg + shadow-lg +
 * `z-overlay`; same compound color matrix). Pinning both axes to the same prop would force one
 * to compromise — separating them is faithful to both families and matches Radix's split.
 *
 * ### Why the trigger uses `<button>` not `<input>`
 *
 * `<input>` doesn't render arbitrary JSX inside (no `leftIcon` + label + chevron in one element),
 * and combobox-pattern ARIA wants `aria-haspopup="listbox"` on the focusable element. The hidden
 * `<input type="hidden">` rendered by `<Select>` carries `name` + `value` for form submission so
 * the field still posts naturally.
 */
export const selectTriggerRecipe = cv({
  base: [
    controlBase,
    // Trigger-specific shell: same horizontal flex row as Input minus addons, with the chevron
    // sitting at the logical end. `cursor-default` because clicking opens the listbox, not because
    // it accepts text input. `text-start` so the placeholder/value left-aligns even though the
    // chevron is right-aligned.
    'relative isolate inline-flex items-center gap-2',
    'border text-start',
    'cursor-default',
    'data-[placeholder=true]:text-fg-muted',
  ].join(' '),
  variants: {
    variant: {
      outline: 'border-border bg-bg-paper',
      solid: 'border-transparent bg-bg-subtle',
      ghost: 'border-transparent bg-transparent',
      underline: 'border-0 border-b border-border bg-transparent',
    },
    size: {
      sm: 'h-8 px-2.5 text-sm rounded-sm',
      md: 'h-10 px-3 text-sm rounded-md',
      lg: 'h-12 px-4 text-base rounded-lg',
    },
    color: {
      primary: '',
      secondary: '',
      success: '',
      warning: '',
      danger: '',
      info: '',
      neutral: '',
    },
    fullWidth: { true: 'w-full', false: 'w-auto' },
  },
  compoundVariants: [
    // Underline: strip the size's corner radius + drop the base focus ring (the bottom rule IS
    // the focus affordance for this variant) — same treatment Input uses.
    { variant: 'underline', class: 'rounded-none focus-within:ring-0' },
    // 4 variants × 7 colors = 28 entries. Sourced from the shared matrix so Select stays in
    // lock-step with Input + Textarea — Phase 23 is the third consumer of this matrix, validating
    // the Phase 8 extraction.
    ...variantColorMatrix({ for: 'Select' }),
  ],
  defaultVariants: {
    variant: 'outline',
    size: 'md',
    color: 'primary',
    fullWidth: true,
  },
});

/**
 * Chevron at the logical end of the trigger. Rotates 180° when the listbox is open via
 * `data-[state=open]` on the trigger.
 */
export const selectTriggerChevronRecipe = cv({
  base: [
    'ms-auto size-4 shrink-0 text-fg-muted',
    'transition-transform duration-fast ease-standard',
    'group-data-[state=open]/select-trigger:rotate-180',
  ].join(' '),
});

/**
 * Listbox surface. Reuses Menu / Popover's solid/outline/soft × 7 color compound matrix verbatim
 * — 14 compound cells. The width is overridden inline by Select.Content when `matchTriggerWidth`
 * is `true` (the default); the `min-w` / `max-w` here apply when the consumer opts out.
 */
export const selectContentRecipe = cv({
  base: [
    'group/select',
    'relative outline-none',
    'rounded-md border bg-bg-paper text-fg-default',
    'shadow-lg',
    'z-overlay',
    'min-w-[8rem] max-w-[--radix-select-content-available-width,32rem]',
    'overflow-hidden',
    'transition-[opacity,transform] duration-fast ease-standard',
    'focus-visible:outline-none',
  ].join(' '),
  variants: {
    variant: {
      solid: 'border-border-default',
      outline: '',
      soft: '',
    },
    size: {
      sm: 'p-1 text-xs',
      md: 'p-1 text-sm',
      lg: 'p-1.5 text-base',
    },
    color: {
      primary: '',
      secondary: '',
      success: '',
      warning: '',
      danger: '',
      info: '',
      neutral: '',
    },
  },
  compoundVariants: [
    // ── outline (7) — color-tinted border ─────────────────────────────────────────────────────
    { variant: 'outline', color: 'primary', class: 'border-primary' },
    { variant: 'outline', color: 'secondary', class: 'border-secondary' },
    { variant: 'outline', color: 'success', class: 'border-success' },
    { variant: 'outline', color: 'warning', class: 'border-warning' },
    { variant: 'outline', color: 'danger', class: 'border-danger' },
    { variant: 'outline', color: 'info', class: 'border-info' },
    { variant: 'outline', color: 'neutral', class: 'border-neutral' },
    // ── soft (7) — tinted bg + soft border ────────────────────────────────────────────────────
    { variant: 'soft', color: 'primary', class: 'bg-primary-subtle border-primary/30' },
    { variant: 'soft', color: 'secondary', class: 'bg-secondary-subtle border-secondary/30' },
    { variant: 'soft', color: 'success', class: 'bg-success-subtle border-success/30' },
    { variant: 'soft', color: 'warning', class: 'bg-warning-subtle border-warning/30' },
    { variant: 'soft', color: 'danger', class: 'bg-danger-subtle border-danger/30' },
    { variant: 'soft', color: 'info', class: 'bg-info-subtle border-info/30' },
    { variant: 'soft', color: 'neutral', class: 'bg-neutral-subtle border-neutral/30' },
  ],
  defaultVariants: { variant: 'solid', size: 'md', color: 'neutral' },
});

/**
 * Single option row. Same highlight + disabled discipline as Menu — `data-highlighted` is
 * driven imperatively by the shared keyboard hook (no per-item React re-render on each arrow
 * keystroke). Adds `data-selected=true` for the currently-chosen item so the indicator slot
 * lights up.
 */
export const selectItemRecipe = cv({
  base: [
    'relative flex items-center gap-2',
    'rounded-sm select-none cursor-default',
    'outline-none',
    // Reserve space at the logical end for the indicator slot so selected + unselected items
    // line up. Selected items render the Check icon into this slot; unselected items leave it
    // empty.
    'pe-8',
    'data-[highlighted=true]:bg-bg-subtle data-[highlighted=true]:text-fg-default',
    'data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none',
    'focus-visible:outline-none',
  ].join(' '),
  variants: {
    size: {
      sm: 'px-2 py-1 text-xs',
      md: 'px-2 py-1.5 text-sm',
      lg: 'px-3 py-2 text-base',
    },
  },
  defaultVariants: { size: 'md' },
});

/**
 * Indicator slot at the logical end of a selected item. Absolutely positioned so the label can
 * grow / truncate without ever overlapping the check mark. Hidden by default; shown only when
 * the consuming item carries `data-selected=true`.
 */
export const selectItemIndicatorRecipe = cv({
  base: [
    'absolute end-2 inline-flex size-4 items-center justify-center text-current',
    'pointer-events-none',
  ].join(' '),
});

/** Non-interactive section header. Slightly smaller + muted; not focusable. */
export const selectLabelRecipe = cv({
  base: 'px-2 py-1 text-xs font-medium text-fg-muted select-none',
});

/** Visual + ARIA grouping container. No padding of its own; items carry their own. */
export const selectGroupRecipe = cv({
  base: 'flex flex-col',
});

/** Horizontal rule between sections. Negative inline margin so it spans Content's padding. */
export const selectSeparatorRecipe = cv({
  base: '-mx-1 my-1 h-px bg-border',
});