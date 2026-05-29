'use client';

import type { CSSProperties, ReactNode } from 'react';

import { ratingRecipes } from './Rating.recipe';
import type { RatingColor, RatingSize } from './Rating.types';

export interface RatingStarProps {
  /** Star position, 1-based (purely for `data-star`). */
  position: number;
  /** Fill fraction `0..1`. The empty layer is always painted; the filled layer is clipped. */
  fill: number;
  size: RatingSize;
  color: RatingColor;
  iconFilled: ReactNode;
  iconEmpty: ReactNode;
  /** Document direction — drives which side `clip-path` shrinks from. */
  dir: 'ltr' | 'rtl';
}

/**
 * One star in the rating row. Renders two layered glyphs:
 *
 *   <empty glyph>            ← always painted, in the "border" color
 *   <filled glyph>           ← clipped from the trailing edge so only `fill * 100%` is visible
 *
 * The clip is `inset(0 X% 0 0)` in LTR and `inset(0 0 0 X%)` in RTL — the filled layer always
 * grows from the leading edge regardless of direction, matching the user's reading order.
 *
 * Pure visual; carries `aria-hidden="true"` so screen readers only see the root slider's
 * `aria-valuetext`. `data-star` + `data-fill` attributes are exposed for tests + theming.
 */
export function RatingStar(props: RatingStarProps) {
  const { position, fill, size, color, iconFilled, iconEmpty, dir } = props;

  const clipPercent = Math.round((1 - fill) * 1000) / 10;
  const clipStyle: CSSProperties =
    dir === 'rtl'
      ? { clipPath: `inset(0 0 0 ${clipPercent}%)` }
      : { clipPath: `inset(0 ${clipPercent}% 0 0)` };

  return (
    <span
      aria-hidden="true"
      data-star={position}
      data-fill={fill}
      className={ratingRecipes.star({ size })}
    >
      <span className={ratingRecipes.starEmpty()}>{iconEmpty}</span>
      <span className={ratingRecipes.starFilled({ color })} style={clipStyle}>
        {iconFilled}
      </span>
    </span>
  );
}
