'use client';

import { forwardRef, useId } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import type { ReactElement } from 'react';

import { navMenuGroupLabelRecipe, navMenuGroupRecipe } from './NavigationMenu.recipe';
import type { NavigationMenuGroupProps } from './NavigationMenu.types';

/**
 * `<NavigationMenu.Group>` — a labeled column inside a mega-menu Content panel.
 *
 * The Group renders its `label` as an `<h3>` (the W3C Menubar pattern points to
 * `<h3>` for visible group labels) and its children inside a sibling `<ul>` so
 * a screen-reader announces "list, 4 items" when entering the group.
 *
 * Outside a mega-menu the Group still works — it just looks like a labeled
 * stack of links. The `<ul>` carries `aria-labelledby` pointing to the heading
 * id, which is the W3C-recommended way to label a list.
 */
export const NavigationMenuGroup = forwardRef<HTMLDivElement, NavigationMenuGroupProps>(
  function NavigationMenuGroup(props, forwardedRef): ReactElement {
    const { children, label, className, style, ...rest } = props;

    const labelId = useId();

    const { className: groupClass, style: groupStyle } = useThemedClasses({
      recipe: navMenuGroupRecipe,
      componentName: 'NavigationMenu',
      slot: 'group',
      props: { className, style },
    });

    const { className: labelClass } = useThemedClasses({
      recipe: navMenuGroupLabelRecipe,
      componentName: 'NavigationMenu',
      slot: 'groupLabel',
      props: {},
    });

    return (
      <div
        ref={forwardedRef}
        className={groupClass}
        style={groupStyle ?? undefined}
        data-nav-menu-group=""
        {...rest}
      >
        {label !== undefined ? (
          <h3 id={labelId} className={labelClass} data-nav-menu-group-label="">
            {label}
          </h3>
        ) : null}
        <ul
          role="group"
          aria-labelledby={label !== undefined ? labelId : undefined}
          className="m-0 flex list-none flex-col gap-0.5 p-0"
          data-nav-menu-group-list=""
        >
          {children}
        </ul>
      </div>
    );
  },
  'NavigationMenu.Group',
);