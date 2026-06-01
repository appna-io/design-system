import type { ReactNode, AnchorHTMLAttributes, HTMLAttributes, ButtonHTMLAttributes, CSSProperties } from 'react';
import type { Sx } from '@apx-ui/engine';

import type { BadgeColor } from '../Badge/Badge.types';

/**
 * Visual chrome family for the Sidebar root. Mirrors the Card / Toolbar conventions:
 *
 *   - `default`  — transparent surface; sits inside an AppShell that already paints the chrome.
 *   - `bordered` — adds a logical-end border so the sidebar visually separates from main.
 *   - `floating` — detached card with shadow + rounded corners (Notion / marketing-style).
 *   - `ghost`    — fully transparent; useful when the sidebar is overlaid on a custom background.
 */
export type SidebarVariant = 'default' | 'bordered' | 'floating' | 'ghost';

/** Size scale propagated down to subparts via context. */
export type SidebarSize = 'sm' | 'md' | 'lg';

/** Item-level size override. Defaults to the root's `size` when not set. */
export type SidebarItemSize = SidebarSize;

/** Logical position of the sidebar relative to main content. */
export type SidebarPosition = 'start' | 'end';

/**
 * URL-matching strategy for the root's `activeHref` prop. Each Item self-determines its
 * `aria-current="page"` by comparing its own `href` against `activeHref` per this strategy:
 *
 *   - `exact`  — current and item paths must match (trailing slashes normalized).
 *   - `prefix` — current path equals item path, OR current starts with `item + '/'`
 *                (the `+ '/'` is the boundary check so `/p` doesn't match `/photos`).
 */
export type SidebarActiveMatchStrategy = 'exact' | 'prefix';

/** Per-Item visual variant. */
export type SidebarItemVariant = 'default' | 'ghost' | 'primary';

/**
 * Context value shared between the Sidebar root and every subpart. Each Item / Section reads
 * `collapsed` (rail mode), `size`, `itemSize`, `activeHref`, and `activeMatchStrategy` from
 * here so consumers don't have to thread them through every JSX node.
 */
export interface SidebarContextValue {
  collapsed: boolean;
  size: SidebarSize;
  itemSize: SidebarItemSize;
  activeHref: string | undefined;
  activeMatchStrategy: SidebarActiveMatchStrategy;
}

/**
 * Props for the Sidebar root. Most fields are optional with sensible defaults — the absolute
 * minimum is `<Sidebar><Sidebar.Item href="/">Home</Sidebar.Item></Sidebar>`.
 */
export interface SidebarProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  children: ReactNode;

  /** Visual chrome. Default: `'default'`. */
  variant?: SidebarVariant;
  /** Size scale propagated to subparts. Default: `'md'`. */
  size?: SidebarSize;
  /** Per-Item size override (otherwise inherits `size`). */
  itemSize?: SidebarItemSize;

  /**
   * When `true`, the sidebar enters **rail mode**: item labels become `sr-only` (the icon stays
   * visible), each Item is wrapped in a Tooltip showing its label, and section labels collapse.
   * Drives directly off the consumer's prop — typically wired to `useAppShell().isSidebarCollapsed`
   * when nested inside an AppShell. Default: `false`.
   */
  collapsed?: boolean;

  /**
   * The current page's URL path. Each `<Sidebar.Item href>` self-compares against this to decide
   * if it's the active item; the active item then gets `aria-current="page"` + active styling.
   */
  activeHref?: string;

  /**
   * How `activeHref` is matched against each Item's `href`. Default: `'exact'`. Use `'prefix'`
   * to highlight a parent route when on a child page (`/projects` active when on `/projects/42`).
   */
  activeMatchStrategy?: SidebarActiveMatchStrategy;

  /**
   * Accessible name for the `<aside>` landmark. Required for axe-clean output unless the
   * sidebar already lives inside an AppShell's labeled sidebar slot (AppShell labels its own
   * `<aside>`, and the Sidebar component renders as a plain `<nav>` in that case via the
   * `as` prop — but here Sidebar always renders `<nav>` to avoid double-landmark warnings).
   *
   * Default: `'Sidebar'`.
   */
  ariaLabel?: string;

  /** Override the sidebar's own `<nav>` aria-labelledby instead of `ariaLabel`. */
  ariaLabelledBy?: string;

  /** Optional inline width override (e.g. `'260px'` or `260`). Defaults to the parent layout. */
  width?: number | string;
  /** Inline width override when `collapsed`. Defaults to the parent layout. */
  collapsedWidth?: number | string;

  /** Logical position relative to main content. Affects only the `bordered` variant's border side. Default: `'start'`. */
  position?: SidebarPosition;

  className?: string;
  style?: CSSProperties;
  sx?: Sx | undefined;
}

/** Props for `<Sidebar.Header>` — typically the app logo + name. */
export interface SidebarHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Props for `<Sidebar.Footer>` — typically the user avatar / account menu. */
export interface SidebarFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * `<Sidebar.Spacer>` pushes following items to the logical end of the sidebar via `flex: 1`.
 * Pure layout primitive — no props beyond standard div attributes.
 */
export type SidebarSpacerProps = HTMLAttributes<HTMLDivElement>;

/**
 * Props for `<Sidebar.Section>`. A section is a labeled grouping of items. When `collapsible`,
 * the label becomes a `<button aria-expanded>` that toggles a CSS-grid disclosure transition
 * on the section body.
 */
export interface SidebarSectionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Section header — text or any ReactNode (e.g. label + count). Required for screen readers. */
  label: ReactNode;
  /** When true, the label becomes a toggle that opens / closes the section body. Default: `false`. */
  collapsible?: boolean;
  /** Initial open state (uncontrolled). Default: `true`. */
  defaultOpen?: boolean;
  /** Controlled open state. When supplied, `defaultOpen` is ignored. */
  open?: boolean;
  /** Fires when the open state changes (both controlled and uncontrolled paths). */
  onOpenChange?: (open: boolean) => void;
  /** When the sidebar is in rail mode, hide the section label entirely. Default: `true`. */
  hideLabelWhenCollapsed?: boolean;
  /** Optional badge displayed beside the section label (count, status pill, …). */
  badge?: ReactNode;
  /** When set with `badge`, controls the badge color. */
  badgeColor?: BadgeColor;
  /** Section body — typically `<Sidebar.Item>` children. */
  children: ReactNode;
}

/**
 * Props for `<Sidebar.Item>`. The primary atom of the sidebar — every navigation entry is one
 * of these. Renders as `<a>` when `href` is set, as `<button>` when only `onClick` is set, and
 * as the consumer's element when `asChild` is passed (router Link integration).
 */
export interface SidebarItemProps
  extends Omit<
    AnchorHTMLAttributes<HTMLElement> & ButtonHTMLAttributes<HTMLElement>,
    'children' | 'onChange'
  > {
  children: ReactNode;
  /** Leading icon. REQUIRED in rail mode (it's the only visible content). */
  icon?: ReactNode;
  /** Trailing icon — chevron, external-link glyph, etc. Hidden in rail mode. */
  endIcon?: ReactNode;
  /** Numeric count or any ReactNode. Renders inside a `<Badge>` after the label. */
  badge?: ReactNode | number;
  /** Badge palette. Default: `'neutral'`. */
  badgeColor?: BadgeColor;
  /** Navigational `href`. When set, the item renders as `<a>`. */
  href?: string;
  /** Explicit active override. When omitted, falls back to root's `activeHref` matching. */
  active?: boolean;
  /** When true, the item has an attached `<Sidebar.SubItems>` disclosure. Default: `false`. */
  expandable?: boolean;
  /** Initial expanded state for the disclosure (uncontrolled). Default: `false`. */
  defaultExpanded?: boolean;
  /** Controlled expanded state for the disclosure. */
  expanded?: boolean;
  /** Fires when the disclosure expanded state changes. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Per-item visual variant. Default: `'default'`. */
  variant?: SidebarItemVariant;
  /** Per-item size override. Default: inherits root's `itemSize`. */
  size?: SidebarItemSize;
  /** When true, render the item as its single child (router Link integration). Default: `false`. */
  asChild?: boolean;
}

/**
 * Props for `<Sidebar.SubItems>`. Used as a child of `<Sidebar.Item expandable>`. Renders the
 * nested items inside a `role="group"` `<ul>` that is shown / hidden by the parent item's
 * `expanded` state.
 */
export interface SidebarSubItemsProps extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  children: ReactNode;
}