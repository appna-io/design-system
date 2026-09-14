import { Flame, Globe, Zap } from '@apx-ui/icons';
import { Card, Div, Surface, Typography } from '@apx-ui/ds';

import { SectionHeading } from '../SectionHeading';
import { values, valueProps, type ValueIcon } from '../data';

/**
 * The dark espresso band. The source inlined three heroicons SVGs (fire, globe-alt, lightning);
 * those are now `@apx-ui/icons` components — `Zap` was the one glyph the set was missing and
 * was added for this port.
 *
 * The band is a `<Surface tone="primary">`: `primary.main` is espresso and `primary.contrast` is
 * cream, which is exactly the source's `bg-espresso-900 text-cream-50`. Nothing inside names a
 * colour — the heading, the card hairline and both type steps read the plain surface tokens, which
 * the tone has re-pointed at the espresso/cream pair.
 */
const ICONS: Record<ValueIcon, typeof Flame> = {
  flame: Flame,
  globe: Globe,
  zap: Zap,
};

export function ValueProps() {
  return (
    <Surface as="section" tone="primary" className="py-16 lg:py-24">
      <Div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={valueProps.title} body={valueProps.body} align="center" />

        <Div as="ul" className="mt-12 grid gap-8 md:grid-cols-3">
          {values.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <Div as="li" key={item.title}>
                <Card variant="outline" shape="pill" size="lg" className="h-full">
                  <Card.Body>
                    <Div className="text-secondary-border">
                      <Icon size={32} />
                    </Div>
                    <Typography
                      as="h3"
                      variant="h4"
                      weight="semibold"
                      fontFamily="display"
                      className="mt-4 text-xl"
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="bodySmall"
                      lineHeight="relaxed"
                      color="fg.muted"
                      className="mt-2"
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
    </Surface>
  );
}
