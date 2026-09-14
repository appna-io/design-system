import { Badge, Div, Typography } from '@apx-ui/ds';

import { SectionHeading } from '../SectionHeading';
import { formatDuration, formatPrice, services, servicesSection, type Service } from '../data';

/**
 * The price list. Deliberately rows on a shared rule rather than a grid of `Card`s: a barber's
 * menu is read as a column of prices, and eight cards would turn a scannable list into eight
 * competing surfaces.
 *
 * `<dl>` is the honest element — every row is a term (the service) and its definition (what it
 * includes, how long, what it costs) — so the price stays associated with its service for a
 * screen reader instead of floating as a sibling number.
 */
export function Services() {
  return (
    <Div
      as="section"
      id="services"
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <SectionHeading
        eyebrow={servicesSection.eyebrow}
        title={servicesSection.title}
        body={servicesSection.body}
      />

      <Div as="dl" className="mt-12 grid gap-x-16 lg:grid-cols-2">
        {services.map((service) => (
          <ServiceRow key={service.id} service={service} />
        ))}
      </Div>
    </Div>
  );
}

/**
 * One `<dt>` / `<dd>` pair inside a wrapper `div`, which is the only nesting `<dl>` permits.
 * The name and the price share the `<dt>` line because they are the term being looked up; the
 * description is the definition. Nothing here is a heading — `<dt>` may not contain one, and a
 * price list does not need eight `h3`s in the outline.
 */
function ServiceRow({ service }: { service: Service }) {
  return (
    <Div className="border-t border-border py-6">
      <Div as="dt" className="flex items-baseline justify-between gap-6">
        <Typography
          size="h4"
          weight="semibold"
          fontFamily="display"
          className="text-xl"
        >
          {service.name}
          {service.popular && (
            <Badge
              variant="soft"
              color="secondary"
              shape="square"
              size="sm"
              className="ms-3 align-middle"
            >
              Most booked
            </Badge>
          )}
        </Typography>

        <Div className="flex shrink-0 items-baseline gap-3">
          <Typography
            as="span"
            variant="caption"
            color="foreground.subtle"
            transform="upper"
            letterSpacing="wider"
          >
            {formatDuration(service.duration)}
          </Typography>
          <Typography size="h4" weight="bold" fontFamily="display" className="text-xl">
            {formatPrice(service.price)}
          </Typography>
        </Div>
      </Div>

      <Typography as="dd" variant="bodySmall" color="foreground.muted" className="mt-2 max-w-md">
        {service.description}
      </Typography>
    </Div>
  );
}
