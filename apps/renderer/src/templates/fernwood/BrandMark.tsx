import { Leaf } from '@apx-ui/icons';
import { Div, Typography } from '@apx-ui/ds';

import { brand } from './content';

/**
 * Wordmark for the header, the mobile drawer and the footer.
 *
 * The leaf sits in the `primary` role rather than a literal green, so the mark follows a palette
 * edit like everything else on the page. It is the only place the accent appears in the header —
 * this template's whole art direction is that the accent is rare.
 */
export interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  as?: 'a' | 'span';
}

const TEXT = { sm: 'text-base', md: 'text-lg', lg: 'text-xl' } as const;
const GLYPH = { sm: 15, md: 17, lg: 20 } as const;

export function BrandMark({ size = 'md', as = 'a' }: BrandMarkProps) {
  const isLink = as === 'a';

  return (
    <Div
      as={isLink ? undefined : 'span'}
      actLike={isLink ? 'a' : undefined}
      href={isLink ? '#top' : undefined}
      className="inline-flex items-center gap-2 no-underline"
      aria-label={isLink ? `${brand.name} — home` : undefined}
    >
      <Div aria-hidden className="shrink-0 text-primary">
        <Leaf size={GLYPH[size]} />
      </Div>
      <Typography
        as="span"
        weight="semibold"
        letterSpacing="tight"
        fontFamily="display"
        className={TEXT[size]}
      >
        {brand.name}
      </Typography>
    </Div>
  );
}
