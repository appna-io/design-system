'use client';

import { useState } from 'react';
import { Menu } from '@apx-ui/icons';
import { Button, Div, Drawer, Typography } from '@apx-ui/ds';

import { BrandMark } from '../BrandMark';
import { headerCta, navLinks } from '../data';

/**
 * Sticky, blurred header. Sticky positioning lives on the orchestrator's `<Inspectable>`
 * wrapper — a sticky child inside a wrapper that is exactly its own height can never move.
 *
 * The source collapsed to an inline disclosure `<nav>` below `md`. That is `Drawer`'s job in
 * the DS, and since [#2] it resolves `side="start"` against direction, so the panel opens from
 * the correct edge in both LTR and RTL — something the original could not do.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <Div
      as="header"
      className="border-b border-border/80 bg-bg/95 backdrop-blur-md"
    >
      <Div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <BrandMark size="md" />

        <Div as="nav" aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Typography
              key={link.href}
              actLike="a"
              href={link.href}
              variant="bodySmall"
              weight="medium"
              color="fg.muted"
              className="rounded-md transition hover:text-fg"
            >
              {link.label}
            </Typography>
          ))}
          <Button size="sm" asChild>
            <a href={headerCta.href}>{headerCta.label}</a>
          </Button>
        </Div>

        <Drawer open={open} onOpenChange={setOpen}>
          <Drawer.Trigger asChild>
            <Button
              variant="ghost"
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
                    color="fg.muted"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 transition hover:bg-bg-subtle hover:text-fg"
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
