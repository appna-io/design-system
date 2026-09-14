import { Avatar, Badge, Div, Reveal, Section, SectionHeading, Typography } from '@apx-ui/ds';

import { speakers, speakersIntro, tracks } from '../content';

/**
 * Six speakers, each with the talk they are actually giving.
 *
 * The card leads with the *topic*, not the person: a name means nothing to most readers, and a
 * conference is bought on the talks. The name and company sit under it as attribution.
 *
 * `Avatar` draws initials rather than a photograph. That is a deliberate choice, not a
 * placeholder to fill in later — a template that shipped stock headshots would be attaching real
 * strangers' faces to invented job titles, and the initials tile re-themes with the palette where
 * a photo never could.
 *
 * The track chip reads its palette role from the content (`Track.color`), so a track's colour is
 * a role and recolouring the theme recolours the schedule — the same chip appears in the agenda.
 */
const TRACK_BY_ID = new Map(tracks.map((track) => [track.id, track]));

export function Speakers() {
  return (
    <Section as="section" id="speakers" rhythm="compact">
      <Reveal>
        <SectionHeading
          eyebrowStyle={{ variant: 'solid', shape: 'square' }}
          eyebrow={speakersIntro.eyebrow}
          title={speakersIntro.title}
          body={speakersIntro.body}
        />
      </Reveal>

      <Reveal
        as="ul"
        stagger="row"
        columns={3}
        className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {speakers.map((speaker) => {
          const track = TRACK_BY_ID.get(speaker.trackId);
          return (
            <Reveal
              as="li"
              key={speaker.id}
              className="group flex h-full flex-col border-2 border-fg bg-bg p-6 transition-transform duration-200 hover:-translate-y-1"
            >
              {track && (
                <Badge variant="soft" color={track.color} shape="square" size="sm">
                  {track.name}
                </Badge>
              )}

              <Typography
                as="h3"
                variant="h4"
                weight="bold"
                fontFamily="display"
                lineHeight="tight"
                className="mt-5 text-xl"
              >
                {speaker.topic}
              </Typography>

              <Div className="mt-auto flex items-center gap-3 pt-8">
                <Avatar name={speaker.name} size="md" color="auto">
                  {speaker.initials}
                </Avatar>
                <Div>
                  <Typography as="span" variant="body" weight="semibold" className="block">
                    {speaker.name}
                  </Typography>
                  <Typography as="span" variant="bodySmall" color="fg.muted" className="block">
                    {speaker.role} · {speaker.company}
                  </Typography>
                </Div>
              </Div>
            </Reveal>
          );
        })}
      </Reveal>
    </Section>
  );
}
