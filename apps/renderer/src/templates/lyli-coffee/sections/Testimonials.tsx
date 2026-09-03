import { Card, Div, Typography } from '@apx-ui/ds';

import { SectionHeading } from '../SectionHeading';
import { testimonials, testimonialsSection } from '../data';

/**
 * Three quote cards. The DS has no `Quote` primitive, and it does not need one — the semantics
 * live in the elements, so `Typography` renders the real `<blockquote>` / `<cite>` the source
 * used and `Card` supplies the surface.
 *
 * `not-italic` on the `<cite>` matches the source: the browser default italicises `<cite>`, and
 * the design does not want that.
 */
export function Testimonials() {
  return (
    <Div as="section" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        title={testimonialsSection.title}
        body={testimonialsSection.body}
        align="center"
      />

      <Div as="ul" className="mt-12 grid gap-8 md:grid-cols-3">
        {testimonials.map((item) => (
          <Div as="li" key={item.name}>
            <Card variant="outline" shape="pill" size="lg" className="h-full bg-bg-paper shadow-md">
              <Card.Body>
                <Typography as="blockquote">
                  <Typography variant="body" color="fg.muted" lineHeight="relaxed">
                    &ldquo;{item.quote}&rdquo;
                  </Typography>
                  <Div as="footer" className="mt-6">
                    <Typography as="cite" className="not-italic">
                      <Typography as="span" variant="body" weight="semibold">
                        {item.name}
                      </Typography>
                      <Typography as="span" variant="bodySmall" color="fg.subtle" display="block">
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
