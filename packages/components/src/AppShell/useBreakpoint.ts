'use client';

import { useMediaQuery } from '@apx-ui/engine';

import type { AppShellBreakpoint } from './AppShell.types';

/**
 * Tailwind-native breakpoint values in pixels. The DS hasn't centralized this table yet
 * (the engine ships `RESPONSIVE_BREAKPOINTS` keys but no pixel mapping), so we mirror the
 * Tailwind defaults here. When the centralized table lands, this helper becomes a thin
 * read-from-token wrapper without changing the public API.
 *
 * **Component-local on purpose.** Per @SDS-Leader's Phase 51 guardrail, no engine writes —
 * `useBreakpoint` lives in `src/AppShell/` until a second consumer (NavigationMenu Phase 52,
 * Sidebar Phase 53) signals they need it. At that point the API gets posted to the room and
 * extracted in a dedicated pass.
 */
const BREAKPOINT_PX: Record<AppShellBreakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

/**
 * Returns `true` when the viewport is **below** the given breakpoint. Used by AppShell to
 * detect mobile mode and swap the sidebar for a `<Drawer>` — the inverse of Tailwind's
 * mobile-first `md:` prefix (which fires when viewport is `>=` the breakpoint).
 *
 * SSR-safe: `useMediaQuery` returns `false` until the client mounts, so the initial render
 * always treats the viewport as desktop. This avoids a flash of mobile chrome on first paint
 * for SSR'd pages — consumers who want SSR mobile detection should use a UA-sniffing
 * server-side hint and pass `sidebarMobileOpen` controlled from there.
 */
export function useBreakpointBelow(breakpoint: AppShellBreakpoint): boolean {
  // `max-width: (px - 0.02px)` is the standard Bootstrap / Tailwind boundary trick that
  // avoids a 1px dead zone at the exact breakpoint value. Without the 0.02 offset, a viewport
  // of exactly 768px would match both `max-width: 768px` and `min-width: 768px`.
  const px = BREAKPOINT_PX[breakpoint];
  return useMediaQuery(`(max-width: ${px - 0.02}px)`);
}

/**
 * Pure resolver — given a viewport width, returns whether it's below the breakpoint. Exposed
 * so unit tests can exercise the boundary logic without a `matchMedia` polyfill.
 */
export function isBelowBreakpoint(
  viewportWidth: number,
  breakpoint: AppShellBreakpoint,
): boolean {
  const px = BREAKPOINT_PX[breakpoint];
  return viewportWidth < px;
}

/** Exposed for tests + future extraction. */
export { BREAKPOINT_PX };
