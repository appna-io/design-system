import { transitionTokens } from '@apx-ui/engine';

/**
 * Confirm animation. Two motion configs — backdrop fade + content scale-up. Tuned to feel
 * deliberate (matches the Modal cadence) since a confirm prompts a destructive / committed
 * action and shouldn't snap in like a tooltip.
 *
 * `prefers-reduced-motion` is honored automatically by Motion's built-in handling.
 */

function bezierToTuple(css: string): [number, number, number, number] {
  const match = css.match(
    /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/,
  );
  if (!match) return [0.4, 0, 0.2, 1];
  return [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])];
}

export const confirmBackdropMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: transitionTokens.duration.fast },
};

export const confirmContentMotion = {
  initial: { opacity: 0, scale: 0.96, y: 0 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 0 },
  transition: {
    duration: transitionTokens.duration.slow,
    ease: bezierToTuple(transitionTokens.ease.emphasized),
  },
};