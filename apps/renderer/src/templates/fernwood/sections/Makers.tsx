import { Div, Image, SectionHeading, Typography } from '@apx-ui/ds';

import { makers, makersSection } from '../content';

/**
 * The makers — the section that carries the brand's actual claim, so it gets portraits at a real
 * size rather than avatar chips.
 *
 * `hoverEffect="lift"` rather than `"zoom"`: these are people, and scaling a portrait on hover
 * reads as a product interaction. The lift is the quieter acknowledgement, and it is the DS's own
 * shadow scale doing it rather than a hand-rolled `hover:shadow-xl`.
 *
 * The reveal comes in from the inline-start edge so the three cards arrive in reading order,
 * which under RTL means they arrive from the right — `slideInFromLeft` is authored motion and
 * deliberately not mirrored, so the cascade still reads as a sequence either way.
 */
export function Makers() {
  return (
    <Div as="section" id="makers" className="scroll-mt-28">
      <Div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading intro={makersSection} />

        <Div
          as="ul"
          stagger={0.1}
          staggerDelay={0.08}
          animateOnView={{ amount: 0.15 }}
          className="mt-14 grid list-none grid-cols-1 gap-8 p-0 sm:grid-cols-3"
        >
          {makers.map((maker) => (
            <Div as="li" key={maker.id} animation="riseIn" animationDuration="slower">
              <Image
                src={maker.media.src}
                alt={maker.media.alt}
                hoverEffect="lift"
                aspectRatio="4/5"
                fit="cover"
                radius="xl"
                fullWidth
                loading="lazy"
                fallback={<Div className="h-full w-full bg-neutral-subtle" />}
              />

              <Typography
                as="h3"
                size="h4"
                weight="medium"
                letterSpacing="tight"
                fontFamily="display"
                className="mt-5 text-xl"
              >
                {maker.name}
              </Typography>
              <Typography
                variant="bodySmall"
                color="primary"
                transform="upper"
                letterSpacing="wider"
                className="mt-1.5 text-xs"
              >
                {maker.craft}
              </Typography>
              <Typography
                as="blockquote"
                variant="body"
                color="fg.muted"
                lineHeight="relaxed"
                className="mt-4"
              >
                &ldquo;{maker.quote}&rdquo;
              </Typography>
            </Div>
          ))}
        </Div>
      </Div>
    </Div>
  );
}
