import { Clock, MapPin, Repeat, ShieldCheck, Smartphone, Zap } from '@apx-ui/icons';
import { Card, Div, Typography } from '@apx-ui/ds';

import { SectionHeading } from '../SectionHeading';
import { features, featuresSection, type FeatureIcon } from '../data';

/**
 * Six-up feature grid using `Card.Header`'s icon slot rather than a hand-rolled tile — that
 * slot already derives its size, colour and corner radius from the card's own `size` context,
 * so it is one prop instead of four classes, and it stays consistent if the theme's radii move.
 *
 * The icon map is shared with `Workflow.tsx` via the `FeatureIcon` union in `data.ts`, so the
 * two sections cannot drift onto different glyphs for the same concept.
 */
const ICONS: Record<FeatureIcon, typeof Clock> = {
  clock: Clock,
  mapPin: MapPin,
  shield: ShieldCheck,
  repeat: Repeat,
  phone: Smartphone,
  zap: Zap,
};

export function Features() {
  return (
    <Div as="section" className="bg-bg-subtle py-20 lg:py-28">
      <Div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={featuresSection.eyebrow}
          title={featuresSection.title}
          body={featuresSection.body}
        />

        <Div as="ul" className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = ICONS[feature.icon];
            return (
              <Div as="li" key={feature.title}>
                <Card
                  variant="solid"
                  size="lg"
                  className="h-full bg-bg-paper transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <Card.Header
                    icon={<Icon size={20} />}
                    iconColor="primary"
                    iconVariant="soft"
                    title={
                      <Typography as="h3" variant="h4" weight="semibold" className="text-lg">
                        {feature.title}
                      </Typography>
                    }
                  />
                  <Card.Body>
                    <Typography variant="bodySmall" color="foreground.muted" lineHeight="relaxed">
                      {feature.description}
                    </Typography>
                  </Card.Body>
                </Card>
              </Div>
            );
          })}
        </Div>
      </Div>
    </Div>
  );
}
