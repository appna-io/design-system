'use client';

import { useMemo } from 'react';
import { AppShell, Div, Typography } from '@apx-ui/ds';

import { Inspectable } from '../../components/templates/inspector';

import { DocBody } from './sections/DocBody';
import { DocHeader } from './sections/DocHeader';
import { DocSidebar } from './sections/DocSidebar';
import { OnThisPage } from './sections/OnThisPage';
import { docSections, footer } from './content';
import { useActiveSection } from './useActiveSection';

/**
 * Orchestrator for the Halyard docs site.
 *
 * ## Why `AppShell` rather than a grid
 *
 * The three-column docs layout is the point of this lane, and the interesting part is not the
 * three columns — it is everything a hand-built grid quietly omits. `AppShell` supplies the sticky
 * header, the `<main>` landmark, and — the one that matters — **the sidebar collapsing into a
 * `Drawer` below `md`**, with the trigger, the focus trap and the escape handling already correct.
 * Every docs site that hand-rolls this ships a mobile nav that traps focus behind the overlay.
 *
 * This is also the first template to put `AppShell` and `TreeView` on a real page rather than in a
 * docs example, which was the board's argument for the lane: it shows the DS is more than a
 * landing-page kit.
 *
 * ## One position, three consumers
 *
 * `useActiveSection` runs **here**, not in the sidebar and not in the rail. Both of those take
 * `activeId` as a prop. Two observers would be two answers to "where is the reader", and they
 * diverge exactly when it is most visible — mid-scroll, with both rails on screen at once.
 *
 * ## Motion
 *
 * Deliberately the quietest template in the gallery: `fadeIn` on section entry, no travel, no
 * stagger, no parallax. See `DocBody`'s note — a reference page is read non-linearly and content
 * that moves while you scroll through it is content you cannot read. The board asked for the
 * template that proves the motion rules include knowing when not to move.
 */
export function Halyard() {
  // `docSections` is a module constant, so this never actually recomputes — but the hook takes an
  // array in its dependency list, and passing a fresh `.map()` each render would re-create the
  // IntersectionObserver on every commit.
  const ids = useMemo(() => docSections.map((section) => section.id), []);
  const activeId = useActiveSection(ids);

  return (
    <Div className="min-h-screen bg-bg text-fg">
      <AppShell
        headerVariant="bordered"
        sidebarWidth={264}
        asideWidth={240}
        header={
          <Inspectable id="doc-header" label="Header">
            <DocHeader />
          </Inspectable>
        }
        sidebar={
          <Inspectable id="doc-sidebar" label="Sidebar nav">
            <DocSidebar activeId={activeId} />
          </Inspectable>
        }
        aside={
          <Inspectable id="on-this-page" label="On this page">
            <OnThisPage activeId={activeId} />
          </Inspectable>
        }
        footer={
          <Inspectable id="doc-footer" label="Footer">
            <Div className="flex w-full flex-wrap items-center justify-between gap-4">
              <Div as="nav" aria-label="Footer" className="flex flex-wrap gap-4">
                {footer.links.map((link) => (
                  <Typography
                    key={link.href}
                    actLike="a"
                    href={link.href}
                    variant="bodySmall"
                    color="fg.muted"
                    className="transition hover:text-fg"
                  >
                    {link.label}
                  </Typography>
                ))}
              </Div>
              <Typography variant="bodySmall" color="fg.subtle" fontFamily="display">
                {footer.legal}
              </Typography>
            </Div>
          </Inspectable>
        }
      >
        <Inspectable id="doc-body" label="Documentation">
          <DocBody />
        </Inspectable>
      </AppShell>
    </Div>
  );
}
