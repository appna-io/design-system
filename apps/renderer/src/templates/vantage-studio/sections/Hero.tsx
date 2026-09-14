import { ArrowRight } from '@apx-ui/icons';
import { Button, Div, Reveal, Stat, Typography } from '@apx-ui/ds';

import { hero, heroStats } from '../data';

/**
 * Opening band. Three things are doing the work here:
 *
 *  1. **The headline cascades line by line.** `data.ts` authors the line breaks rather than
 *     letting the browser choose them, and the `stagger` parent walks them in sequence. At this
 *     size a wrap in the wrong place changes the reading rhythm, so the breaks are content.
 *  2. **It animates on mount, not on view** — `<Reveal onMount>`. This is the one section
 *     guaranteed to be above the fold, so a viewport trigger would be a no-op at best and a flash
 *     of hidden text at worst. Every section below it reveals on scroll, which is `Reveal`'s
 *     default: the rule is mechanical rather than remembered.
 *  3. **The gradient is a `Div` prop, not a class.** It resolves palette tokens, so the wash
 *     re-skins with the theme instead of being pinned to a literal.
 */
export function Hero() {
  return (
    <Div as="section" className="relative overflow-hidden">
      <Div
        decorative
        gradient={{
          type: 'radial',
          from: 'primary.subtle',
          to: 'background.default',
          position: 'top-right',
          size: '70%',
        }}
      />

      <Div className="relative mx-auto w-full max-w-[1600px] px-5 pb-20 pt-16 sm:px-8 lg:px-12 lg:pb-28 lg:pt-24">
        <Reveal stagger onMount>
          <Reveal preset="fade" onMount>
            <Div className="flex items-center gap-3">
              <Div aria-hidden className="size-1.5 rounded-full bg-primary" />
              <Typography
                variant="overline"
                weight="medium"
                color="fg.subtle"
                transform="upper"
                letterSpacing="widest"
                className="text-xs"
              >
                {hero.eyebrow}
              </Typography>
            </Div>
          </Reveal>

          <Typography as="h1" variant="display2Xl" weight="medium" className="mt-8">
            {hero.titleLines.map((line) => (
              <Reveal key={line} as="span" onMount className="block">
                {line}
              </Reveal>
            ))}
          </Typography>

          <Reveal
            preset="fade"
            onMount
            className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
          >
            <Typography
              variant="bodyLarge"
              color="fg.subtle"
              lineHeight="relaxed"
              className="max-w-xl"
            >
              {hero.body}
            </Typography>

            <Div className="flex shrink-0 flex-wrap gap-3">
              <Button size="lg" rightIcon={<ArrowRight size={18} />} asChild>
                <a href={hero.primaryCta.href}>{hero.primaryCta.label}</a>
              </Button>
              <Button size="lg" variant="outline" color="neutral" asChild>
                <a href={hero.secondaryCta.href}>{hero.secondaryCta.label}</a>
              </Button>
            </Div>
          </Reveal>
        </Reveal>
      </Div>

      {/* Discipline rail — the studio's remit stated flatly, as a rule under the headline. */}
      <Div className="relative border-y border-border-subtle">
        <Reveal
          stagger
          className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-x-8 gap-y-3 px-5 py-5 sm:px-8 lg:px-12"
        >
          {hero.marquee.map((item) => (
            <Reveal key={item} preset="fade">
              <Typography
                variant="bodySmall"
                color="fg.subtle"
                transform="upper"
                letterSpacing="wider"
                className="text-xs"
              >
                {item}
              </Typography>
            </Reveal>
          ))}
        </Reveal>
      </Div>

      {/* Proof row. `Stat` in compound form so the number can carry the display face. */}
      <Reveal
        stagger="row"
        columns={4}
        className="mx-auto grid w-full max-w-[1600px] grid-cols-2 gap-8 px-5 py-12 sm:px-8 lg:grid-cols-4 lg:px-12 lg:py-16"
      >
        {heroStats.map((stat) => (
          <Reveal key={stat.label}>
            <Stat variant="minimal" size="lg">
              <Stat.Value className="font-display text-3xl sm:text-4xl lg:text-5xl">
                {stat.value}
              </Stat.Value>
              <Stat.Label>{stat.label}</Stat.Label>
            </Stat>
          </Reveal>
        ))}
      </Reveal>
    </Div>
  );
}
