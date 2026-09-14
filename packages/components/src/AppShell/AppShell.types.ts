import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  Ref,
} from 'react';
import type { Sx } from '@apx-ui/engine';

/**
 * Layout variant — the canonical "header above main only" vs "header spans the full width"
 * split that defines every modern product shell. GitHub / Linear use `inset`; Notion / VS Code
 * use `default`.
 *
 * - `default` → sidebar is full-height (header sits in the main column only).
 * - `inset`   → header spans the full width (sidebar starts below the header).
 */
export type AppShellLayout = 'default' | 'inset';

/** Logical side of the sidebar / aside. `start` = leading edge (left in LTR, right in RTL). */
export type AppShellSidePosition = 'start' | 'end';

/** Visual chrome variants for the header. */
export type AppShellHeaderVariant = 'default' | 'bordered' | 'floating';

/**
 * Header scroll behaviour. See `AppShellProps.headerScroll` for why `'reveal'` exists but is not
 * the default.
 */
export type AppShellHeaderScroll = 'none' | 'condense' | 'reveal';

/**
 * Breakpoint at which the sidebar collapses to a `<Drawer>`. Matches the engine's tailwind-
 * native breakpoint vocabulary. Below this threshold the sidebar is removed from the grid and
 * mounted as a slide-in drawer; above it, the sidebar lives in-grid (with optional rail
 * collapse).
 */
export type AppShellBreakpoint = 'sm' | 'md' | 'lg' | 'xl';

/** Theme spacing scale entries for the main content's inner padding. */
export type AppShellMainPadding = 0 | 2 | 4 | 6 | 8 | 10 | 12;

/** Tailwind container width tokens for the main content's `max-width`. */
export type AppShellMainMaxWidth = 'full' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl';

export interface AppShellMainConfig {
  /** Inner padding on all four sides. @default 6 */
  padding?: AppShellMainPadding;
  /** Max width of the main content (drives `max-w-*`). @default 'full' */
  maxWidth?: AppShellMainMaxWidth;
  /** Center the constrained main content horizontally. @default true (only meaningful when maxWidth != 'full') */
  centered?: boolean;
}

export interface AppShellContextValue {
  /** Resolved layout variant. */
  layout: AppShellLayout;
  /** Resolved sidebar position. */
  sidebarPosition: AppShellSidePosition;
  /** True when viewport is below `sidebarBreakpoint`. */
  isMobile: boolean;
  /** Desktop rail-collapse state. */
  isSidebarCollapsed: boolean;
  /** Mobile drawer open state. */
  isSidebarOpen: boolean;
  /** Aside panel open state. */
  isAsideOpen: boolean;
  /** Toggle the contextually-appropriate sidebar state (drawer on mobile, rail on desktop). */
  toggleSidebar: () => void;
  /** Force the desktop sidebar into the rail-collapsed state. */
  collapseSidebar: () => void;
  /** Force the desktop sidebar to expand back to full width. */
  expandSidebar: () => void;
  /** Open the mobile drawer. */
  openSidebar: () => void;
  /** Close the mobile drawer. */
  closeSidebar: () => void;
  /** Toggle the aside panel. */
  toggleAside: () => void;
  /** Open the aside panel. */
  openAside: () => void;
  /** Close the aside panel. */
  closeAside: () => void;
}

export interface AppShellProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Top header slot. Pure layout — AppShell doesn't introspect the node. */
  header?: ReactNode;
  /** Primary navigation slot. Falls into a `<Drawer>` below `sidebarBreakpoint`. */
  sidebar?: ReactNode;
  /** Detail / inspector slot, opposite of sidebar by default. */
  aside?: ReactNode;
  /** Bottom footer slot. */
  footer?: ReactNode;
  /** Main content. Wrapped in a `<main>` landmark. */
  children?: ReactNode;

  /** @default 'default' */
  layout?: AppShellLayout;

  /** Sidebar logical side. @default 'start' */
  sidebarPosition?: AppShellSidePosition;
  /** Sidebar width in px when expanded. @default 260 */
  sidebarWidth?: number;
  /** Sidebar width in px when rail-collapsed. @default 64 */
  sidebarCollapsedWidth?: number;
  /** Controlled rail-collapse on desktop. */
  sidebarCollapsed?: boolean;
  /** Uncontrolled initial rail-collapse state. @default false */
  defaultSidebarCollapsed?: boolean;
  /** Notified whenever the rail-collapse state changes. */
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
  /** Breakpoint below which the sidebar becomes a drawer. @default 'md' */
  sidebarBreakpoint?: AppShellBreakpoint;
  /** Controlled mobile drawer open state. */
  sidebarMobileOpen?: boolean;
  /** Uncontrolled initial mobile drawer state. @default false */
  defaultSidebarMobileOpen?: boolean;
  /** Notified whenever the mobile drawer open state changes. */
  onSidebarMobileOpenChange?: (open: boolean) => void;
  /** Accessible label for the sidebar landmark. @default 'Primary navigation' */
  sidebarLabel?: string;

  /** Header height in px. @default 56 */
  headerHeight?: number;
  /** Whether the header is `position: sticky`. @default true */
  headerSticky?: boolean;
  /** @default 'default' */
  headerVariant?: AppShellHeaderVariant;
  /**
   * How the header reacts to page scroll.
   *
   * - `'none'` — inert. The default, because an app shell's header is chrome, not a marketing
   *   surface; changing it on scroll is a landing-page idiom.
   * - `'condense'` — gains a border, a solid background and a blur once the page is past the fold.
   *   This is the house style for templates: a header pinned transparently over a hero has to
   *   become legible once real content is behind it.
   * - `'reveal'` — additionally hides on scroll down and returns on scroll up.
   *
   * `'reveal'` is offered but is deliberately **not** the house style. It removes the nav at the
   * exact moment a fast-scrolling user is reaching for it, and it takes away the fixed orientation
   * anchor that some users rely on to know where they are. Fine as an option, wrong as a default.
   * It is also suppressed entirely under `prefers-reduced-motion`, where it degrades to
   * `'condense'`.
   *
   * The header carries `data-scrolled` / `data-hidden` attributes in either mode, so a consumer
   * can hang their own styles off the state without re-implementing the listener.
   *
   * @default 'none'
   */
  headerScroll?: AppShellHeaderScroll;
  /**
   * Force the reduced-motion behaviour on (`true`) or off (`false`), bypassing the media query.
   * For tests and side-by-side documentation.
   */
  headerReduceMotion?: boolean;
  /** Additional top offset for OS toolbars (Electron / Tauri) in px. @default 0 */
  headerOffset?: number;

  /** Aside logical side. @default 'end' */
  asidePosition?: AppShellSidePosition;
  /** Aside width in px when open. @default 320 */
  asideWidth?: number;
  /** Controlled aside open state. */
  asideOpen?: boolean;
  /** Uncontrolled initial aside open state. @default true */
  defaultAsideOpen?: boolean;
  /** Notified whenever the aside open state changes. */
  onAsideOpenChange?: (open: boolean) => void;
  /** Accessible label for the aside landmark. @default 'Details' */
  asideLabel?: string;

  /** Inner padding / max-width / centering for the main content. */
  main?: AppShellMainConfig;

  /**
   * Render the skip-to-content link at the top of the shell. When focused, it scrolls to and
   * focuses the `<main>` landmark. @default true
   */
  skipToContent?: boolean;
  /** Visible text for the skip-to-content link. @default 'Skip to content' */
  skipToContentLabel?: string;

  className?: string;
  style?: CSSProperties;
  sx?: Sx | undefined;
  ref?: Ref<HTMLDivElement>;
}