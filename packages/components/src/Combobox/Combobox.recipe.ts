import { cv } from '@apx-ui/engine';

import { controlBase } from '../_shared/controlRecipe';
import { variantColorMatrix } from '../_shared/variantColorMatrix';

/**
 * Combobox's wrapper recipe — the form-control shell hosting the (potentially multi) tag list +
 * the editable `<input>`. Same `controlBase` + `variantColorMatrix` that Input / Textarea /
 * Select consume — Combobox is the **fourth consumer** of the matrix, doubly-validating the
 * Phase 8 extraction.
 *
 * Layout primitive: `flex flex-wrap items-center` so multi-mode tag chips wrap onto multiple
 * lines without breaking the focus ring or the perceived field height. Single mode renders the
 * tag-list row empty, so the layout collapses to a one-line input automatically.
 *
 * The internal `<input>` is *not* themed with `inputInnerRecipe`; it's a borderless transparent
 * text field rendered inline because the surrounding shell already paints every visible affordance
 * (border, focus ring, addons via icon slots). Reusing `inputInnerRecipe` would re-apply the per-
 * size padding-X that we already control on the wrapper.
 *
 * **Why we don't extend `inputRecipe` directly**: Combobox's height isn't fixed in multi mode —
 * it grows with each new row of tags. Locking `h-8`/`h-10`/`h-12` on the wrapper (like Input)
 * would clip tags past the first row. We mirror only the per-size padding + font + radius from
 * `inputRecipe` and let the height be content-driven via `min-h`.
 */
export const comboboxWrapperRecipe = cv({
  base: [
    controlBase,
    'relative isolate flex flex-wrap items-center gap-1',
    'border',
    'cursor-text',
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
      sm: 'min-h-8 px-2 py-1 text-sm rounded-sm',
      md: 'min-h-10 px-2.5 py-1 text-sm rounded-md',
      lg: 'min-h-12 px-3 py-1.5 text-base rounded-lg',
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
    { variant: 'underline', class: 'rounded-none focus-within:ring-0' },
    ...variantColorMatrix({ for: 'Combobox' }),
  ],
  defaultVariants: {
    variant: 'outline',
    size: 'md',
    color: 'primary',
    fullWidth: true,
  },
});

/**
 * The bare `<input>` inside the shell. Strips browser chrome so the wrapper's focus-within ring
 * is the only visible focus affordance. Width grows-to-fill so the input occupies all available
 * inline-size once tags are laid out.
 */
export const comboboxInputRecipe = cv({
  base: [
    'min-w-[4ch] grow self-stretch',
    'bg-transparent text-inherit',
    'border-0 outline-none focus:outline-none focus-visible:outline-none',
    'placeholder:text-fg-muted',
    'disabled:cursor-not-allowed',
  ].join(' '),
  variants: {
    size: {
      sm: 'text-sm py-0.5',
      md: 'text-sm py-1',
      lg: 'text-base py-1.5',
    },
  },
  defaultVariants: { size: 'md' },
});

/** Tag pill list rendered before the input in multi mode. Empty in single mode. */
export const comboboxTagListRecipe = cv({
  base: 'contents',
});

/** Clear-all button anchored to the logical end of the shell. */
export const comboboxClearButtonRecipe = cv({
  base: [
    'inline-flex shrink-0 items-center justify-center',
    'size-5 rounded-full',
    'text-fg-muted hover:text-fg-default',
    'transition-colors duration-fast ease-standard',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current',
  ].join(' '),
});

/** Non-interactive group label inside the listbox. */
export const comboboxGroupLabelRecipe = cv({
  base: 'px-2 py-1 text-xs font-semibold uppercase tracking-wider text-fg-muted select-none',
});

/** Empty-state row. Centered, muted; full-width inside the listbox padding. */
export const comboboxEmptyRecipe = cv({
  base: 'px-3 py-6 text-center text-sm text-fg-muted select-none',
});

/** Loading-state row. Spinner + muted text on a single line. */
export const comboboxLoadingRecipe = cv({
  base: 'flex items-center justify-center gap-2 px-3 py-6 text-sm text-fg-muted select-none',
});

/** Error-state row. Same shape as empty/loading; danger-coded. */
export const comboboxErrorRecipe = cv({
  base: 'px-3 py-6 text-center text-sm text-danger select-none',
});

/**
 * "Create '{query}'" row. Styled like an item but with a leading "+" affordance — visually
 * matches Select's items so the keyboard + highlight discipline reads identically.
 */
export const comboboxCreateRowRecipe = cv({
  base: [
    'relative flex items-center gap-2',
    'rounded-sm cursor-default select-none',
    'px-2 py-1.5 text-sm',
    'data-[highlighted=true]:bg-primary-subtle data-[highlighted=true]:text-primary',
    'text-fg-default',
  ].join(' '),
});

/** `<mark>` chrome for `highlightMatch`. Inherits color so theme overrides flow through. */
export const comboboxHighlightRecipe = cv({
  base: 'bg-transparent font-semibold text-primary',
});
