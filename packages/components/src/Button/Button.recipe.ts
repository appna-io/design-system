import { cv } from '@apx-ui/engine';

/**
 * The single source of styling for `<Button />`. `Button.tsx` never builds class strings itself —
 * it only forwards the relevant variant axes through `useThemedClasses({ recipe: buttonRecipe })`.
 *
 * Phase 5 shipped `solid` for all 7 colors. Phase 6 fills in `outline` and `ghost` so every
 * (variant × color) cell — 21 total — is covered by a compound rule. Hover / active / focus
 * states all reference semantic palette tokens (no hardcoded shades), so a Theme-Studio palette
 * edit re-paints every cell automatically.
 *
 * The 21 compound rows are written out flat (not generated) on purpose: Tailwind v3's content
 * scanner is a string matcher, so every utility class has to appear *literally* somewhere in
 * the codebase. Generating them via `${color}-hover` template literals would produce classes
 * Tailwind never sees and silently drops at build time.
 */
export const buttonRecipe = cv({
  base: [
    // Layout / shape — `border border-transparent` keeps every variant on the same 40px height
    // grid; outline simply overrides `border-color` without growing the box (Tailwind's
    // `box-sizing: border-box` includes the border in the height).
    'inline-flex items-center justify-center gap-2 align-middle',
    'font-medium select-none whitespace-nowrap',
    'rounded-md border border-transparent',
    // Motion — CSS-only press scale (Motion handles the loading spinner; for a button press the
    // spring overshoot is imperceptible vs CSS transform and we save ~30KB of bundle).
    'transition-[transform,background-color,color,border-color,box-shadow]',
    'duration-fast ease-standard',
    'active:scale-[0.97] motion-reduce:active:scale-100',
    // Focus
    'outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    // Disabled — handled both via the native attribute (real <button>) and the `data-disabled`
    // attribute (used by `asChild` since the child may not be a button).
    'disabled:opacity-50 disabled:pointer-events-none',
    'data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none',
    // Loading state cursor hint
    'aria-busy:cursor-progress',
  ].join(' '),
  variants: {
    variant: {
      solid: '',
      outline: '',
      ghost: '',
    },
    size: {
      sm: 'h-8 px-3 text-sm gap-1.5 [&_svg]:size-3.5',
      md: 'h-10 px-4 text-sm gap-2 [&_svg]:size-4',
      lg: 'h-12 px-6 text-base gap-2 [&_svg]:size-5',
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
    fullWidth: { true: 'w-full' },
    iconOnly: { true: 'aspect-square px-0' },
  },
  compoundVariants: [
    // ── solid ────────────────────────────────────────────────────────────────────────────────
    {
      variant: 'solid',
      color: 'primary',
      class: 'bg-primary text-primary-contrast hover:bg-primary-hover focus-visible:ring-primary',
    },
    {
      variant: 'solid',
      color: 'secondary',
      class:
        'bg-secondary text-secondary-contrast hover:bg-secondary-hover focus-visible:ring-secondary',
    },
    {
      variant: 'solid',
      color: 'success',
      class: 'bg-success text-success-contrast hover:bg-success-hover focus-visible:ring-success',
    },
    {
      variant: 'solid',
      color: 'warning',
      class: 'bg-warning text-warning-contrast hover:bg-warning-hover focus-visible:ring-warning',
    },
    {
      variant: 'solid',
      color: 'danger',
      class: 'bg-danger text-danger-contrast hover:bg-danger-hover focus-visible:ring-danger',
    },
    {
      variant: 'solid',
      color: 'info',
      class: 'bg-info text-info-contrast hover:bg-info-hover focus-visible:ring-info',
    },
    {
      variant: 'solid',
      color: 'neutral',
      class: 'bg-neutral text-neutral-contrast hover:bg-neutral-hover focus-visible:ring-neutral',
    },
    // ── outline ──────────────────────────────────────────────────────────────────────────────
    // Transparent background, role's `border` slot for the visible 1px outline, `main` for text.
    // Hover/active fill with the role's `subtle` tint so the button feels "pressed" without
    // changing the border or text color.
    {
      variant: 'outline',
      color: 'primary',
      class:
        'bg-transparent text-primary border-primary-border hover:bg-primary-subtle active:bg-primary-subtle focus-visible:ring-primary',
    },
    {
      variant: 'outline',
      color: 'secondary',
      class:
        'bg-transparent text-secondary border-secondary-border hover:bg-secondary-subtle active:bg-secondary-subtle focus-visible:ring-secondary',
    },
    {
      variant: 'outline',
      color: 'success',
      class:
        'bg-transparent text-success border-success-border hover:bg-success-subtle active:bg-success-subtle focus-visible:ring-success',
    },
    {
      variant: 'outline',
      color: 'warning',
      class:
        'bg-transparent text-warning border-warning-border hover:bg-warning-subtle active:bg-warning-subtle focus-visible:ring-warning',
    },
    {
      variant: 'outline',
      color: 'danger',
      class:
        'bg-transparent text-danger border-danger-border hover:bg-danger-subtle active:bg-danger-subtle focus-visible:ring-danger',
    },
    {
      variant: 'outline',
      color: 'info',
      class:
        'bg-transparent text-info border-info-border hover:bg-info-subtle active:bg-info-subtle focus-visible:ring-info',
    },
    {
      variant: 'outline',
      color: 'neutral',
      class:
        'bg-transparent text-neutral border-neutral-border hover:bg-neutral-subtle active:bg-neutral-subtle focus-visible:ring-neutral',
    },
    // ── ghost ────────────────────────────────────────────────────────────────────────────────
    // No border, no fill at rest — just colored text. Hover/active reveal the role's `subtle`
    // tint for affordance. Same focus ring as solid/outline so keyboard focus stays consistent.
    {
      variant: 'ghost',
      color: 'primary',
      class:
        'bg-transparent text-primary hover:bg-primary-subtle active:bg-primary-subtle focus-visible:ring-primary',
    },
    {
      variant: 'ghost',
      color: 'secondary',
      class:
        'bg-transparent text-secondary hover:bg-secondary-subtle active:bg-secondary-subtle focus-visible:ring-secondary',
    },
    {
      variant: 'ghost',
      color: 'success',
      class:
        'bg-transparent text-success hover:bg-success-subtle active:bg-success-subtle focus-visible:ring-success',
    },
    {
      variant: 'ghost',
      color: 'warning',
      class:
        'bg-transparent text-warning hover:bg-warning-subtle active:bg-warning-subtle focus-visible:ring-warning',
    },
    {
      variant: 'ghost',
      color: 'danger',
      class:
        'bg-transparent text-danger hover:bg-danger-subtle active:bg-danger-subtle focus-visible:ring-danger',
    },
    {
      variant: 'ghost',
      color: 'info',
      class:
        'bg-transparent text-info hover:bg-info-subtle active:bg-info-subtle focus-visible:ring-info',
    },
    {
      variant: 'ghost',
      color: 'neutral',
      class:
        'bg-transparent text-neutral hover:bg-neutral-subtle active:bg-neutral-subtle focus-visible:ring-neutral',
    },
  ],
  defaultVariants: {
    variant: 'solid',
    size: 'md',
    color: 'primary',
    fullWidth: false,
    iconOnly: false,
  },
});