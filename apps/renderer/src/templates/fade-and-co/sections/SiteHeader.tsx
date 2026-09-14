'use client';

import { useState } from 'react';
import { Menu, Phone } from '@apx-ui/icons';
import { Button, Div, Drawer, Typography } from '@apx-ui/ds';

import { BrandMark } from '../BrandMark';
import { headerCta, headerPhone, navLinks } from '../data';

/**
 * Sticky, blurred header. Sticky positioning lives on the orchestrator's `<Inspectable>`
 * wrapper — a sticky child inside a wrapper that is exactly its own height can never move.
 *
 * The phone number is a header-level action here rather than footer-only: for a shop this is
 * the highest-intent link on the page, so it sits next to the booking CTA on `lg` and collapses
 * into the drawer footer below it.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <Div as="header" className="border-b border-border bg-bg/90 backdrop-blur-md">
      <Div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <BrandMark size="md" />

        <Div as="nav" aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Typography
              key={link.href}
              actLike="a"
              href={link.href}
              variant="bodySmall"
              weight="semibold"
              transform="upper"
              letterSpacing="wider"
              color="foreground.muted"
              className="rounded-sm transition hover:text-fg"
            >
              {link.label}
            </Typography>
          ))}

          <Typography
            actLike="a"
            href={headerPhone.href}
            variant="bodySmall"
            weight="semibold"
            color="foreground.default"
            className="hidden items-center gap-2 rounded-sm transition hover:text-secondary lg:inline-flex"
          >
            <Phone size={16} />
            {headerPhone.label}
          </Typography>

          <Button size="sm" color="secondary" asChild>
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
                    weight="semibold"
                    transform="upper"
                    letterSpacing="wide"
                    color="foreground.muted"
                    onClick={() => setOpen(false)}
                    className="rounded-sm px-3 py-2 transition hover:bg-bg-subtle hover:text-fg"
                  >
                    {link.label}
                  </Typography>
                ))}
              </Div>
            </Drawer.Body>
            <Drawer.Footer>
              <Div className="flex w-full flex-col gap-2">
                <Button fullWidth color="secondary" onClick={() => setOpen(false)} asChild>
                  <a href={headerCta.href}>{headerCta.label}</a>
                </Button>
                <Button fullWidth variant="outline" color="neutral" asChild>
                  <a href={headerPhone.href}>{headerPhone.label}</a>
                </Button>
              </Div>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer>
      </Div>
    </Div>
  );
}
