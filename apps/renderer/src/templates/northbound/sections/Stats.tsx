import { Reveal, Section, SectionHeading, Stat } from '@apx-ui/ds';

import { stats, statsIntro } from '../content';

/**
 * The shape of the day, in four numbers.
 *
 * `Stat size="display"` with `countUp` — the DS step added in #3 for exactly this band. The
 * numerals are the display face at `tabular-nums`, which is not decoration at this size: a
 * proportional face re-measures the row on every frame of a count-up and the whole grid jitters.
 *
 * `countUp` is switched by the presence of `countTo` rather than turned on for the row, which is
 * the distinction the content schema's separate numeric field exists to let content make. All four
 * of these are quantities, so all four count; a stat whose value is a year would not.
 *
 * One reveal for the group at the house interval — the same one the agenda rows use. Repeating one
 * interval across the page is what makes the motion read as a schedule rather than as decoration.
 */
export function Stats() {
  return (
    <Section as="section" rhythm="compact">
      <Reveal>
        <SectionHeading
          eyebrowStyle={{ variant: 'solid', shape: 'square' }}
          eyebrow={statsIntro.eyebrow}
          title={statsIntro.title}
          body={statsIntro.body}
        />
      </Reveal>

      <Reveal
        as="dl"
        stagger
        className="mt-14 grid grid-cols-2 gap-px border-2 border-fg bg-fg lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <Reveal key={stat.label} preset="fade" className="bg-bg p-6 lg:p-8">
            <Stat
              size="display"
              label={stat.label}
              value={stat.countTo ?? stat.value}
              countUp={stat.countTo !== undefined}
            />
          </Reveal>
        ))}
      </Reveal>
    </Section>
  );
}
