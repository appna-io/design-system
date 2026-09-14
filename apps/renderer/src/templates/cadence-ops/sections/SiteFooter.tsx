import { Div, Divider, Typography } from '@apx-ui/ds';

import { BrandMark } from '../BrandMark';
import { brand, footer } from '../data';

/**
 * Four-column footer on the page's own surface rather than an inverted band — the CTA band
 * directly above it is already `primary`, and stacking two saturated bands would bury the
 * closing call to action under a second one.
 *
 * Columns come from `footer.columns` rather than being typed out, so adding a link group is a
 * data edit and the markup stays one map.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <Div as="footer" className="border-t border-border-subtle bg-bg-subtle">
      <Div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <Div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <Div>
            <BrandMark as="span" />
            <Typography
              variant="bodySmall"
              lineHeight="relaxed"
              color="foreground.muted"
              className="mt-4 block max-w-xs"
            >
              {footer.blurb}
            </Typography>
          </Div>

          {footer.columns.map((column) => (
            <Div as="nav" key={column.title} aria-label={column.title}>
              <FooterColumnTitle>{column.title}</FooterColumnTitle>
              <Div as="ul" className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <Div as="li" key={link.label}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </Div>
                ))}
              </Div>
            </Div>
          ))}

          <Div>
            <FooterColumnTitle>{footer.contact.title}</FooterColumnTitle>
            <Div as="ul" className="mt-4 flex flex-col gap-2.5">
              <Div as="li">
                <FooterLink href={`mailto:${footer.contact.email}`}>
                  {footer.contact.email}
                </FooterLink>
              </Div>
              <Div as="li">
                <FooterLink href={footer.contact.phone.href}>
                  {footer.contact.phone.label}
                </FooterLink>
              </Div>
            </Div>

            <Typography variant="caption" color="foreground.subtle" className="mt-4 block">
              {brand.tagline}
            </Typography>
          </Div>
        </Div>

        <Divider className="mt-12" />

        <Typography
          variant="caption"
          align="center"
          color="foreground.subtle"
          className="mt-6 block"
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
      variant="caption"
      weight="semibold"
      transform="upper"
      letterSpacing="wider"
      color="foreground.default"
    >
      {children}
    </Typography>
  );
}

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <Typography
      actLike="a"
      href={href}
      variant="bodySmall"
      color="foreground.muted"
      className="rounded-md transition hover:text-fg"
    >
      {children}
    </Typography>
  );
}
