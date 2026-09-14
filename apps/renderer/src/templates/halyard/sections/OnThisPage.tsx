'use client';

import { Div, Typography } from '@apx-ui/ds';

import { docSections } from '../content';

/**
 * The third column. Same `docSections` list as the sidebar and the same `activeId` — the two rails
 * cannot disagree because there is nothing for them to disagree about.
 *
 * A plain `<nav>` of anchors rather than a second `TreeView`: this list is flat, has no expand
 * state, and its whole job is to be glanceable. A tree here would add roving-tabindex semantics to
 * something that is correctly just a list of links.
 *
 * The active marker is a border on the link, not a background — the rail sits at the edge of the
 * viewport where a filled highlight reads as a scrollbar.
 */
export interface OnThisPageProps {
  activeId: string | null;
}

export function OnThisPage({ activeId }: OnThisPageProps) {
  return (
    <Div as="nav" aria-label="On this page" className="p-4">
      <Typography
        as="span"
        variant="bodySmall"
        weight="semibold"
        fontFamily="display"
        color="fg.subtle"
        transform="upper"
        letterSpacing="wider"
        className="block"
      >
        On this page
      </Typography>

      <Div as="ul" className="mt-4 flex flex-col gap-0.5 border-s border-border-subtle">
        {docSections.map((section) => {
          const active = section.id === activeId;
          return (
            <Div as="li" key={section.id}>
              <Typography
                actLike="a"
                href={`#${section.id}`}
                variant="bodySmall"
                weight={active ? 'semibold' : undefined}
                color={active ? 'primary.main' : 'fg.muted'}
                // `aria-current="location"` is the correct value for "this is where you are in the
                // document" — `page` would be a lie, since every entry is the same page.
                {...(active ? { 'aria-current': 'location' as const } : {})}
                className={`-ms-px block border-s-2 py-1.5 ps-3 transition hover:text-fg ${
                  active ? 'border-primary' : 'border-transparent'
                }`}
              >
                {section.label}
              </Typography>
            </Div>
          );
        })}
      </Div>
    </Div>
  );
}
