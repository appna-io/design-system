import { Div, Divider, Typography } from '@apx-ui/ds';

import { BrandMark } from '../BrandMark';
import { footer, footerLinks, socials } from '../data';

/**
 * Three-column espresso footer. Like the ValueProps band it inverts the palette rather than
 * naming colours: the surface is `primary` and the type is `primary.contrast`.
 *
 * The copyright year is computed at render, matching the source's `new Date().getFullYear()`.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <Div as="footer" className="border-t border-border bg-primary text-primary-contrast">
      <Div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <Div className="grid gap-10 md:grid-cols-3">
          <Div>
            <BrandMark as="span" />
            <Typography
              variant="bodySmall"
              lineHeight="relaxed"
              color="primary.contrast"
              className="mt-3 max-w-xs opacity-80"
            >
              {footer.blurb}
            </Typography>
          </Div>

          <Div as="nav" aria-label="Footer navigation">
            <FooterColumnTitle>{footer.exploreTitle}</FooterColumnTitle>
            <Div as="ul" className="mt-4 flex flex-col gap-2">
              {footerLinks.map((link) => (
                <Div as="li" key={link.href}>
                  <Typography
                    actLike="a"
                    href={link.href}
                    variant="bodySmall"
                    color="primary.contrast"
                    className="opacity-80 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-contrast"
                  >
                    {link.label}
                  </Typography>
                </Div>
              ))}
            </Div>
          </Div>

          <Div>
            <FooterColumnTitle>{footer.contactTitle}</FooterColumnTitle>
            <Div as="ul" className="mt-4 flex flex-col gap-2">
              <Div as="li">
                <Typography
                  actLike="a"
                  href={`mailto:${footer.email}`}
                  variant="bodySmall"
                  color="primary.contrast"
                  className="opacity-80 transition hover:opacity-100"
                >
                  {footer.email}
                </Typography>
              </Div>
              <Typography
                as="li"
                variant="bodySmall"
                color="primary.contrast"
                className="opacity-80"
              >
                {footer.hours}
              </Typography>
              <Typography
                as="li"
                variant="bodySmall"
                color="primary.contrast"
                className="opacity-80"
              >
                {footer.location}
              </Typography>
            </Div>

            <Div className="mt-4 flex gap-4">
              {socials.map((social) => (
                <Typography
                  key={social.name}
                  actLike="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  variant="bodySmall"
                  color="primary.contrast"
                  className="opacity-80 transition hover:opacity-100"
                >
                  {social.label}
                </Typography>
              ))}
            </Div>
          </Div>
        </Div>

        <Divider className="mt-10 bg-primary-border" />

        <Typography
          variant="caption"
          align="center"
          color="primary.contrast"
          className="mt-6 block opacity-60"
        >
          {footer.copyright(year)}
        </Typography>
      </Div>
    </Div>
  );
}

function FooterColumnTitle({ children }: { children: string }) {
  return (
    <Typography
      as="h3"
      variant="bodySmall"
      weight="semibold"
      transform="upper"
      letterSpacing="wider"
      color="primary.contrast"
    >
      {children}
    </Typography>
  );
}
