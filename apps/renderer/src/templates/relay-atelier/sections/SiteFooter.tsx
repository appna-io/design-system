import { Div, Typography } from '@apx-ui/ds';

import { brand, footer } from '../content';

/** A rule, four links and a line of legal. Nothing else earns a footer on a page this quiet. */
export function SiteFooter() {
  return (
    <Div as="footer" className="border-t border-border-subtle">
      <Div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Div as="nav" aria-label="Footer" className="flex flex-wrap gap-6">
          {footer.links.map((link) => (
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
        </Div>

        <Div className="flex flex-wrap items-center gap-6">
          <Typography variant="bodySmall" color="fg.subtle">
            {brand.tagline}
          </Typography>
          <Typography variant="bodySmall" color="fg.subtle">
            {footer.legal}
          </Typography>
        </Div>
      </Div>
    </Div>
  );
}
