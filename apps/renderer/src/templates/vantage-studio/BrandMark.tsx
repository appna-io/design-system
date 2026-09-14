import { Div, Typography } from '@apx-ui/ds';

import { brand } from './data';

/**
 * The wordmark, used by the header, the mobile drawer and the footer.
 *
 * The accent square is a palette role rather than a literal, so the studio's colour can be
 * changed once and the mark follows — the same reason the other templates keep their brand
 * furniture on tokens.
 */
export interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  as?: 'a' | 'span';
  onDark?: boolean;
}

const TEXT_SIZE = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
} as const;

const DOT_SIZE = {
  sm: 'size-2',
  md: 'size-2.5',
  lg: 'size-3',
} as const;

export function BrandMark({ size = 'md', as = 'a', onDark = false }: BrandMarkProps) {
  return (
    <Div
      as={as === 'a' ? undefined : 'span'}
      actLike={as === 'a' ? 'a' : undefined}
      href={as === 'a' ? '#top' : undefined}
      className="inline-flex items-center gap-2.5 no-underline"
      aria-label={as === 'a' ? `${brand.name} — home` : undefined}
    >
      <Div
        aria-hidden
        className={`${DOT_SIZE[size]} shrink-0 rounded-sm bg-primary`}
      />
      <Typography
        as="span"
        weight="semibold"
        letterSpacing="tight"
        fontFamily="display"
        color={onDark ? 'primary.contrast' : undefined}
        className={TEXT_SIZE[size]}
      >
        {brand.name}
      </Typography>
    </Div>
  );
}
