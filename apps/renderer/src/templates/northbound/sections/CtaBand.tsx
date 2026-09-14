import { ArrowRight } from '@apx-ui/icons';
import { Button, Div, Reveal, Section, SectionHeading } from '@apx-ui/ds';

import { Countdown } from '../Countdown';
import { cta } from '../content';

/**
 * The close, on the secondary fill — the other half of the duotone, so the page ends on the
 * colour it did not open on. Bookending with `primary` would make the orange read as an accent
 * rather than as an equal, which is the difference between a duotone and a tinted neutral.
 *
 * The countdown appears a second and final time. Repeating it is the argument: the first one was
 * information, this one is the deadline. It is the same component reading the same content, so
 * the two can never disagree.
 *
 * Nothing here names a colour, including the eyebrow bar — which is the interesting one, because
 * the bar is the only element whose *fill* is a palette role rather than a surface token, and a
 * `primary` bar on a `primary` fill is invisible. `SectionHeading` reads the surface tone from
 * context and picks `neutral` itself now (#5), so the band that most needed a prop is the band
 * that needs the fewest.
 */
export function CtaBand() {
  return (
    <Section
      as="section"
      tone="secondary"
      rhythm="spacious"
      width="narrow"
      className="border-t-2 border-fg"
      containerClassName="text-center"
    >
      <Div
        decorative
        gradient={{
          type: 'radial',
          from: 'secondary.hover',
          to: 'transparent',
          position: 'bottom-right',
          size: '65% 110%',
        }}
      />

      <Reveal>
        <SectionHeading
          eyebrowStyle={{ variant: 'solid', shape: 'square' }}
          eyebrow={cta.eyebrow}
          title={cta.title}
          body={cta.body}
          align="center"
        />

        <Div className="mt-12 flex justify-center border-y-2 border-current py-8">
          <Countdown />
        </Div>

        <Div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button size="lg" color="neutral" asChild>
            <a href={cta.primaryCta.href} className="inline-flex items-center gap-2">
              {cta.primaryCta.label}
              <ArrowRight size={18} />
            </a>
          </Button>
          <Button size="lg" variant="outline" color="neutral" asChild>
            <a href={cta.secondaryCta.href}>{cta.secondaryCta.label}</a>
          </Button>
        </Div>
      </Reveal>
    </Section>
  );
}
