import { Div, Typography } from '@apx-ui/ds';

import { brand } from './data';

/**
 * The `FADE & CO.` wordmark. The ampersand carries the brass accent — the one piece of brand
 * styling the header, the drawer and the footer all repeat, so it lives here rather than being
 * re-typed in three sections that would always change together.
 *
 * Set in the display face, uppercase, on wide tracking: the whole identity is squared-off, and
 * the wordmark is where that reads first.
 *
 * It carries no on-dark variant. The footer sits inside a `Surface tone="inverted"`, so the
 * default `text-fg` is already the right colour there — an `onDark` prop would be a second way
 * to say what the surface has already said.
 */
export interface BrandMarkProps {
  /** `md` is the header lockup; `sm` steps it down for the mobile drawer title. */
  size?: 'sm' | 'md';
  /** Element to render as — `span` when it sits inside another interactive element. */
  as?: 'a' | 'span';
}

const SIZES = { sm: 'text-lg', md: 'text-xl' } as const;

export function BrandMark({ size = 'md', as = 'a' }: BrandMarkProps) {
  return (
    <Div
      as={as}
      {...(as === 'a' ? { href: '#top' } : {})}
      className="inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
    >
      <Typography
        size="h4"
        weight="bold"
        fontFamily="display"
        transform="upper"
        letterSpacing="wider"
        className={SIZES[size]}
      >
        {brand.name}{' '}
        <Typography as="span" color="secondary.main" fontFamily="inherit">
          {brand.connector}
        </Typography>{' '}
        {brand.suffix}
      </Typography>
    </Div>
  );
}
