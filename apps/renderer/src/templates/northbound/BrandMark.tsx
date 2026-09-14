import { Div, Typography } from '@apx-ui/ds';

/**
 * A square mark and a wordmark. The square is the compass rose reduced to its one useful part —
 * the north point — drawn as a rotated half-square rather than an icon, so it inherits type
 * colour and needs no asset.
 *
 * No `onDark` / `onBrand` prop: `text-fg` and `bg-primary` both resolve correctly on every band
 * this template has, because every band is a `<Surface>`. The mark reads as ink on paper, paper
 * on ink, and contrast on brand, from the same two class names.
 */
export interface BrandMarkProps {
  size?: 'sm' | 'md';
  as?: 'a' | 'div';
}

const WORD_SIZE = { sm: 'text-lg', md: 'text-xl' } as const;
const GLYPH_SIZE = { sm: 'h-6 w-6', md: 'h-7 w-7' } as const;

export function BrandMark({ size = 'md', as = 'a' }: BrandMarkProps) {
  return (
    <Div
      as={as}
      {...(as === 'a' ? { href: '#top', 'aria-label': 'Northbound — back to top' } : {})}
      className="inline-flex items-center gap-2.5"
    >
      <Div
        aria-hidden
        className={`${GLYPH_SIZE[size]} shrink-0 bg-primary`}
        style={{ clipPath: 'polygon(50% 0%, 100% 100%, 50% 72%, 0% 100%)' }}
      />
      <Typography
        as="span"
        variant="h4"
        weight="bold"
        fontFamily="display"
        letterSpacing="tight"
        className={WORD_SIZE[size]}
      >
        Northbound
      </Typography>
    </Div>
  );
}
