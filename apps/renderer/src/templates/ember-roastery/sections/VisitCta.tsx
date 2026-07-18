import { ArrowRight, Clock, MapPin } from 'lucide-react';
import { Button, Card, Div, Divider, Typography } from '@apx-ui/ds';

import { visit } from '../data';

export function VisitCta() {
  return (
    <Div as="section" id="visit" className="border-b border-border">
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
                Come see the coffee in person.
              </Typography>
              <Typography variant="body" color="fg.muted" className="mt-3 max-w-xl">
                {visit.note}
              </Typography>

              <Div className="mt-6 flex items-start gap-3">
                <Div
                  as="span"
                  aria-hidden
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-subtle text-primary"
                >
                  <MapPin size={16} />
                </Div>
                <Div>
                  <Typography variant="bodySmall" weight="medium">
                    {visit.address}
                  </Typography>
                  <Typography variant="caption" color="fg.muted">
                    Two minutes from the old market square
                  </Typography>
                </Div>
              </Div>
            </Div>

            <Div className="relative">
              <Div className="flex items-center gap-2">
                <Clock size={16} />
                <Typography
                  variant="caption"
                  weight="semibold"
                  transform="upper"
                  letterSpacing="wider"
                  color="fg.muted"
                >
                  Opening hours
                </Typography>
              </Div>
              <Div className="mt-4 flex flex-col gap-3">
                {visit.hours.map((row, index) => (
                  <Div key={row.day}>
                    <Div className="flex items-center justify-between gap-4">
                      <Typography variant="bodySmall" color="fg.muted">
                        {row.day}
                      </Typography>
                      <Typography variant="bodySmall" weight="medium">
                        {row.time}
                      </Typography>
                    </Div>
                    {index < visit.hours.length - 1 ? <Divider className="mt-3" /> : null}
                  </Div>
                ))}
              </Div>
              <Button className="mt-6" fullWidth rightIcon={<ArrowRight size={16} />}>
                Get directions
              </Button>
            </Div>
          </Div>
        </Card>
      </Div>
    </Div>
  );
}
