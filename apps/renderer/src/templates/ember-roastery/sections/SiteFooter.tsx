import { Coffee } from 'lucide-react';
import { Div, Typography } from '@apx-ui/ds';

import { cafeMeta, footerLinks } from '../data';

export function SiteFooter() {
  return (
    <Div as="footer">
      <Div className="mx-auto w-full max-w-6xl px-6 py-16">
        <Div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.5fr_repeat(4,1fr)]">
          <Div>
            <Div className="flex items-center gap-2 font-semibold tracking-tight">
              <Div
                as="span"
                aria-hidden
                className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-contrast"
              >
                <Coffee size={16} />
              </Div>
              <Typography as="span" variant="body" weight="semibold">
                {cafeMeta.brand}
              </Typography>
            </Div>
            <Typography variant="bodySmall" color="fg.muted" className="mt-4 max-w-xs">
              A neighbourhood roastery for people who like to look at their coffee as much as they
              like to drink it.
            </Typography>
          </Div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <Div key={heading}>
              <Typography
                as="h3"
                variant="caption"
                weight="semibold"
                transform="upper"
                letterSpacing="wider"
                color="fg.muted"
              >
                {heading}
              </Typography>
              <Div as="ul" className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <Div as="li" key={link}>
                    <Typography
                      actLike="a"
                      href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                      variant="bodySmall"
                      color="fg.muted"
                      className="transition hover:text-fg"
                    >
                      {link}
                    </Typography>
                  </Div>
                ))}
              </Div>
            </Div>
          ))}
        </Div>

        <Div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <Typography variant="caption" color="fg.muted">
            © 2026 {cafeMeta.brand} Roastery. All rights reserved.
          </Typography>
          <Div className="flex items-center gap-3">
            <Typography
              actLike="a"
              href="#visit"
              variant="caption"
              color="fg.muted"
              className="hover:text-fg"
            >
              Visit us
            </Typography>
            <Typography as="span" variant="caption" color="fg.muted" aria-hidden>
              ·
            </Typography>
            <Typography
              actLike="a"
              href="#menu"
              variant="caption"
              color="fg.muted"
              className="hover:text-fg"
            >
              Menu
            </Typography>
          </Div>
        </Div>
      </Div>
    </Div>
  );
}
