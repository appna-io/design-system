import { type ReactNode } from 'react';

import { discoverComponents } from '../../lib/discover';
import { Sidebar } from './Sidebar';

interface ChromeProps {
  children: ReactNode;
}

/**
 * Server component. Loads the component list once per request and hands a slim shape to the
 * client-side Sidebar. The pages themselves render their own TopBar so they can inject a
 * page-specific title (and any per-page controls).
 */
export async function Chrome({ children }: ChromeProps) {
  const components = await discoverComponents();
  const slim = components.map((c) => ({ slug: c.slug, meta: c.meta }));

  return (
    <div className="grid min-h-screen grid-cols-[260px_minmax(0,1fr)] bg-bg text-fg">
      {/* `sticky top-0 h-screen` pins the sidebar to the viewport; `self-start` keeps the grid
          item from stretching to the full row height (which would defeat the sticky pin). The
          Sidebar component itself is `flex h-full flex-col` with an internally-scrolling
          `<nav>`, so a long component list scrolls inside the pinned column instead of
          pushing the column off-screen. */}
      <div className="sticky top-0 h-screen self-start">
        <Sidebar components={slim} />
      </div>
      <div className="flex min-h-screen min-w-0 flex-col">{children}</div>
    </div>
  );
}
