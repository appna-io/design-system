import { Avatar, Reveal, Section, SectionHeading, Typography } from '@apx-ui/ds';

import { people, studioSection } from '../data';

/**
 * The people. `Avatar` with `shape="square"` rather than the default circle — this identity is
 * squared throughout, and a row of circles would be the one soft thing on the page.
 *
 * `name` is passed alongside `src` so the initials fallback is a real fallback: if a portrait
 * fails to load the card degrades to monogram + role instead of a hole in the grid.
 */
export function Studio() {
  return (
    <Section
      as="section"
      id="studio"
      width="wide"
      className="border-y border-border-subtle bg-bg-subtle"
    >
      <Reveal>
        <SectionHeading intro={studioSection} eyebrowVariant="rule" size="section" />
      </Reveal>

      <Reveal
        as="ul"
        stagger="row"
        columns={6}
        delay="short"
        className="mt-16 grid list-none grid-cols-2 gap-x-6 gap-y-10 p-0 sm:grid-cols-3 lg:grid-cols-6"
      >
        {people.map((person) => (
          <Reveal as="li" key={person.name}>
              <Avatar
                src={person.image}
                name={person.name}
                alt={person.name}
                shape="square"
                size="xl"
                className="!size-full aspect-square rounded-xl"
              />
              <Typography
                as="h3"
                variant="body"
                weight="medium"
                letterSpacing="tight"
                className="mt-4"
              >
                {person.name}
              </Typography>
              <Typography variant="bodySmall" color="fg.subtle" className="mt-1">
                {person.role}
              </Typography>
          </Reveal>
        ))}
      </Reveal>
    </Section>
  );
}
