import { Div, Reveal, Section, SectionHeading, Typography } from '@apx-ui/ds';

import { approach, approachSection } from '../data';

/**
 * Process band. Four columns on desktop, each with a rule above it — the rules are what turn four
 * paragraphs into a timeline without importing a component whose vertical axis would fight this
 * layout.
 *
 * The accent rule grows in from zero width on reveal. That is a template-level flourish and it is
 * built from `Div`'s own animation props rather than a keyframe, so it still respects
 * `prefers-reduced-motion` through the same gate as everything else on the page.
 */
export function Approach() {
  return (
    <Section as="section" id="approach" width="wide">
      <Reveal>
        <SectionHeading intro={approachSection} eyebrowVariant="rule" size="section" />
      </Reveal>

      <Reveal
        as="ol"
        stagger
        delay="short"
        className="mt-16 grid list-none grid-cols-1 gap-10 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8"
      >
        {approach.map((step) => (
          <Reveal as="li" key={step.week}>
              <Div aria-hidden className="h-px w-full bg-primary" />
              <Typography
                variant="bodySmall"
                weight="medium"
                color="primary"
                transform="upper"
                letterSpacing="wider"
                className="mt-5 text-xs"
              >
                {step.week}
              </Typography>
              <Typography
                as="h3"
                variant="h4"
                weight="medium"
                letterSpacing="tight"
                fontFamily="display"
                className="mt-3 text-xl sm:text-2xl"
              >
                {step.title}
              </Typography>
              <Typography
                variant="bodySmall"
                color="fg.subtle"
                lineHeight="relaxed"
                className="mt-3"
              >
                {step.body}
              </Typography>
          </Reveal>
        ))}
      </Reveal>
    </Section>
  );
}
