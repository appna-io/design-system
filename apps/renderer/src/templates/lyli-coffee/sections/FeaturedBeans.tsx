import { Badge, Card, Div, Image, Typography } from '@apx-ui/ds';

import { SectionHeading } from '../SectionHeading';
import { beans, featuredBeans, formatPrice, type Bean } from '../data';

/**
 * The product grid. The source hand-built each card as a `<li>` with its own rounded/shadow
 * classes; here it is `Card` proper — `Card.Media` for the square image, `Card.Body` for the
 * detail block — so the card's radius, shadow and surface all come from the theme.
 *
 * The lift-on-hover and the image zoom stay as template styles: they are this brand's motion,
 * not card behaviour the DS should own.
 */
export function FeaturedBeans() {
  return (
    <Div
      as="section"
      id="beans"
      className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <SectionHeading title={featuredBeans.title} body={featuredBeans.body} align="center" />

      <Div as="ul" className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {beans.map((bean) => (
          <Div as="li" key={bean.id}>
            <BeanCard bean={bean} />
          </Div>
        ))}
      </Div>
    </Div>
  );
}

function BeanCard({ bean }: { bean: Bean }) {
  return (
    <Card
      variant="solid"
      shape="pill"
      size="md"
      className="group h-full bg-bg-paper shadow-md transition hover:-translate-y-1 hover:shadow-lg"
    >
      <Card.Media>
        <Image
          src={bean.imageUrl}
          alt={`${bean.name} coffee beans`}
          aspectRatio="1/1"
          fit="cover"
          fullWidth
          className="transition duration-500 group-hover:scale-105"
          fallback={<Div className="h-full w-full bg-neutral-subtle" />}
        />
      </Card.Media>

      <Card.Body className="pt-5">
        <Div className="flex items-start justify-between gap-2">
          <Typography as="h3" size="h4" weight="semibold" fontFamily="display">
            {bean.name}
          </Typography>
          <Badge variant="soft" color="secondary" shape="pill" size="sm" className="shrink-0">
            {bean.roastLevel}
          </Badge>
        </Div>

        <Typography variant="bodySmall" color="fg.subtle" className="mt-1">
          {bean.origin}
        </Typography>

        <Typography variant="bodySmall" color="fg.muted" className="mt-2">
          {bean.tastingNotes}
        </Typography>

        <Typography variant="body" weight="semibold" color="primary" className="mt-4">
          {formatPrice(bean.price)}
        </Typography>
      </Card.Body>
    </Card>
  );
}
