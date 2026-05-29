'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { forwardRef, type ForwardedRef, type ReactElement } from 'react';

import { menuGroupRecipe } from './Menu.recipe';
import type { MenuGroupProps } from './Menu.types';

/**
 * `role="group"` wrapper around a related set of items. Mostly invisible — the recipe is a
 * `flex flex-col` stub — but the role gives screen readers a "group of N items" hint, which
 * pairs well with a leading `<Menu.Label>` for the section name.
 */
function MenuGroupImpl(
  props: MenuGroupProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const { className, sx, style, children, ...rest } = props;

  const { className: groupClass, style: groupStyle } = useThemedClasses({
    recipe: menuGroupRecipe,
    componentName: 'Menu',
    slot: 'group',
    props: { className, sx, style },
  });

  return (
    <div ref={forwardedRef} role="group" className={groupClass} style={groupStyle} {...rest}>
      {children}
    </div>
  );
}

export const MenuGroup = forwardRef<HTMLDivElement, MenuGroupProps>(MenuGroupImpl);
MenuGroup.displayName = 'Menu.Group';
