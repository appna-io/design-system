import { Div, Reveal, Section, SectionHeading, Stat } from '@apx-ui/ds';

import { sectionEyebrow } from '../sectionEyebrow';

import { studioIntro, studioStats } from '../content';

/**
 * The studio, in three numbers and two sentences.
 *
 * `Stat size="display"` — the display serif at `tabular-nums`, which matters here beyond the
 * count-up rule: a high-contrast serif's figures are the most characterful thing in the face, and
 * three of them at 4rem is most of this section's visual interest.
 *
 * `2019` is a year rather than a quantity and carries no `countTo`, so it sits still while the
 * other two count. That asymmetry is the point — counting up to a year is nonsense, and it would
 * run three orders of magnitude longer than the `4` beside it.
 */
export function Studio() {
  return (
    <Section as="section" id="studio">
      <Div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
        <Reveal preset="fade">
          <SectionHeading
            eyebrow={sectionEyebrow('03', studioIntro.eyebrow)}
            eyebrowVariant="plain"
            titleMeasure="md"
            title={studioIntro.title}
            body={studioIntro.body}
          />
        </Reveal>

        <Reveal as="dl" stagger className="grid grid-cols-3 gap-6 self-end lg:gap-10">
          {studioStats.map((stat) => (
            <Reveal key={stat.label} className="border-t border-border-subtle pt-6">
              <Stat
                size="display"
                label={stat.label}
                value={stat.countTo ?? stat.value}
                countUp={stat.countTo !== undefined}
              />
            </Reveal>
          ))}
        </Reveal>
      </Div>
    </Section>
  );
}
