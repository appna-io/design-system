import { ArrowRight } from 'lucide-react';
import { Button, Card, Div, Stat, StatGroup, Typography } from '@apx-ui/ds';

import { stats } from '../data';

export function MetricsBand() {
  return (
    <Div as="section" id="solutions" className="border-b border-border bg-bg-subtle/40">
      <Div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1fr_1.2fr]">
        <Div>
          <Typography variant="overline" color="primary" weight="semibold">
            Outcomes
          </Typography>
          <Typography
            variant="h2"
            weight="semibold"
            letterSpacing="tight"
            className="mt-3 text-3xl sm:text-4xl"
          >
            Numbers from teams already on Aurora
          </Typography>
          <Typography variant="body" color="fg.muted" className="mt-4 max-w-md">
            A composable system pays for itself the moment your second product surface ships.
            Here&apos;s what teams measure in their first ninety days.
          </Typography>
          <Button className="mt-6" variant="outline" rightIcon={<ArrowRight size={14} />}>
            Read the customer stories
          </Button>
        </Div>
        <Card variant="elevated" size="lg">
          <Card.Body>
            <StatGroup gap={6} direction={{ base: 'column', sm: 'row' }} divider>
              {stats.map((s) => (
                <Stat
                  key={s.label}
                  label={s.label}
                  value={s.value}
                  delta={{
                    value: parseFloat(s.delta.replace(/[^\d.-]/g, '')),
                    direction: s.trend,
                    suffix: s.delta.includes('%') ? '%' : '',
                  }}
                />
              ))}
            </StatGroup>
          </Card.Body>
        </Card>
      </Div>
    </Div>
  );
}