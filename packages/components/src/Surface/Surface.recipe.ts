import { cv } from '@apx-ui/engine';

/**
 * Surface paints the ground it establishes. Every tone uses the *same* classes — the difference is
 * entirely in the CSS variables those classes resolve to (see `Surface.tone.ts`), which is what
 * keeps this a token-level feature rather than N sets of on-dark styles to maintain.
 *
 * `[color-scheme:dark]` on the non-default tones is the one thing classes have to carry: it tells
 * the browser to render form-control internals (the caret, a `<select>` arrow, scrollbars,
 * autofill) for a dark ground. Without it a text input inside a dark band gets a black caret on a
 * black field — invisible, and not something any token can fix.
 *
 * The brand tones declare it too, because a brand fill is normally saturated with a white
 * `contrast` slot. That is a default, not a law: a theme whose `primary.contrast` is *dark* wants
 * the other scheme, which is what `Surface`'s `colorScheme` prop is for — it lands in inline style
 * and so wins over this class.
 */
export const surfaceRecipe = cv({
  base: 'bg-bg text-fg',
  variants: {
    tone: {
      default: '',
      inverted: '[color-scheme:dark]',
      primary: '[color-scheme:dark]',
      secondary: '[color-scheme:dark]',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
});
