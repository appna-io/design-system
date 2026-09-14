'use client';

import { Div, TreeView, Typography } from '@apx-ui/ds';

import { brand, navTree } from '../content';

/**
 * The docs sidebar, as a real `TreeView` rather than a nested `<ul>` of links.
 *
 * This is the component the board said no marketing template touches, and the reason to use it
 * here is not novelty: a docs nav is a tree that needs roving-tabindex keyboard traversal, an
 * `aria-selected` current node, and expand/collapse that announces itself. Hand-rolling that from
 * `<a>` tags is how docs sites end up with a nav a screen-reader user cannot navigate.
 *
 * `selected` is driven by the shared scroll-spy, so the highlighted node is wherever the reader
 * actually is — not wherever they last clicked. Those diverge the moment anyone scrolls, and the
 * version that tracks the click is the one that lies.
 *
 * Groups are `selectable: false`: "Getting started" is a label, not a destination, and letting it
 * take selection would put the highlight on a node with nothing to show.
 */
export interface DocSidebarProps {
  activeId: string | null;
}

export function DocSidebar({ activeId }: DocSidebarProps) {
  return (
    <Div className="flex h-full flex-col gap-6 p-4">
      <Div>
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
          Documentation
        </Typography>
        <Typography as="span" variant="bodySmall" color="fg.subtle" fontFamily="display">
          {brand.version}
        </Typography>
      </Div>

      <TreeView
        aria-label="Documentation sections"
        data={navTree.map((group) => ({
          id: group.id,
          label: group.label,
          selectable: false,
          children: group.children.map((child) => ({ id: child.id, label: child.label })),
        }))}
        defaultExpanded={navTree.map((group) => group.id)}
        selected={activeId ?? ''}
        onSelect={(id) => {
          // The tree owns selection state; the document owns position. Clicking a node scrolls,
          // and the scroll-spy then sets `selected` — so the highlight is always a consequence of
          // where the reader is, never of what they clicked. `scroll-mt` on the heading handles
          // the sticky header.
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      />
    </Div>
  );
}
