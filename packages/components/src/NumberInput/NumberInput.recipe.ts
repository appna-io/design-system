import { cv } from '@apx-ui/engine';

/**
 * Two single-purpose recipes for the +/- step controls inside `<NumberInput />`.
 *
 *  - `stepperGroupRecipe` — the flex container that holds one or two stepper buttons. Variants
 *     across `position` (`start` / `end` / `split`) and `size` so layout + width match the
 *     parent Input's height tokens.
 *  - `stepperButtonRecipe` — a single `<button>` slot. Sized by the parent Input's `size` axis,
 *     tinted by `color` via a small compound matrix.
 *
 * No new visual surface for the input frame itself — that comes from `inputRecipe` in
 * `../Input/Input.recipe.ts`. NumberInput is a thin overlay on Input's existing shell.
 */
export const stepperGroupRecipe = cv({
  base: 'flex shrink-0 self-stretch select-none',
  variants: {
    position: {
      // `+` on top, `−` on bottom — same column on the trailing edge.
      end: 'flex-col border-s border-border',
      // Mirror — same column on the leading edge.
      start: 'flex-col border-e border-border',
      // Two horizontal slots, one on each side. The recipe just describes the *individual*
      // wrapper; the component renders two wrappers in this mode (start + end).
      split: 'flex-col',
    },
    size: {
      sm: 'w-5',
      md: 'w-6',
      lg: 'w-7',
    },
  },
  defaultVariants: {
    position: 'end',
    size: 'md',
  },
});

export const stepperButtonRecipe = cv({
  base: [
    'flex flex-1 cursor-pointer items-center justify-center text-fg-muted',
    'transition-colors duration-fast ease-standard',
    'hover:bg-bg-subtle hover:text-fg-default',
    'focus-visible:outline-none focus-visible:bg-bg-subtle',
    'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
    // Steppers are visual-only controls — keyboard users use arrow keys on the input itself.
    // tabIndex={-1} on the JSX side keeps them out of the tab order; this rule keeps the
    // hover/focus story consistent even when they do receive programmatic focus.
  ].join(' '),
  variants: {
    size: {
      sm: 'text-[10px]',
      md: 'text-xs',
      lg: 'text-sm',
    },
    edge: {
      // Visual divider between the two stacked buttons (end / start position only).
      top: 'border-b border-border',
      bottom: '',
      // No divider for split positions — they live on opposite sides.
      none: '',
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
    { color: 'primary', class: 'hover:text-primary focus-visible:text-primary' },
    { color: 'secondary', class: 'hover:text-secondary focus-visible:text-secondary' },
    { color: 'success', class: 'hover:text-success focus-visible:text-success' },
    { color: 'warning', class: 'hover:text-warning focus-visible:text-warning' },
    { color: 'danger', class: 'hover:text-danger focus-visible:text-danger' },
    { color: 'info', class: 'hover:text-info focus-visible:text-info' },
    { color: 'neutral', class: '' },
  ],
  defaultVariants: {
    size: 'md',
    edge: 'none',
    color: 'primary',
  },
});
