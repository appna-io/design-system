import type { MotionShape } from '@apx-ui/engine';

/**
 * Motion tokens consumed by both CSS and Motion (the JS lib). Durations are stored in **milliseconds**
 * for direct use in CSS `transition-duration`. The engine's `transitionTokens` keeps the same names
 * but uses seconds for Motion's `transition.duration` field — both are derived from these numbers.
 */
export const motion: MotionShape = {
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
  },
  ease: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.3, 0, 0, 1)',
    decelerate: 'cubic-bezier(0, 0, 0, 1)',
    accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
  },
  reduceMotion: 'system',
};