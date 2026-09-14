import { Div, Marquee, Section, Typography } from '@apx-ui/ds';

import { clients } from '../content';

/**
 * A running band of client names. Set in the display serif at reading size rather than as logos —
 * a studio site full of borrowed marks is a studio site advertising other people's design.
 *
 * `speed="slow"` and `pauseOnHover`, which matters more here than on a decorative band: these are
 * names someone might actually want to read, and a name that slides away as you focus on it is a
 * name you cannot read. `Marquee` handles reduced-motion and the keyboard pause itself.
 */
export function Clients() {
  return (
    <Section
      as="section"
      rhythm="flush"
      width="full"
      className="border-y border-border-subtle py-7"
    >
      <Marquee speed="slow" gap={12} pauseOnHover aria-label="Selected clients">
        {clients.map((client) => (
          <Div key={client} className="flex items-center gap-12">
            <Typography
              size="h4"
              fontFamily="display"
              color="fg.muted"
              className="whitespace-nowrap text-xl"
            >
              {client}
            </Typography>
            <Div aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-secondary" />
          </Div>
        ))}
      </Marquee>
    </Section>
  );
}
