import { ArrowRight, Coffee, Leaf, MapPin } from 'lucide-react';
import { Badge, Button, Card, Div, Typography } from '@apx-ui/ds';

import { cafeMeta, menu } from '../data';

export function Hero() {
  return (
    <Div as="section" id="top" className="relative overflow-hidden border-b border-border">
      {/* Soft gradient backdrop. Uses semantic tokens so it tracks the active variant. */}
      <Div decorative gradient={{ position: 'top', size: '60% 60%' }} />
      <Div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center">
        <Badge variant="soft" color="primary" shape="pill" size="md" withDot dotPulse>
          {cafeMeta.badge}
        </Badge>
        <Typography
          variant="display"
          as="h1"
          weight="semibold"
          letterSpacing="tight"
          className="mt-6 max-w-3xl text-5xl text-fg sm:text-6xl"
        >
          {cafeMeta.tagline}
        </Typography>
        <Typography variant="bodyLarge" color="fg.muted" className="mt-5 max-w-2xl">
          {cafeMeta.description}
        </Typography>
        <Div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button size="lg" rightIcon={<ArrowRight size={16} />}>
            {cafeMeta.primaryCta.label}
          </Button>
          <Button size="lg" variant="ghost" leftIcon={<MapPin size={16} />}>
            {cafeMeta.secondaryCta.label}
          </Button>
        </Div>

        <HeroSurface />
      </Div>
    </Div>
  );
}

function HeroSurface() {
  const featured = menu.filter((d) => d.popular).slice(0, 3);

  return (
    <Div className="relative mt-16 w-full max-w-5xl">
      <Div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-primary/15 to-transparent blur-2xl" />
      <Card variant="elevated" size="lg" className="relative overflow-hidden border-border/80">
        <Div className="grid gap-px bg-border md:grid-cols-3">
          {featured.map((drink) => (
            <Div key={drink.name} className="bg-bg-paper p-6 text-left">
              <Div className="flex items-center justify-between gap-3">
                <Div
                  as="span"
                  aria-hidden
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-subtle text-primary"
                >
                  <Coffee size={16} />
                </Div>
                <Typography variant="body" weight="semibold" color="primary">
                  {drink.price}
                </Typography>
              </Div>
              <Typography variant="h4" weight="semibold" className="mt-4">
                {drink.name}
              </Typography>
              <Typography variant="caption" color="fg.muted" className="mt-1">
                {drink.description}
              </Typography>
            </Div>
          ))}
          <Div className="bg-bg-paper p-6 md:col-span-3">
            <Div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Div className="flex items-center gap-3">
                <Div
                  as="span"
                  aria-hidden
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-success-subtle text-success"
                >
                  <Leaf size={16} />
                </Div>
                <Div className="text-left">
                  <Typography variant="bodySmall" weight="medium">
                    Roasted in-house this morning
                  </Typography>
                  <Typography variant="caption" color="fg.muted">
                    8 single origins on the bar today · ground to order
                  </Typography>
                </Div>
              </Div>
              <Badge variant="outline" color="success" withDot>
                Open now
              </Badge>
            </Div>
          </Div>
        </Div>
      </Card>
    </Div>
  );
}
