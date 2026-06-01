import type { SVGProps } from 'react';

/**
 * Public props for every icon exported from `@apx-ui/icons`.
 *
 * Icons are plain SVGs that paint with `currentColor`, so:
 *   - `color` flows from CSS `color` on the parent.
 *   - `size` sets both `width` and `height` (px by default; a string like `"1em"`
 *     also works for line-height-relative sizing).
 *   - `title` opts into an accessible name. Omit it (or pass `aria-hidden`) for
 *     purely decorative usage — the icon is `aria-hidden` by default.
 *
 * The component accepts the full set of native `<svg>` props (including `ref`)
 * so consumers can spread their own className, data-* attributes, event handlers,
 * etc. without us having to enumerate them.
 */
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  /**
   * Pixel size for both width and height. Accepts a number (px) or any CSS
   * length string (e.g. `"1em"`, `"1.25rem"`). Defaults to `24`.
   */
  size?: number | string;
  /**
   * Accessible name. When provided, the icon is announced to assistive tech
   * via a `<title>` element and `role="img"`. When omitted, the icon is
   * marked `aria-hidden` and treated as decorative.
   */
  title?: string;
}

/**
 * The component type returned by `createIcon`. We expose it so consumers can
 * type `as` props, icon registries, or higher-order wrappers without having to
 * re-derive it from a sample import.
 */
export type IconComponent = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
> & {
  /** Stable identifier used by tests, the renderer preview, and snapshots. */
  iconName: string;
};