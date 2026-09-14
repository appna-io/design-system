'use client';

import { useState } from 'react';
import { Menu } from '@apx-ui/icons';
import { Button, Div, Drawer, NavigationMenu, Typography } from '@apx-ui/ds';

import { BrandMark } from '../BrandMark';
import { brand, nav } from '../content';

/**
 * Sticky header. Sticky positioning lives on the orchestrator's `<Inspectable>` wrapper — a
 * sticky child inside a wrapper that is exactly its own height can never move.
 *
 * The date sits in the header rather than only in the hero, because a conference page is read in
 * two modes: "what is this" and "when is it, again". The second reader is scrolled halfway down
 * the agenda, where the hero is long gone.
 *
 * The drawer's links need no focus styling of their own — `Typography` renders a real anchor and
 * brings its own ring since #7. They shipped without one here, which is what prompted that fix.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <Div as="header" className="border-b-2 border-fg bg-bg/90 backdrop-blur-xl">
      <Div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <BrandMark size="md" />

        <Div className="hidden md:block">
          <NavigationMenu aria-label="Main navigation">
            {nav.links.map((link) => (
              <NavigationMenu.Item key={link.href}>
                <NavigationMenu.Link href={link.href}>{link.label}</NavigationMenu.Link>
              </NavigationMenu.Item>
            ))}
          </NavigationMenu>
        </Div>

        <Div className="hidden items-center gap-4 md:flex">
          <Typography
            variant="bodySmall"
            weight="semibold"
            color="fg.muted"
            className="tabular-nums"
          >
            {brand.dateLabel} · {brand.cityLabel}
          </Typography>
          <Button size="sm" asChild>
            <a href={nav.cta.href}>{nav.cta.label}</a>
          </Button>
        </Div>

        <Drawer open={open} onOpenChange={setOpen}>
          <Drawer.Trigger asChild>
            <Button
              variant="ghost"
              color="neutral"
              size="sm"
              iconOnly
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="md:hidden"
            >
              <Menu size={22} />
            </Button>
          </Drawer.Trigger>
          <Drawer.Content side="start" className="w-72">
            <Drawer.Header>
              <BrandMark size="sm" as="div" />
            </Drawer.Header>
            <Drawer.Body>
              <Div as="nav" aria-label="Main navigation" className="flex flex-col gap-1">
                {nav.links.map((link) => (
                  <Typography
                    key={link.href}
                    actLike="a"
                    href={link.href}
                    variant="body"
                    weight="semibold"
                    onClick={() => setOpen(false)}
                    className="rounded-sm px-2 py-2.5 transition hover:bg-bg-subtle"
                  >
                    {link.label}
                  </Typography>
                ))}
              </Div>
            </Drawer.Body>
            <Drawer.Footer>
              <Button fullWidth asChild>
                <a href={nav.cta.href} onClick={() => setOpen(false)}>
                  {nav.cta.label}
                </a>
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer>
      </Div>
    </Div>
  );
}
