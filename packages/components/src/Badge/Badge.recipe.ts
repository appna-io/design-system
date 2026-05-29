import { cv } from '@apx-ui/engine';

/**
 * Single-slot recipe for `<Badge />`. Unlike Button, Badge ships **four** variants
 * (`solid` / `outline` / `soft` / `subtle`) × **7** colors = 28 compound rules. Same DRY logic:
 * compound rows are written out flat because Tailwind v3's content scanner is a string matcher
 * and needs every utility class to appear literally in source.
 *
 * `subtle` is the odd one out — its background and text are palette-neutral; only the inner dot
 * + leading icon pick up the color (`[&_.sds-badge-dot]:bg-<color>` and `[&_svg]:text-<color>`).
 * This keeps count/numeric badges from shouting while still tying them to a semantic role.
 *
 * Adding an 8th color = one palette entry in `@apx-ui/tokens` + four compound rows here
 * (one per variant). Adding a 5th variant = one entry in `variants.variant` + 7 compound rows.
 * Zero `<Badge />` component code changes for either.
 */
export const badgeRecipe = cv({
  base: [
    'inline-flex items-center justify-center',
    'font-medium leading-none whitespace-nowrap select-none align-middle',
    'border border-transparent',
    'transition-[background-color,border-color,color] duration-fast ease-standard',
  ].join(' '),
  variants: {
    variant: {
      solid: '',
      outline: '',
      soft: '',
      subtle: '',
    },
    size: {
      sm: 'h-[1.125rem] px-1.5 text-[10px] gap-1 [&_svg]:size-3',
      md: 'h-5 px-2 text-xs gap-1 [&_svg]:size-3.5',
      lg: 'h-6 px-2.5 text-sm gap-1.5 [&_svg]:size-4',
    },
    shape: {
      rounded: 'rounded',
      pill: 'rounded-full',
      square: 'rounded-none',
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
    { variant: 'solid', color: 'primary', class: 'bg-primary text-primary-contrast' },
    { variant: 'solid', color: 'secondary', class: 'bg-secondary text-secondary-contrast' },
    { variant: 'solid', color: 'success', class: 'bg-success text-success-contrast' },
    { variant: 'solid', color: 'warning', class: 'bg-warning text-warning-contrast' },
    { variant: 'solid', color: 'danger', class: 'bg-danger text-danger-contrast' },
    { variant: 'solid', color: 'info', class: 'bg-info text-info-contrast' },
    { variant: 'solid', color: 'neutral', class: 'bg-neutral text-neutral-contrast' },
    // ── outline (7) ──────────────────────────────────────────────────────────────────────────
    { variant: 'outline', color: 'primary', class: 'bg-transparent text-primary border-primary' },
    {
      variant: 'outline',
      color: 'secondary',
      class: 'bg-transparent text-secondary border-secondary',
    },
    { variant: 'outline', color: 'success', class: 'bg-transparent text-success border-success' },
    { variant: 'outline', color: 'warning', class: 'bg-transparent text-warning border-warning' },
    { variant: 'outline', color: 'danger', class: 'bg-transparent text-danger border-danger' },
    { variant: 'outline', color: 'info', class: 'bg-transparent text-info border-info' },
    { variant: 'outline', color: 'neutral', class: 'bg-transparent text-neutral border-neutral' },
    // ── soft (7) ─────────────────────────────────────────────────────────────────────────────
    { variant: 'soft', color: 'primary', class: 'bg-primary-subtle text-primary' },
    { variant: 'soft', color: 'secondary', class: 'bg-secondary-subtle text-secondary' },
    { variant: 'soft', color: 'success', class: 'bg-success-subtle text-success' },
    { variant: 'soft', color: 'warning', class: 'bg-warning-subtle text-warning' },
    { variant: 'soft', color: 'danger', class: 'bg-danger-subtle text-danger' },
    { variant: 'soft', color: 'info', class: 'bg-info-subtle text-info' },
    { variant: 'soft', color: 'neutral', class: 'bg-neutral-subtle text-neutral' },
    // ── subtle (7) ───────────────────────────────────────────────────────────────────────────
    // Neutral fill + muted text; only the dot/icon picks up the role color so count badges read
    // calmly. The `.sds-badge-dot` class is set on the dot span in `Badge.tsx`.
    {
      variant: 'subtle',
      color: 'primary',
      class: 'bg-bg-subtle text-fg-muted [&_.sds-badge-dot]:bg-primary [&_svg]:text-primary',
    },
    {
      variant: 'subtle',
      color: 'secondary',
      class: 'bg-bg-subtle text-fg-muted [&_.sds-badge-dot]:bg-secondary [&_svg]:text-secondary',
    },
    {
      variant: 'subtle',
      color: 'success',
      class: 'bg-bg-subtle text-fg-muted [&_.sds-badge-dot]:bg-success [&_svg]:text-success',
    },
    {
      variant: 'subtle',
      color: 'warning',
      class: 'bg-bg-subtle text-fg-muted [&_.sds-badge-dot]:bg-warning [&_svg]:text-warning',
    },
    {
      variant: 'subtle',
      color: 'danger',
      class: 'bg-bg-subtle text-fg-muted [&_.sds-badge-dot]:bg-danger [&_svg]:text-danger',
    },
    {
      variant: 'subtle',
      color: 'info',
      class: 'bg-bg-subtle text-fg-muted [&_.sds-badge-dot]:bg-info [&_svg]:text-info',
    },
    {
      variant: 'subtle',
      color: 'neutral',
      class: 'bg-bg-subtle text-fg-muted [&_.sds-badge-dot]:bg-neutral [&_svg]:text-neutral',
    },
  ],
  defaultVariants: {
    variant: 'soft',
    size: 'md',
    shape: 'rounded',
    color: 'primary',
  },
});
