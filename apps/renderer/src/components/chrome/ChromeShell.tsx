'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

import type { ComponentEntry } from '../../lib/discover';
import { Sidebar } from './Sidebar';

interface ChromeShellProps {
  components: Pick<ComponentEntry, 'slug' | 'meta'>[];
  children: ReactNode;
}

/**
 * Path prefixes that opt out of the renderer's docs chrome (sidebar + page TopBar).
 *
 * The template preview viewer renders a full website inside the document — letting
 * the renderer's sidebar push it into a column would defeat the point. The viewer
 * supplies its own floating toolbar with mode / variant / direction toggles plus a
 * back button, so the user never gets stranded.
 *
 * Add a new prefix here when introducing another full-bleed surface (e.g. a future
 * `/print/...` export view).
 */
const FULL_BLEED_PREFIXES = ['/templates/'];

function isFullBleed(pathname: string | null): boolean {
  if (!pathname) return false;
  return FULL_BLEED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function ChromeShell({ components, children }: ChromeShellProps) {
  const pathname = usePathname();

  if (isFullBleed(pathname)) {
    return <div className="min-h-screen bg-bg text-fg">{children}</div>;
  }

  return (
    <div className="grid min-h-screen grid-cols-[260px_minmax(0,1fr)] bg-bg text-fg">
      {/* `sticky top-0 h-screen` pins the sidebar to the viewport; `self-start` keeps the grid
          item from stretching to the full row height (which would defeat the sticky pin). The
          Sidebar component itself is `flex h-full flex-col` with an internally-scrolling
          `<nav>`, so a long component list scrolls inside the pinned column instead of
          pushing the column off-screen. */}
      <div className="sticky top-0 h-screen self-start">
        <Sidebar components={components} />
      </div>
      <div className="flex min-h-screen min-w-0 flex-col">{children}</div>
    </div>
  );
}