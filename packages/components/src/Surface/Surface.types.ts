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
 *
 * Deliberately not `'dark'`. A dark *mode* is a user preference resolved by `ThemeProvider`; this
 * is a local inversion of whatever palette is active, and it inverts a dark theme just as
 * correctly (giving a light band on a dark page).
 */
export type SurfaceTone = 'default' | 'inverted';

export interface SurfaceProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Ground for this region and everything inside it. Default: `'default'`. */
  tone?: SurfaceTone;
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
