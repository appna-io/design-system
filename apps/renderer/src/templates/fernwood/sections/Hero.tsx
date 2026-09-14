import { ArrowRight } from '@apx-ui/icons';
import { Button, Div, Image, Typography } from '@apx-ui/ds';

import { hero } from '../content';

/**
 * Opening band — and the one section in the gallery where a photograph is the hero rather than a
 * mockup, per the lane's brief. The product *is* the picture, so the type gets out of its way:
 * a five-column text well against a seven-column image, not the usual even split.
 *
 * It animates on mount, not on view. This is the one section guaranteed to be above the fold, so a
 * viewport trigger would be a no-op at best and a flash of hidden text at worst; everything below
 * uses `animateOnView`.
 */
export function Hero() {
  return (
    <Div as="section" className="relative overflow-hidden bg-bg-subtle">
      <Div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-20">
        <Div stagger={0.09} className="lg:col-span-5">
          <Div animation="fadeIn" animationDuration="slower">
            <Typography
              variant="overline"
              weight="medium"
              color="primary"
              transform="upper"
              letterSpacing="widest"
              className="text-xs"
            >
              {hero.eyebrow}
            </Typography>
          </Div>

          <Div animation="riseIn" animationDuration="slower" animationEase="emphasized">
            <Typography
              as="h1"
              variant="displayXl"
              weight="medium"
              lineHeight="tight"
              letterSpacing="tight"
              fontFamily="display"
              className="mt-5"
            >
              {hero.title}
            </Typography>
          </Div>

          <Div animation="riseIn" animationDuration="slower">
            <Typography
              variant="bodyLarge"
              color="fg.muted"
              lineHeight="relaxed"
              className="mt-6 max-w-md"
            >
              {hero.body}
            </Typography>
          </Div>

          <Div animation="fadeIn" animationDuration="slower" className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" rightIcon={<ArrowRight size={18} />} asChild>
              <a href={hero.primaryCta.href}>{hero.primaryCta.label}</a>
            </Button>
            <Button size="lg" variant="ghost" color="neutral" asChild>
              <a href={hero.secondaryCta.href}>{hero.secondaryCta.label}</a>
            </Button>
          </Div>
        </Div>

        <Div
          animation="zoomIn"
          animationDuration="deliberate"
          animationEase="emphasized"
          className="lg:col-span-7"
        >
          <Image
            src={hero.media.src}
            alt={hero.media.alt}
            aspectRatio="5/4"
            fit="cover"
            radius="xl"
            fullWidth
            loading="eager"
            fallback={<Div className="h-full w-full bg-neutral-subtle" />}
          />
        </Div>
      </Div>
    </Div>
  );
}
