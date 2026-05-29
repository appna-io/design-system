import { transitionTokens } from '@apx-ui/engine';

import type { ModalPlacement } from './Modal.types';

/**
 * Modal animation. Two motion configs:
 *
 *  - **Backdrop** — opacity-only fade (200ms). Stays cheap and reduced-motion safe.
 *  - **Content** — slide + scale based on placement (center: scale-up; top: slide-down). 280ms
 *    with the `emphasized` ease curve, slightly slower than Popover (200ms) and Tooltip (120ms)
 *    because Modal is the heaviest, most attention-claiming overlay.
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

export const modalBackdropMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: transitionTokens.duration.fast },
};

export function modalContentMotion(placement: ModalPlacement): {
  initial: { opacity: number; scale: number; y: number };
  animate: { opacity: number; scale: number; y: number };
  exit: { opacity: number; scale: number; y: number };
  transition: { duration: number; ease: [number, number, number, number] };
} {
  // `top`-anchored modals slide down from above the offset; `center` modals scale-up from 96%.
  const slide = placement === 'top' ? { y: -16 } : { y: 0 };
  return {
    initial: { opacity: 0, scale: 0.96, y: slide.y },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: slide.y },
    transition: {
      // ~280ms — Modal is the most deliberate overlay; the slower curve telegraphs "the page just
      // changed mode, attention here".
      duration: transitionTokens.duration.slow,
      ease: bezierToTuple(transitionTokens.ease.emphasized),
    },
  };
}
