import { Avatar, Card, Div, Typography } from '@apx-ui/ds';

import { testimonials } from '../data';

export function Testimonials() {
  return (
    <Div as="section" id="customers" className="border-b border-border bg-bg-subtle/40">
      <Div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Div className="mx-auto max-w-2xl text-center">
          <Typography variant="overline" color="primary" weight="semibold">
            What teams say
          </Typography>
          <Typography
            variant="h2"
            weight="semibold"
            letterSpacing="tight"
            className="mt-3 text-3xl sm:text-4xl"
          >
            Loved by builders on every continent
          </Typography>
        </Div>

        <Div className="mt-12 grid gap-5 lg:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.author} variant="solid" size="lg" className="h-full">
              <Card.Body className="flex h-full flex-col gap-6">
                <Typography variant="body" lineHeight="relaxed">
                  &ldquo;{t.quote}&rdquo;
                </Typography>
                <Div className="mt-auto flex items-center gap-3">
                  <Avatar size="sm" name={t.author} />
                  <Div className="min-w-0">
                    <Typography variant="bodySmall" weight="medium" truncate>
                      {t.author}
                    </Typography>
                    <Typography variant="caption" color="fg.muted" truncate>
                      {t.role}
                    </Typography>
                  </Div>
                </Div>
              </Card.Body>
            </Card>
          ))}
        </Div>
      </Div>
    </Div>
  );
}