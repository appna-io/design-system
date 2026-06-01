'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { cn } from '../primitives/cn';

/**
 * Fixed top-of-viewport progress bar that animates from 0 → ~90% as soon as the user clicks an
 * internal link, then snaps to 100% and fades out once the new pathname has rendered. It's a
 * dependency-free NProgress-style indicator scoped to the renderer's needs.
 *
 * We listen for clicks at the document level (capture phase) instead of wrapping `<Link>` because
 * the renderer has links in many places (sidebar, top bar, in-content) and we want all of them to
 * trigger the bar without per-call wiring.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  // Hide the bar whenever the pathname actually updates — that's the signal navigation completed.
  useEffect(() => {
    if (!pending) return;
    // Small delay so the 100% state is visually perceptible before the fade-out.
    const t = window.setTimeout(() => setPending(false), 180);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally re-runs only on pathname change
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      // Respect modifier keys and middle-click — those open in a new tab/window.
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;
      // External / hash / non-http schemes are not Next route changes.
      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('//') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) {
        return;
      }
      if (anchor.target && anchor.target !== '_self') return;
      // Reload-suppressing modifier on Next's <Link> — if it's preventing default, bail.
      if (anchor.hasAttribute('download')) return;

      // Strip query/hash to compare paths only — clicking the same page with an anchor link
      // shouldn't trigger the bar.
      const nextPath = href.split('?')[0]?.split('#')[0] ?? href;
      if (nextPath === pathname) return;

      setPending(true);
    }

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [pathname]);

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-primary shadow-[0_0_8px_var(--sds-palette-primary-main)]',
        // While pending, slide from 0 → 90% over ~12s (the "still loading" curve). On completion
        // the `pending` flip flushes the element and the snap-to-100 happens via the brief
        // delayed cleanup in the effect above.
        pending
          ? 'animate-[route-progress_12s_cubic-bezier(0.1,0.9,0.2,1)_forwards] opacity-100'
          : 'scale-x-0 opacity-0 transition-opacity duration-300',
      )}
    />
  );
}