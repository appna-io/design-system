import { Avatar, Card, Div, Typography } from '@apx-ui/ds';

import { reviews } from '../data';

export function Reviews() {
  return (
    <Div as="section" className="border-b border-border">
      <Div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Div className="mx-auto max-w-2xl text-center">
          <Typography variant="overline" color="primary" weight="semibold">
            From the regulars
          </Typography>
          <Typography
            variant="h2"
            weight="semibold"
            letterSpacing="tight"
            className="mt-3 text-3xl sm:text-4xl"
          >
            People come back for the cup
          </Typography>
        </Div>

        <Div className="mt-12 grid gap-5 lg:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.author} variant="solid" size="lg" className="h-full">
              <Card.Body className="flex h-full flex-col gap-6">
                <Typography variant="body" lineHeight="relaxed">
                  &ldquo;{review.quote}&rdquo;
                </Typography>
                <Div className="mt-auto flex items-center gap-3">
                  <Avatar size="sm" name={review.author} />
                  <Div className="min-w-0">
                    <Typography variant="bodySmall" weight="medium" truncate>
                      {review.author}
                    </Typography>
                    <Typography variant="caption" color="fg.muted" truncate>
                      {review.role}
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
