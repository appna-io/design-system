import { Card, Div, Rating, Typography } from '@apx-ui/ds';

import { SectionHeading } from '../SectionHeading';
import { testimonials, testimonialsSection } from '../data';

/**
 * Three quote cards. The DS has no `Quote` primitive and does not need one — the semantics live
 * in the elements, so `Typography` renders real `<blockquote>` / `<cite>` and `Card` supplies
 * the surface.
 *
 * Each card carries its own read-only `Rating` rather than repeating the shop average from the
 * numbers band: this is the individual score that quote was left with.
 */
export function Testimonials() {
  return (
    <Div as="section" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <SectionHeading
        eyebrow={testimonialsSection.eyebrow}
        title={testimonialsSection.title}
        align="center"
      />

      <Div as="ul" className="mt-12 grid gap-8 md:grid-cols-3">
        {testimonials.map((item) => (
          <Div as="li" key={item.name}>
            <Card variant="outline" shape="square" size="lg" className="h-full bg-bg-paper">
              <Card.Body>
                <Rating
                  value={item.rating}
                  readOnly
                  size="sm"
                  color="warning"
                  ariaLabel={`Rated ${item.rating} out of 5`}
                />

                <Typography as="blockquote" className="mt-5">
                  <Typography variant="body" color="foreground.muted" lineHeight="relaxed">
                    &ldquo;{item.quote}&rdquo;
                  </Typography>
                  <Div as="footer" className="mt-6">
                    <Typography as="cite" className="not-italic">
                      <Typography as="span" variant="body" weight="semibold">
                        {item.name}
                      </Typography>
                      <Typography
                        as="span"
                        variant="caption"
                        color="foreground.subtle"
                        transform="upper"
                        letterSpacing="wider"
                        display="block"
                        className="mt-1"
                      >
                        {item.role}
                      </Typography>
                    </Typography>
                  </Div>
                </Typography>
              </Card.Body>
            </Card>
          </Div>
        ))}
      </Div>
    </Div>
  );
}
