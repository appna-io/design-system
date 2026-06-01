import { Button, Div, PricingCard, Typography } from '@apx-ui/ds';

import { pricingTiers } from '../data';

export function Pricing() {
  return (
    <Div as="section" id="pricing" className="border-b border-border">
      <Div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Div className="mx-auto max-w-2xl text-center">
          <Typography variant="overline" color="primary" weight="semibold">
            Pricing
          </Typography>
          <Typography
            variant="h2"
            weight="semibold"
            letterSpacing="tight"
            className="mt-3 text-3xl sm:text-4xl"
          >
            Simple plans that scale with the team
          </Typography>
          <Typography variant="body" color="fg.muted" className="mt-4">
            Start free, upgrade when you outgrow it. No seats charged for guests, ever.
          </Typography>
        </Div>

        <Div className="mt-12 grid gap-5 md:grid-cols-3">
          {pricingTiers.map((tier) => (
            <PricingCard
              key={tier.name}
              name={tier.name}
              price={tier.price}
              cadence={tier.cadence}
              blurb={tier.blurb}
              features={tier.features}
              highlighted={tier.highlight}
              cta={
                <Button
                  fullWidth
                  variant={tier.highlight ? 'solid' : 'outline'}
                  color="primary"
                >
                  {tier.cta}
                </Button>
              }
            />
          ))}
        </Div>
      </Div>
    </Div>
  );
}