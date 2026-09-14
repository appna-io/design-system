'use client';

import { useMemo, useState } from 'react';
import { Badge, Button, Div, Reveal, Section, SectionHeading, Table, Typography } from '@apx-ui/ds';

import { agenda, agendaIntro, speakers, tracks, type AgendaSlot } from '../content';

/**
 * The agenda — the one section that has to be genuinely usable rather than persuasive. Everything
 * else on a conference page is an argument; this is the product.
 *
 * ## Why a real `<Table>` and not a stack of cards
 *
 * A schedule is tabular data: time, talk, track, room, with meaning in both axes. Cards would
 * throw away the column relationship and make it impossible to scan "what is on at 10:20", which
 * is the only question anyone actually asks a schedule. `Table` gives us the semantics
 * (`<th scope>`, a caption) for free, and #2 requires wide content to scroll inside its own
 * container rather than the page — `Table` already handles that.
 *
 * ## The filter
 *
 * Client-side, over a `useMemo`d list, with `null`-track rows (registration, lunch, the closing
 * drinks) always kept. Filtering those out would leave gaps in the day and make the schedule read
 * as if the venue were empty between 11:00 and 12:00 — the whole-room moments are what make it a
 * day rather than a talk list, so they are structurally exempt rather than a special case in the
 * data.
 *
 * The filter is a row of buttons, not a `Select`: three options are faster to read as a set than
 * to open, and the current state stays visible while you read the table under it.
 *
 * ## Motion
 *
 * None on the rows. This is the template's counter-example to itself: an agenda that re-animates
 * every time you change the filter would be unusable, and #2's "one reveal per viewport" already
 * spent this section's motion budget on the heading. Where the section *does* reveal, it reveals
 * as one block.
 */
const SPEAKER_BY_ID = new Map(speakers.map((speaker) => [speaker.id, speaker]));
const TRACK_BY_ID = new Map(tracks.map((track) => [track.id, track]));

const COLUMNS = [
  {
    id: 'time',
    header: 'Time',
    width: '8.5rem',
    cell: (slot: AgendaSlot) => (
      <Typography as="span" variant="bodySmall" weight="semibold" className="tabular-nums">
        {slot.start}
        <Typography as="span" variant="bodySmall" color="fg.subtle" className="tabular-nums">
          {' '}
          – {slot.end}
        </Typography>
      </Typography>
    ),
  },
  {
    id: 'title',
    header: 'Session',
    minWidth: '18rem',
    cell: (slot: AgendaSlot) => {
      const speaker = slot.speakerId ? SPEAKER_BY_ID.get(slot.speakerId) : undefined;
      return (
        <Div>
          <Typography as="span" variant="body" weight="semibold" className="block">
            {slot.title}
          </Typography>
          {speaker && (
            <Typography as="span" variant="bodySmall" color="fg.muted" className="block">
              {speaker.name} · {speaker.company}
            </Typography>
          )}
        </Div>
      );
    },
  },
  {
    id: 'track',
    header: 'Track',
    width: '11rem',
    cell: (slot: AgendaSlot) => {
      const track = slot.trackId ? TRACK_BY_ID.get(slot.trackId) : undefined;
      // A break has no track, and an em dash says so more clearly than an empty cell, which reads
      // as missing data rather than as "everyone, everywhere".
      if (!track) {
        return (
          <Typography as="span" variant="bodySmall" color="fg.subtle" aria-label="All attendees">
            &mdash;
          </Typography>
        );
      }
      return (
        <Badge variant="soft" color={track.color} shape="square" size="sm">
          {track.name}
        </Badge>
      );
    },
  },
  {
    id: 'room',
    header: 'Room',
    width: '9rem',
    cell: (slot: AgendaSlot) => (
      <Typography as="span" variant="bodySmall" color="fg.muted">
        {slot.room}
      </Typography>
    ),
  },
];

export function Agenda() {
  const [trackId, setTrackId] = useState<string | null>(null);

  // `Table` takes a mutable `data` array while the content tree is `readonly` on purpose — the
  // copy is the seam between the two, not a workaround. Cheap: twelve rows, and it only re-runs
  // when the filter changes.
  const rows = useMemo(
    () =>
      trackId
        ? agenda.filter((slot) => slot.trackId === null || slot.trackId === trackId)
        : [...agenda],
    [trackId],
  );

  const filters: readonly { id: string | null; label: string }[] = [
    { id: null, label: 'All tracks' },
    ...tracks.map((track) => ({ id: track.id as string | null, label: track.name })),
  ];

  return (
    <Section as="section" id="agenda" rhythm="compact">
      <Reveal>
        <SectionHeading
          eyebrowStyle={{ variant: 'solid', shape: 'square' }}
          eyebrow={agendaIntro.eyebrow}
          title={agendaIntro.title}
          body={agendaIntro.body}
        />

        <Div
          role="group"
          aria-label="Filter the agenda by track"
          className="mt-10 flex flex-wrap gap-2"
        >
          {filters.map((filter) => {
            const active = filter.id === trackId;
            return (
              <Button
                key={filter.label}
                size="sm"
                variant={active ? 'solid' : 'outline'}
                color="neutral"
                aria-pressed={active}
                onClick={() => setTrackId(filter.id)}
              >
                {filter.label}
              </Button>
            );
          })}
        </Div>

        <Div className="mt-8 border-2 border-fg">
          <Table
            columns={COLUMNS}
            data={rows}
            getRowId={(slot: AgendaSlot) => slot.id}
            ariaLabel="Conference agenda"
            stickyHeader
          />
        </Div>

        {/* A live region, so a screen-reader user who presses a filter is told what happened.
            Without it the only feedback is a table quietly changing length below the focus. */}
        <Typography variant="bodySmall" color="fg.muted" className="mt-4 block" aria-live="polite">
          Showing {rows.length} of {agenda.length} sessions.
        </Typography>
      </Reveal>
    </Section>
  );
}
