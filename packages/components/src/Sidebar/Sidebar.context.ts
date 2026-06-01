import { createContext, useContext } from 'react';

import type { SidebarContextValue } from './Sidebar.types';

/**
 * React Context shared between the Sidebar root and every subpart. Subparts read this for the
 * `collapsed` (rail mode), `size`, `itemSize`, `activeHref`, and `activeMatchStrategy` values,
 * which avoids prop-drilling through every nested `<Sidebar.Section>` / `<Sidebar.Item>`.
 *
 * `null` is the sentinel meaning "not inside a Sidebar". Subparts throw a descriptive error in
 * dev to flag misuse early; we don't try to make subparts work standalone since they have no
 * semantic meaning outside the `<nav aria-label>` landmark.
 */
export const SidebarContext = createContext<SidebarContextValue | null>(null);

/**
 * Hook for subparts that REQUIRE the Sidebar context. Throws on misuse so consumers get a
 * clear error instead of a silent `null` dereference. Matches the Card / Tabs / Toolbar pattern.
 */
export function useSidebarContext(componentName: string): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (ctx === null) {
    throw new Error(
      `${componentName} must be used inside <Sidebar>. ` +
        'Wrap your sidebar tree in <Sidebar> so subparts can read collapsed / size / activeHref state.',
    );
  }
  return ctx;
}

/**
 * Hook for subparts that OPTIONALLY consume the Sidebar context. Returns `null` outside a
 * Sidebar. Used by helpers that want to gracefully degrade (e.g. `Sidebar.Item` rendered inside
 * a `Sidebar.SubItems` doesn't need to throw — the SubItems wrapper already enforces context).
 */
export function useOptionalSidebarContext(): SidebarContextValue | null {
  return useContext(SidebarContext);
}