import { transitionTokens } from '@apx-ui/engine';

import type { SelectPlacement } from './Select.types';

/**
 * Slide-from-trigger motion for the Select listbox. Shares Popover / Menu's shape (180ms,
 * 0.96 scale, 8px slide) — all three overlay surfaces animate identically so the family reads
 * as one motion language. `prefers-reduced-motion` is honored automatically by Motion's
 * built-in handling, which collapses scale + translate to opacity-only.
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

export function selectMotion(placement: SelectPlacement): {
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
