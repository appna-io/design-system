import { cv } from '@apx-ui/engine';

/**
 * Single-slot recipe for `<Skeleton />`. Three convenience components consume it:
 *
 * - `<Skeleton />`        — block primitive
 * - `<SkeletonText />`    — multi-line wrapper that spawns N `<Skeleton>` lines
 * - `<SkeletonAvatar />`  — `<Skeleton rounded="full">` with `<Avatar>`-matched sizes
 *
 * The base sets the block-level layout + the resting background (the neutral subtle role from the
 * theme palette). Variant `soft` swaps to a role-tinted subtle via the compound rows so the visual
 * tracks the active brand palette.
 *
 * Animation is **not** a recipe axis — the `<Skeleton>` component pairs a Tailwind utility
 * (`animate-skeleton-shimmer` / `animate-skeleton-pulse`) with an inline `backgroundImage` /
 * `backgroundSize` style (for shimmer only). Keeping the gradient out of the recipe avoids fighting
 * Tailwind v3's arbitrary-value parser on commas inside `linear-gradient(...)` and keeps the class
 * string short. The keyframes themselves live in `packages/theme/src/tailwind-preset.ts` so any
 * Tailwind consumer of the preset gets the animation utilities for free.
 *
 * Adding an 8th color = one palette entry in `@apx-ui/tokens` + one compound row here.
 */
export const skeletonRecipe = cv({
  base: [
    'block relative overflow-hidden isolate',
    'bg-bg-subtle',
    'select-none pointer-events-none',
  ].join(' '),
  variants: {
    variant: {
      solid: '',
      soft: '',
    },
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
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
    // ── soft × color (7) ─────────────────────────────────────────────────────────────────────────
    // Solid + neutral is intentionally the same surface as the recipe `base` — no override needed.
    // Soft re-tints to the role's -subtle background so brand-immersive splash skeletons can read
    // as part of the section's color family.
    { variant: 'soft', color: 'primary', class: 'bg-primary-subtle' },
    { variant: 'soft', color: 'secondary', class: 'bg-secondary-subtle' },
    { variant: 'soft', color: 'success', class: 'bg-success-subtle' },
    { variant: 'soft', color: 'warning', class: 'bg-warning-subtle' },
    { variant: 'soft', color: 'danger', class: 'bg-danger-subtle' },
    { variant: 'soft', color: 'info', class: 'bg-info-subtle' },
    { variant: 'soft', color: 'neutral', class: 'bg-neutral-subtle' },
  ],
  defaultVariants: {
    variant: 'solid',
    rounded: 'md',
    color: 'neutral',
  },
});

/**
 * Pre-baked inline-style payload for the `shimmer` animation. The gradient uses CSS custom
 * properties with sensible RGB fallbacks so the animation works even on themes that haven't
 * defined `--sds-skeleton-base` / `--sds-skeleton-highlight`. Consumers can override either token
 * at any DOM depth (`:root`, a `<ThemeProvider>` wrapper, or an element-level `style`) to retune
 * the shimmer palette without re-deriving the gradient string.
 */
export const SKELETON_SHIMMER_STYLE = {
  backgroundImage:
    'linear-gradient(110deg, var(--sds-skeleton-base, rgba(125,125,125,0.10)) 0%, var(--sds-skeleton-base, rgba(125,125,125,0.10)) 40%, var(--sds-skeleton-highlight, rgba(255,255,255,0.22)) 50%, var(--sds-skeleton-base, rgba(125,125,125,0.10)) 60%, var(--sds-skeleton-base, rgba(125,125,125,0.10)) 100%)',
  backgroundSize: '200% 100%',
  backgroundRepeat: 'no-repeat',
} as const;
