import { Div, Typography } from '@apx-ui/ds';

import { brand } from './data';

/**
 * The Cadence wordmark — a filled primary tile with the initial, then the name. Shared by the
 * header, the mobile drawer and the footer, which would always change together.
 *
 * The tile is a `Div` with palette roles rather than an SVG asset: a logo file would not
 * re-skin when the theme changes, and this page's whole argument is that it does.
 */
export interface BrandMarkProps {
  /** `md` is the header lockup; `sm` steps it down for the mobile drawer title. */
  size?: 'sm' | 'md';
  /** Element to render as — `span` when it sits inside another interactive element. */
  as?: 'a' | 'span';
  /** Inverts the wordmark for the dark CTA band and footer. */
  onDark?: boolean;
}

const SIZES = {
  sm: { tile: 'h-7 w-7 text-sm', text: 'text-base' },
  md: { tile: 'h-9 w-9 text-base', text: 'text-lg' },
} as const;

export function BrandMark({ size = 'md', as = 'a', onDark = false }: BrandMarkProps) {
  const scale = SIZES[size];

  return (
    <Div
      as={as}
      {...(as === 'a' ? { href: '#top' } : {})}
      aria-label={brand.name}
      className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
    >
      <Div
        aria-hidden
        className={`grid place-items-center rounded-lg bg-primary font-semibold text-primary-contrast ${scale.tile}`}
      >
        {brand.name.charAt(0)}
      </Div>
      <Typography
        as="span"
        variant="h4"
        weight="bold"
        letterSpacing="tight"
        fontFamily="display"
        color={onDark ? 'primary.contrast' : undefined}
        className={scale.text}
      >
        {brand.name}
      </Typography>
    </Div>
  );
}
