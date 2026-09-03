import { forwardRef, type ReactNode } from 'react';

import type { IconComponent, IconProps } from './types';

/**
 * Factory that turns a piece of SVG content into a typed, ref-forwarding icon
 * component. Centralising the wrapping `<svg>` here means every icon in the
 * package shares the exact same defaults (viewBox, stroke width, line caps,
 * accessibility behaviour) — individual icon files only have to describe their
 * unique paint.
 *
 * We deliberately avoid pulling in `@apx-ui/engine`'s `forwardRef` helper so
 * that this package can be installed standalone, without dragging the rest of
 * the design system along for the ride.
 */
export interface CreateIconOptions {
  /**
   * Mark the glyph as **directional** — its meaning depends on reading order, so it must mirror
   * under `dir="rtl"`. An arrow that means "next" points left in Arabic; leaving it pointing
   * right doesn't just look wrong, it points at the previous item.
   *
   * This only stamps `data-apx-icon-directional` on the `<svg>`. The one CSS rule that acts on
   * it lives in `@apx-ui/theme`'s `styles/reset.css`, so this package keeps its "installable on
   * its own, no design-system dependency" property. Consumers who don't import the reset get
   * un-mirrored icons and nothing else breaks.
   *
   * Only glyphs whose *semantics* are directional qualify. A `Search` magnifier and a `Repeat`
   * loop have a handedness but mean the same thing either way — mirroring those is churn.
   */
  directional?: boolean;
}

export function createIcon(
  name: string,
  children: ReactNode,
  options: CreateIconOptions = {},
): IconComponent {
  const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
    { size = 24, title, ...rest },
    ref,
  ) {
    const hasTitle = typeof title === 'string' && title.length > 0;
    const a11yProps = hasTitle
      ? ({ role: 'img', 'aria-label': title } as const)
      : ({ 'aria-hidden': true, focusable: false } as const);

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...(options.directional ? { 'data-apx-icon-directional': '' } : {})}
        {...a11yProps}
        {...rest}
      >
        {hasTitle ? <title>{title}</title> : null}
        {children}
      </svg>
    );
  }) as IconComponent;

  Icon.displayName = name;
  Icon.iconName = name;
  return Icon;
}