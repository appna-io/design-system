import { cv } from '@apx-ui/engine';

/**
 * Three recipes for the `<Popover>` family — `content` (the floating surface), `arrow` (the
 * SVG tip), and `close` (the optional × button). Same precedence story as Tooltip:
 * `useThemedClasses` resolves the recipe → theme `styleOverrides.{ content, arrow, close }` →
 * variant prop → sx → style → consumer className.
 *
 * The 3 variants × 7 colors compound matrix is written out flat (`solid` is color-neutral and
 * doesn't need compound rows; `outline` and `soft` need 7 each). 14 compound cells total. Same
 * Tailwind-content-scanner DRY justification as Badge / Alert / Tooltip.
 *
 * The `[&_[data-arrow-fill]]:fill-*` and `[&_[data-arrow-stroke]]:stroke-*` group selectors paint
 * the arrow's SVG shape based on the parent surface's variant + color, so the arrow's own recipe
 * stays variant-agnostic.
 */
export const popoverContentRecipe = cv({
  base: [
    'group/popover',
    'relative outline-none',
    'rounded-md border bg-bg-paper text-fg-default',
    'shadow-lg',
    'z-overlay',
    'transition-[opacity,transform] duration-fast ease-standard',
    'focus-visible:outline-none',
  ].join(' '),
  variants: {
    variant: {
      // `solid` is color-neutral on purpose — paper bg, neutral border. No compound rows needed.
      solid:
        'border-border-default [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-border-default',
      // `outline` and `soft` need per-color compound rows (border + arrow stroke; soft also
      // tints the bg + arrow fill).
      outline: '',
      soft: '',
    },
    size: {
      sm: 'p-3 min-w-48 max-w-xs',
      md: 'p-4 min-w-56 max-w-sm',
      lg: 'p-6 min-w-72 max-w-md',
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
    // ── outline (7) ──────────────────────────────────────────────────────────────────────────
    // Paper bg, 1px colored border. Arrow fill matches the paper bg; stroke matches the border.
    {
      variant: 'outline',
      color: 'primary',
      class:
        'border-primary [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-primary',
    },
    {
      variant: 'outline',
      color: 'secondary',
      class:
        'border-secondary [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-secondary',
    },
    {
      variant: 'outline',
      color: 'success',
      class:
        'border-success [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-success',
    },
    {
      variant: 'outline',
      color: 'warning',
      class:
        'border-warning [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-warning',
    },
    {
      variant: 'outline',
      color: 'danger',
      class:
        'border-danger [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-danger',
    },
    {
      variant: 'outline',
      color: 'info',
      class: 'border-info [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-info',
    },
    {
      variant: 'outline',
      color: 'neutral',
      class:
        'border-neutral [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-neutral',
    },
    // ── soft (7) ─────────────────────────────────────────────────────────────────────────────
    // Subtle tinted background + colored text + low-opacity colored border. Arrow fill matches
    // the subtle tint; stroke matches the low-opacity border.
    {
      variant: 'soft',
      color: 'primary',
      class:
        'bg-primary-subtle text-primary border-primary/30 [&_[data-arrow-fill]]:fill-primary-subtle [&_[data-arrow-stroke]]:stroke-primary/30',
    },
    {
      variant: 'soft',
      color: 'secondary',
      class:
        'bg-secondary-subtle text-secondary border-secondary/30 [&_[data-arrow-fill]]:fill-secondary-subtle [&_[data-arrow-stroke]]:stroke-secondary/30',
    },
    {
      variant: 'soft',
      color: 'success',
      class:
        'bg-success-subtle text-success border-success/30 [&_[data-arrow-fill]]:fill-success-subtle [&_[data-arrow-stroke]]:stroke-success/30',
    },
    {
      variant: 'soft',
      color: 'warning',
      class:
        'bg-warning-subtle text-warning border-warning/30 [&_[data-arrow-fill]]:fill-warning-subtle [&_[data-arrow-stroke]]:stroke-warning/30',
    },
    {
      variant: 'soft',
      color: 'danger',
      class:
        'bg-danger-subtle text-danger border-danger/30 [&_[data-arrow-fill]]:fill-danger-subtle [&_[data-arrow-stroke]]:stroke-danger/30',
    },
    {
      variant: 'soft',
      color: 'info',
      class:
        'bg-info-subtle text-info border-info/30 [&_[data-arrow-fill]]:fill-info-subtle [&_[data-arrow-stroke]]:stroke-info/30',
    },
    {
      variant: 'soft',
      color: 'neutral',
      class:
        'bg-neutral-subtle text-neutral border-neutral/30 [&_[data-arrow-fill]]:fill-neutral-subtle [&_[data-arrow-stroke]]:stroke-neutral/30',
    },
  ],
  defaultVariants: {
    variant: 'solid',
    size: 'md',
    color: 'neutral',
  },
});

/** Sizes the SVG arrow; fill/stroke colors come from the parent surface via group selectors. */
export const popoverArrowRecipe = cv({
  base: 'pointer-events-none absolute',
  variants: {
    size: {
      sm: 'h-1.5 w-3',
      md: 'h-2 w-4',
      lg: 'h-2.5 w-5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

/**
 * Variant-agnostic close button. Sits in the logical-end / top corner of `<Popover.Content>`.
 * Uses `end-2 top-2` so RTL flips automatically (LTR: top-right; RTL: top-left).
 */
export const popoverCloseRecipe = cv({
  base: [
    'absolute end-2 top-2',
    'inline-flex items-center justify-center',
    'size-6 rounded',
    'text-fg-muted',
    'hover:text-fg-default hover:bg-bg-subtle',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
    'transition-colors duration-fast ease-standard',
  ].join(' '),
});

/**
 * Backdrop rendered when `<Popover modal>` is set. Captures pointer events so descendant clicks
 * stay within the Popover; closes on click via `useOutsideClick` (the same handler the
 * non-modal case uses).
 */
export const popoverBackdropRecipe = cv({
  base: 'fixed inset-0 z-overlay bg-fg-default/30 backdrop-blur-[1px]',
});
