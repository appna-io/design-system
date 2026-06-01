import { cv } from '@apx-ui/engine';

/**
 * Single source of styling for `<Alert />` and its sub-parts. Four recipes:
 *
 *  - `root` — the wrapper (border, background, padding, layout, color-by-color contrast text).
 *  - `title` — the optional `Alert.Title` heading.
 *  - `description` — the optional `Alert.Description` body text.
 *  - `action` — the optional `Alert.Action` button row.
 *
 * The 4 variants × 5 colors compound matrix (20 rows) is written out flat for the same reason
 * Button + Input wrote theirs out: Tailwind's content scanner is a literal string matcher.
 * Generating rows via template literals would produce classes Tailwind never sees and silently
 * drops at build time.
 *
 * `inline` variant is the special case — instead of a full border, it uses a single colored
 * logical-start border bar (`border-s-4`), so the compound rules for `inline` skip the
 * background/border-color story and just colorize the bar + icon.
 */
export const alertRootRecipe = cv({
  base: [
    'group/alert',
    'flex items-start',
    'border rounded-md',
    'transition-[border-color,background-color,box-shadow,color]',
    'duration-fast ease-standard',
  ].join(' '),
  variants: {
    variant: {
      solid: '',
      outline: 'bg-bg-paper',
      soft: '',
      // `inline` strips the box and replaces the leading border with a thick logical-start bar.
      inline: 'rounded-none border-0 border-s-4 bg-transparent py-2',
    },
    size: {
      sm: 'p-2.5 text-sm gap-2 [&_svg]:size-4',
      md: 'p-3.5 text-sm gap-3 [&_svg]:size-5',
      lg: 'p-4 text-base gap-3.5 [&_svg]:size-6',
    },
    color: {
      info: '',
      success: '',
      warning: '',
      danger: '',
      neutral: '',
    },
  },
  compoundVariants: [
    // ── solid ────────────────────────────────────────────────────────────────────────────────
    {
      variant: 'solid',
      color: 'info',
      class: 'bg-info text-info-contrast border-transparent [&_svg]:text-info-contrast',
    },
    {
      variant: 'solid',
      color: 'success',
      class: 'bg-success text-success-contrast border-transparent [&_svg]:text-success-contrast',
    },
    {
      variant: 'solid',
      color: 'warning',
      class: 'bg-warning text-warning-contrast border-transparent [&_svg]:text-warning-contrast',
    },
    {
      variant: 'solid',
      color: 'danger',
      class: 'bg-danger text-danger-contrast border-transparent [&_svg]:text-danger-contrast',
    },
    {
      variant: 'solid',
      color: 'neutral',
      class: 'bg-neutral text-neutral-contrast border-transparent [&_svg]:text-neutral-contrast',
    },
    // ── outline ──────────────────────────────────────────────────────────────────────────────
    {
      variant: 'outline',
      color: 'info',
      class: 'border-info-border text-fg [&_svg]:text-info',
    },
    {
      variant: 'outline',
      color: 'success',
      class: 'border-success-border text-fg [&_svg]:text-success',
    },
    {
      variant: 'outline',
      color: 'warning',
      class: 'border-warning-border text-fg [&_svg]:text-warning',
    },
    {
      variant: 'outline',
      color: 'danger',
      class: 'border-danger-border text-fg [&_svg]:text-danger',
    },
    {
      variant: 'outline',
      color: 'neutral',
      class: 'border-neutral-border text-fg [&_svg]:text-neutral',
    },
    // ── soft ─────────────────────────────────────────────────────────────────────────────────
    {
      variant: 'soft',
      color: 'info',
      class: 'bg-info-subtle border-info-border text-fg [&_svg]:text-info',
    },
    {
      variant: 'soft',
      color: 'success',
      class: 'bg-success-subtle border-success-border text-fg [&_svg]:text-success',
    },
    {
      variant: 'soft',
      color: 'warning',
      class: 'bg-warning-subtle border-warning-border text-fg [&_svg]:text-warning',
    },
    {
      variant: 'soft',
      color: 'danger',
      class: 'bg-danger-subtle border-danger-border text-fg [&_svg]:text-danger',
    },
    {
      variant: 'soft',
      color: 'neutral',
      class: 'bg-neutral-subtle border-neutral-border text-fg [&_svg]:text-neutral',
    },
    // ── inline — logical-start colored bar + colored icon, no background or full border ──────
    {
      variant: 'inline',
      color: 'info',
      class: 'border-s-info text-fg [&_svg]:text-info',
    },
    {
      variant: 'inline',
      color: 'success',
      class: 'border-s-success text-fg [&_svg]:text-success',
    },
    {
      variant: 'inline',
      color: 'warning',
      class: 'border-s-warning text-fg [&_svg]:text-warning',
    },
    {
      variant: 'inline',
      color: 'danger',
      class: 'border-s-danger text-fg [&_svg]:text-danger',
    },
    {
      variant: 'inline',
      color: 'neutral',
      class: 'border-s-neutral text-fg [&_svg]:text-neutral',
    },
  ],
  defaultVariants: {
    variant: 'soft',
    size: 'md',
    color: 'info',
  },
});

/**
 * `Alert.Title` — a small, semantically-neutral heading. The actual heading level is left to the
 * consumer (wrap in `<h3>` / `<h4>` when the page outline demands it). Same convention as Card.
 */
export const alertTitleRecipe = cv({
  base: 'font-semibold leading-snug',
});

/**
 * `Alert.Description` — body text. `text-current/90` on `solid` variants softens the contrast
 * text without losing legibility against the strong colored background. On every other variant
 * the muted foreground token already carries the right contrast.
 */
export const alertDescriptionRecipe = cv({
  base: [
    'leading-relaxed mt-1',
    'text-fg-muted',
    'group-data-[variant=solid]/alert:text-current group-data-[variant=solid]/alert:opacity-90',
  ].join(' '),
});

/**
 * `Alert.Action` — the action button row. Flex-wrap so multiple buttons stack on narrow viewports.
 */
export const alertActionRecipe = cv({
  base: 'mt-2 flex flex-wrap gap-2',
});

/**
 * `Alert` dismiss button — the built-in × control rendered when `closable={true}`. The hover
 * tint adapts to the variant via attribute selectors so the button reads correctly on every
 * surface (low-contrast tint on the strong `solid` background; subtle ink tint elsewhere).
 */
export const alertCloseRecipe = cv({
  base: [
    'inline-flex shrink-0 items-center justify-center self-start',
    'rounded-sm transition-colors duration-fast',
    'cursor-pointer text-current opacity-70 hover:opacity-100',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-1 focus-visible:ring-offset-transparent',
    'group-data-[variant=solid]/alert:hover:bg-white/15',
    'group-data-[variant=outline]/alert:hover:bg-bg-subtle',
    'group-data-[variant=soft]/alert:hover:bg-bg-subtle',
  ].join(' '),
  variants: {
    size: {
      sm: 'size-5 -me-0.5 -mt-0.5 [&_svg]:size-3',
      md: 'size-6 -me-1 -mt-1 [&_svg]:size-3.5',
      lg: 'size-7 -me-1 -mt-1 [&_svg]:size-4',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});