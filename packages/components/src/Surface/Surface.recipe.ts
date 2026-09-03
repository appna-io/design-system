import { cv } from '@apx-ui/engine';

/**
 * Surface paints the ground it establishes. Both tones use the *same* classes — the difference is
 * entirely in the CSS variables those classes resolve to (see `Surface.tone.ts`), which is what
 * keeps this a token-level feature rather than a second set of on-dark styles to maintain.
 *
 * `[color-scheme:dark]` on the inverted tone is the one thing classes have to carry: it tells the
 * browser to render form-control internals (the caret, a `<select>` arrow, scrollbars, autofill)
 * for a dark ground. Without it a text input inside a dark band gets a black caret on a black
 * field — invisible, and not something any token can fix.
 */
export const surfaceRecipe = cv({
  base: 'bg-bg text-fg',
  variants: {
    tone: {
      default: '',
      inverted: '[color-scheme:dark]',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
});
