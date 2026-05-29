'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { useSidebarContext } from './Sidebar.context';
import { sidebarFooterRecipe } from './Sidebar.recipe';
import type { SidebarFooterProps } from './Sidebar.types';

/**
 * `<Sidebar.Footer>` — the area at the bottom of the sidebar, typically the user avatar /
 * account menu / logout button. Sits beneath the item list via `mt-auto` (or via an explicit
 * `<Sidebar.Spacer>` before it).
 *
 * Auto-centers its content in rail mode so a `<UserAvatar>` glyph sits cleanly between the
 * collapsed rails.
 */
export const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(
  function SidebarFooter(props, ref) {
    const { children, className, style, ...rest } = props;

    const ctx = useSidebarContext('Sidebar.Footer');

    const { className: themedClass, style: themedStyle } = useThemedClasses({
      recipe: sidebarFooterRecipe,
      componentName: 'Sidebar.Footer',
      props: { collapsed: ctx.collapsed, className, style },
    });

    return (
      <div
        ref={ref}
        className={themedClass}
        style={themedStyle ?? undefined}
        data-sidebar-footer=""
        {...rest}
      >
        {children}
      </div>
    );
  },
  'Sidebar.Footer',
);
