import { cv } from '@apx-ui/engine';

/**
 * Root `<ul role="tree">` chrome. We strip the list bullets and reset spacing so the
 * tree reads as a focusable column. The recipe is intentionally tiny — most of the
 * visual weight lives on each row.
 */
export const treeRootRecipe = cv({
  base: 'flex w-full flex-col text-fg-default outline-none',
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: { size: 'md' },
});

/**
 * Row chrome for a single treeitem. The dot-attribute pattern (`data-selected`,
 * `data-focused`, `data-disabled`) lets us layer states independently rather than
 * exploding the recipe variants into N×M×K compound rules.
 */
export const treeItemRecipe = cv({
  base: 'relative flex w-full items-center gap-1.5 rounded-sm transition-colors focus-visible:outline-none data-[focused=true]:bg-bg-subtle data-[selected=true]:bg-primary-subtle/60 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 hover:bg-bg-subtle/60 data-[disabled=true]:hover:bg-transparent',
  variants: {
    size: {
      sm: 'min-h-7 px-1.5 py-0.5',
      md: 'min-h-8 px-2 py-1',
      lg: 'min-h-9 px-2.5 py-1.5',
    },
    selectable: {
      true: 'cursor-pointer',
      false: 'cursor-default',
    },
  },
  defaultVariants: { size: 'md', selectable: true },
});

/**
 * Chevron — rotates on expansion. We give it a fixed size and color it via the row's
 * text color so it inherits hover / disabled states automatically.
 */
export const treeChevronRecipe = cv({
  base: 'inline-flex shrink-0 items-center justify-center text-fg-muted transition-transform motion-reduce:transition-none',
  variants: {
    size: {
      sm: 'size-3.5',
      md: 'size-4',
      lg: 'size-4',
    },
    expanded: {
      true: 'rotate-90',
      false: 'rotate-0',
    },
    hidden: {
      true: 'opacity-0',
      false: 'opacity-100',
    },
  },
  defaultVariants: { size: 'md', expanded: false, hidden: false },
});

/**
 * Icon container — a slot for `defaultIcon` / `expandedIcon` / `leafIcon` / `node.icon`.
 * Always `aria-hidden` since the icon is decorative; the accessible name comes from the
 * row's `<span>` label.
 */
export const treeIconRecipe = cv({
  base: 'inline-flex shrink-0 items-center justify-center text-fg-muted',
  variants: {
    size: {
      sm: 'size-3.5',
      md: 'size-4',
      lg: 'size-4',
    },
  },
  defaultVariants: { size: 'md' },
});

/** Row label slot — truncates on overflow so deep trees stay legible inside narrow panes. */
export const treeLabelRecipe = cv({
  base: 'min-w-0 flex-1 truncate',
});

/**
 * Connector-line column — drawn with `border-inline-start` so it sits on the logical
 * start edge (LTR left / RTL right). Only present when `showLines` is on.
 */
export const treeConnectorRecipe = cv({
  base: 'pointer-events-none absolute inset-y-0 border-border-subtle',
  variants: {
    showLines: {
      true: 'border-inline-start',
      false: 'hidden',
    },
  },
  defaultVariants: { showLines: false },
});

/** Wrapper for the async-load sentinel row (spinner + label). */
export const treeAsyncRecipe = cv({
  base: 'inline-flex items-center gap-1.5 px-2 py-1 text-fg-muted',
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: { size: 'md' },
});

/** Inline error row with a retry button. */
export const treeErrorRecipe = cv({
  base: 'inline-flex items-center gap-2 px-2 py-1 text-danger',
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: { size: 'md' },
});
