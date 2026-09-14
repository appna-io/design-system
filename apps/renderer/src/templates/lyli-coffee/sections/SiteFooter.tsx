import { Div, Divider, Surface, Typography } from '@apx-ui/ds';

import { BrandMark } from '../BrandMark';
import { footer, footerLinks, socials } from '../data';

/**
 * Three-column espresso footer, on the same `<Surface tone="primary">` as the ValueProps and
 * Newsletter bands.
 *
 * It used to name `color="primary.contrast"` nine times and fake a muted step with `opacity-80`.
 * Both were the same workaround: `primary.contrast` is the *ink slot of the primary role*, and
 * using it to mean "the text colour on this dark band" only works because the band happens to be
 * primary — it breaks the moment the band changes, and it cannot express a muted step at all,
 * which is why the opacity was there. The tone provides `foreground.default` and
 * `foreground.muted` directly, so every one of them is now a plain token.
 *
 * The copyright year is computed at render, matching the source's `new Date().getFullYear()`.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <Surface as="footer" tone="primary" className="border-t border-border">
      <Div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <Div className="grid gap-10 md:grid-cols-3">
          <Div>
            <BrandMark as="span" />
            <Typography
              variant="bodySmall"
              lineHeight="relaxed"
              color="fg.muted"
              className="mt-3 max-w-xs"
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
                    color="fg.muted"
                    className="transition hover:text-fg"
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
                  color="fg.muted"
                  className="transition hover:text-fg"
                >
                  {footer.email}
                </Typography>
              </Div>
              <Typography
                as="li"
                variant="bodySmall"
                color="fg.muted"
              >
                {footer.hours}
              </Typography>
              <Typography
                as="li"
                variant="bodySmall"
                color="fg.muted"
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
                  color="fg.muted"
                  className="transition hover:text-fg"
                >
                  {social.label}
                </Typography>
              ))}
            </Div>
          </Div>
        </Div>

        <Divider className="mt-10" />

        <Typography
          variant="caption"
          align="center"
          color="fg.muted"
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
      variant="bodySmall"
      weight="semibold"
      transform="upper"
      letterSpacing="wider"
    >
      {children}
    </Typography>
  );
}
