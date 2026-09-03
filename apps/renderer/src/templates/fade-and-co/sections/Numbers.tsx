import { Div, Rating, Stat, Typography } from '@apx-ui/ds';

import { ratingSummary, stats } from '../data';

/**
 * Slim credibility band between the hero and the menu.
 *
 * `Stat` is used in its compound form purely so the number can carry `font-display` — the
 * shorthand `value` prop renders through the recipe's own type scale, and a page whose whole
 * identity is the heavy display face cannot have its four biggest numbers set in the body face.
 * Everything else (scale, rhythm, muted caption) still comes from the recipe.
 *
 * The fourth cell is hand-assembled because it is a rating, not a statistic: a read-only
 * `Rating` at `precision="exact"` paints 4.9 as four-and-most-of-a-star rather than rounding up
 * to five, which is the honest rendering of an average. It mirrors `Stat`'s label / value /
 * caption order and value size so all four cells sit on the same baselines.
 */
const VALUE_CLASS = 'font-display text-4xl';

export function Numbers() {
  return (
    <Div as="section" className="border-b border-border bg-bg-subtle">
      <Div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {stats.map((item) => (
          <Stat key={item.label} variant="minimal" size="lg">
            <Stat.Label>{item.label}</Stat.Label>
            <Stat.Value className={VALUE_CLASS}>{item.value}</Stat.Value>
            <Stat.Caption>{item.caption}</Stat.Caption>
          </Stat>
        ))}

        <Div>
          <Typography variant="bodySmall" color="foreground.muted" className="block">
            {ratingSummary.label}
          </Typography>

          <Div className="mt-1 flex items-center gap-3">
            <Typography as="span" weight="semibold" letterSpacing="tight" className={VALUE_CLASS}>
              {ratingSummary.value.toFixed(1)}
            </Typography>
            <Rating
              value={ratingSummary.value}
              precision="exact"
              readOnly
              color="warning"
              ariaLabel={`${ratingSummary.value} out of 5`}
            />
          </Div>

          <Typography variant="bodySmall" color="foreground.muted" className="mt-1 block">
            {ratingSummary.caption}
          </Typography>
        </Div>
      </Div>
    </Div>
  );
}
