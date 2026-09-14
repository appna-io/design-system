'use client';

import { useState } from 'react';
import { Menu } from '@apx-ui/icons';
import { Button, Div, Drawer, Typography } from '@apx-ui/ds';

import { brand, nav } from '../content';

/**
 * The header is a wordmark, three links and a rule. No background, no blur, no shadow — it sits
 * directly on the paper and scrolls away with it.
 *
 * That is the one genuinely unusual decision here and it is deliberate: every other template in
 * the gallery has a sticky header, and a studio site whose chrome follows you down the page is a
 * studio site that does not trust its work to hold you. The nav is three links; you can get back
 * to the top.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <Div as="header" className="border-b border-border-subtle">
      <Div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Typography
          actLike="a"
          href="#top"
          as="span"
          variant="h4"
          weight="medium"
          fontFamily="display"
          letterSpacing="tight"
          className="text-xl"
        >
          {brand.name}
          <Typography
            as="span"
            variant="h4"
            color="fg.subtle"
            fontFamily="display"
            className="text-xl"
          >
            {' '}
            {brand.suffix}
          </Typography>
        </Typography>

        <Div as="nav" aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {nav.links.map((link) => (
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
          <Button size="sm" variant="outline" color="neutral" asChild>
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
          <Drawer.Content side="end" className="w-72">
            <Drawer.Body>
              <Div as="nav" aria-label="Main navigation" className="flex flex-col gap-2 pt-6">
                {[...nav.links, nav.cta].map((link) => (
                  <Typography
                    key={link.href}
                    actLike="a"
                    href={link.href}
                    variant="h4"
                    fontFamily="display"
                    onClick={() => setOpen(false)}
                    className="py-1.5 text-2xl"
                  >
                    {link.label}
                  </Typography>
                ))}
              </Div>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer>
      </Div>
    </Div>
  );
}
