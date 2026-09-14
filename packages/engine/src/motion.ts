/**
 * Motion primitives shared across the DS. These are plain data — they do not import `motion` at
 * runtime, so the engine has zero hard dependency on a motion library. Components that opt into
 * Motion (peer dep) consume these objects as `<motion.div animate={fadeIn.animate} … />` or as
 * `Variants`.
 *
 * Duration values are seconds (the unit Motion's `transition` expects). Easing values are stored
 * as CSS cubic-bezier strings so they can be dropped straight into `transition-timing-function`.
 *
 * Motion, however, does **not** accept that form — its JS engine parses easings itself and throws
 * "Invalid easing type" on a CSS `cubic-bezier(…)` string, wanting a `[x1, y1, x2, y2]` tuple
 * instead. Anything handed to Motion therefore goes through `toMotionEase` / `resolveTransition`,
 * never straight from the token table.
 */
import { useMediaQuery } from './hooks/useMediaQuery';

export interface TransitionTokens {
  duration: {
    fast: number;
    normal: number;
    slow: number;
    slower: number;
    deliberate: number;
  };
  ease: {
    standard: string;
    emphasized: string;
    decelerate: string;
    accelerate: string;
    expressive: string;
    soft: string;
    linear: string;
  };
}

export const transitionTokens: TransitionTokens = {
  duration: { fast: 0.15, normal: 0.2, slow: 0.3, slower: 0.5, deliberate: 0.7 },
  ease: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.3, 0, 0, 1)',
    decelerate: 'cubic-bezier(0, 0, 0, 1)',
    accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
    expressive: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    soft: 'cubic-bezier(0.16, 1, 0.3, 1)',
    linear: 'linear',
  },
};

/** Named duration tokens accepted anywhere a duration is taken. */
export type MotionDurationToken = keyof TransitionTokens['duration'];
/** Named easing tokens accepted anywhere an easing is taken. */
export type MotionEaseToken = keyof TransitionTokens['ease'];

/** Simple variant objects — shape-compatible with Motion's `Variants` type. */
export interface SimpleVariant {
  initial?: Record<string, unknown>;
  animate?: Record<string, unknown>;
  exit?: Record<string, unknown>;
  whileHover?: Record<string, unknown>;
  whileTap?: Record<string, unknown>;
}

export const motionPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } satisfies SimpleVariant,

  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  } satisfies SimpleVariant,

  slideInFromBottom: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
  } satisfies SimpleVariant,

  slideInFromTop: {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  } satisfies SimpleVariant,

  /**
   * Horizontal counterparts to the two slide presets. Offsets are deliberately **not** mirrored
   * for RTL here: these are authored motion, and a section that slides in "from the left edge of
   * the screen" should keep doing so regardless of reading direction — otherwise a mirrored
   * layout would animate its columns in the opposite order to the one it reads in. Components
   * that genuinely need direction-aware motion negate `x` themselves using the engine's
   * `useDirection()`.
   */
  slideInFromLeft: {
    initial: { opacity: 0, x: -24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  } satisfies SimpleVariant,

  slideInFromRight: {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 24 },
  } satisfies SimpleVariant,

  /**
   * A larger-travel reveal for full page sections, where the 8px of `slideInFromBottom` reads as
   * a twitch rather than an entrance. 32px is the smallest offset that still registers as
   * deliberate at section scale.
   */
  riseIn: {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 32 },
  } satisfies SimpleVariant,

  /**
   * Focus-pull. `filter` is GPU-composited but NOT free — a blurred layer is re-rasterised for
   * every intermediate value, so this belongs on a handful of hero elements, never on a long
   * list. Pair it with `zoomIn` at most once per viewport.
   */
  blurIn: {
    initial: { opacity: 0, filter: 'blur(12px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(12px)' },
  } satisfies SimpleVariant,

  /**
   * Scales *up* into place from slightly under-size, where `scaleIn`'s 0.95 is a subtle pop.
   * 0.88 is the point where the movement reads as an arrival rather than a correction.
   */
  zoomIn: {
    initial: { opacity: 0, scale: 0.88 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.88 },
  } satisfies SimpleVariant,

  pressScale: {
    whileTap: { scale: 0.97 },
  } satisfies SimpleVariant,
} as const;

export type MotionPresetName = keyof typeof motionPresets;

/**
 * A Motion `transition` object, typed structurally so the engine stays free of a Motion import.
 * Every field is optional — an empty result means "let Motion use its own defaults".
 */
export type CubicBezierPoints = [number, number, number, number];

/**
 * An easing in the form Motion actually accepts: one of its named easings (`'linear'`,
 * `'easeOut'`, …) or a four-point cubic-bezier tuple.
 *
 * Notably **not** a CSS `cubic-bezier(…)` string. Motion's JS animation engine parses easings
 * itself rather than handing them to the browser, and rejects the CSS function form outright
 * ("Invalid easing type"). The DS stores its easing tokens as CSS strings because they also have
 * to work in `transition-timing-function`, so anything crossing into Motion goes through
 * `toMotionEase` first.
 */
export type MotionEasing = string | CubicBezierPoints;

export interface ResolvedTransition {
  delay?: number;
  duration?: number;
  ease?: MotionEasing;
  staggerChildren?: number;
  delayChildren?: number;
}

const CUBIC_BEZIER_RE =
  /^cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)$/;

/**
 * Converts a CSS easing string into something Motion accepts.
 *
 * `cubic-bezier(a, b, c, d)` becomes `[a, b, c, d]`; every other string (Motion's named easings,
 * `'linear'`, `'steps(…)'`, or an unrecognised value we shouldn't silently mangle) passes through
 * untouched so Motion can validate it — or reject it loudly, which is more useful than us
 * guessing.
 */
export function toMotionEase(value: string): MotionEasing {
  const match = CUBIC_BEZIER_RE.exec(value.trim());
  if (!match) return value;

  const points = [match[1], match[2], match[3], match[4]].map(Number);
  // A NaN here would reach Motion as a silently broken curve, so fall back to the raw string.
  return points.some(Number.isNaN) ? value : (points as CubicBezierPoints);
}

export interface TransitionInput {
  /** Seconds to wait before starting. */
  delay?: number | undefined;
  /** Seconds, or a named duration token (`'fast'` / `'normal'` / `'slow'`). */
  duration?: number | MotionDurationToken | undefined;
  /** A raw CSS easing string, or a named easing token (`'standard'`, `'emphasized'`, …). */
  ease?: string | MotionEaseToken | undefined;
  /** Seconds between each child's start, when orchestrating children through variants. */
  staggerChildren?: number | undefined;
  /** Seconds to wait before the first child starts. */
  delayChildren?: number | undefined;
}

function isDurationToken(value: string): value is MotionDurationToken {
  return value in transitionTokens.duration;
}

function isEaseToken(value: string): value is MotionEaseToken {
  return value in transitionTokens.ease;
}

/**
 * Resolves a loose transition description into a Motion-ready object, mapping token *names* onto
 * the DS's `transitionTokens` so `duration="slow"` and `ease="emphasized"` mean the same thing
 * everywhere. Raw numbers and raw cubic-bezier strings pass through untouched, which is what
 * keeps the escape hatch open for one-off motion that the tokens genuinely don't cover.
 *
 * Returns `undefined` when nothing was specified, so callers can spread it away entirely rather
 * than handing Motion an empty object it would have to reconcile.
 *
 * @example
 *   resolveTransition({ duration: 'slow', ease: 'emphasized', delay: 0.2 })
 *   // → { duration: 0.3, ease: 'cubic-bezier(0.3, 0, 0, 1)', delay: 0.2 }
 */
export function resolveTransition(input: TransitionInput): ResolvedTransition | undefined {
  const { delay, duration, ease, staggerChildren, delayChildren } = input;

  const resolved: ResolvedTransition = {};

  if (typeof delay === 'number') resolved.delay = delay;

  if (typeof duration === 'number') {
    resolved.duration = duration;
  } else if (typeof duration === 'string' && isDurationToken(duration)) {
    resolved.duration = transitionTokens.duration[duration];
  }

  if (typeof ease === 'string') {
    resolved.ease = toMotionEase(isEaseToken(ease) ? transitionTokens.ease[ease] : ease);
  }

  if (typeof staggerChildren === 'number') resolved.staggerChildren = staggerChildren;
  if (typeof delayChildren === 'number') resolved.delayChildren = delayChildren;

  return Object.keys(resolved).length > 0 ? resolved : undefined;
}

/**
 * Viewport options for scroll-triggered reveals — structurally compatible with Motion's
 * `viewport` prop.
 */
export interface ViewportOptions {
  /** Animate only the first time the element enters. Defaults to `true`. */
  once?: boolean | undefined;
  /** Fraction of the element that must be visible to trigger (`0`–`1`), or `'some'` / `'all'`. */
  amount?: number | 'some' | 'all' | undefined;
  /** A CSS margin string that grows/shrinks the trigger box, e.g. `'0px 0px -80px 0px'`. */
  margin?: string | undefined;
}

/**
 * Defaults for scroll reveals. `once: true` because a section that re-animates every time it
 * scrolls back into view reads as a glitch on a marketing page, and the bottom margin means the
 * reveal fires slightly *before* the element reaches the fold — so the user sees motion arriving
 * rather than catching up.
 */
export const defaultViewport: Required<Pick<ViewportOptions, 'once' | 'amount' | 'margin'>> = {
  once: true,
  amount: 0.25,
  margin: '0px 0px -64px 0px',
};

/**
 * Returns `true` when the user has expressed a preference for reduced motion (or when the
 * consumer-provided override forces it). Use this inside components to swap heavy animations
 * for cheap fades or to skip motion entirely.
 *
 * @example
 *   const reduced = useReducedMotion();
 *   <motion.div animate={reduced ? { opacity: 1 } : motionPresets.scaleIn.animate} />
 */
export function useReducedMotion(forceValue?: boolean): boolean {
  const systemPrefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)', {
    defaultValue: false,
  });
  return forceValue ?? systemPrefersReduced;
}
