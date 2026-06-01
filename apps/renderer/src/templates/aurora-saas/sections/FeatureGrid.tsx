import { Gauge, ShieldCheck, Sparkles, Workflow } from 'lucide-react';
import { Card, Div, Typography } from '@apx-ui/ds';

import { features, type Feature } from '../data';

const FEATURE_ICONS: Record<Feature['iconKey'], typeof Sparkles> = {
  spark: Sparkles,
  gauge: Gauge,
  shield: ShieldCheck,
  workflow: Workflow,
};

export function FeatureGrid() {
  return (
    <Div as="section" id="product" className="border-b border-border">
      <Div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Div className="mx-auto max-w-2xl text-center">
          <Typography variant="overline" color="primary" weight="semibold">
            Why teams switch
          </Typography>
          <Typography
            variant="h2"
            weight="semibold"
            letterSpacing="tight"
            className="mt-3 text-3xl sm:text-4xl"
          >
            Built like the apps you ship
          </Typography>
          <Typography variant="body" color="fg.muted" className="mt-4">
            Every component carries the same opinions about theming, accessibility, and
            performance — so the surface you build is the surface your users get.
          </Typography>
        </Div>

        <Div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = FEATURE_ICONS[feature.iconKey];
            return (
              <Card
                key={feature.title}
                variant="outline"
                size="lg"
                hoverable
                className="h-full"
              >
                <Card.Header
                  icon={<Icon size={22} />}
                  iconColor={feature.color}
                  title={
                    <Typography as="h3" variant="h4" weight="semibold">
                      {feature.title}
                    </Typography>
                  }
                />
                <Card.Body>
                  <Typography variant="bodySmall" color="fg.muted" lineHeight="relaxed">
                    {feature.description}
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