import { Card, Div, SectionHeading, Typography } from '@apx-ui/ds';

import { Stars } from '../Stars';
import { reviews, reviewsSection } from '../content';

/**
 * Reviews, attributed to the specific product each one is about — which is the only kind of
 * storefront review worth printing, and the reason `detail` is a field rather than decoration.
 *
 * `Card variant="outline"` rather than a filled tile: the page's surfaces are already doing the
 * separating (paper / subtle / paper), and a third fill here would flatten that rhythm.
 */
export function Reviews() {
  return (
    <Div as="section" className="border-y border-border-subtle bg-bg-subtle">
      <Div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading intro={reviewsSection} align="center" />

        <Div
          as="ul"
          stagger={0.09}
          staggerDelay={0.08}
          animateOnView={{ amount: 0.15 }}
          className="mt-14 grid list-none grid-cols-1 gap-6 p-0 lg:grid-cols-3"
        >
          {reviews.map((review) => (
            <Div as="li" key={review.id} animation="riseIn" animationDuration="slower">
              <Card variant="outline" size="lg" className="h-full bg-bg-paper">
                <Card.Body>
                  <Stars rating={review.rating} size={15} />
                  <Typography
                    as="blockquote"
                    variant="body"
                    lineHeight="relaxed"
                    className="mt-4"
                  >
                    &ldquo;{review.quote}&rdquo;
                  </Typography>
                </Card.Body>
                <Card.Footer>
                  <Div>
                    <Typography variant="bodySmall" weight="medium">
                      {review.name}
                    </Typography>
                    <Typography variant="caption" color="fg.subtle">
                      {review.detail}
                    </Typography>
                  </Div>
                </Card.Footer>
              </Card>
            </Div>
          ))}
        </Div>
      </Div>
    </Div>
  );
}
