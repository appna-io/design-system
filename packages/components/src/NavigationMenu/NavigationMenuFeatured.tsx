'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import type { ReactElement } from 'react';

import { navMenuFeaturedRecipe } from './NavigationMenu.recipe';
import type { NavigationMenuFeaturedProps } from './NavigationMenu.types';

/**
 * `<NavigationMenu.Featured>` — promo / showcase slot inside a mega-menu.
 *
 * Pure container. The consumer drops anything they like inside (a `<Card>`, an
 * image, a marketing CTA, …) — we provide a soft surface and consistent
 * padding so the slot fits the mega-menu grid without bespoke styling.
 *
 * The slot is `aria-hidden="false"` (default) — the contents are part of the
 * navigation surface and screen readers should announce them. Consumers who
 * want to mark the slot as decorative can set `aria-hidden` directly.
 */
export const NavigationMenuFeatured = forwardRef<HTMLDivElement, NavigationMenuFeaturedProps>(
  function NavigationMenuFeatured(props, forwardedRef): ReactElement {
    const { children, className, style, ...rest } = props;

    const { className: featuredClass, style: featuredStyle } = useThemedClasses({
      recipe: navMenuFeaturedRecipe,
      componentName: 'NavigationMenu',
      slot: 'featured',
      props: { className, style },
    });

    return (
      <div
        ref={forwardedRef}
        className={featuredClass}
        style={featuredStyle ?? undefined}
        data-nav-menu-featured=""
        {...rest}
      >
        {children}
      </div>
    );
  },
  'NavigationMenu.Featured',
);