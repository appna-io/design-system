import { Div, Divider, Typography } from '@apx-ui/ds';

import { BrandMark } from '../BrandMark';
import { brand, footer } from '../data';

/**
 * Footer. Deliberately quiet — the CTA band directly above it is doing the asking, so this is
 * reference material rather than a second pitch.
 *
 * The columns come from `data.ts` as a list, so adding one is a content edit and the grid
 * absorbs it.
 */
export function SiteFooter() {
  const year = 2026;

  return (
    <Div as="footer" className="bg-bg">
      <Div className="mx-auto w-full max-w-[1600px] px-5 py-16 sm:px-8 lg:px-12">
        <Div className="grid gap-12 lg:grid-cols-12">
          <Div className="lg:col-span-5">
            <BrandMark size="lg" as="span" />
            <Typography
              variant="bodySmall"
              color="fg.subtle"
              lineHeight="relaxed"
              className="mt-5 max-w-sm"
            >
              {footer.blurb}
            </Typography>
            <Typography
              actLike="a"
              href={`mailto:${footer.email}`}
              variant="body"
              weight="medium"
              className="mt-6 inline-block underline decoration-primary decoration-2 underline-offset-4 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              {footer.email}
            </Typography>
          </Div>

          {footer.columns.map((column) => (
            <Div key={column.title} className="lg:col-span-2">
              <Typography
                variant="overline"
                weight="medium"
                color="fg.subtle"
                transform="upper"
                letterSpacing="wider"
                className="text-xs"
              >
                {column.title}
              </Typography>
              <Div as="ul" className="mt-4 flex list-none flex-col gap-2.5 p-0">
                {column.links.map((link) => (
                  <Div as="li" key={link.href}>
                    <Typography
                      actLike="a"
                      href={link.href}
                      variant="bodySmall"
                      color="fg.muted"
                      className="transition hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      {link.label}
                    </Typography>
                  </Div>
                ))}
              </Div>
            </Div>
          ))}

          <Div className="lg:col-span-3">
            <Typography
              variant="overline"
              weight="medium"
              color="fg.subtle"
              transform="upper"
              letterSpacing="wider"
              className="text-xs"
            >
              Studio
            </Typography>
            <Div className="mt-4">
              {footer.address.map((line) => (
                <Typography key={line} variant="bodySmall" color="fg.muted">
                  {line}
                </Typography>
              ))}
            </Div>
            <Div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
              {footer.social.map((link) => (
                <Typography
                  key={link.href}
                  actLike="a"
                  href={link.href}
                  variant="bodySmall"
                  color="fg.muted"
                  className="transition hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  {link.label}
                </Typography>
              ))}
            </Div>
          </Div>
        </Div>

        <Divider decorative className="my-10" />

        <Div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Typography variant="caption" color="fg.subtle">
            © {year} {brand.legalName}
          </Typography>
          <Typography variant="caption" color="fg.subtle">
            {brand.tagline}
          </Typography>
        </Div>
      </Div>
    </Div>
  );
}
