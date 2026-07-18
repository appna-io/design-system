import { Coffee, Snowflake } from 'lucide-react';
import { Badge, Card, Div, Typography } from '@apx-ui/ds';

import { menu, type Drink } from '../data';

const TEMP_META: Record<Drink['temp'], { label: string; color: 'warning' | 'info'; Icon: typeof Coffee }> = {
  hot: { label: 'Hot', color: 'warning', Icon: Coffee },
  iced: { label: 'Iced', color: 'info', Icon: Snowflake },
};

export function MenuShowcase() {
  return (
    <Div as="section" id="menu" className="border-b border-border">
      <Div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Div className="mx-auto max-w-2xl text-center">
          <Typography variant="overline" color="primary" weight="semibold">
            The menu
          </Typography>
          <Typography
            variant="h2"
            weight="semibold"
            letterSpacing="tight"
            className="mt-3 text-3xl sm:text-4xl"
          >
            See the coffee, then order it
          </Typography>
          <Typography variant="body" color="fg.muted" className="mt-4">
            Every cup on the bar, what is in it, and what it costs — no chalkboard squinting
            required. Hot or iced, there is something for your morning.
          </Typography>
        </Div>

        <Div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {menu.map((drink) => {
            const meta = TEMP_META[drink.temp];
            return (
              <Card key={drink.name} variant="outline" size="lg" hoverable className="h-full">
                <Card.Body className="flex h-full flex-col gap-4">
                  <Div className="flex items-start justify-between gap-3">
                    <Div className="flex items-center gap-3">
                      <Div
                        as="span"
                        aria-hidden
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-subtle text-primary"
                      >
                        <meta.Icon size={18} />
                      </Div>
                      <Typography as="h3" variant="h4" weight="semibold">
                        {drink.name}
                      </Typography>
                    </Div>
                    <Typography variant="h4" weight="semibold" color="primary">
                      {drink.price}
                    </Typography>
                  </Div>

                  <Typography variant="bodySmall" color="fg.muted" lineHeight="relaxed">
                    {drink.description}
                  </Typography>

                  <Div className="mt-auto flex items-center gap-2 pt-2">
                    <Badge variant="soft" color={meta.color} shape="pill" size="sm">
                      {meta.label}
                    </Badge>
                    {drink.popular ? (
                      <Badge variant="soft" color="primary" shape="pill" size="sm">
                        Popular
                      </Badge>
                    ) : null}
                  </Div>
                </Card.Body>
              </Card>
            );
          })}
        </Div>
      </Div>
    </Div>
  );
}
