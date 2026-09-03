import { Button, Div, PricingCard } from '@apx-ui/ds';

import { SectionHeading } from '../SectionHeading';
import { pricingSection, tiers } from '../data';

/**
 * Three tiers through `PricingCard`, which owns the whole tier anatomy — name, price, cadence,
 * blurb, checked feature list, highlight badge and selection ring. Hand-building this from
 * `Card` would be a second, drifting implementation of a component the DS already ships.
 *
 * The CTA is passed in rather than configured, which is the right seam: the card should not
 * decide whether a tier's action is a trial signup or a sales conversation.
 */
export function Pricing() {
  return (
    <Div
      as="section"
      id="pricing"
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <SectionHeading
        eyebrow={pricingSection.eyebrow}
        title={pricingSection.title}
        body={pricingSection.body}
      />

      <Div className="mt-14 grid items-start gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <PricingCard
            key={tier.id}
            name={tier.name}
            price={tier.price}
            cadence={tier.cadence}
            blurb={tier.blurb}
            features={tier.features}
            highlighted={tier.highlighted}
            cta={
              <Button fullWidth variant={tier.highlighted ? 'solid' : 'outline'} color="primary">
                {tier.cta}
              </Button>
            }
          />
        ))}
      </Div>
    </Div>
  );
}
