import { transitionTokens } from '@apx-ui/engine';

import type { HoverCardPlacement } from './HoverCard.types';

/**
 * Slide-from-trigger motion for the HoverCard surface. Mirrors `popoverMotion` (8px slide, 0.92
 * scale, ~180ms). HoverCard is a panel-class overlay so the motion timing aligns with Popover
 * rather than the snappier Tooltip (~120ms / 4px / 0.96).
 *
 * `prefers-reduced-motion` is honored automatically by Motion's built-in handling — when the
 * user prefers reduced motion the slide collapses to a pure opacity fade.
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

export function hoverCardMotion(placement: HoverCardPlacement): {
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
      duration: transitionTokens.duration.normal,
      ease: bezierToTuple(transitionTokens.ease.standard),
    },
  };
}