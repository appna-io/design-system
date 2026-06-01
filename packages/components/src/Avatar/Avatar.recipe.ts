import { cv } from '@apx-ui/engine';

/**
 * `<Avatar />` paints a tile (background, optional border, font for initials) that the loaded
 * image then covers. The recipe describes the **fallback** appearance — 3 variants × 7 colors =
 * 21 compound rules — plus axes for `size`, `shape`, and the optional accent `ring`.
 *
 * ### Why a flat compound table (and not `variantColorMatrix`)
 *
 * `_shared/variantColorMatrix.ts` is form-control-shaped (`focus-within` rules, border-only
 * accents). Avatar is a display primitive with its own color story (filled tile, contrast text)
 * — the same shape as Badge. Following Badge's flat-table pattern keeps Avatar's recipe legible
 * and lets Tailwind's literal-text class scanner pick up every utility.
 *
 * ### Why `ring` is on the root recipe
 *
 * The accent ring sits *outside* the avatar's circle in the offset gap. That means it's a child
 * of the same wrapper that owns `rounded-*`, which means it lives in the same recipe (one render
 * pass, one shared `border-radius`). Status dot and group spacing stay in their own recipes.
 */
export const avatarRecipes = {
  root: cv({
    base: [
      'relative inline-flex shrink-0 items-center justify-center overflow-visible align-middle',
      'font-medium leading-none select-none uppercase',
      'transition-[background-color,color,box-shadow] duration-fast ease-standard',
      'bg-bg-subtle text-fg-default',
    ].join(' '),
    variants: {
      variant: {
        solid: '',
        outline: 'border-2 bg-bg-paper',
        soft: '',
      },
      size: {
        xs: 'size-6 text-[10px]',
        sm: 'size-8 text-xs',
        md: 'size-10 text-sm',
        lg: 'size-12 text-base',
        xl: 'size-16 text-lg',
        '2xl': 'size-24 text-2xl',
      },
      shape: {
        circle: 'rounded-full',
        rounded: 'rounded-lg',
        square: 'rounded-none',
      },
      color: {
        // Empty rows here so the engine still emits stable data-* attributes; the actual classes
        // come from compoundVariants. `auto` is resolved to a concrete role before reaching the
        // recipe — we keep the key only for typing symmetry with `AvatarColor`.
        auto: '',
        primary: '',
        secondary: '',
        success: '',
        warning: '',
        danger: '',
        info: '',
        neutral: '',
      },
      ring: {
        none: '',
        primary: 'ring-2 ring-offset-2 ring-offset-bg ring-primary',
        secondary: 'ring-2 ring-offset-2 ring-offset-bg ring-secondary',
        success: 'ring-2 ring-offset-2 ring-offset-bg ring-success',
        warning: 'ring-2 ring-offset-2 ring-offset-bg ring-warning',
        danger: 'ring-2 ring-offset-2 ring-offset-bg ring-danger',
        info: 'ring-2 ring-offset-2 ring-offset-bg ring-info',
        neutral: 'ring-2 ring-offset-2 ring-offset-bg ring-neutral',
      },
    },
    compoundVariants: [
      // ── solid (7) — opaque fill, contrast text ───────────────────────────────────────────────
      { variant: 'solid', color: 'primary', class: 'bg-primary text-primary-contrast' },
      { variant: 'solid', color: 'secondary', class: 'bg-secondary text-secondary-contrast' },
      { variant: 'solid', color: 'success', class: 'bg-success text-success-contrast' },
      { variant: 'solid', color: 'warning', class: 'bg-warning text-warning-contrast' },
      { variant: 'solid', color: 'danger', class: 'bg-danger text-danger-contrast' },
      { variant: 'solid', color: 'info', class: 'bg-info text-info-contrast' },
      { variant: 'solid', color: 'neutral', class: 'bg-neutral text-neutral-contrast' },
      // ── outline (7) — paper bg + role-colored text + role-colored 2px border ─────────────────
      { variant: 'outline', color: 'primary', class: 'text-primary border-primary' },
      { variant: 'outline', color: 'secondary', class: 'text-secondary border-secondary' },
      { variant: 'outline', color: 'success', class: 'text-success border-success' },
      { variant: 'outline', color: 'warning', class: 'text-warning border-warning' },
      { variant: 'outline', color: 'danger', class: 'text-danger border-danger' },
      { variant: 'outline', color: 'info', class: 'text-info border-info' },
      { variant: 'outline', color: 'neutral', class: 'text-neutral border-neutral' },
      // ── soft (7) — palette `-subtle` background + role-colored text ──────────────────────────
      { variant: 'soft', color: 'primary', class: 'bg-primary-subtle text-primary' },
      { variant: 'soft', color: 'secondary', class: 'bg-secondary-subtle text-secondary' },
      { variant: 'soft', color: 'success', class: 'bg-success-subtle text-success' },
      { variant: 'soft', color: 'warning', class: 'bg-warning-subtle text-warning' },
      { variant: 'soft', color: 'danger', class: 'bg-danger-subtle text-danger' },
      { variant: 'soft', color: 'info', class: 'bg-info-subtle text-info' },
      { variant: 'soft', color: 'neutral', class: 'bg-neutral-subtle text-neutral' },
    ],
    defaultVariants: {
      variant: 'solid',
      size: 'md',
      shape: 'circle',
      color: 'neutral',
      ring: 'none',
    },
  }),

  /**
   * Status dot recipe. Positioned absolutely off the wrapper's four corners using
   * `translate-x/y-1/2` so it sits half-on / half-off the avatar's edge for that signature
   * "indicator bites the bezel" look. The `ring-2 ring-bg` halo cuts the dot out from the
   * avatar's background so the boundary stays crisp regardless of palette role.
   */
  status: cv({
    base: 'absolute z-10 block rounded-full ring-2 ring-[var(--sds-palette-background-default)]',
    variants: {
      size: {
        xs: 'size-1.5',
        sm: 'size-2',
        md: 'size-2.5',
        lg: 'size-3',
        xl: 'size-3.5',
        '2xl': 'size-4',
      },
      placement: {
        'top-right': 'top-0.5 right-0.5',
        'top-left': 'top-0.5 left-0.5',
        'bottom-right': 'bottom-0.5 right-0.5',
        'bottom-left': 'bottom-0.5 left-0.5',
      },
      tone: {
        online: 'bg-success',
        offline: 'bg-neutral',
        away: 'bg-warning',
        busy: 'bg-danger animate-badge-pulse motion-reduce:animate-none',
      },
    },
    defaultVariants: {
      size: 'md',
      placement: 'bottom-right',
      tone: 'online',
    },
  }),
};