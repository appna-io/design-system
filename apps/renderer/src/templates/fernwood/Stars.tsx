import { Star } from '@apx-ui/icons';
import { Div } from '@apx-ui/ds';

/**
 * A five-star rating readout, used by the product cards and the review cards.
 *
 * Shared at the template root because two sections need it — the same reason `BrandMark` and
 * `SectionHeading` live here. It is not in the DS because `Rating` already is; this is the
 * *static display* case, and `Rating` is an input. Reaching for an interactive control to render a
 * read-only number would be the "patch around it" failure in the other direction.
 *
 * The visible stars are `aria-hidden` and the real value is announced once as text, so a screen
 * reader hears "rated 4.9 out of 5" rather than five separate star glyphs.
 */
export interface StarsProps {
  rating: number;
  size?: number;
}

export function Stars({ rating, size = 14 }: StarsProps) {
  const filled = Math.round(rating);

  return (
    <Div className="inline-flex items-center gap-0.5">
      <Div aria-hidden className="flex items-center gap-0.5 text-primary">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} size={size} fill={i < filled ? 'currentColor' : 'none'} />
        ))}
      </Div>
      <span className="sr-only">{`Rated ${rating} out of 5`}</span>
    </Div>
  );
}
