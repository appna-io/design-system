import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react';

import type { Sx } from '@apx-ui/engine';

/**
 * Which ground the surface establishes for its subtree.
 *
 * - `default` — the ambient palette, unchanged. A `<Surface>` still paints `bg-bg text-fg`, so it
 *   is a useful "this region owns its background" marker even without inverting anything.
 * - `inverted` — swap the surface tokens, so a light theme's dark ink becomes the ground. Every
 *   descendant that reads `bg-bg*` / `text-fg*` / `border-*` / the `neutral` role adapts on its
 *   own; nothing inside needs an on-dark variant.
 * - `primary` / `secondary` — fill the band with that brand role and re-point the surface tokens
 *   at it, so the ink becomes the role's authored `contrast` colour. This is the CTA band, the
 *   newsletter strip, the pricing highlight.
 *
 * Deliberately not `'dark'`. A dark *mode* is a user preference resolved by `ThemeProvider`; this
 * is a local inversion of whatever palette is active, and it inverts a dark theme just as
 * correctly (giving a light band on a dark page).
 *
 * ## Which one do I reach for
 *
 * | You want                                   | Tone          | The light button on it is |
 * | ------------------------------------------ | ------------- | ------------------------- |
 * | a dark band on a light page                | `inverted`    | `<Button color="neutral">` |
 * | a band filled with the brand colour        | `primary`     | `<Button color="neutral">` |
 * | a light card sitting inside either of those | `inverted` (nested) | `<Button color="primary">` |
 *
 * In every case the thing inside is a plain DS component with no on-dark prop. That is the point:
 * the tone changes what the tokens resolve to, so the call site stays colour-free.
 */
export type SurfaceTone = 'default' | 'inverted' | 'primary' | 'secondary';

export interface SurfaceProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Ground for this region and everything inside it. Default: `'default'`. */
  tone?: SurfaceTone;
  /**
   * Overrides the `color-scheme` a non-`default` tone declares.
   *
   * `color-scheme` is the one thing tokens cannot express: it drives the parts of a form control
   * the page does not own — the caret, the `<select>` arrow, scrollbars, autofill — and CSS has no
   * way to ask "is this ground dark?". `inverted` and the brand tones therefore declare `dark`,
   * which is right for `inverted` always and for a brand role whose fill is saturated and whose
   * `contrast` is white (the overwhelmingly common case, and the DS default for `primary` and
   * `secondary`).
   *
   * A brand that authors a *pale* fill — the default `warning` role is `#f59e0b` on `#111827` ink,
   * and a theme is free to make `primary` look like that — needs `colorScheme="light"` here, or an
   * `<Input>` in the band gets a white caret on a yellow field. Set it when the tone's ink is dark.
   */
  colorScheme?: 'light' | 'dark' | undefined;
  /**
   * Render as a different element — `section`, `footer`, `aside`. Default: `'div'`.
   * A dark band is usually a landmark, so reach for the semantic tag.
   */
  as?: ElementType | undefined;
  /** Theme-aware inline style object. Merged after the recipe's own style. */
  sx?: Sx | undefined;
  /** Inline style. Merged last, so it wins. */
  style?: CSSProperties | undefined;
  children?: ReactNode;
}
