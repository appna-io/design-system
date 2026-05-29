import { transitionTokens } from '@apx-ui/engine';
import type { TooltipPlacement } from './Tooltip.types';

/**
 * Slide-from-trigger motion. The tooltip enters from the trigger's direction (placed on top →
 * slides down by 4px → settles into final position). The exit animation reverses, so dismissing
 * a tooltip placed above the trigger looks like it's tucking back into the trigger.
 *
 * Placement values resolve through `placement.split('-')[0]` to get the side (`top` / `right` /
 * `bottom` / `left`); the alignment suffix (`-start` / `-end`) doesn't change the slide axis.
 */
const offsetMap: Record<string, { x: number; y: number }> = {
  top: { x: 0, y: 4 },
  bottom: { x: 0, y: -4 },
  left: { x: 4, y: 0 },
  right: { x: -4, y: 0 },
};

/**
 * Convert an engine `cubic-bezier(a, b, c, d)` token to the `[a, b, c, d]` tuple Motion's JS
 * runtime expects. Same helper Alert uses; defer extracting until a third consumer needs it.
 */
function bezierToTuple(css: string): [number, number, number, number] {
  const match = css.match(
    /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/,
  );
  if (!match) return [0.4, 0, 0.2, 1];
  return [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])];
}

/**
 * Build the Motion props for the tooltip surface based on its **final** placement (post-flip).
 * `prefers-reduced-motion` is honored automatically by Motion's built-in reduced-motion handling;
 * the consumer doesn't need to do anything.
 */
export function tooltipMotion(placement: TooltipPlacement): {
  initial: { opacity: number; scale: number; x: number; y: number };
  animate: { opacity: number; scale: number; x: number; y: number };
  exit: { opacity: number; scale: number; x: number; y: number };
  transition: { duration: number; ease: [number, number, number, number] };
} {
  const side = placement.split('-')[0] as keyof typeof offsetMap;
  const from = offsetMap[side] ?? { x: 0, y: 0 };
  return {
    initial: { opacity: 0, scale: 0.96, x: from.x, y: from.y },
    animate: { opacity: 1, scale: 1, x: 0, y: 0 },
    exit: { opacity: 0, scale: 0.96, x: from.x, y: from.y },
    transition: {
      duration: transitionTokens.duration.fast,
      ease: bezierToTuple(transitionTokens.ease.standard),
    },
  };
}
