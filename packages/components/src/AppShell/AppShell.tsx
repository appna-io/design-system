'use client';

import { forwardRef, useControllableState, useId } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useCallback, useMemo, useRef } from 'react';

import { Drawer } from '../Drawer';
import { AppShellContext } from './AppShell.context';
import {
  appShellAsideRecipe,
  appShellFooterRecipe,
  appShellHeaderRecipe,
  appShellMainRecipe,
  appShellRecipe,
  appShellSidebarRecipe,
  appShellSkipLinkRecipe,
} from './AppShell.recipe';
import type {
  AppShellContextValue,
  AppShellMainConfig,
  AppShellProps,
} from './AppShell.types';
import { computeGridTemplate } from './computeGridTemplate';
import { useBreakpointBelow } from './useBreakpoint';

const DEFAULT_MAIN_CONFIG: Required<AppShellMainConfig> = {
  padding: 6,
  maxWidth: 'full',
  centered: true,
};

/**
 * `<AppShell>` — the canonical "logged-in product layout" primitive. Composes a header,
 * sidebar, aside, footer, and main content into a CSS-Grid-driven shell with sensible
 * responsive behavior baked in:
 *
 *   - **Two layout variants**: `default` (sidebar full-height) and `inset` (header
 *     full-width). Industry-standard split — Notion / VS Code use `default`, GitHub /
 *     Linear use `inset`. Switched at runtime via a single prop.
 *   - **Mobile drawer**: below `sidebarBreakpoint` (default `'md'`), the sidebar is removed
 *     from the grid and rendered into a `<Drawer>`. The header's hamburger button toggles
 *     it via the `useAppShell()` context.
 *   - **Desktop rail-collapse**: `sidebarCollapsed` swaps the sidebar width between
 *     `sidebarWidth` (260px) and `sidebarCollapsedWidth` (64px). Pure CSS transition; the
 *     sidebar contents stay mounted, just narrower.
 *   - **Optional aside panel** with the same logical-position vocabulary as the sidebar.
 *   - **Skip-to-content link**: focusable on Tab, scrolls and focuses the `<main>` landmark.
 *
 * What AppShell does NOT do:
 *   - Render any sidebar / header navigation content. Consumers compose their own with
 *     `<Stack>` / `<NavigationMenu>` / `<Tabs>` and pass it in as a slot prop.
 *   - Style the slot children. Consumers control the visual look — AppShell contributes only
 *     layout + landmark roles + the responsive collapse behavior.
 *
 * @example Basic SaaS layout with header + sidebar.
 *   <AppShell
 *     header={<TopBar />}
 *     sidebar={<SidebarNav />}
 *   >
 *     <PageContent />
 *   </AppShell>
 *
 * @example With a controlled aside detail panel.
 *   const [open, setOpen] = useState(false);
 *   <AppShell
 *     header={<TopBar />}
 *     sidebar={<SidebarNav />}
 *     aside={open ? <DetailPanel /> : null}
 *     asideOpen={open}
 *     onAsideOpenChange={setOpen}
 *   >
 *     <PageContent />
 *   </AppShell>
 */
export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(function AppShell(props, ref) {
  const {
    header,
    sidebar,
    aside,
    footer,
    children,

    layout = 'default',

    sidebarPosition = 'start',
    sidebarWidth = 260,
    sidebarCollapsedWidth = 64,
    sidebarCollapsed: sidebarCollapsedProp,
    defaultSidebarCollapsed = false,
    onSidebarCollapsedChange,
    sidebarBreakpoint = 'md',
    sidebarMobileOpen: sidebarMobileOpenProp,
    defaultSidebarMobileOpen = false,
    onSidebarMobileOpenChange,
    sidebarLabel = 'Primary navigation',

    headerHeight = 56,
    headerSticky = true,
    headerVariant = 'default',
    headerOffset = 0,

    asidePosition = 'end',
    asideWidth = 320,
    asideOpen: asideOpenProp,
    defaultAsideOpen = true,
    onAsideOpenChange,
    asideLabel = 'Details',

    main,

    skipToContent = true,
    skipToContentLabel = 'Skip to content',

    className,
    style,
    sx,
    ...rest
  } = props;

  // State machines — three independent controllable booleans wrapped via the engine's
  // shared hook so each one supports both controlled + uncontrolled callers cleanly. The
  // `?? false` / `?? true` coercions after the hook call collapse the `boolean | undefined`
  // return type into a concrete boolean for downstream code paths (matches the convention
  // used by Popover / Combobox / Select).
  const [sidebarCollapsedRaw, setSidebarCollapsed] = useControllableState<boolean>({
    value: sidebarCollapsedProp,
    defaultValue: defaultSidebarCollapsed,
    onChange: onSidebarCollapsedChange,
  });
  const isSidebarCollapsed = sidebarCollapsedRaw ?? false;

  const [sidebarOpenRaw, setSidebarOpen] = useControllableState<boolean>({
    value: sidebarMobileOpenProp,
    defaultValue: defaultSidebarMobileOpen,
    onChange: onSidebarMobileOpenChange,
  });
  const isSidebarOpen = sidebarOpenRaw ?? false;

  const [asideOpenRaw, setAsideOpen] = useControllableState<boolean>({
    value: asideOpenProp,
    defaultValue: defaultAsideOpen,
    onChange: onAsideOpenChange,
  });
  const isAsideOpen = asideOpenRaw ?? true;

  const isMobile = useBreakpointBelow(sidebarBreakpoint);

  // Stable id for the main landmark — used as the target of the skip-to-content link.
  // useId returns a string that's safe across SSR boundaries.
  const reactId = useId();
  const mainId = `${reactId}-main`;
  const mainRef = useRef<HTMLDivElement>(null);

  const hasSidebar = sidebar !== undefined && sidebar !== null && sidebar !== false;
  const hasAside =
    aside !== undefined && aside !== null && aside !== false && isAsideOpen;
  const hasHeader = header !== undefined && header !== null && header !== false;
  const hasFooter = footer !== undefined && footer !== null && footer !== false;

  // Compute the grid template inline. The sidebar is only included in the grid when we're
  // NOT in mobile mode — on mobile it lives in a `<Drawer>` outside the grid.
  const gridTemplate = useMemo(
    () =>
      computeGridTemplate({
        layout,
        sidebarPosition,
        asidePosition,
        hasHeader,
        hasSidebar: hasSidebar && !isMobile,
        hasAside,
        hasFooter,
        sidebarWidthPx: isSidebarCollapsed ? sidebarCollapsedWidth : sidebarWidth,
        asideWidthPx: asideWidth,
        headerHeightPx: headerHeight,
      }),
    [
      layout,
      sidebarPosition,
      asidePosition,
      hasHeader,
      hasSidebar,
      isMobile,
      hasAside,
      hasFooter,
      isSidebarCollapsed,
      sidebarCollapsedWidth,
      sidebarWidth,
      asideWidth,
      headerHeight,
    ],
  );

  // Toggle / open / close helpers. `toggleSidebar()` is the smart entry point that header
  // hamburger buttons call — on mobile it flips the drawer, on desktop it flips the rail.
  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(!isSidebarOpen);
    } else {
      setSidebarCollapsed(!isSidebarCollapsed);
    }
  }, [isMobile, isSidebarOpen, isSidebarCollapsed, setSidebarOpen, setSidebarCollapsed]);

  const collapseSidebar = useCallback(() => setSidebarCollapsed(true), [setSidebarCollapsed]);
  const expandSidebar = useCallback(() => setSidebarCollapsed(false), [setSidebarCollapsed]);
  const openSidebar = useCallback(() => setSidebarOpen(true), [setSidebarOpen]);
  const closeSidebar = useCallback(() => setSidebarOpen(false), [setSidebarOpen]);
  const toggleAside = useCallback(() => setAsideOpen(!isAsideOpen), [isAsideOpen, setAsideOpen]);
  const openAside = useCallback(() => setAsideOpen(true), [setAsideOpen]);
  const closeAside = useCallback(() => setAsideOpen(false), [setAsideOpen]);

  // Build the context value. The hook fires re-renders when any state field changes; pre-
  // memoize so unchanged helpers keep stable identities (downstream consumers can rely on
  // referential equality for their own memoization).
  const ctxValue: AppShellContextValue = useMemo(
    () => ({
      layout,
      sidebarPosition,
      isMobile,
      isSidebarCollapsed,
      isSidebarOpen,
      isAsideOpen,
      toggleSidebar,
      collapseSidebar,
      expandSidebar,
      openSidebar,
      closeSidebar,
      toggleAside,
      openAside,
      closeAside,
    }),
    [
      layout,
      sidebarPosition,
      isMobile,
      isSidebarCollapsed,
      isSidebarOpen,
      isAsideOpen,
      toggleSidebar,
      collapseSidebar,
      expandSidebar,
      openSidebar,
      closeSidebar,
      toggleAside,
      openAside,
      closeAside,
    ],
  );

  const { className: rootClass, style: rootStyle } = useThemedClasses({
    recipe: appShellRecipe,
    componentName: 'AppShell',
    slot: 'root',
    props: { layout, className, sx, style },
  });

  const { className: headerClass } = useThemedClasses({
    recipe: appShellHeaderRecipe,
    componentName: 'AppShell',
    slot: 'header',
    props: { variant: headerVariant, sticky: headerSticky },
  });

  const { className: sidebarClass } = useThemedClasses({
    recipe: appShellSidebarRecipe,
    componentName: 'AppShell',
    slot: 'sidebar',
    props: { position: sidebarPosition, collapsed: isSidebarCollapsed },
  });

  const { className: asideClass } = useThemedClasses({
    recipe: appShellAsideRecipe,
    componentName: 'AppShell',
    slot: 'aside',
    props: { position: asidePosition },
  });

  const mainConfig = { ...DEFAULT_MAIN_CONFIG, ...main };
  const { className: mainClass } = useThemedClasses({
    recipe: appShellMainRecipe,
    componentName: 'AppShell',
    slot: 'main',
    props: {
      padding: String(mainConfig.padding) as '0' | '2' | '4' | '6' | '8' | '10' | '12',
      maxWidth: mainConfig.maxWidth,
      centered: mainConfig.maxWidth !== 'full' && mainConfig.centered,
    },
  });

  const { className: footerClass } = useThemedClasses({
    recipe: appShellFooterRecipe,
    componentName: 'AppShell',
    slot: 'footer',
    props: {},
  });

  const { className: skipLinkClass } = useThemedClasses({
    recipe: appShellSkipLinkRecipe,
    componentName: 'AppShell',
    slot: 'skipLink',
    props: {},
  });

  const handleSkipClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const node = mainRef.current;
    if (node) {
      node.focus();
      // `scrollIntoView` isn't implemented in JSDOM; guard so unit tests that simulate the
      // skip-link click don't surface an unhandled error. In real browsers it's always there.
      if (typeof node.scrollIntoView === 'function') {
        node.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  // Combine the recipe-driven style with the computed grid template. We layer:
  //   recipeStyle (theme overrides) < computed grid template < consumer's `style` prop.
  // Consumer style wins so a custom paddingTop / overrides aren't blown away.
  const mergedStyle: React.CSSProperties = {
    ...(rootStyle ?? undefined),
    gridTemplateAreas: gridTemplate.gridTemplateAreas,
    gridTemplateColumns: gridTemplate.gridTemplateColumns,
    gridTemplateRows: gridTemplate.gridTemplateRows,
    ...(headerOffset > 0 ? { paddingTop: `${headerOffset}px` } : {}),
    ...style,
  };

  return (
    <AppShellContext.Provider value={ctxValue}>
      {skipToContent ? (
        <a href={`#${mainId}`} className={skipLinkClass} onClick={handleSkipClick}>
          {skipToContentLabel}
        </a>
      ) : null}

      <div
        ref={ref}
        data-layout={layout}
        data-sidebar-position={sidebarPosition}
        data-mobile={isMobile || undefined}
        className={rootClass}
        style={mergedStyle}
        {...rest}
      >
        {hasHeader ? (
          <header className={headerClass} data-appshell-header="">
            {header}
          </header>
        ) : null}

        {hasSidebar && !isMobile ? (
          <aside
            className={sidebarClass}
            aria-label={sidebarLabel}
            data-appshell-sidebar=""
            data-collapsed={isSidebarCollapsed || undefined}
          >
            {sidebar}
          </aside>
        ) : null}

        <main
          ref={mainRef}
          id={mainId}
          tabIndex={-1}
          className={mainClass}
          data-appshell-main=""
        >
          {children}
        </main>

        {hasAside ? (
          <aside
            className={asideClass}
            aria-label={asideLabel}
            data-appshell-aside=""
          >
            {aside}
          </aside>
        ) : null}

        {hasFooter ? (
          <footer className={footerClass} data-appshell-footer="">
            {footer}
          </footer>
        ) : null}
      </div>

      {/* Mobile drawer — only mounted when we have a sidebar slot AND we're in mobile mode.
          The `<Drawer>` handles focus trap, scroll lock, Esc-to-close, and backdrop click;
          we just feed it the same sidebar node the consumer passed at the root. */}
      {hasSidebar && isMobile ? (
        <Drawer
          open={isSidebarOpen}
          onOpenChange={setSidebarOpen}
        >
          <Drawer.Content side={sidebarPosition === 'end' ? 'right' : 'left'} size="sm">
            <Drawer.Body>{sidebar}</Drawer.Body>
          </Drawer.Content>
        </Drawer>
      ) : null}
    </AppShellContext.Provider>
  );
}, 'AppShell');
