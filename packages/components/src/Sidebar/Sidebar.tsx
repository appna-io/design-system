'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useMemo, type CSSProperties } from 'react';

import { SidebarContext } from './Sidebar.context';
import { sidebarRecipe } from './Sidebar.recipe';
import type { SidebarContextValue, SidebarProps } from './Sidebar.types';

/**
 * `<Sidebar>` — the vertical navigation rail that lives inside an AppShell's `sidebar` slot.
 *
 * Renders as a `<nav>` landmark (NOT an `<aside>` — AppShell already labels its own `<aside>`
 * sidebar slot, and stacking two landmarks would noise the a11y tree). The accessible name
 * comes from `ariaLabel` ("Sidebar" by default) or `ariaLabelledBy` if the consumer wants to
 * point at a visible heading inside `<Sidebar.Header>`.
 *
 * What the root does:
 *   - Sets up the SidebarContext that every subpart reads (`collapsed`, `size`, `itemSize`,
 *     `activeHref`, `activeMatchStrategy`).
 *   - Applies the recipe-driven chrome (variant / size / collapsed / position).
 *   - Optionally pins an inline `width` / `collapsedWidth` so the sidebar can be used outside an
 *     AppShell (e.g. as a standalone marketing demo). When inside an AppShell, the grid column
 *     handles width and these inline overrides are typically omitted.
 *
 * What the root does NOT do:
 *   - Render any sidebar content itself. Consumers compose `<Sidebar.Header>`, `<Sidebar.Item>`,
 *     `<Sidebar.Section>`, `<Sidebar.Footer>` (and friends) as children.
 *   - Manage a "collapsed" state internally. The `collapsed` prop is the source of truth;
 *     wiring it to `useAppShell().isSidebarCollapsed` is a one-liner consumer responsibility.
 *
 * @example Bare-minimum standalone usage.
 *   <Sidebar ariaLabel="Main navigation">
 *     <Sidebar.Item icon={<HomeIcon />} href="/">Home</Sidebar.Item>
 *   </Sidebar>
 *
 * @example Inside an AppShell, driving collapsed state.
 *   function App() {
 *     const { isSidebarCollapsed } = useAppShell();
 *     return (
 *       <Sidebar collapsed={isSidebarCollapsed} activeHref={router.pathname}>
 *         …
 *       </Sidebar>
 *     );
 *   }
 */
export const SidebarRoot = forwardRef<HTMLElement, SidebarProps>(function Sidebar(props, ref) {
  const {
    children,
    variant = 'default',
    size = 'md',
    itemSize,
    collapsed = false,
    activeHref,
    activeMatchStrategy = 'exact',
    ariaLabel = 'Sidebar',
    ariaLabelledBy,
    width,
    collapsedWidth,
    position = 'start',
    className,
    style,
    sx,
    ...rest
  } = props;

  const { className: themedClass, style: themedStyle } = useThemedClasses({
    recipe: sidebarRecipe,
    componentName: 'Sidebar',
    props: { variant, size, position, collapsed, className, sx, style },
  });

  /**
   * Memoized context so identity-stable subparts can skip re-renders when unrelated root state
   * changes. Items / Sections rely on equality of `activeHref` + `collapsed` + `size`.
   */
  const ctx = useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      size,
      itemSize: itemSize ?? size,
      activeHref,
      activeMatchStrategy,
    }),
    [collapsed, size, itemSize, activeHref, activeMatchStrategy],
  );

  /**
   * Compute the inline width override. We let consumers pass either `width` / `collapsedWidth`,
   * and we pick whichever applies given the current `collapsed` state. Either prop being unset
   * means "don't write an inline width" — the parent grid handles it.
   */
  const inlineWidth = collapsed ? collapsedWidth : width;
  const widthStyle: CSSProperties | undefined =
    inlineWidth !== undefined
      ? { width: typeof inlineWidth === 'number' ? `${inlineWidth}px` : inlineWidth }
      : undefined;

  const mergedStyle: CSSProperties | undefined =
    themedStyle || widthStyle ? { ...themedStyle, ...widthStyle } : undefined;

  return (
    <SidebarContext.Provider value={ctx}>
      <nav
        ref={ref}
        className={themedClass}
        style={mergedStyle}
        aria-label={ariaLabelledBy ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledBy}
        data-collapsed={collapsed ? 'true' : undefined}
        data-variant={variant}
        data-size={size}
        data-position={position}
        {...rest}
      >
        {children}
      </nav>
    </SidebarContext.Provider>
  );
}, 'Sidebar');