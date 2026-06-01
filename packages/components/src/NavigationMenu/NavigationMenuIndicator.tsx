'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useMemo, type CSSProperties, type ReactElement } from 'react';

import { useNavigationMenuContext } from './NavigationMenu.context';
import { navMenuIndicatorRecipe } from './NavigationMenu.recipe';
import type { NavigationMenuIndicatorProps } from './NavigationMenu.types';
import { useIndicatorPosition } from './useIndicatorPosition';

/**
 * `<NavigationMenu.Indicator>` — the animated underline / pill / bar that
 * slides between items.
 *
 * The Indicator is a single absolutely-positioned `<div>` whose `transform` and
 * width are updated whenever the tracked item changes. CSS handles the
 * interpolation — pure GPU-composited, no layout thrash. `motion-reduce`
 * disables the transition for users who prefer reduced motion.
 *
 * Tracking priority:
 *   1. The currently-open dropdown (so the indicator follows clicks / hovers).
 *   2. The currently-focused trigger (so keyboard navigation moves it).
 *   3. The active item resolved from `activeHref` (the resting state).
 *   4. None — the indicator hides via `opacity: 0`.
 *
 * The indicator is auto-rendered by the root when `indicator` is `true`;
 * consumers rarely import it directly, but the export is useful for tests +
 * theme overrides.
 */
export const NavigationMenuIndicator = forwardRef<HTMLDivElement, NavigationMenuIndicatorProps>(
  function NavigationMenuIndicator(props, forwardedRef): ReactElement | null {
    const { className, style, ...rest } = props;

    const ctx = useNavigationMenuContext('NavigationMenu.Indicator');

    // Pick the target id following the priority chain. The active item is
    // resolved at the indicator level (not the Item level) because it can
    // come from any number of Items and we want exactly one indicator
    // tracking exactly one item at a time.
    const activeId = useMemo<string | null>(() => {
      if (ctx.openItemId) return ctx.openItemId;
      if (ctx.focusedItemId) return ctx.focusedItemId;
      if (ctx.activeHref) {
        const items = ctx.getOrderedItems();
        for (const item of items) {
          if (!item.href) continue;
          if (item.href === ctx.activeHref) return item.id;
          if (
            ctx.activeMatchStrategy === 'prefix' &&
            ctx.activeHref.startsWith(item.href === '/' ? '/' : item.href + '/')
          ) {
            return item.id;
          }
        }
      }
      return null;
    }, [ctx]);

    const rect = useIndicatorPosition({
      rootRef: ctx.rootRef,
      targetId: activeId,
      orientation: ctx.orientation,
    });

    const visible = rect !== null;

    const { className: indicatorClass, style: indicatorStyle } = useThemedClasses({
      recipe: navMenuIndicatorRecipe,
      componentName: 'NavigationMenu',
      slot: 'indicator',
      props: {
        variant: ctx.indicatorVariant,
        orientation: ctx.orientation,
        visible,
        className,
        style,
      },
    });

    if (!ctx.indicator) return null;

    // Compose the transform. We always use logical translation:
    //
    //   - Horizontal LTR: `translateX(x) translateY(y)` → 0,0 is top-start.
    //   - Horizontal RTL: same — `useIndicatorPosition` already measures `x`
    //     from the logical start edge, so writing `transform: translateX(x)`
    //     under `direction: rtl` puts it on the correct side.
    //
    // We additionally set `inset-inline-start: 0` (handled by the recipe via
    // `start-0`) so the transform origin is the logical start, not the
    // physical left.
    const transformStyle: CSSProperties = rect
      ? {
          // Use logical-direction-friendly transform via inset-inline-start.
          transform: `translate3d(${rect.rtl ? -rect.x : rect.x}px, ${rect.y}px, 0)`,
          width: ctx.orientation === 'horizontal' ? `${rect.w}px` : undefined,
          height: ctx.orientation === 'vertical' ? `${rect.h}px` : undefined,
          ...(rect.rtl ? { insetInlineEnd: 0, insetInlineStart: 'auto' } : {}),
        }
      : {};

    const composedStyle: CSSProperties = {
      ...(indicatorStyle ?? {}),
      ...transformStyle,
    };

    return (
      <div
        ref={forwardedRef}
        aria-hidden="true"
        className={indicatorClass}
        style={composedStyle}
        data-nav-menu-indicator=""
        data-visible={visible ? 'true' : 'false'}
        {...rest}
      />
    );
  },
  'NavigationMenu.Indicator',
);