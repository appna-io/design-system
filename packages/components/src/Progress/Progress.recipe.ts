import { cv } from '@apx-ui/engine';

/**
 * Three-slot recipe for `<Progress />` (linear). The split mirrors Alert's:
 *
 *  - `track` — the outer wrapper. Owns the rounded corners, height, and base background.
 *  - `bar`   — the inner fill rectangle. Owns the role color + the indeterminate keyframe.
 *  - `label` — the optional inline percentage label (`showLabel={true}`).
 *
 * The 7-color × 3-variant matrix is written out flat (21 compound rows on `track` + the
 * per-color rules baked into `bar.variants.color`). Tailwind v3's content scanner is a literal
 * string matcher; generating these via template literals would emit utilities Tailwind never
 * sees and silently drops at build time.
 *
 * `striped` is a **shortcut** for `variant='striped'` — both paths land on the same diagonal
 * gradient overlay (the bar carries `data-striped`, see `bar.base`).
 */
export const progressRecipes = {
  track: cv({
    base: 'group/progress relative w-full overflow-hidden',
    variants: {
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
      },
      rounded: {
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
      variant: {
        solid: 'bg-bg-subtle',
        soft: '',
        striped: 'bg-bg-subtle',
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
      { variant: 'soft', color: 'primary', class: 'bg-primary-subtle' },
      { variant: 'soft', color: 'secondary', class: 'bg-secondary-subtle' },
      { variant: 'soft', color: 'success', class: 'bg-success-subtle' },
      { variant: 'soft', color: 'warning', class: 'bg-warning-subtle' },
      { variant: 'soft', color: 'danger', class: 'bg-danger-subtle' },
      { variant: 'soft', color: 'info', class: 'bg-info-subtle' },
      { variant: 'soft', color: 'neutral', class: 'bg-neutral-subtle' },
    ],
    defaultVariants: {
      size: 'md',
      rounded: 'full',
      variant: 'solid',
      color: 'primary',
    },
  }),
  /**
   * Inner bar. The width is set inline via `style={{ width: '<percent>%' }}` (or omitted under
   * `indeterminate`, where the keyframe drives the position + width). The `data-striped="true"`
   * attribute toggles the diagonal overlay so the same rule fires whether the consumer reaches
   * for `striped` (boolean shortcut) or `variant='striped'`.
   *
   * `data-animated="false"` opts out of the width transition (consumers chasing precise
   * server-driven progress sometimes want the bar to snap, not glide).
   */
  bar: cv({
    base: [
      'h-full',
      'transition-[width] duration-normal ease-emphasized',
      'data-[animated=false]:transition-none',
      'motion-reduce:transition-none',
      'data-[indeterminate=true]:absolute data-[indeterminate=true]:inset-y-0 data-[indeterminate=true]:start-0',
      'data-[indeterminate=true]:w-1/3 data-[indeterminate=true]:animate-progress-indeterminate',
      // Diagonal stripes overlay — applied via background-image so it composes cleanly on top of
      // the role-colored fill (the role color comes from the per-axis `color` variant).
      'data-[striped=true]:bg-[linear-gradient(45deg,rgba(255,255,255,0.18)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.18)_50%,rgba(255,255,255,0.18)_75%,transparent_75%,transparent)]',
      'data-[striped=true]:bg-[length:1rem_1rem]',
    ].join(' '),
    variants: {
      color: {
        primary: 'bg-primary',
        secondary: 'bg-secondary',
        success: 'bg-success',
        warning: 'bg-warning',
        danger: 'bg-danger',
        info: 'bg-info',
        neutral: 'bg-neutral',
      },
    },
    defaultVariants: {
      color: 'primary',
    },
  }),
  /**
   * Optional inline label. Sits absolutely over the bar so the same DOM works on both light
   * (`solid` / `striped` — the label sits on the role color) and tinted (`soft`) tracks. The
   * tabular-numbers utility keeps the digits from jittering as the value animates.
   */
  label: cv({
    base: [
      'pointer-events-none absolute inset-0',
      'flex items-center justify-center',
      'font-medium tabular-nums select-none',
      'text-fg-default mix-blend-difference invert',
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