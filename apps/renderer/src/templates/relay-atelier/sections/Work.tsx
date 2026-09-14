import { ArrowUpRight } from '@apx-ui/icons';
import { Div, Parallax, Reveal, SectionHeading, Section, Typography } from '@apx-ui/ds';

import { sectionEyebrow } from '../sectionEyebrow';

import { MockFrame } from '../../_kit';
import { caseStudies, workIntro } from '../content';

/**
 * Four case studies, alternating sides. Each is a browser frame and about sixty words — the
 * board's "show the work, quietly".
 *
 * ## The mockup
 *
 * `MockFrame chrome="browser"` from `_kit`, which existed because Halyard's two mocks needed a
 * shared frame. This is the second template to use it and the first to use the browser chrome, so
 * it is the check on whether the abstraction was right: it took the frame unchanged and supplied
 * its own body. Inside the frame is a **type composition**, not a fake screenshot — an invented
 * screenshot of an invented client is a lie in two directions, and a block of the studio's own
 * type is honest about being a placeholder while still showing the work's proportions.
 *
 * ## Parallax
 *
 * The board specced background parallax on case imagery. When this template was written the DS had
 * no parallax primitive, so it shipped without one rather than hand-rolling a scroll listener —
 * that would have been the local patch the workspace rule forbids. `Parallax` has since landed
 * ([#3](/issues/3)), so the frames drift now.
 *
 * `speed={-0.05}`, comfortably inside the ±0.1 ceiling and half of it. #2 caps parallax at ~10% of
 * scroll distance and calls it background-only; on a near-monochrome page where the frames are
 * most of the visual weight, even the ceiling would read as the layer arguing with the scroll.
 * The drift is negative so the frame lags the copy beside it, which is the reading that makes a
 * case study feel like a plate on a page rather than a card sliding past.
 *
 * The blur-in stays. The two do different jobs — `blurIn` is the arrival, the drift is what
 * happens while you read — and `Parallax` handles reduced motion itself, so the layer simply
 * stops moving without the reveal being affected.
 */
export function Work() {
  return (
    <Section as="section" id="work">
      <Reveal preset="fade">
        <SectionHeading
          eyebrow={sectionEyebrow('01', workIntro.eyebrow)}
          eyebrowVariant="plain"
          titleMeasure="md"
          title={workIntro.title}
          body={workIntro.body}
        />
      </Reveal>

      <Div as="ul" className="mt-20 flex flex-col gap-24 lg:gap-32">
        {caseStudies.map((study, index) => (
          <Reveal
            as="li"
            key={study.id}
            stagger
            className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
              index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
            }`}
          >
            <Reveal preset="blur">
              <Parallax speed={-0.05}>
                <MockFrame chrome="browser" url={study.url} label={study.client}>
                  <Div className="flex aspect-[4/3] flex-col justify-between bg-bg p-8">
                    <Typography
                      as="span"
                      variant="caption"
                      transform="upper"
                      letterSpacing="wider"
                      color="fg.subtle"
                    >
                      {study.client}
                    </Typography>
                    <Typography as="span" variant="displayLg" className="block">
                      {study.outcome}
                    </Typography>
                  </Div>
                </MockFrame>
              </Parallax>
            </Reveal>

            <Reveal>
              <Div className="flex items-baseline gap-4">
                <Typography
                  as="span"
                  variant="caption"
                  color="secondary.main"
                  className="tabular-nums"
                >
                  {study.year}
                </Typography>
                <Typography
                  as="span"
                  variant="caption"
                  transform="upper"
                  letterSpacing="wider"
                  color="fg.subtle"
                >
                  {study.discipline}
                </Typography>
              </Div>

              <Typography as="h3" variant="displayLg" className="mt-5 max-w-lg">
                {study.title}
              </Typography>

              <Typography
                variant="bodyLarge"
                lineHeight="relaxed"
                color="fg.muted"
                className="mt-6 max-w-md"
              >
                {study.summary}
              </Typography>

              <Typography
                actLike="a"
                href="#contact"
                variant="bodySmall"
                weight="medium"
                transform="upper"
                letterSpacing="wider"
                className="group mt-8 inline-flex items-center gap-2 transition hover:text-secondary"
              >
                {`Read the ${study.client} case`}
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Typography>
            </Reveal>
          </Reveal>
        ))}
      </Div>
    </Section>
  );
}
