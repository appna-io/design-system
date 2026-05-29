import { transitionTokens } from '@apx-ui/engine';

import type { MenuPlacement } from './Menu.types';

/**
 * Slide-from-trigger motion for the Menu surface. Reuses Popover's shape (180ms, 0.92 scale,
 * 8px slide). Menus and Popovers are siblings — one carries a freeform body, the other carries
 * a list — and sharing the motion preset keeps them visually related.
 *
 * `prefers-reduced-motion` is honored automatically by Motion's built-in handling, which collapses
 * scale + translate to an opacity-only transition.
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

export function menuMotion(placement: MenuPlacement): {
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

/**
 * Submenu motion — slightly faster than the root, with no scale (a horizontal-only slide reads as
 * "extending out" rather than "popping in"). The plan called for a 60ms stagger; we implement it
 * as a delay on the SubContent rather than orchestrating siblings, because the SubContent owns
 * its own AnimatePresence cycle.
 */
export function menuSubMotion(placement: MenuPlacement): {
  initial: { opacity: number; x: number; y: number };
  animate: { opacity: number; x: number; y: number };
  exit: { opacity: number; x: number; y: number };
  transition: { duration: number; ease: [number, number, number, number]; delay?: number };
} {
  const side = placement.split('-')[0] as keyof typeof offsetMap;
  const from = offsetMap[side] ?? { x: 6, y: 0 };
  return {
    initial: { opacity: 0, x: from.x, y: from.y },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: from.x, y: from.y },
    transition: {
      duration: transitionTokens.duration.fast,
      ease: bezierToTuple(transitionTokens.ease.standard),
      delay: 0.06,
    },
  };
}
