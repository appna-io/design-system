'use client';

import { useState } from 'react';
import { Menu, Search, ShoppingBag } from '@apx-ui/icons';
import { Badge, Button, Div, Drawer, NavigationMenu, Typography } from '@apx-ui/ds';

import { BrandMark } from '../BrandMark';
import { announcement, nav } from '../content';

/**
 * Announcement strip + sticky header.
 *
 * Sticky positioning lives on the orchestrator's `<Inspectable>` wrapper — a sticky child inside a
 * wrapper that is exactly its own height can never move.
 *
 * The cart is the storefront's one persistent affordance, so it carries a count `Badge` and is the
 * only control in the header with a filled treatment. Everything else is ghost: the accent is
 * rare on this template by design, and a header full of green would spend it before the page
 * starts.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <Div as="header">
      <Div className="bg-primary py-2 text-center">
        <Typography variant="caption" color="primary.contrast" className="px-4">
          {announcement}
        </Typography>
      </Div>

      <Div className="border-b border-border-subtle bg-bg/85 backdrop-blur-xl">
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

          <Div className="flex items-center gap-1">
            <Button variant="ghost" color="neutral" size="sm" iconOnly aria-label="Search">
              <Search size={19} />
            </Button>

            <Div className="relative">
              <Button variant="ghost" color="neutral" size="sm" iconOnly aria-label="Cart, 2 items">
                <ShoppingBag size={19} />
              </Button>
              <Badge
                color="primary"
                shape="pill"
                size="sm"
                aria-hidden
                className="pointer-events-none absolute -end-1 -top-1 min-w-4 justify-center px-1 text-[10px]"
              >
                2
              </Badge>
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
                  <Menu size={20} />
                </Button>
              </Drawer.Trigger>
              <Drawer.Content side="start" size="sm">
                <Drawer.Close />
                <Drawer.Header title={<BrandMark size="sm" as="span" />} />
                <Drawer.Body>
                  <Div as="nav" aria-label="Mobile navigation" className="flex flex-col gap-1">
                    {nav.links.map((link) => (
                      <Typography
                        key={link.href}
                        actLike="a"
                        href={link.href}
                        size="h4"
                        weight="medium"
                        fontFamily="display"
                        onClick={() => setOpen(false)}
                        className="rounded-xl px-3 py-2.5 text-xl transition hover:bg-bg-subtle"
                      >
                        {link.label}
                      </Typography>
                    ))}
                  </Div>
                </Drawer.Body>
                <Drawer.Footer>
                  <Button fullWidth onClick={() => setOpen(false)} asChild>
                    <a href={nav.cta.href}>{nav.cta.label}</a>
                  </Button>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer>
          </Div>
        </Div>
      </Div>
    </Div>
  );
}
