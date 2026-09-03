import { Award, Clock, Scissors } from '@apx-ui/icons';
import { Card, Div, Surface, Typography } from '@apx-ui/ds';

import { SectionHeading } from '../SectionHeading';
import { craftPoints, craftSection, type CraftIcon } from '../data';

/**
 * The dark ink band, as a `Surface tone="inverted"`.
 *
 * It used to paint itself with the `primary` role and hand every descendant a
 * `color="primary.contrast"`, because the DS had no way to say "this band is dark". Surface says
 * it at the token layer instead: the heading, the card, the divider hairline and the muted
 * description all read the tokens they always read, and those tokens now resolve inverted. That
 * deleted six colour props and an `opacity-70` from this file and, more importantly, freed the
 * `primary` role to mean "the brand's ink" rather than doubling as "dark ground".
 *
 * `Scissors` was the one glyph `@apx-ui/icons` was missing for this template and was added to
 * the set for it, the way `Zap` was added for the coffee port.
 */
const ICONS: Record<CraftIcon, typeof Scissors> = {
  scissors: Scissors,
  clock: Clock,
  award: Award,
};

export function Craft() {
  return (
    <Surface as="section" tone="inverted" className="py-20 lg:py-28">
      <Div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={craftSection.eyebrow}
          title={craftSection.title}
          body={craftSection.body}
          align="center"
        />

        <Div as="ul" className="mt-14 grid gap-px overflow-hidden bg-border md:grid-cols-3">
          {craftPoints.map((point) => {
            const Icon = ICONS[point.icon];
            return (
              <Div as="li" key={point.title}>
                <Card variant="ghost" shape="square" size="lg" className="h-full bg-bg">
                  <Card.Body>
                    <Div className="text-secondary-main">
                      <Icon size={28} />
                    </Div>
                    <Typography
                      as="h3"
                      variant="h4"
                      weight="semibold"
                      fontFamily="display"
                      transform="upper"
                      letterSpacing="wide"
                      className="mt-6 text-lg"
                    >
                      {point.title}
                    </Typography>
                    <Typography
                      variant="bodySmall"
                      lineHeight="relaxed"
                      color="foreground.muted"
                      className="mt-3"
                    >
                      {point.description}
                    </Typography>
                  </Card.Body>
                </Card>
              </Div>
            );
          })}
        </Div>
      </Div>
    </Surface>
  );
}
