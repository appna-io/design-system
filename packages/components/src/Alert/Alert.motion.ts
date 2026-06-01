import { transitionTokens } from '@apx-ui/engine';

/**
 * Enter / exit animation for `<Alert />`. `height: 'auto' ↔ 0` is the trick that makes the
 * surrounding layout reflow smoothly when the alert dismisses — Motion handles the height
 * interpolation internally so we don't need a manual measurement.
 *
 * The duration is tied to the engine's `duration.normal` token so a theme that slows everything
 * down (e.g. an accessibility-tuned palette) also slows the alert dismiss.
 *
 * `prefers-reduced-motion` is honored by Motion's built-in reduced-motion handling — the
 * consumer doesn't need to do anything, the transform / height tweens collapse to zero-duration
 * when the OS toggle is on.
 */

/**
 * Convert an engine `cubic-bezier(a, b, c, d)` token to the `[a, b, c, d]` tuple Motion's JS
 * runtime expects (it accepts either a named keyword like `'easeInOut'` or a four-element
 * control-point array — not the CSS string form).
 */
function bezierToTuple(css: string): [number, number, number, number] {
  const match = css.match(/cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/);
  if (!match) return [0.4, 0, 0.2, 1];
  return [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])];
}

export const alertMotion = {
  initial: { opacity: 0, y: -8, height: 0 },
  animate: { opacity: 1, y: 0, height: 'auto' as const },
  exit: { opacity: 0, y: -8, height: 0 },
  transition: {
    duration: transitionTokens.duration.normal,
    ease: bezierToTuple(transitionTokens.ease.standard),
  },
};