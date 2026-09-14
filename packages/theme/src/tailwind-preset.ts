/**
 * Tailwind preset that maps every `--sds-*` CSS variable to a Tailwind theme key. Consumers add
 * one line to their `tailwind.config.{ts,js,mjs}`:
 *
 *     import { apxTailwindPreset } from '@apx-ui/ds/tailwind-preset';
 *     export default { presets: [apxTailwindPreset], content: [...] };
 *
 * After that, classes like `bg-primary`, `text-primary-contrast`, `hover:bg-primary-hover`,
 * `rounded-md`, `shadow-md`, and `duration-normal` all resolve to the DS variables — meaning
 * mode/variant switching is a no-op for those classes (the var changes, the class doesn't).
 *
 * ## Also set `future.hoverOnlyWhenSupported`
 *
 *     export default {
 *       future: { hoverOnlyWhenSupported: true },   // ← NOT optional; see below
 *       presets: [apxTailwindPreset],
 *       content: [...],
 *     };
 *
 * On touch, `:hover` latches after a tap and never releases — there is no pointer-leave event to
 * end it. Without the flag, a tapped Card stays lifted and a tapped ColorPicker swatch stays
 * enlarged for the rest of the session, with no gesture available to undo it. With it, Tailwind
 * wraps every `hover:` utility in `@media (hover: hover)`; measured on this repo that moved 100 of
 * 102 hover rules behind the guard. (The two it can't reach are arbitrary variants like
 * `[&>tr:hover>td]:…`, where the `:hover` is inside a raw selector rather than the `hover:`
 * variant — both cosmetic, and one is a scrollbar, which touch doesn't have.)
 *
 * **This preset cannot set it for you, and that is a Tailwind limitation rather than a choice.**
 * `resolveConfig` does not merge `future` from presets — verified by measurement: the flag set
 * here produced 0 guarded rules, the same flag in the consumer's own config produced 102. So it
 * has to be a line in every consuming app's config.
 */

type TailwindColorScale = Record<string, string>;

/**
 * Every DS color goes through here so Tailwind's `/opacity` modifier works on it.
 *
 * A bare `var(--sds-palette-primary-main)` is opaque to Tailwind: the modifier rewrites a color
 * into `<color> / <alpha>`, which needs a value carrying the `<alpha-value>` placeholder. Given a
 * plain `var()` Tailwind emitted an invalid declaration and the browser dropped it — so
 * `bg-primary/50` rendered **fully transparent**, silently. That is one of the most-used Tailwind
 * idioms, and a vanished surface doesn't read as "slightly wrong", so it went unnoticed across
 * two whole templates.
 *
 * `color-mix()` carries the placeholder while keeping the value a `var()` reference, so the color
 * still tracks the active theme, the active variant, and any scoped brand palette layered over it.
 * With no modifier Tailwind substitutes `1`, giving `calc(1 * 100%)` — the untouched color.
 *
 * Chosen over emitting parallel `--sds-palette-*-rgb` channel triplets (the other way to satisfy
 * `<alpha-value>`) because that form only works if every palette value is a hex string.
 * `defineTheme` accepts any CSS color, so a theme using `rgb()`, `hsl()`, or a named color would
 * silently fail to convert — reintroducing exactly this bug's failure mode for those consumers.
 * `color-mix` is format-agnostic. It needs Baseline-2023 browsers (Chrome 111, Safari 16.2,
 * Firefox 113); if the DS ever has to support older ones, the channel-triplet form is the fallback
 * and the change is confined to this file.
 */
function alphaAwareVar(varName: string): string {
  return `color-mix(in srgb, var(${varName}) calc(<alpha-value> * 100%), transparent)`;
}

/** Shorthand for the common case — a path under the `--sds-palette-` prefix. */
function alphaAware(token: string): string {
  return alphaAwareVar(`--sds-palette-${token}`);
}

function colorRoleScale(role: string): TailwindColorScale {
  return {
    DEFAULT: alphaAware(`${role}-main`),
    main: alphaAware(`${role}-main`),
    contrast: alphaAware(`${role}-contrast`),
    hover: alphaAware(`${role}-hover`),
    active: alphaAware(`${role}-active`),
    subtle: alphaAware(`${role}-subtle`),
    border: alphaAware(`${role}-border`),
  };
}

const ROLE_NAMES = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'];

export const apxTailwindPreset = {
  theme: {
    extend: {
      colors: {
        ...Object.fromEntries(ROLE_NAMES.map((r) => [r, colorRoleScale(r)])),
        bg: {
          DEFAULT: alphaAware('background-default'),
          default: alphaAware('background-default'),
          paper: alphaAware('background-paper'),
          subtle: alphaAware('background-subtle'),
        },
        fg: {
          DEFAULT: alphaAware('foreground-default'),
          default: alphaAware('foreground-default'),
          muted: alphaAware('foreground-muted'),
          subtle: alphaAware('foreground-subtle'),
        },
        border: {
          DEFAULT: alphaAware('border-default'),
          default: alphaAware('border-default'),
          subtle: alphaAware('border-subtle'),
          strong: alphaAware('border-strong'),
          // `border-control` — an interactive control's edge, held to WCAG 1.4.11's 3:1. See the
          // note on `BorderColors.control`.
          control: alphaAware('border-control'),
        },
        // `--sds-overlay` is a scalar token, not a palette path, and already carries its own
        // alpha (`rgba(0,0,0,.5)`). Left as a bare var deliberately — `bg-overlay/50` would be
        // compounding two opacities, which is never what a caller means.
        overlay: 'var(--sds-overlay)',
      },
      // Wires the three font utilities to the theme's stacks. Before this, `font-sans` /
      // `font-mono` resolved to Tailwind's built-in stacks, so setting
      // `typography.fontFamily.mono` on a theme had no effect on anything using `font-mono` —
      // `<Typography variant="code">` included. `font-display` falls back to the sans stack, so
      // a theme that never sets `display` renders exactly as it did before the slot existed.
      fontFamily: {
        sans: 'var(--sds-font-sans)',
        mono: 'var(--sds-font-mono)',
        display: 'var(--sds-font-display, var(--sds-font-sans))',
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
        // Palette-tinted elevation — see the note on these tokens in `@apx-ui/tokens`.
        ambient: 'var(--sds-shadows-ambient)',
        glow: 'var(--sds-shadows-glow)',
      },
      // Type scale + tracking come from the theme so a brand override actually reaches the
      // recipes. Before this, `text-5xl` and `tracking-tight` were Tailwind's built-ins while
      // `<Typography fontSize="5xl">` read the DS var — the same name resolving two ways, and a
      // theme that retuned its type scale changed only one of them.
      fontSize: {
        xs: 'var(--sds-font-size-xs)',
        sm: 'var(--sds-font-size-sm)',
        base: 'var(--sds-font-size-base)',
        lg: 'var(--sds-font-size-lg)',
        xl: 'var(--sds-font-size-xl)',
        '2xl': 'var(--sds-font-size-2xl)',
        '3xl': 'var(--sds-font-size-3xl)',
        '4xl': 'var(--sds-font-size-4xl)',
        '5xl': 'var(--sds-font-size-5xl)',
        '6xl': 'var(--sds-font-size-6xl)',
        '7xl': 'var(--sds-font-size-7xl)',
        '8xl': 'var(--sds-font-size-8xl)',
        // Fluid marketing steps — `text-display-xl` instead of a hand-written clamp().
        'display-md': 'var(--sds-font-size-display-md)',
        'display-lg': 'var(--sds-font-size-display-lg)',
        'display-xl': 'var(--sds-font-size-display-xl)',
        'display-2xl': 'var(--sds-font-size-display-2xl)',
      },
      letterSpacing: {
        tighter: 'var(--sds-letter-spacing-tighter)',
        tight: 'var(--sds-letter-spacing-tight)',
        normal: 'var(--sds-letter-spacing-normal)',
        wide: 'var(--sds-letter-spacing-wide)',
        wider: 'var(--sds-letter-spacing-wider)',
      },
      transitionDuration: {
        fast: 'var(--sds-duration-fast)',
        DEFAULT: 'var(--sds-duration-normal)',
        normal: 'var(--sds-duration-normal)',
        slow: 'var(--sds-duration-slow)',
        // The reveal end of the scale. `duration-*` utilities exist for CSS-driven motion; the
        // JS side reaches the same numbers through `transitionTokens` in the engine.
        slower: 'var(--sds-duration-slower)',
        deliberate: 'var(--sds-duration-deliberate)',
      },
      transitionTimingFunction: {
        standard: 'var(--sds-ease-standard)',
        emphasized: 'var(--sds-ease-emphasized)',
        decelerate: 'var(--sds-ease-decelerate)',
        accelerate: 'var(--sds-ease-accelerate)',
        expressive: 'var(--sds-ease-expressive)',
        soft: 'var(--sds-ease-soft)',
      },
      outlineColor: {
        // Paired with `ringColor` below. Outline-based focus rings are the right default for
        // *text* links: `ring-*` is implemented as a box-shadow, so on a theme whose shadows are
        // hard offsets (katana, vantage-studio) a shadow ring lands diagonally off the element.
        // An outline cannot collide with a component's own box-shadow.
        DEFAULT: alphaAwareVar('--sds-focus-ring'),
        focus: alphaAwareVar('--sds-focus-ring'),
      },
      ringColor: {
        // Alpha-aware like the rest: `ring-focus/40` for a softened focus ring is a reasonable
        // thing to write, and leaving one color out would reinstate the silent-transparency trap
        // in exactly one place.
        DEFAULT: alphaAwareVar('--sds-focus-ring'),
        focus: alphaAwareVar('--sds-focus-ring'),
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
        // SplashScreen — `fade` variant: gentle scale-in + opacity ramp for the logo / title /
        // subtitle stack. Reads as a clean, deliberate first-paint without any horizontal motion
        // so it pairs well with brand marks that have their own internal motion.
        'splash-fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        // SplashScreen — `pulse` variant: concentric radar rings expanding out from the logo.
        // Each ring starts at 60% scale + full opacity and ends at 180% scale + zero opacity.
        // Three rings on staggered delays produce the canonical "sonar pulse" sweep.
        'splash-ring-pulse': {
          '0%': { transform: 'scale(0.6)', opacity: '0.6' },
          '80%': { opacity: '0' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        // SplashScreen — `gradient` variant: the immersive flowing-gradient background. The
        // backdrop carries a wide multi-stop linear gradient at `background-size: 200% 200%` and
        // this keyframe shifts the background-position so the gradient sweeps diagonally
        // across the viewport. Pure CSS — no JS frame loop.
        'splash-gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        // SplashScreen — `particles` variant: each particle orbits around the central logo. The
        // child sits on an absolute orbit ring and this keyframe rotates the ring; `rotate(0)`
        // → `rotate(360deg)` gives a uniform orbit so multiple particles can share one keyframe
        // and stagger only via `animation-delay`.
        'splash-orbit': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        // SplashScreen — `particles` variant: a tiny breathing scale on each particle so the
        // orbit doesn't read as rigid. Paired with `splash-orbit` on a parent.
        'splash-particle-breathe': {
          '0%, 100%': { transform: 'scale(0.7)', opacity: '0.5' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
        },
        // SplashScreen — `wave` variant: the bottom decorative wave gently translates up / down
        // so the surface feels alive without competing with the logo. Slow + subtle on purpose;
        // splash screens shouldn't read as "loading frantically".
        'splash-wave': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(-2%, -6px, 0)' },
        },
        // SplashScreen — `wave` variant (secondary band): a phase-offset translate so two wave
        // bands stacked produce a parallax illusion instead of moving in lockstep.
        'splash-wave-back': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(2%, 4px, 0)' },
        },
        // Marquee — the seamless horizontal loop. The track renders its children TWICE and this
        // keyframe slides it by exactly one copy, so the instant copy A has fully exited, copy B
        // sits pixel-for-pixel where A began and the restart is invisible.
        //
        // `--sds-marquee-distance` is the MEASURED width of one copy plus the gap that follows it,
        // written inline by the component. It has to be measured rather than expressed as a
        // percentage for two reasons: it lands exactly on the seam (a percentage of the track is
        // half a gap short, which shows as a hitch once per cycle), and the component needs the
        // number anyway to turn a px-per-second speed into a duration — a rate being the only unit
        // under which bands of different lengths travel at the same visible speed.
        //
        // The `50%` fallback is the pre-measurement frame (SSR, first paint): approximately right,
        // and far better than a band that sits still until JS lands.
        'marquee-x': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-1 * var(--sds-marquee-distance, 50%)))' },
        },
        // Marquee — the vertical counterpart, on the block axis.
        'marquee-y': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(calc(-1 * var(--sds-marquee-distance, 50%)))' },
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
        // SplashScreen — five canonical animations. Each maps to a `variant` on
        // `<SplashScreen />` and is registered here so any preset consumer gets the utility
        // class without an extra `globals.css` import.
        'splash-fade-in': 'splash-fade-in 700ms cubic-bezier(0.16,1,0.3,1) both',
        'splash-ring-pulse': 'splash-ring-pulse 2.4s ease-out infinite',
        'splash-gradient-shift': 'splash-gradient-shift 8s ease-in-out infinite',
        'splash-orbit': 'splash-orbit 6s linear infinite',
        'splash-particle-breathe': 'splash-particle-breathe 2.4s ease-in-out infinite',
        'splash-wave': 'splash-wave 6s ease-in-out infinite',
        'splash-wave-back': 'splash-wave-back 8s ease-in-out infinite',
        // Marquee — `linear` and `infinite` are not stylistic choices here. Any easing would
        // accelerate and decelerate within each cycle, which makes the seam legible as a stutter;
        // linear is the only timing function under which a looped translate reads as continuous
        // travel. The duration here is only a placeholder — the component always overrides
        // `animation-duration` inline, computing it from the measured distance and the
        // `ambientMotion.speed` rate.
        'marquee-x': 'marquee-x 40s linear infinite',
        'marquee-y': 'marquee-y 40s linear infinite',
      },
    },
  },
};

export type ApxTailwindPreset = typeof apxTailwindPreset;