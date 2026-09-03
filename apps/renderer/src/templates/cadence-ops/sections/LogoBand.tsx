import { Div, Typography } from '@apx-ui/ds';

import { logos } from '../data';

/**
 * The trust strip. Set as wordmarks in the display face rather than image logos — every company
 * on this page is invented (see `data.ts`), and rendering fake brands as polished SVGs would
 * dress an illustration up as an endorsement.
 *
 * It also keeps the band honest under theming: type re-skins with the palette, a logo file
 * would not.
 */
export function LogoBand() {
  return (
    <Div as="section" className="border-y border-border-subtle bg-bg-subtle">
      <Div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Typography
          variant="caption"
          weight="semibold"
          transform="upper"
          letterSpacing="wider"
          color="foreground.subtle"
          align="center"
          className="block"
        >
          {logos.title}
        </Typography>

        <Div as="ul" className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {logos.companies.map((company) => (
            <Typography
              as="li"
              key={company}
              variant="body"
              weight="semibold"
              letterSpacing="tight"
              fontFamily="display"
              color="foreground.muted"
              className="opacity-70"
            >
              {company}
            </Typography>
          ))}
        </Div>
      </Div>
    </Div>
  );
}
