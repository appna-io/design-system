import { transitionTokens } from '@apx-ui/engine';

/**
 * Animation applied to the loading spinner. Kept linear / non-spring so the rotation reads as a
 * continuous progress indicator rather than a bouncy gesture. The spinner is the only piece of
 * Button that actually uses Motion — the press scale is CSS-only (see `Button.recipe.ts`).
 */
export const spinnerMotion = {
  animate: { rotate: 360 },
  transition: {
    repeat: Infinity,
    duration: transitionTokens.duration.slow * 4,
    ease: 'linear' as const,
  },
};