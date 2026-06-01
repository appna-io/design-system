import { ArrowRight } from 'lucide-react';
import { Button, Card, Div, Typography } from '@apx-ui/ds';

import { productMeta } from '../data';

export function CtaBand() {
  return (
    <Div as="section" id="trial" className="border-b border-border">
      <Div className="mx-auto w-full max-w-6xl px-6 py-20">
        <Card variant="elevated" size="lg" color="primary" className="overflow-hidden">
          <Div className="relative grid gap-8 p-4 sm:p-8 md:grid-cols-[1.5fr_1fr] md:items-center">
            <Div decorative gradient={{ position: 'left' }} />
            <Div className="relative">
              <Typography
                as="h2"
                variant="h2"
                weight="semibold"
                letterSpacing="tight"
                className="text-3xl sm:text-4xl"
              >
                Ship something your team is proud of this quarter.
              </Typography>
              <Typography
                variant="body"
                color="fg.muted"
                className="mt-3 max-w-xl"
              >
                Spin up a workspace in under a minute. Free for the first 14 days — no credit
                card, no salesperson required.
              </Typography>
            </Div>
            <Div className="relative flex flex-col gap-3 md:items-end">
              <Button size="lg" rightIcon={<ArrowRight size={16} />}>
                {productMeta.primaryCta.label}
              </Button>
              <Typography as="span" variant="caption" color="fg.muted">
                No credit card · Cancel anytime
              </Typography>
            </Div>
          </Div>
        </Card>
      </Div>
    </Div>
  );
}