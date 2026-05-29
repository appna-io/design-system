import { transitionTokens } from '@apx-ui/engine';

import type { DrawerSide } from './Drawer.types';

/**
 * Drawer animation — two configs:
 *
 *  - **Backdrop** — opacity-only fade (180ms). Same shape as Modal's, slightly faster because
 *    Drawer is structurally lighter than Modal (anchored to an edge, less attention-claiming).
 *  - **Content** — direction-aware slide. The hidden state translates Content fully off the
 *    anchored edge (`-100%` for left/top, `100%` for right/bottom); the visible state rests at
 *    `0`. 280ms with the `emphasized` ease curve, matching Modal's deliberate timing.
 *
 * `prefers-reduced-motion` is honored automatically by Motion (translate transforms collapse to
 * an opacity-only fade, same as Modal / Popover / Tooltip).
 *
 * The `xPercent` / `yPercent` keys (rather than raw `x` / `y`) keep the slide proportional to
 * Content's measured width / height. A 320px-wide left drawer and a 600px-wide left drawer both
 * slide their full width regardless of the runtime size.
 */

function bezierToTuple(css: string): [number, number, number, number] {
  const match = css.match(
    /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/,
  );
  if (!match) return [0.4, 0, 0.2, 1];
  return [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])];
}

export const drawerBackdropMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: transitionTokens.duration.fast },
};

interface DrawerContentMotion {
  initial: { opacity: number; x?: string; y?: string };
  animate: { opacity: number; x: string; y: string };
  exit: { opacity: number; x?: string; y?: string };
  transition: { duration: number; ease: [number, number, number, number] };
}

export function drawerContentMotion(side: DrawerSide): DrawerContentMotion {
  const hidden: { x?: string; y?: string } =
    side === 'left'
      ? { x: '-100%' }
      : side === 'right'
        ? { x: '100%' }
        : side === 'top'
          ? { y: '-100%' }
          : { y: '100%' };

  return {
    initial: { opacity: 0, ...hidden },
    animate: { opacity: 1, x: '0%', y: '0%' },
    exit: { opacity: 0, ...hidden },
    transition: {
      duration: transitionTokens.duration.slow,
      ease: bezierToTuple(transitionTokens.ease.emphasized),
    },
  };
}
