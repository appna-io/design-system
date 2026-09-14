import { ArrowRight } from '@apx-ui/icons';
import { Button, Div, Surface, Typography } from '@apx-ui/ds';

import { Countdown } from '../Countdown';
import { hero } from '../content';

/**
 * The poster. `Surface tone="primary"` fills the whole viewport-height band with the ink navy and
 * points every token inside at the paper contrast slot — so the headline, the standfirst, the
 * countdown and both buttons are written without naming a single colour.
 *
 * The type is the composition. `Northbound` runs to the edge of the measure at the largest step
 * the scale has, with everything else deliberately small and quiet underneath it. Nothing else on
 * the page is allowed to be this size, which is what makes it read as a poster rather than a
 * header.
 *
 * Above the fold does not scroll-reveal (#2): this plays on mount, staggered at 80ms, and is
 * finished in well under a second. Nobody should watch a hero assemble.
 */
export function Hero() {
  return (
    <Surface
      as="section"
      tone="primary"
      id="top"
      className="relative overflow-hidden border-b-2 border-fg"
    >
      {/* Two offset radial washes rather than one linear gradient — the house atmosphere pattern
          from #2. `secondary` appears here and only here in the top half of the page: as light,
          not as a second button colour competing with the CTA. */}
      <Div
        decorative
        gradient={{
          type: 'radial',
          from: 'secondary.main',
          to: 'transparent',
          position: 'top-right',
          size: '55% 90%',
        }}
      />
      <Div
        decorative
        gradient={{
          type: 'radial',
          from: 'primary.hover',
          to: 'transparent',
          position: 'bottom-left',
          size: '70% 70%',
        }}
      />

      <Div
        stagger={0.08}
        className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
      >
        <Div animation="riseIn">
          <Typography
            variant="overline"
            weight="bold"
            transform="upper"
            letterSpacing="wider"
            className="inline-block border-2 border-current px-3 py-1.5"
          >
            {hero.eyebrow}
          </Typography>
        </Div>

        <Div animation="riseIn">
          <Typography as="h1" variant="display2Xl" className="mt-8">
            {hero.title}
          </Typography>
        </Div>

        <Div animation="riseIn">
          <Typography
            variant="bodyLarge"
            lineHeight="relaxed"
            className="mt-6 max-w-xl text-lg sm:text-xl"
          >
            {hero.standfirst}
          </Typography>
        </Div>

        <Div animation="riseIn" className="mt-12 border-t-2 border-current pt-8">
          <Countdown />
        </Div>

        <Div animation="riseIn" className="mt-10 flex flex-wrap items-center gap-3">
          <Button size="lg" color="neutral" asChild>
            <a href={hero.primaryCta.href} className="inline-flex items-center gap-2">
              {hero.primaryCta.label}
              <ArrowRight size={18} />
            </a>
          </Button>
          <Button size="lg" variant="outline" color="neutral" asChild>
            <a href={hero.secondaryCta.href}>{hero.secondaryCta.label}</a>
          </Button>
        </Div>

        <Div animation="riseIn">
          <Typography variant="bodySmall" color="fg.muted" className="mt-6 block">
            {hero.footnote}
          </Typography>
        </Div>
      </Div>
    </Surface>
  );
}
