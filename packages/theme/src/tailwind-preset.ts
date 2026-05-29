/**
 * Tailwind preset that maps every `--sds-*` CSS variable to a Tailwind theme key. Consumers add
 * one line to their `tailwind.config.{ts,js,mjs}`:
 *
 *     import { apxTailwindPreset } from 'apx-ds/tailwind-preset';
 *     export default { presets: [apxTailwindPreset], content: [...] };
 *
 * After that, classes like `bg-primary`, `text-primary-contrast`, `hover:bg-primary-hover`,
 * `rounded-md`, `shadow-md`, and `duration-normal` all resolve to the DS variables — meaning
 * mode/variant switching is a no-op for those classes (the var changes, the class doesn't).
 */

type TailwindColorScale = Record<string, string>;

function colorRoleScale(role: string): TailwindColorScale {
  return {
    DEFAULT: `var(--sds-palette-${role}-main)`,
    main: `var(--sds-palette-${role}-main)`,
    contrast: `var(--sds-palette-${role}-contrast)`,
    hover: `var(--sds-palette-${role}-hover)`,
    active: `var(--sds-palette-${role}-active)`,
    subtle: `var(--sds-palette-${role}-subtle)`,
    border: `var(--sds-palette-${role}-border)`,
  };
}

const ROLE_NAMES = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'];

export const apxTailwindPreset = {
  theme: {
    extend: {
      colors: {
        ...Object.fromEntries(ROLE_NAMES.map((r) => [r, colorRoleScale(r)])),
        bg: {
          DEFAULT: 'var(--sds-palette-background-default)',
          default: 'var(--sds-palette-background-default)',
          paper: 'var(--sds-palette-background-paper)',
          subtle: 'var(--sds-palette-background-subtle)',
        },
        fg: {
          DEFAULT: 'var(--sds-palette-foreground-default)',
          default: 'var(--sds-palette-foreground-default)',
          muted: 'var(--sds-palette-foreground-muted)',
          subtle: 'var(--sds-palette-foreground-subtle)',
        },
        border: {
          DEFAULT: 'var(--sds-palette-border-default)',
          default: 'var(--sds-palette-border-default)',
          subtle: 'var(--sds-palette-border-subtle)',
          strong: 'var(--sds-palette-border-strong)',
        },
        overlay: 'var(--sds-overlay)',
      },
      borderRadius: {
        none: 'var(--sds-radius-none)',
        xs: 'var(--sds-radius-xs)',
        sm: 'var(--sds-radius-sm)',
        DEFAULT: 'var(--sds-radius-md)',
        md: 'var(--sds-radius-md)',
        lg: 'var(--sds-radius-lg)',
        xl: 'var(--sds-radius-xl)',
        '2xl': 'var(--sds-radius-2xl)',
        '3xl': 'var(--sds-radius-3xl)',
        full: 'var(--sds-radius-full)',
      },
      boxShadow: {
        none: 'var(--sds-shadows-none)',
        xs: 'var(--sds-shadows-xs)',
        sm: 'var(--sds-shadows-sm)',
        DEFAULT: 'var(--sds-shadows-md)',
        md: 'var(--sds-shadows-md)',
        lg: 'var(--sds-shadows-lg)',
        xl: 'var(--sds-shadows-xl)',
        '2xl': 'var(--sds-shadows-2xl)',
        inner: 'var(--sds-shadows-inner)',
      },
      transitionDuration: {
        fast: 'var(--sds-duration-fast)',
        DEFAULT: 'var(--sds-duration-normal)',
        normal: 'var(--sds-duration-normal)',
        slow: 'var(--sds-duration-slow)',
      },
      transitionTimingFunction: {
        standard: 'var(--sds-ease-standard)',
        emphasized: 'var(--sds-ease-emphasized)',
        decelerate: 'var(--sds-ease-decelerate)',
        accelerate: 'var(--sds-ease-accelerate)',
      },
      ringColor: {
        DEFAULT: 'var(--sds-focus-ring)',
        focus: 'var(--sds-focus-ring)',
      },
      zIndex: {
        hide: 'var(--sds-z-index-hide)',
        base: 'var(--sds-z-index-base)',
        dropdown: 'var(--sds-z-index-dropdown)',
        sticky: 'var(--sds-z-index-sticky)',
        overlay: 'var(--sds-z-index-overlay)',
        modal: 'var(--sds-z-index-modal)',
        toast: 'var(--sds-z-index-toast)',
        tooltip: 'var(--sds-z-index-tooltip)',
      },
      // Component-owned keyframes. Each component that needs a CSS animation registers its
      // keyframe + utility name here so consumers using the preset get the animation utility
      // automatically (no extra `globals.css` import required).
      keyframes: {
        // Phase 12 — Badge: slow "Live" indicator pulse.
        'badge-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.4)' },
        },
        // Phase 24 — Progress (linear): the indeterminate sweep. The bar is positioned absolutely
        // at width 1/3 by the recipe; this keyframe slides it left → right and back so the
        // motion reads as "actively working" without making any value claim.
        'progress-indeterminate': {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(150%)' },
          '100%': { transform: 'translateX(350%)' },
        },
        // Phase 24 — CircularProgress: the spinner rotation. Pairs with `circular-indeterminate-dash`
        // (which modulates the visible arc length) to produce the canonical "growing-then-shrinking
        // arc that's also rotating" indeterminate spinner look.
        'circular-indeterminate-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        // Phase 24 — CircularProgress: the arc length oscillator. The strokeDasharray is the full
        // circumference; this keyframe drives the `stroke-dashoffset` so the visible arc grows from
        // ~25% → ~75% → ~25% of the ring while the spin keyframe rotates the whole SVG.
        'circular-indeterminate-dash': {
          '0%': { strokeDashoffset: 'var(--sds-circular-dash-low, 75%)' },
          '50%': { strokeDashoffset: 'var(--sds-circular-dash-high, 25%)' },
          '100%': { strokeDashoffset: 'var(--sds-circular-dash-low, 75%)' },
        },
        // Phase 25 — Skeleton: the left-to-right gradient sweep. The element ships a
        // `linear-gradient(110deg, base, base, highlight, base, base)` background image and a
        // `background-size: 200% 100%` so the visible "highlight" band travels across the box as
        // background-position cycles. The two `--sds-skeleton-*` CSS variables can be retuned per
        // theme to soften / harden the shimmer without re-deriving the gradient string.
        'skeleton-shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        // Phase 25 — Skeleton: the classic opacity blink. Cheaper than shimmer (no gradient) and
        // works on any background, so it's the right pick when consumers can't guarantee the
        // shimmer highlight contrasts against their surface.
        'skeleton-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        // Phase 39 — Spinner (dots variant): three dots scale + fade in / out on staggered delays
        // so the trio reads as a single "thinking" gesture. The `both` fill-mode (set on the
        // animation utility below) keeps each dot at its end-state opacity across the delay window
        // so we don't get a frame of all-three-fully-bright at t=0.
        'spinner-bounce': {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.5' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        // Phase 39 — Spinner (pulse variant): single disc expands from 60% scale at full opacity
        // out to 140% at zero opacity. The expanding ring reads as a sonar pulse — slower than the
        // dot bounce and quieter than the ring spin, the right pick for "we're working on it,
        // don't look at me".
        'spinner-pulse': {
          '0%': { transform: 'scale(0.6)', opacity: '1' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
      },
      animation: {
        'badge-pulse': 'badge-pulse 1.4s ease-in-out infinite',
        'progress-indeterminate': 'progress-indeterminate 1.4s ease-in-out infinite',
        'circular-indeterminate-spin': 'circular-indeterminate-spin 1.4s linear infinite',
        'circular-indeterminate-dash': 'circular-indeterminate-dash 1.4s ease-in-out infinite',
        'skeleton-shimmer': 'skeleton-shimmer 1.6s linear infinite',
        'skeleton-pulse': 'skeleton-pulse 1.8s ease-in-out infinite',
        // Phase 39 — Spinner: `dots` and `pulse` variants. The `speed` prop overrides the
        // `animation-duration` inline (1200ms / 800ms / 500ms for slow / normal / fast); the
        // duration baked in here is the `normal` default so static consumption (`<Spinner />`)
        // works without any inline style.
        'spinner-bounce': 'spinner-bounce 0.8s ease-in-out infinite both',
        'spinner-pulse': 'spinner-pulse 0.8s ease-in-out infinite',
      },
    },
  },
};

export type ApxTailwindPreset = typeof apxTailwindPreset;
