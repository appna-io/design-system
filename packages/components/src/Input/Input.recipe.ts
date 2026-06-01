import { cv } from '@apx-ui/engine';

import { controlBase } from '../_shared/controlRecipe';
import { variantColorMatrix } from '../_shared/variantColorMatrix';

/**
 * Single source of styling for `<Input />`. The wrapper recipe paints the **frame** — border,
 * background, focus ring — and the inner `<input>` runs on a tiny secondary recipe that only
 * owns the per-size padding-X / font-size (see `inputInnerRecipe`).
 *
 * Why split into two recipes? Because the focus ring belongs on the **wrapper** (so addons live
 * inside the same ring) but the visual size/padding belong on the **input** (so the placeholder
 * text isn't offset from the icons). Each recipe is single-purpose and the engine handles
 * variant resolution for both identically.
 *
 * The 4 variants × 7 colors compound matrix lives in `_shared/variantColorMatrix.ts` so Input
 * and Textarea (and any future text-control shell) stay in lock-step — adding a color or
 * variant happens in one place and both surfaces pick it up. The matrix was inline in Phase 7
 * and lifted out during Phase 8 per the DS rule "extract on the second consumer".
 *
 * `invalid` precedence: the danger border + ring color come from the `controlBase` attribute
 * selector (`aria-[invalid=true]:…`) which the input wrapper carries when `aria-invalid="true"`.
 * That selector wins over the color compound rules because it specificity-ties and is declared
 * last in the CSS source order (Tailwind's `aria-*` variant emits after the base `focus-within`).
 */
export const inputRecipe = cv({
  base: [
    controlBase,
    // Input-specific shell: horizontal flex row of [addon | icon | input | icon | addon],
    // clipped to the rounded shell so addon backgrounds don't poke past the border. Moved out
    // of `controlBase` in Phase 7¹ (layout-free refactor) so Textarea / Select can pick their
    // own layout primitive without fighting tailwind-merge.
    'relative isolate flex items-stretch overflow-hidden',
    'border',
    'cursor-text',
    'aria-busy:cursor-progress',
    'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50',
  ].join(' '),
  variants: {
    variant: {
      outline: 'border-border bg-bg-paper',
      solid: 'border-transparent bg-bg-subtle',
      ghost: 'border-transparent bg-transparent',
      underline: 'border-0 border-b border-border bg-transparent',
    },
    size: {
      sm: 'h-8 text-sm rounded-sm',
      md: 'h-10 text-sm rounded-md',
      lg: 'h-12 text-base rounded-lg',
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
    // the focus affordance for this variant). Declared first so the per-size `rounded-*` and the
    // base `focus-within:ring-2` are overridden by what follows in compoundVariants order.
    { variant: 'underline', class: 'rounded-none focus-within:ring-0' },
    // 4 variants × 7 colors = 28 entries. Sourced from the shared matrix so Textarea inherits the
    // same focus story without copying the table.
    ...variantColorMatrix({ for: 'Input' }),
  ],
  defaultVariants: {
    variant: 'outline',
    size: 'md',
    color: 'primary',
    fullWidth: true,
  },
});

/**
 * Padding-X + per-size icon dimensions for the bare `<input>` slot. Kept separate from the
 * frame recipe so the wrapper can carry the ring/border without the input's padding fighting
 * with the addon borders (addons own their outer padding-X; the input contributes a small
 * inner gutter so text doesn't sit flush against the addon divider).
 */
export const inputInnerRecipe = cv({
  base: [
    'min-w-0 grow self-stretch',
    'bg-transparent text-inherit',
    // Suppress the UA focus ring at every level. Same Tailwind-3 / `:focus-visible` story as
    // Textarea — the bare `outline-none` is `outline: 2px solid transparent` and can be
    // overridden by the browser's `:focus-visible { outline: auto … }` rule, which leaks a
    // rectangular browser ring inside our wrapper on the `underline` variant. The wrapper owns
    // the visible focus affordance. See `plans/bugs/textarea-active-frame-mismatch.md`
    // (Symptom B — mirror change to Input per the bug doc's fix-order item 3).
    'border-0 outline-none focus:outline-none focus-visible:outline-none',
    'placeholder:text-fg-muted',
    'disabled:cursor-not-allowed',
    'read-only:cursor-default',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
  ].join(' '),
  variants: {
    size: {
      sm: 'px-2.5 text-sm',
      md: 'px-3 text-sm',
      lg: 'px-4 text-base',
    },
    hasLeftIcon: { true: '' },
    hasRightIcon: { true: '' },
    hasLeftAddon: { true: '' },
    hasRightAddon: { true: '' },
  },
  compoundVariants: [
    // Trim the leading padding-X when an icon already lives in the slot — keeps the visual gap
    // between icon and text consistent across sizes.
    { hasLeftIcon: true, size: 'sm', class: 'ps-1.5' },
    { hasLeftIcon: true, size: 'md', class: 'ps-2' },
    { hasLeftIcon: true, size: 'lg', class: 'ps-2.5' },
    { hasRightIcon: true, size: 'sm', class: 'pe-1.5' },
    { hasRightIcon: true, size: 'md', class: 'pe-2' },
    { hasRightIcon: true, size: 'lg', class: 'pe-2.5' },
    // Addons absorb their own outer padding-X via the addon recipe; the input still needs a
    // small gutter on the divider side so the text/placeholder doesn't sit flush against the
    // addon's `border-e` / `border-s` line. Mirrors the icon spacing for visual consistency.
    { hasLeftAddon: true, size: 'sm', class: 'ps-1.5' },
    { hasLeftAddon: true, size: 'md', class: 'ps-2' },
    { hasLeftAddon: true, size: 'lg', class: 'ps-2.5' },
    { hasRightAddon: true, size: 'sm', class: 'pe-1.5' },
    { hasRightAddon: true, size: 'md', class: 'pe-2' },
    { hasRightAddon: true, size: 'lg', class: 'pe-2.5' },
  ],
  defaultVariants: {
    size: 'md',
  },
});

/**
 * Addon recipe — applied to the `<span>` that wraps `leftAddon` / `rightAddon` content. Stretches
 * to fill the wrapper's height (via `self-stretch`) so all three (addon + input + addon) sit on
 * the same baseline without juggling explicit heights. Background, divider, and text color come
 * from the neutral surface tokens — the wrapper's outer border + radius are the visible shell.
 */
export const inputAddonRecipe = cv({
  base: [
    'inline-flex items-center self-stretch shrink-0 whitespace-nowrap select-none',
    'bg-bg-subtle text-fg-muted',
  ].join(' '),
  variants: {
    size: {
      sm: 'px-2.5 text-sm',
      md: 'px-3 text-sm',
      lg: 'px-4 text-base',
    },
    side: {
      left: 'border-e border-border',
      right: 'border-s border-border',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});