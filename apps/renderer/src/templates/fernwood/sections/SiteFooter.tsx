import { Div, Divider, Typography } from '@apx-ui/ds';

import { BrandMark } from '../BrandMark';
import { brand, footer } from '../content';

/**
 * Footer. Quiet by design — the newsletter band directly above is doing the asking, so this is
 * reference material rather than a second pitch.
 *
 * Columns come from content as a list, so adding one is a content edit and the grid absorbs it.
 */
export function SiteFooter() {
  const year = 2026;

  return (
    <Div as="footer" className="bg-bg">
      <Div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Div className="grid gap-10 lg:grid-cols-12">
          <Div className="lg:col-span-4">
            <BrandMark size="lg" as="span" />
            <Typography
              variant="bodySmall"
              color="fg.muted"
              lineHeight="relaxed"
              className="mt-4 max-w-xs"
            >
              {footer.blurb}
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
                      className="transition hover:text-fg"
                    >
                      {link.label}
                    </Typography>
                  </Div>
                ))}
              </Div>
            </Div>
          ))}

          <Div className="lg:col-span-2">
            <Typography
              variant="overline"
              weight="medium"
              color="fg.subtle"
              transform="upper"
              letterSpacing="wider"
              className="text-xs"
            >
              Follow
            </Typography>
            <Div as="ul" className="mt-4 flex list-none flex-col gap-2.5 p-0">
              {footer.social.map((link) => (
                <Div as="li" key={link.href}>
                  <Typography
                    actLike="a"
                    href={link.href}
                    variant="bodySmall"
                    color="fg.muted"
                    className="transition hover:text-fg"
                  >
                    {link.label}
                  </Typography>
                </Div>
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
