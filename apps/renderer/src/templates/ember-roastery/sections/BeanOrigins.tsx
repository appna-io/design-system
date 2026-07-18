import { Bean } from 'lucide-react';
import { Badge, Card, Div, Typography } from '@apx-ui/ds';

import { beans, type BeanOrigin } from '../data';

const ROAST_COLOR: Record<BeanOrigin['roast'], 'info' | 'warning' | 'neutral'> = {
  Light: 'info',
  Medium: 'warning',
  Dark: 'neutral',
};

export function BeanOrigins() {
  return (
    <Div as="section" id="beans" className="border-b border-border bg-bg-subtle/40">
      <Div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Div className="mx-auto max-w-2xl text-center">
          <Typography variant="overline" color="primary" weight="semibold">
            On the bar today
          </Typography>
          <Typography
            variant="h2"
            weight="semibold"
            letterSpacing="tight"
            className="mt-3 text-3xl sm:text-4xl"
          >
            Meet the beans behind the cup
          </Typography>
          <Typography variant="body" color="fg.muted" className="mt-4">
            Single origins we are pouring this week. Ask the bar to grind any of them for your
            preferred brew, or take a bag home.
          </Typography>
        </Div>

        <Div className="mt-12 grid gap-5 md:grid-cols-3">
          {beans.map((bean) => (
            <Card key={bean.origin} variant="elevated" size="lg" className="h-full">
              <Card.Header
                icon={<Bean size={22} />}
                iconColor="primary"
                title={
                  <Typography as="h3" variant="h4" weight="semibold">
                    {bean.origin}
                  </Typography>
                }
                subtitle={
                  <Typography variant="caption" color="fg.muted">
                    {bean.region}
                  </Typography>
                }
              />
              <Card.Body className="flex flex-col gap-4">
                <Badge variant="soft" color={ROAST_COLOR[bean.roast]} shape="pill" size="sm">
                  {bean.roast} roast
                </Badge>
                <Div>
                  <Typography
                    variant="caption"
                    color="fg.muted"
                    weight="semibold"
                    transform="upper"
                    letterSpacing="wider"
                  >
                    Tasting notes
                  </Typography>
                  <Div className="mt-2 flex flex-wrap gap-2">
                    {bean.notes.map((note) => (
                      <Badge key={note} variant="outline" color="neutral" shape="pill" size="sm">
                        {note}
                      </Badge>
                    ))}
                  </Div>
                </Div>
              </Card.Body>
            </Card>
          ))}
        </Div>
      </Div>
    </Div>
  );
}
