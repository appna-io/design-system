import { ArrowRight } from '@apx-ui/icons';
import { Button, Div, Image, Typography } from '@apx-ui/ds';

import { lookbook } from '../content';

/**
 * Full-bleed lookbook band — the lane's distinctive move alongside the product grid.
 *
 * The copy sits *on* the photograph rather than beside it, which needs a scrim: a photograph is
 * not a palette token and nothing in the theme can guarantee the pixels behind a given word. Both
 * scrims are built from palette roles (`bg-fg/45` and a `Div gradient` from `foreground.default`)
 * rather than a literal `black/60`, so they track the theme's own ink instead of assuming the
 * ground is dark.
 *
 * The image reveals with `blurIn` — spent once here and nowhere else on the page, because a
 * blurred layer is re-rasterised every frame and this is the only element big enough to earn it.
 */
export function Lookbook() {
  return (
    <Div as="section" id="collections" className="scroll-mt-28">
      <Div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <Div
          animation="blurIn"
          animateOnView={{ amount: 0.15 }}
          animationDuration="deliberate"
          animationEase="emphasized"
          className="relative overflow-hidden rounded-[2rem]"
        >
          <Image
            src={lookbook.media.src}
            alt={lookbook.media.alt}
            aspectRatio="16/9"
            fit="cover"
            fullWidth
            loading="lazy"
            className="max-h-[38rem]"
            fallback={<Div className="h-full w-full bg-neutral-subtle" />}
          />

          {/*
            Two stacked scrims rather than one. A single bottom-anchored gradient is enough for a
            dark photograph and nowhere near enough for a bright one — and a photograph is not a
            palette token, so nothing in the theme can promise what is behind any given word. The
            flat wash guarantees a floor of contrast across the whole frame; the gradient then
            deepens the bottom third where the type actually sits. Together they hold legibility
            for any image dropped in here, which a single pass demonstrably did not.
          */}
          <Div decorative className="bg-fg/45" />
          <Div
            decorative
            gradient={{
              type: 'linear',
              from: 'foreground.default',
              to: 'transparent',
              position: 'bottom',
            }}
          />

          <Div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
            <Div className="max-w-2xl">
              <Typography
                variant="overline"
                weight="medium"
                color="background.default"
                transform="upper"
                letterSpacing="widest"
                className="text-xs"
              >
                {lookbook.eyebrow}
              </Typography>
              <Typography
                as="h2"
                variant="displayLg"
                weight="medium"
                lineHeight="tight"
                letterSpacing="tight"
                fontFamily="display"
                color="background.default"
                className="mt-4"
              >
                {lookbook.title}
              </Typography>
              <Typography
                variant="bodyLarge"
                lineHeight="relaxed"
                color="background.default"
                className="mt-4 max-w-xl"
              >
                {lookbook.body}
              </Typography>
              <Div className="mt-7">
                <Button size="lg" rightIcon={<ArrowRight size={18} />} asChild>
                  <a href={lookbook.cta.href}>{lookbook.cta.label}</a>
                </Button>
              </Div>
            </Div>
          </Div>
        </Div>
      </Div>
    </Div>
  );
}
