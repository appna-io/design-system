import { Button, Div, Image, Typography } from '@apx-ui/ds';

import { hero } from '../data';

/**
 * Full-bleed ink hero. The photograph is the background rather than a column beside the copy —
 * a barbershop sells the room as much as the cut — so the type sits on a two-stop scrim instead
 * of a surface token.
 *
 * The scrim is `Div`'s typed `gradient` prop with `primary.active` → `transparent`, not a
 * literal `rgba()`: recolour `primary` and the wash follows, which is the whole point of the
 * page being theme-driven. It is layered over the image and under the content by DOM order —
 * every layer is `absolute inset-0` inside the same `relative` section.
 */
/**
 * Bone-on-ink outline button. `ButtonColor` has no inverse / on-dark role — every option paints
 * a chromatic fill or border, so a light-outlined button on a dark band has to reach for the
 * palette's contrast token directly. Same on-dark gap the booking band hits.
 */
const ON_DARK_OUTLINE = {
  borderColor: 'var(--sds-palette-primary-contrast)',
  color: 'var(--sds-palette-primary-contrast)',
} as const;

export function Hero() {
  return (
    <Div as="section" id="top" className="relative overflow-hidden bg-primary">
      <Div className="absolute inset-0">
        <Image
          src={hero.image.src}
          alt={hero.image.alt}
          fit="cover"
          fullWidth
          loading="eager"
          className="h-full w-full opacity-60"
          fallback={<Div className="h-full w-full bg-primary-hover" />}
        />
      </Div>

      <Div
        decorative
        gradient={{
          type: 'linear',
          from: 'primary.active',
          to: 'transparent',
          position: 'right',
          toStop: '85%',
        }}
      />

      <Div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
        <Div animation="slideInFromBottom" className="max-w-2xl">
          <Div className="flex items-center gap-3">
            <Div aria-hidden className="h-px w-8 bg-secondary" />
            <Typography
              variant="overline"
              weight="semibold"
              color="secondary.main"
              transform="upper"
              letterSpacing="wider"
            >
              {hero.eyebrow}
            </Typography>
          </Div>

          <Typography
            as="h1"
            variant="display"
            weight="bold"
            lineHeight="none"
            letterSpacing="tight"
            fontFamily="display"
            transform="upper"
            color="primary.contrast"
            className="mt-6 text-5xl sm:text-6xl lg:text-7xl"
          >
            {hero.title}
          </Typography>

          <Typography
            variant="bodyLarge"
            lineHeight="relaxed"
            color="primary.contrast"
            className="mt-6 max-w-lg opacity-80"
          >
            {hero.body}
          </Typography>

          <Div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" color="secondary" asChild>
              <a href={hero.primaryCta.href}>{hero.primaryCta.label}</a>
            </Button>
            <Button size="lg" variant="outline" style={ON_DARK_OUTLINE} asChild>
              <a href={hero.secondaryCta.href}>{hero.secondaryCta.label}</a>
            </Button>
          </Div>

          <Div className="mt-10 flex items-center gap-3">
            <Div aria-hidden className="h-2 w-2 rounded-full bg-secondary" />
            <Typography
              variant="bodySmall"
              weight="medium"
              color="primary.contrast"
              className="opacity-70"
            >
              {hero.status}
            </Typography>
          </Div>
        </Div>
      </Div>
    </Div>
  );
}
