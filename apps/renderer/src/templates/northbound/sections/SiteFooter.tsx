import { Mail } from '@apx-ui/icons';
import { Div, Typography } from '@apx-ui/ds';

import { BrandMark } from '../BrandMark';
import { brand, footer } from '../content';

/**
 * Quiet close on the default ground. After two brand bands and an inverted one, a third coloured
 * footer would leave the page with no resting point at all.
 *
 * The links carry a hover treatment and nothing else. The focus ring used to live here — and in a
 * shared const, after it turned out the header had forgotten one — but `Typography` ships its own
 * now (#7), so the stand-in is deleted rather than left to drift out of step with the DS default.
 */
const LINK = 'transition hover:text-fg';

export function SiteFooter() {
  return (
    <Div as="footer" className="border-t-2 border-fg">
      <Div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <Div className="max-w-sm">
            <BrandMark size="md" as="div" />
            <Typography variant="body" color="fg.muted" className="mt-4 block">
              {brand.tagline}
            </Typography>
            <Typography
              actLike="a"
              href={footer.email.href}
              variant="body"
              weight="semibold"
              className={`mt-5 inline-flex items-center gap-2 ${LINK}`}
            >
              <Mail size={16} aria-hidden />
              {footer.email.label}
            </Typography>
          </Div>

          <Div as="nav" aria-label="Footer" className="flex flex-col gap-3">
            {footer.links.map((link) => (
              <Typography
                key={link.href}
                actLike="a"
                href={link.href}
                variant="body"
                color="fg.muted"
                className={LINK}
              >
                {link.label}
              </Typography>
            ))}
          </Div>
        </Div>

        <Div className="mt-14 flex flex-col gap-3 border-t border-border-subtle pt-8 sm:flex-row sm:items-center sm:justify-between">
          <Typography variant="bodySmall" color="fg.subtle">
            {footer.legal}
          </Typography>
          <Typography variant="bodySmall" color="fg.subtle" className="tabular-nums">
            {brand.dateLabel} · {brand.cityLabel}
          </Typography>
        </Div>
      </Div>
    </Div>
  );
}
