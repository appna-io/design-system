'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { forwardRef, type ForwardedRef, type ReactElement } from 'react';

import { drawerBodyRecipe } from './Drawer.recipe';
import { useDrawerContext } from './DrawerContext';
import type { DrawerBodyProps } from './Drawer.types';

/**
 * Scrollable Body region. `flex-1 min-h-0 overflow-y-auto` (from the recipe) bounds it inside
 * Content's max-width / max-height (depending on `side`), so long content scrolls inside Body
 * while Header and Footer stay pinned. The `min-h-0` is what lets `flex-1` actually shrink for
 * top / bottom drawers — without it, vertical drawers with tall content would burst their
 * Content height bound.
 */
function DrawerBodyImpl(
  props: DrawerBodyProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const { className, style, sx, children, ...rest } = props;
  const ctx = useDrawerContext('Drawer.Body');

  const { className: bodyClass, style: bodyStyle } = useThemedClasses({
    recipe: drawerBodyRecipe,
    componentName: 'Drawer',
    slot: 'body',
    props: {
      size: ctx.size,
      className,
      sx,
      style,
    },
  });

  return (
    <div
      ref={forwardedRef}
      className={bodyClass}
      style={bodyStyle ?? undefined}
      {...rest}
    >
      {children}
    </div>
  );
}

export const DrawerBody = forwardRef<HTMLDivElement, DrawerBodyProps>(DrawerBodyImpl);
DrawerBody.displayName = 'Drawer.Body';
