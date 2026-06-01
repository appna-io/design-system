import { cv, PALETTE_GRADIENTS } from '@apx-ui/engine';

/**
 * Multi-slot recipe family for `<SplashScreen />`.
 *
 * Eight slots map 1:1 to the eight regions the root renders:
 *
 * | Slot         | DOM target                                                                       |
 * | ------------ | -------------------------------------------------------------------------------- |
 * | `root`       | The outermost wrapper. Owns the backdrop fill, the `fixed inset-0` positioning   |
 * |              | when `placement='fullscreen'`, and the entrance animation.                       |
 * | `gradient`   | Decorative gradient layer (only rendered when `variant='gradient'`).             |
 * | `wave`       | Decorative wave bands (only rendered when `variant='wave'`).                     |
 * | `stack`      | The vertical content stack (logo → title → subtitle → indicator → footer).      |
 * | `logoWrap`   | Logo container. Holds the variant-specific logo animation and any ring / orbit   |
 * |              | decorations rendered around the logo.                                            |
 * | `title`      | Heading element.                                                                 |
 * | `subtitle`   | Muted subheading.                                                                |
 * | `indicator`  | Spinner / Progress wrapper.                                                      |
 * | `footer`     | Optional footer slot for legal / version copy.                                   |
 *
 * Each slot is themable independently via
 * `theme.components.SplashScreen.styleOverrides.<slot>`. The variant axis on `root` drives both
 * the backdrop + the entrance keyframe; color cascades to ring / particle / wave / accent tones.
 *
 * Adding an 8th palette role = one entry in `@apx-ui/tokens` + one compound row per slot that
 * needs the new tint.
 */

const splashRoot = cv({
  base: [
    'overflow-hidden',
    'flex items-center justify-center',
    // Default text color flows to logo / titles / spinner via currentColor where applicable.
    'text-fg-default',
    // Layered surfaces (variant decorations are absolutely positioned children).
    'relative isolate',
  ].join(' '),
  variants: {
    placement: {
      fullscreen: 'fixed inset-0 z-modal min-h-screen w-screen',
      inline: 'relative w-full min-h-[480px] rounded-lg',
    },
    backdrop: {
      solid: 'bg-bg-default',
      paper: 'bg-bg-paper',
      // The role-tinted compound rows below resolve to the right `bg-{role}-subtle`.
      tinted: '',
      transparent: 'bg-transparent',
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
    variant: {
      fade: '',
      pulse: '',
      gradient: '',
      particles: '',
      wave: '',
    },
  },
  compoundVariants: [
    // ── tinted × color (7) — backdrop picks up the role's `-subtle` token ────────────────────────
    { backdrop: 'tinted', color: 'primary', class: 'bg-primary-subtle' },
    { backdrop: 'tinted', color: 'secondary', class: 'bg-secondary-subtle' },
    { backdrop: 'tinted', color: 'success', class: 'bg-success-subtle' },
    { backdrop: 'tinted', color: 'warning', class: 'bg-warning-subtle' },
    { backdrop: 'tinted', color: 'danger', class: 'bg-danger-subtle' },
    { backdrop: 'tinted', color: 'info', class: 'bg-info-subtle' },
    { backdrop: 'tinted', color: 'neutral', class: 'bg-neutral-subtle' },
  ],
  defaultVariants: {
    placement: 'fullscreen',
    backdrop: 'solid',
    color: 'primary',
    variant: 'fade',
  },
});

/**
 * Decorative gradient layer for `variant='gradient'`. Sits absolutely-positioned behind the
 * content stack with `pointer-events-none` so clicks (`closeOnClick`) still hit the root. The
 * gradient itself is delivered inline via the component (not as a recipe class) because each
 * `color` role produces a different two-stop gradient — driving that via Tailwind utilities
 * would explode the class list. The recipe owns the layout + the animation utility only.
 */
const splashGradient = cv({
  base: [
    'absolute inset-0 -z-10 pointer-events-none',
    'animate-splash-gradient-shift motion-reduce:animate-none',
    'opacity-90',
  ].join(' '),
});

/**
 * Decorative wave bands container for `variant='wave'`. Two stacked SVGs sit pinned to the
 * bottom and translate via the two phase-offset `splash-wave` / `splash-wave-back` keyframes
 * so the bands parallax instead of moving in lockstep.
 */
const splashWave = cv({
  base: 'absolute inset-x-0 bottom-0 pointer-events-none flex flex-col',
});

const splashStack = cv({
  base: [
    'relative z-10',
    'flex flex-col items-center justify-center text-center',
    'px-6 py-10',
    'gap-5',
    'max-w-md w-full mx-auto',
  ].join(' '),
});

const splashLogoWrap = cv({
  base: [
    'relative inline-flex items-center justify-center',
    'h-24 w-24',
    // `[&>*]` styles whatever child the consumer drops in (logo / SVG / img) so they
    // visually fill the slot without per-consumer sizing.
    '[&>img]:max-h-full [&>img]:max-w-full [&>img]:object-contain',
    '[&>svg]:h-full [&>svg]:w-full',
  ].join(' '),
  variants: {
    variant: {
      fade: 'animate-splash-fade-in motion-reduce:animate-none',
      pulse: 'animate-splash-fade-in motion-reduce:animate-none',
      gradient: 'animate-splash-fade-in motion-reduce:animate-none',
      particles: 'animate-splash-fade-in motion-reduce:animate-none',
      wave: 'animate-splash-fade-in motion-reduce:animate-none',
    },
  },
  defaultVariants: { variant: 'fade' },
});

/**
 * Concentric ring for `variant='pulse'`. Three of these are rendered inside the logo wrap on
 * staggered `animation-delay`s (driven inline by the component) so the trio reads as a single
 * sonar pulse. Color cascades from the root via the `color` axis.
 */
const splashPulseRing = cv({
  base: [
    'absolute inset-0 m-auto pointer-events-none',
    'h-full w-full',
    'rounded-full',
    'border-2',
    'animate-splash-ring-pulse motion-reduce:animate-none',
  ].join(' '),
  variants: {
    color: {
      primary: 'border-primary',
      secondary: 'border-secondary',
      success: 'border-success',
      warning: 'border-warning',
      danger: 'border-danger',
      info: 'border-info',
      neutral: 'border-neutral',
    },
  },
  defaultVariants: { color: 'primary' },
});

/**
 * Orbit ring for `variant='particles'`. The parent wrapper rotates on the orbit keyframe; the
 * particle children sit at fixed positions on the perimeter so a single keyframe + per-orbit
 * `animation-delay` produces the swirl effect. Two stacked orbits (drawn inline) give the
 * scene depth without doubling the keyframe count.
 */
const splashOrbit = cv({
  base: [
    'absolute inset-0 m-auto pointer-events-none',
    'animate-splash-orbit motion-reduce:animate-none',
  ].join(' '),
});

const splashParticle = cv({
  base: [
    'absolute h-2.5 w-2.5 rounded-full',
    'animate-splash-particle-breathe motion-reduce:animate-none',
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
  defaultVariants: { color: 'primary' },
});

const splashTitle = cv({
  base: [
    'text-2xl font-semibold leading-tight m-0',
    'animate-splash-fade-in motion-reduce:animate-none',
  ].join(' '),
});

const splashSubtitle = cv({
  base: [
    'text-sm text-fg-muted leading-relaxed m-0 max-w-sm',
    'animate-splash-fade-in motion-reduce:animate-none',
  ].join(' '),
});

const splashIndicator = cv({
  base: [
    'mt-2 inline-flex items-center justify-center',
    'animate-splash-fade-in motion-reduce:animate-none',
    'w-full max-w-[240px]',
  ].join(' '),
});

const splashFooter = cv({
  base: [
    'mt-4 text-xs text-fg-muted',
    'animate-splash-fade-in motion-reduce:animate-none',
  ].join(' '),
});

export const splashScreenRecipes = {
  root: splashRoot,
  gradient: splashGradient,
  wave: splashWave,
  stack: splashStack,
  logoWrap: splashLogoWrap,
  pulseRing: splashPulseRing,
  orbit: splashOrbit,
  particle: splashParticle,
  title: splashTitle,
  subtitle: splashSubtitle,
  indicator: splashIndicator,
  footer: splashFooter,
};

/**
 * Per-color CSS gradient stops for `variant='gradient'`. **Re-exported** from the engine's
 * `PALETTE_GRADIENTS` so the component doesn't carry its own copy of the per-role lookup
 * table — single source of truth for "what does a brand-gradient look like in this DS".
 *
 * Every entry references `--sds-palette-{role}-{slot}` CSS variables, so when the theme
 * switches mode (light / dark) or palette variant (Katana / Tetsu / Origami / runtime
 * override), the gradient automatically re-tints on next paint without re-rendering the
 * splash. The `200% 200%` background-size set on the gradient slot pairs with the
 * `splash-gradient-shift` keyframe to scroll the gradient across the viewport.
 *
 * To customize the shape (angle, stop sequence, kind) without changing the underlying
 * palette tokens, call `buildPaletteGradient(role, { stops, angle, kind })` from
 * `@apx-ui/engine` directly and pass the result as the `gradient` prop on `splash.show()`.
 */
export const SPLASH_GRADIENT_BY_COLOR = PALETTE_GRADIENTS;

/**
 * Per-color SVG wave fill resolver. The wave SVG uses `currentColor` for the fill and the
 * recipe injects this text-color class onto the wave container so both bands pick up the role
 * automatically. Two stacked bands use `opacity-30` + `opacity-50` so the parallax reads even
 * when both bands share one palette role.
 */
export const SPLASH_WAVE_COLOR_CLASS: Record<string, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
  neutral: 'text-neutral',
};

/**
 * Stagger delay (ms) per pulse ring. Three rings on 0 / 600 / 1200 ms offsets produce one
 * complete pulse every 800 ms with always-at-least-one ring visible — same cadence as
 * macOS's "Find My" pulse animation, which is the visual reference here.
 */
export const SPLASH_PULSE_RING_DELAYS_MS: readonly [number, number, number] = [0, 600, 1200];

/**
 * Particle layout for `variant='particles'`. Eight particles on the inner orbit, four on the
 * outer orbit, distributed evenly. The values are angles (deg) — the component converts them
 * to (`left`, `top`) percentages on a square wrapper.
 */
export const SPLASH_PARTICLE_INNER_ANGLES: readonly number[] = [0, 45, 90, 135, 180, 225, 270, 315];
export const SPLASH_PARTICLE_OUTER_ANGLES: readonly number[] = [22, 112, 202, 292];

/**
 * Stagger (ms) for the particle breathing animation. Picked so adjacent particles aren't in
 * phase — the orbit looks alive rather than mechanical.
 */
export const SPLASH_PARTICLE_BREATHE_DELAYS_MS = (i: number) => (i * 300) % 1200;