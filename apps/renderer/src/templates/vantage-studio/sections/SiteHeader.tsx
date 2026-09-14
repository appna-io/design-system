'use client';

import { useState } from 'react';
import { Menu } from '@apx-ui/icons';
import { Button, Div, Drawer, NavigationMenu, Typography } from '@apx-ui/ds';

import { BrandMark } from '../BrandMark';
import { headerCta, navLinks } from '../data';

/**
 * Sticky, blurred header. Sticky positioning lives on the orchestrator's `<Inspectable>` wrapper
 * — a sticky child inside a wrapper that is exactly its own height can never move.
 *
 * No border. The other two marketing templates rule the header off from the page; this one lets
 * the blur do it, because a hairline across a full-bleed black hero reads as a seam.
 *
 * Below `md` it hands over to `Drawer` with `side="start"`, which resolves against direction so
 * the panel opens from the correct edge in RTL.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <Div as="header" className="bg-bg/70 backdrop-blur-xl">
      <Div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-6 px-5 sm:px-8 lg:h-20 lg:px-12">
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

        <Div className="hidden md:block">
          <Button size="sm" asChild>
            <a href={headerCta.href}>{headerCta.label}</a>
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
                    variant="h4"
                    weight="medium"
                    fontFamily="display"
                    color="foreground.muted"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-2xl transition hover:bg-bg-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {link.label}
                  </Typography>
                ))}
              </Div>
            </Drawer.Body>
            <Drawer.Footer>
              <Button fullWidth onClick={() => setOpen(false)} asChild>
                <a href={headerCta.href}>{headerCta.label}</a>
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer>
      </Div>
    </Div>
  );
}
