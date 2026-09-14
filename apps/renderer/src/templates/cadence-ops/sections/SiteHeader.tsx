'use client';

import { useState } from 'react';
import { Menu } from '@apx-ui/icons';
import { Button, Div, Drawer, NavigationMenu, Typography } from '@apx-ui/ds';

import { BrandMark } from '../BrandMark';
import { headerCtas, navLinks } from '../data';

/**
 * Sticky, blurred header. Sticky positioning lives on the orchestrator's `<Inspectable>`
 * wrapper — a sticky child inside a wrapper that is exactly its own height can never move.
 *
 * This is the first template to put `NavigationMenu` on a real page rather than a docs example,
 * which is the point: it was one of the four components fixed in #7, and a marketing header is
 * where its link styling, active state and keyboard behaviour actually get exercised.
 *
 * Below `md` it hands over to `Drawer` — same pattern as the other two templates, and since #2
 * `side="start"` resolves against direction so the panel opens from the correct edge in RTL.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <Div as="header" className="border-b border-border-subtle bg-bg/80 backdrop-blur-xl">
      <Div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:h-18 lg:px-8">
        <BrandMark size="md" />

        <Div className="hidden md:block">
          <NavigationMenu aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavigationMenu.Item key={link.href}>
                <NavigationMenu.Link href={link.href}>{link.label}</NavigationMenu.Link>
              </NavigationMenu.Item>
            ))}
          </NavigationMenu>
        </Div>

        <Div className="hidden items-center gap-2 md:flex">
          <Button size="sm" variant="ghost" color="neutral" asChild>
            <a href={headerCtas.secondary.href}>{headerCtas.secondary.label}</a>
          </Button>
          <Button size="sm" asChild>
            <a href={headerCtas.primary.href}>{headerCtas.primary.label}</a>
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
          <Drawer.Content side="start" size="sm">
            <Drawer.Close />
            <Drawer.Header title={<BrandMark size="sm" as="span" />} />
            <Drawer.Body>
              <Div as="nav" aria-label="Mobile navigation" className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Typography
                    key={link.href}
                    actLike="a"
                    href={link.href}
                    variant="body"
                    weight="medium"
                    color="foreground.muted"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 transition hover:bg-bg-subtle hover:text-fg"
                  >
                    {link.label}
                  </Typography>
                ))}
              </Div>
            </Drawer.Body>
            <Drawer.Footer>
              <Div className="flex w-full flex-col gap-2">
                <Button fullWidth onClick={() => setOpen(false)} asChild>
                  <a href={headerCtas.primary.href}>{headerCtas.primary.label}</a>
                </Button>
                <Button fullWidth variant="outline" color="neutral" asChild>
                  <a href={headerCtas.secondary.href}>{headerCtas.secondary.label}</a>
                </Button>
              </Div>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer>
      </Div>
    </Div>
  );
}
