import { Div, Divider, Surface, Typography } from '@apx-ui/ds';

import { BrandMark } from '../BrandMark';
import { contact, footer, footerLinks, hours, socials } from '../data';

/**
 * Three-column ink footer, on the same `Surface tone="inverted"` as the craft band.
 *
 * Every `color="primary.contrast"` and hand-tuned `opacity-*` in here is gone: muted footer
 * links are `foreground.muted` and the copyright is `foreground.subtle`, the same tokens they
 * would use on a light footer. The band being dark is now the Surface's job, not each node's.
 *
 * Today's hours are repeated here from the visit section on purpose — the footer is where a
 * returning customer looks for "are they open", and it is the same `hours` array, not a second
 * copy of the times.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <Surface as="footer" tone="inverted">
      <Div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <Div className="grid gap-10 md:grid-cols-3">
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

          <Div as="nav" aria-label="Footer navigation">
            <FooterColumnTitle>{footer.exploreTitle}</FooterColumnTitle>
            <Div as="ul" className="mt-4 flex flex-col gap-2">
              {footerLinks.map((link) => (
                <Div as="li" key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </Div>
              ))}
            </Div>
          </Div>

          <Div>
            <FooterColumnTitle>{footer.visitTitle}</FooterColumnTitle>
            <Div as="ul" className="mt-4 flex flex-col gap-2">
              <Div as="li">
                <FooterLink href={contact.phone.href}>{contact.phone.label}</FooterLink>
              </Div>
              <Div as="li">
                <FooterLink href={`mailto:${contact.email}`}>{contact.email}</FooterLink>
              </Div>
              {hours.map((row) => (
                <Typography as="li" key={row.days} variant="bodySmall" color="foreground.muted">
                  {row.days} · {row.time}
                </Typography>
              ))}
            </Div>

            <Div className="mt-5 flex gap-4">
              {socials.map((social) => (
                <Typography
                  key={social.name}
                  actLike="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  variant="bodySmall"
                  weight="semibold"
                  color="foreground.muted"
                  className="transition hover:text-fg"
                >
                  {social.label}
                </Typography>
              ))}
            </Div>
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
    </Surface>
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
      color="secondary.main"
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
      className="transition hover:text-fg"
    >
      {children}
    </Typography>
  );
}
