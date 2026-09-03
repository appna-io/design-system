import { Flame, Globe, Zap } from '@apx-ui/icons';
import { Card, Div, Typography } from '@apx-ui/ds';

import { SectionHeading } from '../SectionHeading';
import { values, valueProps, type ValueIcon } from '../data';

/**
 * The dark espresso band. The source inlined three heroicons SVGs (fire, globe-alt, lightning);
 * those are now `@apx-ui/icons` components — `Zap` was the one glyph the set was missing and
 * was added for this port.
 *
 * The band inverts the palette rather than re-declaring colours: `primary.main` is espresso and
 * `primary.contrast` is cream, which is exactly the source's `bg-espresso-900 text-cream-50`.
 */
const ICONS: Record<ValueIcon, typeof Flame> = {
  flame: Flame,
  globe: Globe,
  zap: Zap,
};

export function ValueProps() {
  return (
    <Div as="section" className="bg-primary py-16 lg:py-24">
      <Div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={valueProps.title} body={valueProps.body} align="center" onDark />

        <Div as="ul" className="mt-12 grid gap-8 md:grid-cols-3">
          {values.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <Div as="li" key={item.title}>
                <Card
                  variant="outline"
                  shape="pill"
                  size="lg"
                  className="h-full border-primary-border bg-primary/50"
                >
                  <Card.Body>
                    <Div className="text-secondary-border">
                      <Icon size={32} />
                    </Div>
                    <Typography
                      as="h3"
                      variant="h4"
                      weight="semibold"
                      fontFamily="display"
                      color="primary.contrast"
                      className="mt-4 text-xl"
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="bodySmall"
                      lineHeight="relaxed"
                      color="primary.contrast"
                      className="mt-2 opacity-80"
                    >
                      {item.description}
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
