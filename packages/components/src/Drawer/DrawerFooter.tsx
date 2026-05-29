'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { forwardRef, type ForwardedRef, type ReactElement } from 'react';

import { drawerFooterRecipe } from './Drawer.recipe';
import { useDrawerContext } from './DrawerContext';
import type { DrawerFooterProps } from './Drawer.types';

/**
 * Footer slot for primary / secondary action buttons. Same `align` grammar as Modal:
 *
 *   - `end` (default) — right-aligned (or left in RTL).
 *   - `start` — logical-start aligned.
 *   - `between` — split.
 *   - `center` — centered.
 *
 * Footer never grows — it sits below the scrollable Body. Content's max-height (vertical
 * drawers) or `h-full` (horizontal drawers) keeps both Header + Footer fully visible at all
 * times.
 */
function DrawerFooterImpl(
  props: DrawerFooterProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const { align = 'end', className, style, sx, children, ...rest } = props;
  const ctx = useDrawerContext('Drawer.Footer');

  const { className: footerClass, style: footerStyle } = useThemedClasses({
    recipe: drawerFooterRecipe,
    componentName: 'Drawer',
    slot: 'footer',
    props: {
      size: ctx.size,
      align,
      className,
      sx,
      style,
    },
  });

  return (
    <div
      ref={forwardedRef}
      className={footerClass}
      style={footerStyle ?? undefined}
      {...rest}
    >
      {children}
    </div>
  );
}

export const DrawerFooter = forwardRef<HTMLDivElement, DrawerFooterProps>(DrawerFooterImpl);
DrawerFooter.displayName = 'Drawer.Footer';
