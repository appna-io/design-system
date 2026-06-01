import { createContext, useContext } from 'react';

import type { NavigationMenuContextValue } from './NavigationMenu.types';

/**
 * React Context shared between the NavigationMenu root and every subpart. Subparts
 * (Item / Trigger / Link / Content / Group / Featured / Indicator) read this for
 * the `openItemId`, `focusedItemId`, indicator config, and item-registry helpers,
 * which avoids prop-drilling through every nested element.
 *
 * `null` is the sentinel meaning "not inside a NavigationMenu". Subparts throw a
 * descriptive error in dev to flag misuse early; we don't try to make subparts
 * work standalone since they have no semantic meaning outside the labeled `<nav>`
 * landmark.
 */
export const NavigationMenuContext = createContext<NavigationMenuContextValue | null>(null);

/**
 * Hook for subparts that REQUIRE the NavigationMenu context. Throws on misuse so
 * consumers get a clear error instead of a silent `null` dereference. Matches the
 * Sidebar / Tabs / Toolbar pattern exactly.
 */
export function useNavigationMenuContext(componentName: string): NavigationMenuContextValue {
  const ctx = useContext(NavigationMenuContext);
  if (ctx === null) {
    throw new Error(
      `${componentName} must be used inside <NavigationMenu>. ` +
        'Wrap your menu tree in <NavigationMenu> so subparts can read open / focused / activeHref state.',
    );
  }
  return ctx;
}

/**
 * Hook for subparts that OPTIONALLY consume the NavigationMenu context. Returns
 * `null` outside a NavigationMenu. Used by helpers (e.g. test fixtures) that want
 * to gracefully degrade.
 */
export function useOptionalNavigationMenuContext(): NavigationMenuContextValue | null {
  return useContext(NavigationMenuContext);
}

/**
 * Per-Item context. Items publish their own id + content-id so descendant Trigger /
 * Content subparts can register against the parent Item without prop-threading.
 * Same pattern Tabs uses for `<Tabs.Trigger value>` ↔ `<Tabs.Panel value>` pairing,
 * adapted here so consumers don't have to repeat the id at every nesting level.
 */
export interface NavigationMenuItemContextValue {
  /** Stable item id used to look up the registered record. */
  itemId: string;
  /** Whether this Item is disabled — Trigger / Link skip activation when true. */
  disabled: boolean;
  /** Trigger DOM id (for `aria-controls` ↔ `aria-labelledby` pairing with Content). */
  triggerId: string;
  /** Content DOM id (mirror of the above). */
  contentId: string;
  /**
   * Item-scoped ref — Trigger and Link both register against this so the root's
   * `getOrderedItems()` snapshot gives the keyboard handler a usable DOM node to
   * `focus()`. The Item itself is `<li role="none">` and not focusable.
   */
  setItemNode: (node: HTMLElement | null) => void;
}

export const NavigationMenuItemContext = createContext<NavigationMenuItemContextValue | null>(null);

/**
 * Hook for descendants of `<NavigationMenu.Item>`. Trigger / Link / Content all
 * require an Item ancestor — the throw message points consumers at the correct
 * nesting.
 */
export function useNavigationMenuItemContext(componentName: string): NavigationMenuItemContextValue {
  const ctx = useContext(NavigationMenuItemContext);
  if (ctx === null) {
    throw new Error(
      `${componentName} must be used inside <NavigationMenu.Item>. ` +
        'Each top-level entry in the menu must be wrapped in <NavigationMenu.Item>.',
    );
  }
  return ctx;
}

/**
 * Marker context published by `<NavigationMenu.Content>` so Link / Group / etc.
 * descendants know they're rendered inside a panel rather than directly under
 * an Item. Top-level Links pull double duty (focusable for the menubar +
 * navigation target); panel Links are simpler — pure anchors with active-state.
 *
 * The value carries the parent Item's id so a panel link can read which Item
 * "owns" it (used by the close-on-link-click behavior).
 */
export interface NavigationMenuContentScope {
  /** The id of the Item whose panel this Link sits inside. */
  itemId: string;
  /**
   * Panel layout. Mega-menus use a richer hierarchy (h3 headings, columns,
   * featured slot) that doesn't fit the W3C menu pattern's required-children
   * contract. Links inside a mega-menu drop their `role="menuitem"` so axe's
   * `aria-required-parent` rule passes.
   */
  variant: 'default' | 'mega';
}

export const NavigationMenuContentItemContext = createContext<NavigationMenuContentScope | null>(
  null,
);