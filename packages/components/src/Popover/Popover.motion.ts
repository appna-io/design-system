import { transitionTokens } from '@apx-ui/engine';

import type { PopoverPlacement } from './Popover.types';

/**
 * Slide-from-trigger motion for the Popover surface. Same shape as `tooltipMotion` but slightly
 * heavier to match the panel-feel: 8px slide (vs Tooltip's 4px), 0.92 scale (vs 0.96), 180ms
 * duration (vs 120ms). Popovers carry interactive content; the slightly more deliberate timing
 * gives users a clearer "this thing just opened, focus is here" cue.
 *
 * `prefers-reduced-motion` is honored automatically by Motion's built-in handling.
 */
const offsetMap: Record<string, { x: number; y: number }> = {
  top: { x: 0, y: 8 },
  bottom: { x: 0, y: -8 },
  left: { x: 8, y: 0 },
  right: { x: -8, y: 0 },
};

function bezierToTuple(css: string): [number, number, number, number] {
  const match = css.match(
    /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/,
  );
  if (!match) return [0.4, 0, 0.2, 1];
  return [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])];
}

export function popoverMotion(placement: PopoverPlacement): {
  initial: { opacity: number; scale: number; x: number; y: number };
  animate: { opacity: number; scale: number; x: number; y: number };
  exit: { opacity: number; scale: number; x: number; y: number };
  transition: { duration: number; ease: [number, number, number, number] };
} {
  const side = placement.split('-')[0] as keyof typeof offsetMap;
  const from = offsetMap[side] ?? { x: 0, y: 0 };
  return {
    initial: { opacity: 0, scale: 0.92, x: from.x, y: from.y },
    animate: { opacity: 1, scale: 1, x: 0, y: 0 },
    exit: { opacity: 0, scale: 0.92, x: from.x, y: from.y },
    transition: {
      // ~180ms — Popovers feel more substantial than the snappy tooltip (~120ms).
      duration: transitionTokens.duration.normal,
      ease: bezierToTuple(transitionTokens.ease.standard),
    },
  };
}

/** Backdrop fade — opacity-only so it stays cheap and reduced-motion safe. */
export const popoverBackdropMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: transitionTokens.duration.fast },
};