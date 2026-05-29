import { transitionTokens } from '@apx-ui/engine';

import type { ToastPosition } from './Toast.types';

/**
 * Toast enter / exit animation. Direction-aware:
 *
 *   `top-*`    enters from `y: -24` (above the viewport edge), exits the same way.
 *   `bottom-*` enters from `y:  24` (below the edge), exits the same way.
 *
 * Horizontal alignment in `position` (`-left` / `-center` / `-right`) only affects where the
 * stack pins on screen — it doesn't change the enter/exit direction, because users expect
 * toasts to slide *from the closest viewport edge*, not horizontally across.
 *
 * Duration is `transitionTokens.duration.normal` (~200ms) — a touch quicker than Modal (slow)
 * because toasts are a lighter, more frequent interaction.
 *
 * Motion's built-in `prefers-reduced-motion` honoring collapses these tweens to opacity-only
 * with zero duration when the OS toggle is on, so we don't need a manual branch here.
 */

function bezierToTuple(css: string): [number, number, number, number] {
  const match = css.match(
    /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/,
  );
  if (!match) return [0.4, 0, 0.2, 1];
  return [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])];
}

export function toastMotion(position: ToastPosition): {
  initial: { opacity: number; y: number; scale: number };
  animate: { opacity: number; y: number; scale: number };
  exit: { opacity: number; y: number; scale: number };
  transition: { duration: number; ease: [number, number, number, number] };
} {
  const isTop = position.startsWith('top-');
  // 24px is enough to read as a deliberate slide without feeling sluggish on the next-frame
  // commit. Modal uses 16px because Modal is already heavy; toasts are smaller so they need a
  // touch more travel to feel intentional.
  const offset = isTop ? -24 : 24;
  return {
    initial: { opacity: 0, y: offset, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: offset, scale: 0.95 },
    transition: {
      duration: transitionTokens.duration.normal,
      ease: bezierToTuple(transitionTokens.ease.standard),
    },
  };
}
