import { cv } from '@apx-ui/engine';

/**
 * Four-slot recipe for `<CircularProgress />`. The component owns the SVG wrapper itself (so it
 * can set inline `width` / `height` for numeric `size` values), but every visual decision lives
 * here:
 *
 *  - `root`  — outer `<div>` that anchors the optional center label.
 *  - `svg`   — the `<svg>` element. Owns the indeterminate spin animation + reduced-motion fallback.
 *  - `track` — the unfilled circle (gray ring under the arc).
 *  - `arc`   — the role-colored progress stroke.
 *  - `label` — the centered numeric/text label.
 *
 * No compound rules are needed — color is a single axis on `track` + `arc`. Sizes for the token
 * path (`sm` / `md` / `lg`) are baked in; numeric `size` values bypass the size variant and set
 * inline width/height on the `<svg>` from the component.
 */
export const circularProgressRecipes = {
  root: cv({
    base: 'relative inline-flex items-center justify-center align-middle',
  }),
  /**
   * The `<svg>`. We rotate `-90deg` so 0% sits at 12-o'clock and the arc grows clockwise — the
   * convention every progress dial in product UI follows. The `data-indeterminate` attribute
   * swaps the static rotation for the rotating keyframe; `motion-reduce` halts the animation
   * (the Tailwind preset's reduced-motion utility short-circuits the keyframe).
   */
  svg: cv({
    base: [
      'block -rotate-90',
      'data-[indeterminate=true]:rotate-0',
      'data-[indeterminate=true]:animate-circular-indeterminate-spin',
      'motion-reduce:data-[indeterminate=true]:animate-none',
      'motion-reduce:data-[indeterminate=true]:opacity-60',
    ].join(' '),
    variants: {
      size: {
        sm: 'size-6',
        md: 'size-10',
        lg: 'size-14',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }),
  /**
   * Track ring — neutral by default (`solid` variant), tinted by the role-subtle in `soft`. The
   * `trackOpacity` prop is applied as inline style on top of these classes.
   */
  track: cv({
    base: 'fill-none',
    variants: {
      variant: {
        solid: 'stroke-bg-subtle',
        soft: '',
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
      { variant: 'soft', color: 'primary', class: 'stroke-primary-subtle' },
      { variant: 'soft', color: 'secondary', class: 'stroke-secondary-subtle' },
      { variant: 'soft', color: 'success', class: 'stroke-success-subtle' },
      { variant: 'soft', color: 'warning', class: 'stroke-warning-subtle' },
      { variant: 'soft', color: 'danger', class: 'stroke-danger-subtle' },
      { variant: 'soft', color: 'info', class: 'stroke-info-subtle' },
      { variant: 'soft', color: 'neutral', class: 'stroke-neutral-subtle' },
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'primary',
    },
  }),
  /**
   * The progress stroke. `stroke-dashoffset` is set inline from the component (so the % can be a
   * smooth float); the keyframe drives indeterminate mode. `round` linecap softens the start / end
   * caps — the conventional spinner look.
   */
  arc: cv({
    base: [
      'fill-none',
      '[stroke-linecap:round]',
      'transition-[stroke-dashoffset] duration-normal ease-emphasized',
      'data-[animated=false]:transition-none',
      'motion-reduce:transition-none',
      'data-[indeterminate=true]:animate-circular-indeterminate-dash',
      'motion-reduce:data-[indeterminate=true]:animate-none',
    ].join(' '),
    variants: {
      color: {
        primary: 'stroke-primary',
        secondary: 'stroke-secondary',
        success: 'stroke-success',
        warning: 'stroke-warning',
        danger: 'stroke-danger',
        info: 'stroke-info',
        neutral: 'stroke-neutral',
      },
    },
    defaultVariants: {
      color: 'primary',
    },
  }),
  label: cv({
    base: [
      'pointer-events-none absolute inset-0',
      'flex items-center justify-center',
      'font-medium tabular-nums select-none',
      'text-fg-default',
    ].join(' '),
    variants: {
      size: {
        sm: 'text-[10px]',
        md: 'text-xs',
        lg: 'text-sm',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }),
};