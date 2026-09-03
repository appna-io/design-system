import { Card, Div, Typography } from '@apx-ui/ds';

import { SectionHeading } from '../SectionHeading';
import { process, steps } from '../data';

/**
 * Three numbered steps on the cream band. The oversized step number is set in the display face
 * at `border` weight — the source used `text-cream-200`, which is the border token, so it reads
 * as a ghosted numeral rather than a second heading.
 *
 * `<ol>` is preserved from the source: these are ordered steps, and the numbering is meaning,
 * not decoration.
 */
export function Process() {
  return (
    <Div as="section" className="bg-bg-subtle py-16 lg:py-24">
      <Div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={process.title} body={process.body} align="center" />

        <Div as="ol" className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <Div as="li" key={item.step}>
              <Card variant="solid" shape="pill" size="lg" className="h-full bg-bg-paper shadow-md">
                <Card.Body>
                  <Typography
                    as="span"
                    variant="display"
                    weight="bold"
                    fontFamily="display"
                    color="border.default"
                    className="text-4xl"
                  >
                    {item.step}
                  </Typography>
                  <Typography
                    as="h3"
                    variant="h4"
                    weight="semibold"
                    fontFamily="display"
                    className="mt-2 text-xl"
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="bodySmall"
                    color="fg.muted"
                    lineHeight="relaxed"
                    className="mt-2"
                  >
                    {item.description}
                  </Typography>
                </Card.Body>
              </Card>
            </Div>
          ))}
        </Div>
      </Div>
    </Div>
  );
}
