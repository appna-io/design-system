import { cv } from '@apx-ui/engine';

/**
 * `<Tooltip />` ships two recipes: a `content` slot for the floating surface and an `arrow` slot
 * for the SVG arrow. Both are styled by `useThemedClasses` so theme `styleOverrides.{ content,
 * arrow }` and `defaultProps.variant`-style overrides flow through automatically.
 *
 * The 4 variants × 7 colors compound matrix is written out flat (3 active variants × 7 colors =
 * 21 rows; `inverted` ignores `color` and is written into the `variant` line directly). Same DRY
 * justification as Badge / Alert: Tailwind v3's content scanner is a literal string matcher and
 * needs every utility class to appear verbatim in source.
 *
 * Adding an 8th color = one palette entry in `@apx-ui/tokens` + 3 compound rows here. Adding
 * a 5th non-special variant = one row in `variants.variant` + 7 compound rows.
 *
 * The `[&_[data-arrow]]:fill-*` and `[&_[data-arrow]]:stroke-*` group selectors paint the arrow's
 * SVG shape based on the parent surface's variant + color, so the arrow's own recipe stays
 * variant-agnostic and we don't have to ship 28 arrow compound rules.
 */
export const tooltipContentRecipe = cv({
  base: [
    'group/tooltip',
    'pointer-events-none select-none whitespace-normal break-words',
    'rounded-md border shadow-md',
    'z-tooltip',
    'transition-[opacity,transform] duration-fast ease-standard',
  ].join(' '),
  variants: {
    variant: {
      solid: '',
      outline: 'bg-bg-paper',
      soft: '',
      // `inverted` is the platform-default dark-on-light / light-on-dark look. The fg/bg tokens
      // already swap with the active theme mode, so this single rule covers both light and dark.
      inverted:
        'bg-fg-default text-bg-paper border-transparent [&_[data-arrow-fill]]:fill-fg-default [&_[data-arrow-stroke]]:stroke-fg-default',
    },
    size: {
      sm: 'px-2 py-1 text-xs max-w-xs',
      md: 'px-2.5 py-1.5 text-sm max-w-sm',
      lg: 'px-3 py-2 text-base max-w-md',
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
    // ── solid (7) ────────────────────────────────────────────────────────────────────────────
    // Filled background + contrast text. Border collapses into the fill color so the arrow
    // doesn't need a separate stroke.
    {
      variant: 'solid',
      color: 'primary',
      class:
        'bg-primary text-primary-contrast border-primary [&_[data-arrow-fill]]:fill-primary [&_[data-arrow-stroke]]:stroke-primary',
    },
    {
      variant: 'solid',
      color: 'secondary',
      class:
        'bg-secondary text-secondary-contrast border-secondary [&_[data-arrow-fill]]:fill-secondary [&_[data-arrow-stroke]]:stroke-secondary',
    },
    {
      variant: 'solid',
      color: 'success',
      class:
        'bg-success text-success-contrast border-success [&_[data-arrow-fill]]:fill-success [&_[data-arrow-stroke]]:stroke-success',
    },
    {
      variant: 'solid',
      color: 'warning',
      class:
        'bg-warning text-warning-contrast border-warning [&_[data-arrow-fill]]:fill-warning [&_[data-arrow-stroke]]:stroke-warning',
    },
    {
      variant: 'solid',
      color: 'danger',
      class:
        'bg-danger text-danger-contrast border-danger [&_[data-arrow-fill]]:fill-danger [&_[data-arrow-stroke]]:stroke-danger',
    },
    {
      variant: 'solid',
      color: 'info',
      class:
        'bg-info text-info-contrast border-info [&_[data-arrow-fill]]:fill-info [&_[data-arrow-stroke]]:stroke-info',
    },
    {
      variant: 'solid',
      color: 'neutral',
      class:
        'bg-neutral text-neutral-contrast border-neutral [&_[data-arrow-fill]]:fill-neutral [&_[data-arrow-stroke]]:stroke-neutral',
    },
    // ── outline (7) ──────────────────────────────────────────────────────────────────────────
    // Paper background, 1px colored border, colored text. The arrow needs both a fill (matches
    // the paper bg so the arrow blends into the surface) AND a stroke (matches the border
    // color so the arrow's edges read as a continuation of the box border).
    {
      variant: 'outline',
      color: 'primary',
      class:
        'text-primary border-primary [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-primary',
    },
    {
      variant: 'outline',
      color: 'secondary',
      class:
        'text-secondary border-secondary [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-secondary',
    },
    {
      variant: 'outline',
      color: 'success',
      class:
        'text-success border-success [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-success',
    },
    {
      variant: 'outline',
      color: 'warning',
      class:
        'text-warning border-warning [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-warning',
    },
    {
      variant: 'outline',
      color: 'danger',
      class:
        'text-danger border-danger [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-danger',
    },
    {
      variant: 'outline',
      color: 'info',
      class:
        'text-info border-info [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-info',
    },
    {
      variant: 'outline',
      color: 'neutral',
      class:
        'text-neutral border-neutral [&_[data-arrow-fill]]:fill-bg-paper [&_[data-arrow-stroke]]:stroke-neutral',
    },
    // ── soft (7) ─────────────────────────────────────────────────────────────────────────────
    // Subtle tinted background + colored text. Border tones down to 30% opacity. Arrow fill
    // matches the subtle background; the stroke is the same low-opacity color border.
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
    // `inverted` × any color is a no-op — the inverted look is fixed (see the variant row above).
  ],
  defaultVariants: {
    variant: 'solid',
    size: 'md',
    color: 'neutral',
  },
});

/**
 * The arrow recipe sizes the SVG; the actual fill/stroke colors come from the parent
 * surface via the `[&_[data-arrow-*]]` group selectors above. This keeps the arrow's recipe
 * variant-agnostic — adding a new variant only touches the content recipe.
 */
export const tooltipArrowRecipe = cv({
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
