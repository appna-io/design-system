import { ArrowRight } from '@apx-ui/icons';
import { Badge, Button, Div, Typography } from '@apx-ui/ds';

import { HeroPreview } from '../HeroPreview';
import { hero } from '../data';

/**
 * Split hero — copy left, live product preview right.
 *
 * The backdrop is two `Div gradient` washes rather than one: a radial bloom behind the copy and
 * a second behind the preview, both anchored on palette roles so the whole atmosphere tracks
 * the theme. A single linear gradient reads as a band; two offset radials read as light.
 *
 * `animation` on the two columns is the `Div` motion preset that #9 fixed — content used to
 * stay permanently invisible because `motion.create` ran during render. Staggering the columns
 * by using it on both is a deliberate re-exercise of that fix on a real page.
 */
export function Hero() {
  return (
    <Div as="section" id="top" className="relative overflow-hidden bg-bg">
      <Div
        decorative
        gradient={{
          type: 'radial',
          from: 'primary.subtle',
          to: 'transparent',
          position: 'top-left',
          size: '70% 90%',
        }}
      />
      <Div
        decorative
        gradient={{
          type: 'radial',
          from: 'secondary.subtle',
          to: 'transparent',
          position: 'bottom-right',
          size: '60% 80%',
        }}
      />

      <Div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
        <Div animation="slideInFromBottom">
          <Badge variant="soft" color="primary" shape="pill" size="sm">
            {hero.eyebrow}
          </Badge>

          <Typography
            as="h1"
            variant="display"
            weight="bold"
            lineHeight="none"
            letterSpacing="tight"
            fontFamily="display"
            className="mt-6 text-4xl sm:text-5xl lg:text-6xl"
          >
            {hero.title}
          </Typography>

          <Typography
            variant="bodyLarge"
            color="foreground.muted"
            lineHeight="relaxed"
            className="mt-6 max-w-xl"
          >
            {hero.body}
          </Typography>

          <Div className="mt-9 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <a href={hero.primaryCta.href} className="inline-flex items-center gap-2">
                {hero.primaryCta.label}
                <ArrowRight size={18} />
              </a>
            </Button>
            <Button size="lg" variant="outline" color="neutral" asChild>
              <a href={hero.secondaryCta.href}>{hero.secondaryCta.label}</a>
            </Button>
          </Div>

          <Typography variant="bodySmall" color="foreground.subtle" className="mt-6 block">
            {hero.footnote}
          </Typography>
        </Div>

        <Div animation="slideInFromBottom" className="lg:pl-4">
          <HeroPreview />
        </Div>
      </Div>
    </Div>
  );
}
