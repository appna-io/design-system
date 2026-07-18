import { Coffee, Droplets, Snowflake, Thermometer } from 'lucide-react';
import { Card, Div, Typography } from '@apx-ui/ds';

import { brewMethods, type BrewMethod } from '../data';

const BREW_ICONS: Record<BrewMethod['iconKey'], typeof Coffee> = {
  espresso: Coffee,
  pourover: Droplets,
  coldbrew: Snowflake,
  frenchpress: Thermometer,
};

export function BrewMethods() {
  return (
    <Div as="section" id="brewing" className="border-b border-border">
      <Div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Div className="mx-auto max-w-2xl text-center">
          <Typography variant="overline" color="primary" weight="semibold">
            How we brew
          </Typography>
          <Typography
            variant="h2"
            weight="semibold"
            letterSpacing="tight"
            className="mt-3 text-3xl sm:text-4xl"
          >
            Four ways to pour the same bean
          </Typography>
          <Typography variant="body" color="fg.muted" className="mt-4">
            The brew method changes everything about the cup. Tell the bar what you like and they
            will steer you to the right one.
          </Typography>
        </Div>

        <Div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {brewMethods.map((method) => {
            const Icon = BREW_ICONS[method.iconKey];
            return (
              <Card key={method.title} variant="outline" size="lg" hoverable className="h-full">
                <Card.Header
                  icon={<Icon size={22} />}
                  iconColor={method.color}
                  title={
                    <Typography as="h3" variant="h4" weight="semibold">
                      {method.title}
                    </Typography>
                  }
                  subtitle={
                    <Typography variant="caption" color="fg.muted">
                      Brews in {method.time}
                    </Typography>
                  }
                />
                <Card.Body>
                  <Typography variant="bodySmall" color="fg.muted" lineHeight="relaxed">
                    {method.description}
                  </Typography>
                </Card.Body>
              </Card>
            );
          })}
        </Div>
      </Div>
    </Div>
  );
}
