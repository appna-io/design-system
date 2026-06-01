import { ArrowRight, Check, PlayCircle } from 'lucide-react';
import { Badge, Button, Card, Div, Stat, Typography } from '@apx-ui/ds';

import { productMeta, stats } from '../data';

export function Hero() {
  return (
    <Div as="section" id="top" className="relative overflow-hidden border-b border-border">
      {/* Soft gradient backdrop. Uses semantic tokens so it tracks the active variant. */}
      <Div decorative gradient={{ position: 'top', size: '60% 60%' }} />
      <Div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center">
        <Badge variant="soft" color="primary" shape="pill" size="md" withDot dotPulse>
          {productMeta.badge}
        </Badge>
        <Typography
          variant="display"
          as="h1"
          weight="semibold"
          letterSpacing="tight"
          className="mt-6 max-w-3xl text-5xl text-fg sm:text-6xl"
        >
          {productMeta.tagline}
        </Typography>
        <Typography
          variant="bodyLarge"
          color="fg.muted"
          className="mt-5 max-w-2xl"
        >
          {productMeta.description}
        </Typography>
        <Div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button size="lg" rightIcon={<ArrowRight size={16} />}>
            {productMeta.primaryCta.label}
          </Button>
          <Button size="lg" variant="ghost" leftIcon={<PlayCircle size={16} />}>
            {productMeta.secondaryCta.label}
          </Button>
        </Div>

        <HeroSurface />
      </Div>
    </Div>
  );
}

function HeroSurface() {
  return (
    <Div className="relative mt-16 w-full max-w-5xl">
      <Div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-primary/15 to-transparent blur-2xl" />
      <Card variant="elevated" size="lg" className="relative overflow-hidden border-border/80">
        <Div className="grid gap-px bg-border md:grid-cols-3">
          {stats.map((s) => (
            <Div key={s.label} className="bg-bg-paper p-6">
              <Stat
                label={s.label}
                value={s.value}
                size="md"
                delta={{
                  value: parseFloat(s.delta.replace(/[^\d.-]/g, '')),
                  direction: s.trend,
                  suffix: s.delta.includes('%') ? '%' : '',
                }}
              />
            </Div>
          ))}
          {/* The fourth stat lives in its own row on the right side */}
          <Div className="bg-bg-paper p-6 md:col-span-3">
            <Div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Div className="flex items-center gap-3">
                <Div
                  as="span"
                  aria-hidden
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-success-subtle text-success"
                >
                  <Check size={16} />
                </Div>
                <Div>
                  <Typography variant="bodySmall" weight="medium">
                    All systems operational
                  </Typography>
                  <Typography variant="caption" color="fg.muted">
                    Last incident resolved 47 days ago · 99.99% rolling uptime
                  </Typography>
                </Div>
              </Div>
              <Badge variant="outline" color="success" withDot>
                Live
              </Badge>
            </Div>
          </Div>
        </Div>
      </Card>
    </Div>
  );
}