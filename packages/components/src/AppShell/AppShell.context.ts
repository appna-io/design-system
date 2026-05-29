'use client';

import { createContext, useContext } from 'react';

import type { AppShellContextValue } from './AppShell.types';

/**
 * Context for the AppShell root → header / sidebar / aside consumers. Header components in
 * particular need to read `isSidebarCollapsed` / `isMobile` and call `toggleSidebar()` to wire
 * up the hamburger button — this context is the integration point.
 */
export const AppShellContext = createContext<AppShellContextValue | null>(null);

/**
 * Public hook. Throws when called outside an `<AppShell>` because every header / sidebar
 * consumer needs a real root context to do anything meaningful — silently returning a stub
 * would mask the misconfiguration until the toggle button mysteriously failed to work.
 *
 * The throwing variant is preferred over an optional-context fallback here because AppShell
 * is a top-level surface (one per page) — there's no "render outside" use case worth catering
 * to.
 */
export function useAppShell(): AppShellContextValue {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error(
      '[useAppShell] must be called inside an <AppShell>. Wrap your header / sidebar in an AppShell root.',
    );
  }
  return ctx;
}

/** Optional reader used by internal subparts that should no-op outside an AppShell. */
export function useOptionalAppShell(): AppShellContextValue | null {
  return useContext(AppShellContext);
}
