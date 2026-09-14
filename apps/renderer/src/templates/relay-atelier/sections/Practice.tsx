import { Reveal, Section, SectionHeading, Typography } from '@apx-ui/ds';

import { sectionEyebrow } from '../sectionEyebrow';

import { practice, practiceIntro } from '../content';

/**
 * The page's one inverted band, and the second of the three places the accent appears.
 *
 * `Surface tone="inverted"` rather than a brand tone: on a near-monochrome page the ink *is* the
 * second colour, so inverting is the strongest move available and it costs no chroma. A
 * `tone="secondary"` band here would spend the entire accent budget on one section — the board's
 * "one accent, used maybe three times" is a page-level budget, and this template holds it at
 * exactly three (the section numerals, the client-band dots, and the contact link).
 *
 * Three items, not six. A capabilities list long enough to cover everything says nothing; naming
 * three is a way of declining the others.
 */
export function Practice() {
  return (
    <Section as="section" tone="inverted" id="practice">
      <Reveal preset="fade">
        <SectionHeading
          eyebrow={sectionEyebrow('02', practiceIntro.eyebrow)}
          eyebrowVariant="plain"
          titleMeasure="md"
          title={practiceIntro.title}
        />
      </Reveal>

      <Reveal as="ul" stagger className="mt-20 grid gap-14 lg:grid-cols-3 lg:gap-16">
        {practice.map((item) => (
          <Reveal as="li" key={item.id} className="border-t border-border pt-8">
            <Typography as="h3" size="h2" fontFamily="display" className="text-2xl sm:text-3xl">
              {item.title}
            </Typography>
            <Typography variant="body" lineHeight="relaxed" color="fg.muted" className="mt-5">
              {item.body}
            </Typography>
          </Reveal>
        ))}
      </Reveal>
    </Section>
  );
}
