import { Button, Div, Image, Typography } from '@apx-ui/ds';

import { hero } from '../data';

/**
 * Opening band. The source painted a three-stop cream gradient with a Tailwind
 * `bg-gradient-to-br` class; here it is `Div`'s typed `gradient` prop, which resolves palette
 * tokens — so the gradient re-skins with the theme instead of being pinned to literal hexes.
 *
 * The image keeps the source's inset ring as an overlay sibling rather than a border, so it
 * sits above the picture the way `ring-inset` did.
 */
export function Hero() {
  return (
    <Div as="section" className="relative overflow-hidden bg-bg-subtle">
      <Div
        decorative
        gradient={{
          type: 'linear',
          from: 'neutral.subtle',
          to: 'background.default',
          position: 'bottom-right',
        }}
      />
      <Div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        <Div animation="slideInFromBottom">
          <Typography
            variant="overline"
            weight="semibold"
            color="secondary"
            transform="upper"
            letterSpacing="wider"
          >
            {hero.eyebrow}
          </Typography>

          <Typography
            as="h1"
            variant="displayXl"
            lineHeight="tight"
            letterSpacing="tight"
            className="mt-4"
          >
            {hero.title}
          </Typography>

          <Typography
            variant="bodyLarge"
            color="fg.subtle"
            lineHeight="relaxed"
            className="mt-6 max-w-lg"
          >
            {hero.body}
          </Typography>

          <Div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <a href={hero.primaryCta.href}>{hero.primaryCta.label}</a>
            </Button>
            <Button size="lg" variant="outline" color="secondary" asChild>
              <a href={hero.secondaryCta.href}>{hero.secondaryCta.label}</a>
            </Button>
          </Div>
        </Div>

        <Div className="relative overflow-hidden rounded-2xl shadow-lg">
          <Image
            src={hero.image.src}
            alt={hero.image.alt}
            aspectRatio="4/3"
            fit="cover"
            fullWidth
            loading="eager"
            className="lg:aspect-square"
            fallback={<Div className="h-full w-full bg-neutral-subtle" />}
          />
          <Div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-fg/10"
          />
        </Div>
      </Div>
    </Div>
  );
}
