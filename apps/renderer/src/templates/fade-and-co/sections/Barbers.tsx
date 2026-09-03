import { Badge, Card, Div, Image, Typography } from '@apx-ui/ds';

import { SectionHeading } from '../SectionHeading';
import { barbers, barbersSection, type Barber } from '../data';

/**
 * The floor. Four portrait cards, each with the two things that barber is asked for by name —
 * the detail that actually decides who a customer books, so it is a `Badge` row rather than a
 * sentence of prose.
 *
 * The years-behind-the-chair number is set over the portrait: it is the credential, and putting
 * it on the image keeps the card body to name, role and specialties.
 */
export function Barbers() {
  return (
    <Div as="section" id="barbers" className="bg-bg-subtle py-20 lg:py-28">
      <Div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={barbersSection.eyebrow}
          title={barbersSection.title}
          body={barbersSection.body}
        />

        <Div as="ul" className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {barbers.map((barber) => (
            <Div as="li" key={barber.id}>
              <BarberCard barber={barber} />
            </Div>
          ))}
        </Div>
      </Div>
    </Div>
  );
}

function BarberCard({ barber }: { barber: Barber }) {
  return (
    <Card
      variant="solid"
      shape="square"
      size="md"
      className="group h-full bg-bg-paper shadow-md transition hover:shadow-lg"
    >
      <Card.Media className="relative">
        <Image
          src={barber.imageUrl}
          alt={`${barber.name}, ${barber.role}`}
          aspectRatio="4/5"
          fit="cover"
          fullWidth
          className="grayscale transition duration-500 group-hover:grayscale-0"
          fallback={<Div className="h-full w-full bg-neutral-subtle" />}
        />
        <Div className="absolute inset-x-0 bottom-0 flex items-end p-4">
          <Typography
            as="span"
            variant="caption"
            weight="semibold"
            transform="upper"
            letterSpacing="wider"
            color="primary.contrast"
            className="bg-primary px-2 py-1"
          >
            {barber.years} yrs behind the chair
          </Typography>
        </Div>
      </Card.Media>

      <Card.Body className="pt-5">
        <Typography as="h3" variant="h4" weight="semibold" fontFamily="display" className="text-lg">
          {barber.name}
        </Typography>
        <Typography
          variant="caption"
          color="foreground.subtle"
          transform="upper"
          letterSpacing="wider"
          className="mt-1 block"
        >
          {barber.role}
        </Typography>

        <Div className="mt-4 flex flex-wrap gap-2">
          {barber.specialties.map((specialty) => (
            <Badge key={specialty} variant="outline" color="neutral" shape="square" size="sm">
              {specialty}
            </Badge>
          ))}
        </Div>
      </Card.Body>
    </Card>
  );
}
