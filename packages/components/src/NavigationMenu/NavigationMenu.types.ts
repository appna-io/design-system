import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  RefObject,
} from 'react';
import type { Sx } from '@apx-ui/engine';

/**
 * Visual chrome family for the NavigationMenu root. The DS sticks to three:
 *
 *   - `default` — flat list of items; lives inside an AppShell header that already
 *     paints the chrome (the marketing-site / Notion default).
 *   - `ghost`   — fully transparent items; useful when the menu is overlaid on a
 *     custom hero or video background.
 *   - `pill`    — items render as filled pill buttons (Stripe's "Products" /
 *     "Pricing" header).
 */
export type NavigationMenuVariant = 'default' | 'ghost' | 'pill';

/** Size scale propagated down to subparts via context. */
export type NavigationMenuSize = 'sm' | 'md' | 'lg';

/** Layout axis. Horizontal is the canonical top-nav; vertical is for side rails. */
export type NavigationMenuOrientation = 'horizontal' | 'vertical';

/**
 * Trigger interaction mode. The plan specifies `'both'` as the default — hover for
 * power users on desktop, click for accessibility + touch.
 */
export type NavigationMenuTriggerMode = 'click' | 'hover' | 'both';

/** Indicator visual variant. Mirrors Tabs' "underline / pill / bar" decision. */
export type NavigationMenuIndicatorVariant = 'underline' | 'pill' | 'bar';

/**
 * URL-matching strategy for the root's `activeHref` prop. Mirrors Sidebar's
 * `SidebarActiveMatchStrategy` and reuses the shared `isActiveHref` helper, so
 * NavigationMenu and Sidebar agree on what "active" means.
 */
export type NavigationMenuActiveMatchStrategy = 'exact' | 'prefix';

/**
 * Tailwind-native breakpoint values. Below this breakpoint the NavigationMenu
 * collapses (renders nothing). Consumers wire a hamburger via AppShell instead.
 *
 * Mirrors `AppShellBreakpoint` — when both files agree, the engine promotion of
 * `useBreakpointBelow` (Phase 53 outcome) becomes safe.
 */
export type NavigationMenuMobileBreakpoint = 'sm' | 'md' | 'lg' | 'xl';

/** Content panel layout. `'mega'` widens the surface and uses a CSS grid. */
export type NavigationMenuContentVariant = 'default' | 'mega';

/** Mega-menu column count. */
export type NavigationMenuColumns = 1 | 2 | 3 | 4;

/**
 * One registered top-level item. The root tracks every Item's id + DOM ref so it
 * can drive the indicator slide, the W3C Menubar arrow keys (next/prev focus),
 * and the open/close state for hover-delay debouncing.
 */
export interface NavigationMenuItemRecord {
  id: string;
  /**
   * Live DOM reference. Filled in by `<NavigationMenu.Item>` via callback ref so
   * the value is always current — important for the indicator's `getBoundingClientRect`
   * read and for `focus()` calls from the keyboard handler.
   */
  ref: RefObject<HTMLElement | null>;
  /** Whether this Item has a Trigger child (renders a dropdown). */
  hasContent: boolean;
  /** Whether the Item is disabled (skipped by arrow-key navigation). */
  disabled: boolean;
  /** When the Item wraps a `<Link href>`, this is the href — used for active-state. */
  href: string | undefined;
  /**
   * Stable label used by type-to-search (W3C Menubar pattern). Falls back to the
   * trigger button's `textContent` when registered via the auto-resolver.
   */
  label: string;
}

/**
 * Context value shared between the NavigationMenu root and every subpart. Items /
 * Triggers / Links / Contents / Indicator all read from a single context to avoid
 * prop-drilling. The shape is intentionally flat — every subpart needs at most 4-5
 * fields and we keep the lookup cost trivial.
 */
export interface NavigationMenuContextValue {
  /** Generated id used to namespace subpart ids (`<root>-trigger-<itemId>`). */
  baseId: string;
  /** Resolved orientation for arrow-key direction + recipe variant. */
  orientation: NavigationMenuOrientation;
  /** Resolved variant (visual chrome family). */
  variant: NavigationMenuVariant;
  /** Resolved size for trigger / link rows. */
  size: NavigationMenuSize;
  /** Trigger mode. `'click'` / `'hover'` / `'both'`. */
  trigger: NavigationMenuTriggerMode;
  /** Hover open delay (ms). */
  hoverDelay: number;
  /** Hover close delay (ms). */
  closeDelay: number;
  /** The currently-open dropdown's item id, or null. */
  openItemId: string | null;
  /**
   * Open or close a dropdown. `null` closes any currently-open dropdown.
   * The optional `source` argument tells the panel whether the open was
   * triggered by keyboard (auto-focus the first link) or pointer (don't
   * yank focus from the trigger).
   */
  setOpenItemId: (id: string | null, source?: 'pointer' | 'keyboard') => void;
  /**
   * Last open source — `'pointer' | 'keyboard'`. The Content panel reads
   * this to decide whether to auto-focus its first link on open.
   */
  lastOpenSource: 'pointer' | 'keyboard';
  /**
   * The currently-focused (roving tabindex) item id. Drives `tabIndex={0|-1}`
   * across all triggers + links so only one is in the tab order at a time.
   */
  focusedItemId: string | null;
  /** Move keyboard focus to a registered item (also updates `focusedItemId`). */
  focusItem: (id: string) => void;
  /** Set the focused id without focusing the DOM (for blur handlers). */
  setFocusedItemId: (id: string | null) => void;
  /** Register an item on mount; returns the unsubscribe function. */
  registerItem: (record: NavigationMenuItemRecord) => () => void;
  /** Update an existing item's record (label changes, href changes, etc.). */
  updateItem: (id: string, patch: Partial<NavigationMenuItemRecord>) => void;
  /** Snapshot of registered items in document order. Used by the keyboard handler. */
  getOrderedItems: () => NavigationMenuItemRecord[];
  /** Hover delay scheduling. Trigger calls `scheduleOpen` on enter, `scheduleClose` on leave. */
  scheduleOpen: (id: string) => void;
  scheduleClose: () => void;
  /** Cancel any in-flight close (used when content panel is hovered). */
  cancelClose: () => void;
  /** Active-link state. Items use this to compute their own `aria-current`. */
  activeHref: string | undefined;
  activeMatchStrategy: NavigationMenuActiveMatchStrategy;
  /** Indicator props — when `false`, NavigationMenu.Indicator skips rendering. */
  indicator: boolean;
  indicatorVariant: NavigationMenuIndicatorVariant;
  /** Live ref to the root `<nav>` element — used by `useIndicatorPosition`. */
  rootRef: RefObject<HTMLElement | null>;
  /** Translated strings. Falls back to en bundle when no I18nProvider is present. */
  translations: NavigationMenuTranslations;
}

/**
 * Translation strings used by the component. Follows the DS's i18n contract — the
 * default English bundle is exported from `NavigationMenu.i18n.ts`; consumers
 * override via `<I18nProvider messages={…}>` or pass a `translations` prop on the
 * root for hard-coded one-offs.
 */
export interface NavigationMenuTranslations {
  /** Accessible name for the `<nav>` landmark. Default: "Main navigation". */
  label: string;
  /** sr-only label appended to a Trigger when it has an open dropdown. */
  toggleSection: string;
  /** sr-only suffix announced after the active link. */
  activeItem: string;
}

/** Props for the NavigationMenu root. */
export interface NavigationMenuProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'onChange' | 'defaultValue'> {
  children: ReactNode;

  /** Visual chrome family. Default: `'default'`. */
  variant?: NavigationMenuVariant;
  /** Size scale propagated to subparts. Default: `'md'`. */
  size?: NavigationMenuSize;
  /** Layout axis. Default: `'horizontal'`. */
  orientation?: NavigationMenuOrientation;

  /** Trigger interaction mode. Default: `'both'`. */
  trigger?: NavigationMenuTriggerMode;
  /** Open delay (ms) for hover trigger. Default: `150`. */
  hoverDelay?: number;
  /** Close delay (ms) for hover trigger. Default: `250`. */
  closeDelay?: number;

  /** Render an animated indicator under the active / focused item. Default: `false`. */
  indicator?: boolean;
  /** Indicator variant. Default: `'underline'`. */
  indicatorVariant?: NavigationMenuIndicatorVariant;

  /** The current page's URL — items self-compare against this to set `aria-current`. */
  activeHref?: string;
  /** Active matching strategy. Default: `'exact'`. */
  activeMatchStrategy?: NavigationMenuActiveMatchStrategy;

  /** Initial open dropdown id (uncontrolled). */
  defaultValue?: string;
  /** Controlled open dropdown id (or `null` for closed). */
  value?: string | null;
  /** Fires whenever the open dropdown id changes. */
  onValueChange?: (value: string | null) => void;

  /** Below this breakpoint the menu collapses (renders nothing). Default: undefined (always visible). */
  mobileBreakpoint?: NavigationMenuMobileBreakpoint;

  /** Override translations directly (skips `<I18nProvider>` lookup). */
  translations?: Partial<NavigationMenuTranslations>;

  /** Override the `<nav>` aria-label. Default: `translations.label` ("Main navigation" in en). */
  ariaLabel?: string;
  /** Override the `<nav>` aria-labelledby (in place of `ariaLabel`). */
  ariaLabelledBy?: string;

  className?: string;
  style?: CSSProperties;
  sx?: Sx | undefined;
}

/**
 * `<NavigationMenu.Item>` — wraps a single top-level entry. The Item registers
 * itself in the root's item registry so the keyboard handler / indicator can find
 * it in document order. The Item itself renders `<li role="none">`; the focusable
 * element is the child Trigger / Link.
 */
export interface NavigationMenuItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'children'> {
  children: ReactNode;
  /** Stable id. Auto-generated when omitted; required only when consumers want to control `value`. */
  value?: string;
  /** Disabled items are skipped by arrow-key navigation and visually muted. */
  disabled?: boolean;
}

/**
 * `<NavigationMenu.Trigger>` — focusable button that opens the dropdown panel.
 * Renders an inline chevron that rotates 180° when the panel is open.
 */
export interface NavigationMenuTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  /** Optional leading icon — same slot as Sidebar.Item's `icon`. */
  icon?: ReactNode;
  /**
   * When `true`, the consumer's child element becomes the trigger via Slot. Used
   * for advanced cases (e.g. wrapping the trigger in a `<Tooltip>`). Default: `false`.
   */
  asChild?: boolean;
  /** Hide the auto-rendered chevron. Default: `false`. */
  hideChevron?: boolean;
}

/**
 * `<NavigationMenu.Link>` — direct navigation link. No dropdown. Renders an `<a>`
 * by default; `asChild` lets routers (NextLink, RouterLink) take over while
 * keeping the styling + a11y attributes.
 */
export interface NavigationMenuLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  children: ReactNode;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Optional trailing description text — only renders inside mega-menus. */
  description?: ReactNode;
  /** Render the consumer's child element as the link via Slot. Default: `false`. */
  asChild?: boolean;
  /** Explicit active override. When omitted, falls back to `activeHref` matching. */
  active?: boolean;
}

/**
 * `<NavigationMenu.Content>` — the portalled dropdown panel attached to a Trigger.
 * Lives as a sibling of the Trigger inside an Item.
 */
export interface NavigationMenuContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  /** Panel layout. `'mega'` widens the panel and switches to a CSS grid. Default: `'default'`. */
  variant?: NavigationMenuContentVariant;
  /** Mega-menu column count. Default: `2`. */
  columns?: NavigationMenuColumns;
}

/**
 * `<NavigationMenu.Group>` — labeled grouping inside a mega-menu. Renders an `<h3>`
 * for the visible label and a `<ul>` for the links beneath it.
 */
export interface NavigationMenuGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  /** Visible label rendered as `<h3>`. */
  label?: ReactNode;
}

/**
 * `<NavigationMenu.Featured>` — promo / showcase slot inside a mega-menu. Renders
 * its children verbatim with no chrome — typically holds a `<Card>` or marketing
 * snippet.
 */
export type NavigationMenuFeaturedProps = HTMLAttributes<HTMLDivElement>;

/**
 * `<NavigationMenu.Indicator>` — optional. Auto-rendered when the root's
 * `indicator` prop is `true`; consumers rarely import this manually.
 */
export type NavigationMenuIndicatorProps = HTMLAttributes<HTMLDivElement>;
