import { ArrowRight, Sparkles } from 'lucide-react';
import { Button, Div, Typography } from '@apx-ui/ds';

import { navLinks, productMeta } from '../data';

export function SiteHeader() {
  return (
    <Div
      as="header"
      className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur"
    >
      <Div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-6">
        <Div
          as="a"
          href="#top"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <Div
            as="span"
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-contrast"
          >
            <Sparkles size={16} />
          </Div>
          <Typography as="span" variant="body" weight="semibold">
            {productMeta.brand}
          </Typography>
        </Div>

        <Div as="nav" aria-label="Primary" className="hidden gap-1 md:flex">
          {navLinks.map((link) => (
            <Typography
              key={link.href}
              actLike="a"
              href={link.href}
              variant="bodySmall"
              weight="medium"
              color="fg.muted"
              className="rounded-md px-3 py-2 transition hover:bg-neutral-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {link.label}
            </Typography>
          ))}
        </Div>

        <Div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
          <Button size="sm" rightIcon={<ArrowRight size={14} />}>
            Get started
          </Button>
        </Div>
      </Div>
    </Div>
  );
}