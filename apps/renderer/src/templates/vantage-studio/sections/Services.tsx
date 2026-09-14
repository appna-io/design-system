import { Check } from '@apx-ui/icons';
import { Divider, Div, Reveal, Section, SectionHeading, Typography } from '@apx-ui/ds';

import { services, servicesSection } from '../data';

/**
 * Numbered service rows rather than a card grid.
 *
 * Four cards of near-identical length would flatten the difference between the disciplines; a
 * ruled list lets each row breathe to its own height and reads as a table of contents, which is
 * what this section actually is.
 *
 * The reveal comes in from the inline-start edge (`slideInFromLeft`) so the rows arrive along the
 * rule they sit on, rather than crossing it.
 */
export function Services() {
  return (
    <Section
      as="section"
      id="services"
      width="wide"
      className="border-y border-border-subtle bg-bg-subtle"
    >
      <Reveal>
        <SectionHeading intro={servicesSection} eyebrowVariant="rule" size="section" />
      </Reveal>

      <Reveal as="ul" stagger className="mt-16 list-none p-0">
        {services.map((service, index) => (
          <Reveal as="li" key={service.number} preset="left">
              {index > 0 && <Divider decorative className="my-0" />}
              <Div className="grid gap-6 py-10 lg:grid-cols-12 lg:gap-10">
                <Div className="lg:col-span-1">
                  <Typography
                    variant="bodySmall"
                    weight="medium"
                    color="primary"
                    fontFamily="display"
                    className="text-sm tabular-nums"
                  >
                    {service.number}
                  </Typography>
                </Div>

                <Div className="lg:col-span-4">
                  <Typography
                    as="h3"
                    variant="h3"
                    weight="medium"
                    lineHeight="snug"
                    letterSpacing="tight"
                    fontFamily="display"
                    className="text-2xl sm:text-3xl"
                  >
                    {service.title}
                  </Typography>
                </Div>

                <Div className="lg:col-span-4">
                  <Typography variant="body" color="fg.subtle" lineHeight="relaxed">
                    {service.body}
                  </Typography>
                </Div>

                <Div className="lg:col-span-3">
                  <Div as="ul" className="flex list-none flex-col gap-2 p-0">
                    {service.deliverables.map((item) => (
                      <Div as="li" key={item} className="flex items-center gap-2.5">
                        <Div aria-hidden className="shrink-0 text-primary">
                          <Check size={15} />
                        </Div>
                        <Typography variant="bodySmall" color="fg.muted">
                          {item}
                        </Typography>
                      </Div>
                    ))}
                  </Div>
                </Div>
              </Div>
          </Reveal>
        ))}
      </Reveal>
    </Section>
  );
}
