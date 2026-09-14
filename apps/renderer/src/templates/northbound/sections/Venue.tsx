import { Clock, Coffee, Globe, MapPin } from '@apx-ui/icons';
import { Reveal, Section, SectionHeading, Typography } from '@apx-ui/ds';

import { venueFacts, venueIntro } from '../content';

/**
 * Where, when, in what language, and what is included — the four things a reader needs before
 * they can decide whether they can attend at all, and the four that conference sites most often
 * bury in a footer.
 *
 * On the inverted band rather than a brand tone: this is the page's one *quiet* dark moment,
 * between two loud brand bands, and `tone="inverted"` grounds on the page's own ink rather than
 * introducing a third fill. Three grounds in a row all shouting is how a duotone becomes noise.
 *
 * The accessibility line is content, not decoration — "step-free throughout", "live captions" —
 * because a venue section that omits it is telling disabled readers to email and ask.
 */
const ICONS = { MapPin, Clock, Globe, Coffee } as const;

export function Venue() {
  return (
    <Section
      as="section"
      tone="inverted"
      id="venue"
      rhythm="compact"
      className="border-y-2 border-fg"
    >
      <Reveal>
        <SectionHeading
          eyebrowStyle={{ variant: 'solid', shape: 'square' }}
          eyebrow={venueIntro.eyebrow}
          title={venueIntro.title}
          body={venueIntro.body}
        />
      </Reveal>

      <Reveal
        as="dl"
        stagger="row"
        columns={4}
        className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4"
      >
        {venueFacts.map((fact) => {
          const Icon = ICONS[fact.icon];
          return (
            <Reveal key={fact.label} preset="fade" className="border-t-2 border-current pt-5">
              <Icon size={22} aria-hidden />
              <Typography
                as="dt"
                variant="overline"
                weight="semibold"
                transform="upper"
                letterSpacing="wider"
                color="fg.muted"
                className="mt-4 block"
              >
                {fact.label}
              </Typography>
              <Typography
                as="dd"
                variant="h4"
                weight="bold"
                fontFamily="display"
                lineHeight="tight"
                className="mt-2 block text-xl"
              >
                {fact.value}
              </Typography>
              {fact.detail && (
                <Typography variant="bodySmall" color="fg.muted" className="mt-2 block">
                  {fact.detail}
                </Typography>
              )}
            </Reveal>
          );
        })}
      </Reveal>
    </Section>
  );
}
