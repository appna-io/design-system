'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { useSidebarContext } from './Sidebar.context';
import { sidebarHeaderRecipe } from './Sidebar.recipe';
import type { SidebarHeaderProps } from './Sidebar.types';

/**
 * `<Sidebar.Header>` — the area at the top of the sidebar that typically holds the app's logo
 * and product name (or just the logo in rail mode). The header doesn't impose its own
 * structure beyond layout chrome — consumers compose whatever fits.
 *
 * Renders as a plain `<div>` (NOT a `<header>` landmark) because the sidebar itself is already
 * a `<nav>` landmark, and nesting a `<header>` inside `<nav>` adds noise to the a11y tree
 * without adding screen-reader value.
 */
export const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(
  function SidebarHeader(props, ref) {
    const { children, className, style, ...rest } = props;

    // Reading context throws when this is used outside a Sidebar — surfaces misuse early.
    useSidebarContext('Sidebar.Header');

    const { className: themedClass, style: themedStyle } = useThemedClasses({
      recipe: sidebarHeaderRecipe,
      componentName: 'Sidebar.Header',
      props: { className, style },
    });

    return (
      <div
        ref={ref}
        className={themedClass}
        style={themedStyle ?? undefined}
        data-sidebar-header=""
        {...rest}
      >
        {children}
      </div>
    );
  },
  'Sidebar.Header',
);
