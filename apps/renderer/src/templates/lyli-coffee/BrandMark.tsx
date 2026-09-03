import { Div, Typography } from '@apx-ui/ds';

import { brand } from './data';

/**
 * The `Beans.` wordmark — the full stop is set in the roast accent, which is the one piece of
 * brand styling the source repeats in both the header and the footer. Shared here rather than
 * duplicated in each section, since the two would always change together.
 *
 * Rendered in the display face; see `TemplateMeta.theme` for why headings carry the stack at
 * the call site rather than through a token.
 */
export interface BrandMarkProps {
  /** `md` is the header's 2xl wordmark; `sm` steps it down for the mobile drawer title. */
  size?: 'sm' | 'md';
  /** Element to render as — `span` when it sits inside another interactive element. */
  as?: 'a' | 'span';
}

const SIZES = { sm: 'text-xl', md: 'text-2xl' } as const;

export function BrandMark({ size = 'md', as = 'a' }: BrandMarkProps) {
  return (
    <Div
      as={as}
      {...(as === 'a' ? { href: '/' } : {})}
      className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
    >
      <Typography as="span" variant="h3" weight="bold" fontFamily="display" className={SIZES[size]}>
        {brand.name}
        <Typography as="span" color="secondary" fontFamily="inherit">
          {brand.punctuation}
        </Typography>
      </Typography>
    </Div>
  );
}
