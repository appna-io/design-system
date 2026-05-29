'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { forwardRef, type ForwardedRef, type ReactElement } from 'react';

import { menuSeparatorRecipe } from './Menu.recipe';
import type { MenuSeparatorProps } from './Menu.types';

/**
 * `role="separator"` horizontal rule. `aria-orientation="horizontal"` is the default for
 * separator and is omitted to keep the DOM lean.
 */
function MenuSeparatorImpl(
  props: MenuSeparatorProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const { className, sx, style, ...rest } = props;

  const { className: sepClass, style: sepStyle } = useThemedClasses({
    recipe: menuSeparatorRecipe,
    componentName: 'Menu',
    slot: 'separator',
    props: { className, sx, style },
  });

  return (
    <div
      ref={forwardedRef}
      role="separator"
      className={sepClass}
      style={sepStyle}
      {...rest}
    />
  );
}

export const MenuSeparator = forwardRef<HTMLDivElement, MenuSeparatorProps>(MenuSeparatorImpl);
MenuSeparator.displayName = 'Menu.Separator';
