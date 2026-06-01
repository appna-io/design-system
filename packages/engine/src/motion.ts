/**
 * Motion primitives shared across the DS. These are plain data — they do not import `motion` at
 * runtime, so the engine has zero hard dependency on a motion library. Components that opt into
 * Motion (peer dep) consume these objects as `<motion.div animate={fadeIn.animate} … />` or as
 * `Variants`.
 *
 * Duration values are seconds (the unit Motion's `transition` expects). Easing values are CSS
 * cubic-bezier strings, which also work with Motion (`ease: 'cubic-bezier(…)'`) and with raw CSS.
 */
import { useMediaQuery } from './hooks/useMediaQuery';

export interface TransitionTokens {
  duration: { fast: number; normal: number; slow: number };
  ease: {
    standard: string;
    emphasized: string;
    decelerate: string;
    accelerate: string;
    linear: string;
  };
}

export const transitionTokens: TransitionTokens = {
  duration: { fast: 0.15, normal: 0.2, slow: 0.3 },
  ease: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.3, 0, 0, 1)',
    decelerate: 'cubic-bezier(0, 0, 0, 1)',
    accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
    linear: 'linear',
  },
};

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

  pressScale: {
    whileTap: { scale: 0.97 },
  } satisfies SimpleVariant,
} as const;

export type MotionPresetName = keyof typeof motionPresets;

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