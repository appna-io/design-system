'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { useSidebarContext } from './Sidebar.context';
import { sidebarSubItemsRecipe } from './Sidebar.recipe';
import type { SidebarSubItemsProps } from './Sidebar.types';

/**
 * `<Sidebar.SubItems>` — nested item group rendered inside an expandable `<Sidebar.Item>`.
 *
 * Renders as a `<ul role="group">` so screen readers announce the nesting relationship between
 * the parent item (which becomes the disclosure trigger) and these children. The list itself is
 * not a tab-stop; its `<Sidebar.Item>` children are.
 *
 * The visible indent comes from the recipe (`ps-5`); the actual show/hide animation lives on
 * the parent `<Sidebar.Item>`'s disclosure wrapper, so this component just renders the static
 * tree underneath.
 */
export const SidebarSubItems = forwardRef<HTMLUListElement, SidebarSubItemsProps>(
  function SidebarSubItems(props, ref) {
    const { children, className, style, ...rest } = props;

    const ctx = useSidebarContext('Sidebar.SubItems');

    const { className: themedClass, style: themedStyle } = useThemedClasses({
      recipe: sidebarSubItemsRecipe,
      componentName: 'Sidebar.SubItems',
      props: { collapsed: ctx.collapsed, className, style },
    });

    return (
      <ul
        ref={ref}
        className={themedClass}
        style={themedStyle ?? undefined}
        role="group"
        data-sidebar-subitems=""
        {...rest}
      >
        {children}
      </ul>
    );
  },
  'Sidebar.SubItems',
);