import { cv } from '@apx-ui/engine';

/**
 * Multi-slot recipe family for `<Confirm>`. The component is a single-purpose dialog so the
 * slot list is short — backdrop + content + iconWrap + title + description + footer. Each slot
 * is themable independently via `theme.components.Confirm.styleOverrides.<slot>`.
 *
 * Pattern note: the `variant` axis lives on the `iconWrap` slot only (where it picks the tint
 * for the leading icon's halo). The confirm button picks its color directly via the `<Button
 * color="..." />` prop in `ConfirmSurface`, so we don't repeat the role-to-class mapping here.
 */

/**
 * Fixed-position backdrop layer. Centers the dialog horizontally and (vertically) by default.
 *
 * Uses `bg-overlay` (the theme's `--sds-overlay` token: `rgba(0,0,0,.5)` light /
 * `rgba(0,0,0,.7)` dark) rather than `bg-fg-default/N`. The `/N` Tailwind opacity modifier
 * needs the underlying color to be decomposable into RGB triplets — and our palette vars are
 * hex strings, so `rgb(var(--sds-palette-foreground-default) / 0.6)` evaluates to invalid CSS
 * and the browser silently falls back to transparent. The dedicated overlay token sidesteps
 * the whole problem (and also reads as "actually dim the page" in both modes, instead of a
 * milky white wash in dark).
 */
export const confirmBackdropRecipe = cv({
  base: 'fixed inset-0 z-modal flex items-center justify-center px-4 bg-overlay',
});

/**
 * The dialog surface itself. Matches the Modal's `solid` chrome (`bg-bg-paper`, `shadow-2xl`,
 * `rounded-lg`) so a Confirm and a Modal feel like siblings, not strangers. Sized small by
 * default — confirm dialogs are most legible at `max-w-sm` (matches the iOS / macOS dialog
 * width) so the eye can land on the title + buttons without scanning.
 */
export const confirmContentRecipe = cv({
  base: [
    'relative outline-none',
    'w-full max-w-sm',
    'rounded-lg',
    'bg-bg-paper text-fg-default',
    'shadow-2xl border border-transparent',
    'flex flex-col items-center text-center',
    'p-6',
    'gap-3',
    'focus-visible:outline-none',
  ].join(' '),
});

/**
 * Halo wrapper around the leading icon. The icon itself is sized by the surface (`h-6 w-6`);
 * the wrapper provides the tinted circle behind it — same pattern as `<EmptyState>` /
 * `<Alert>` use to call attention to the leading status mark.
 *
 * `compoundVariants` pair the variant axis to the role-tinted backdrop + icon color, so any
 * future palette role can be plugged in by adding one variant row + one compound row.
 */
export const confirmIconWrapRecipe = cv({
  base: [
    'inline-flex items-center justify-center',
    'h-12 w-12 rounded-full',
    'shrink-0',
    // The icon inside inherits via `currentColor` — variant rows override `text-{role}`.
    '[&>svg]:h-6 [&>svg]:w-6',
  ].join(' '),
  variants: {
    variant: {
      default: 'bg-neutral-subtle text-neutral',
      info: 'bg-info-subtle text-info',
      success: 'bg-success-subtle text-success',
      warning: 'bg-warning-subtle text-warning',
      // Visual map: the `error` variant uses the `danger` palette role since the DS palette
      // doesn't carry a separate `error` role.
      error: 'bg-danger-subtle text-danger',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const confirmTitleRecipe = cv({
  base: 'text-base font-semibold leading-tight text-fg-default m-0',
});

export const confirmDescriptionRecipe = cv({
  base: 'text-sm leading-relaxed text-fg-muted m-0',
});

/**
 * Button row. Two buttons by default ([cancel] [confirm]), `mt-2` keeps a comfortable space
 * between the body copy and the action row. `justify-end` matches the dominant DS button-row
 * convention; full-width on small screens via `flex-col-reverse sm:flex-row` so the primary
 * action stays at the bottom on mobile (thumb-friendly) and at the right on desktop.
 */
export const confirmFooterRecipe = cv({
  base: [
    'mt-2 w-full',
    'flex flex-col-reverse gap-2',
    'sm:flex-row sm:justify-end sm:gap-3',
  ].join(' '),
});