import { Button, PricingCard, Reveal, Section, SectionHeading } from '@apx-ui/ds';

import { tiers, ticketsIntro } from '../content';

/**
 * Three tiers through `PricingCard`, which owns the whole tier anatomy. Hand-building it from
 * `Card` would be a second, drifting implementation of a component the DS already ships — and the
 * DS version already handles the highlight ring and the checked feature list, which is most of
 * what a ticket tier is.
 *
 * The community tier leads rather than trails. Conference pricing pages conventionally run
 * cheap → expensive with the expensive one highlighted, which quietly frames the cheap ticket as
 * the compromise; here the standard tier is still the highlighted one, but the community ticket
 * being first is the page saying it is a real option rather than a footnote.
 */
export function Tickets() {
  return (
    <Section as="section" id="tickets" rhythm="compact">
      <Reveal>
        <SectionHeading
          eyebrowStyle={{ variant: 'solid', shape: 'square' }}
          eyebrow={ticketsIntro.eyebrow}
          title={ticketsIntro.title}
          body={ticketsIntro.body}
        />
      </Reveal>

      <Reveal stagger className="mt-14 grid items-start gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Reveal key={tier.id}>
            <PricingCard
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
          </Reveal>
        ))}
      </Reveal>
    </Section>
  );
}
