import { cv } from '@apx-ui/engine';

/**
 * Four recipes — one per styling concern in the Toast surface:
 *
 *  - `region`  — the fixed positioned `<ol>` that anchors the toast stack to a screen corner.
 *  - `content` — the rounded card that *is* a single toast.
 *  - `action`  — the action / cancel buttons inside a toast.
 *  - `close`   — the absolute-positioned `×` dismiss button.
 *
 * Same flat-compound shape Alert / Modal use: the matrix of `variant × intent` is enumerated
 * literally so Tailwind's JIT scanner sees every class. Variant-only or intent-only base rows
 * cover the shared declarations; the compounds add the colored bits.
 *
 * The `region` recipe uses literal Tailwind classes for each of the six positions because
 * `top-0 / bottom-0` and the centered translate are not interchangeable — building the strings
 * via template literals would defeat the scanner.
 */

export const toastRegionRecipe = cv({
  base: [
    // The region itself is non-interactive so backdrop clicks pass through to the page below.
    // Each toast card flips `pointer-events-auto` back on so clicks on the toast still register.
    'fixed z-toast pointer-events-none',
    'flex flex-col p-4',
    // Fixed max width so a 1-line headline doesn't stretch to the viewport edge; mobile-safe
    // because `w-full` is capped by `max-w-[420px]`.
    'max-w-[420px] w-full',
    'sm:max-w-[420px]',
    'outline-none',
  ].join(' '),
  variants: {
    position: {
      'top-left': 'top-0 left-0 items-start',
      'top-center': 'top-0 left-1/2 -translate-x-1/2 items-center',
      'top-right': 'top-0 right-0 items-end',
      'bottom-left': 'bottom-0 left-0 items-start',
      'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2 items-center',
      'bottom-right': 'bottom-0 right-0 items-end',
    },
    // Drives the stack direction:
    //   - top-* positions render newest at the bottom so toasts fall away from the screen edge.
    //   - bottom-* positions render newest at the top so toasts rise away from the screen edge.
    // Tailwind's `flex-col-reverse` swaps DOM order at the visual layer only — DOM order remains
    // chronological for the live-region announcer.
    stackDirection: {
      up: 'flex-col-reverse',
      down: 'flex-col',
    },
  },
  defaultVariants: {
    position: 'bottom-right',
    stackDirection: 'up',
  },
});

export const toastContentRecipe = cv({
  base: [
    'pointer-events-auto relative w-full',
    'rounded-md shadow-md border',
    'p-3.5 pe-9',
    'flex items-start gap-3 text-sm',
    // Padding-right cleared by the `pe-9` above leaves room for the absolute close button.
    'transition-[transform,opacity,box-shadow] duration-fast ease-standard',
    'group/toast',
  ].join(' '),
  variants: {
    variant: {
      solid: 'bg-bg-paper border-border text-fg',
      outline: 'bg-bg-paper text-fg',
      soft: 'text-fg',
    },
    intent: {
      neutral: '',
      success: '',
      error: '',
      warning: '',
      info: '',
      loading: '',
    },
  },
  compoundVariants: [
    // Icon colors live in `ToastIcon`'s className map — that drops 18 repeated arbitrary
    // selectors (`[&_[data-toast-icon]]:text-X`) from the bundled recipe. Compound rows below
    // only carry container chrome (background + border).
    // ── outline × intent → colored border, paper background ──────────────────────────────────
    { variant: 'outline', intent: 'neutral', class: 'border-border' },
    { variant: 'outline', intent: 'success', class: 'border-success-border' },
    { variant: 'outline', intent: 'error', class: 'border-danger-border' },
    { variant: 'outline', intent: 'warning', class: 'border-warning-border' },
    { variant: 'outline', intent: 'info', class: 'border-info-border' },
    { variant: 'outline', intent: 'loading', class: 'border-border' },
    // ── soft × intent → tinted background + matching border ─────────────────────────────────
    { variant: 'soft', intent: 'neutral', class: 'bg-bg-subtle border-border' },
    { variant: 'soft', intent: 'success', class: 'bg-success-subtle border-success-border' },
    { variant: 'soft', intent: 'error', class: 'bg-danger-subtle border-danger-border' },
    { variant: 'soft', intent: 'warning', class: 'bg-warning-subtle border-warning-border' },
    { variant: 'soft', intent: 'info', class: 'bg-info-subtle border-info-border' },
    { variant: 'soft', intent: 'loading', class: 'bg-bg-subtle border-border' },
  ],
  defaultVariants: { variant: 'solid', intent: 'neutral' },
});

export const toastActionRecipe = cv({
  base: [
    'inline-flex items-center justify-center',
    'px-2.5 py-1 rounded text-xs font-medium',
    'border border-transparent',
    'transition-colors duration-fast',
    'cursor-pointer',
    'hover:bg-bg-subtle',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-transparent',
    // The action button picks up the toast's intent color via the parent's `text-current`
    // chain on `soft`; on other variants it inherits `text-fg`.
    'text-current',
  ].join(' '),
  variants: {
    role: {
      primary: 'border-current/30 hover:bg-current/10',
      cancel: 'text-fg-muted hover:text-fg',
    },
  },
  defaultVariants: { role: 'primary' },
});

export const toastCloseRecipe = cv({
  base: [
    'absolute end-2 top-2',
    'inline-flex items-center justify-center size-6 rounded',
    'text-fg-muted hover:text-fg hover:bg-bg-subtle',
    'transition-colors duration-fast',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-transparent',
    'cursor-pointer',
    // Make the SVG inherit the muted/contrast color decided by hover state above.
    '[&_svg]:size-3.5',
  ].join(' '),
});
