import { Div, Reveal, Section, Typography } from '@apx-ui/ds';

import { clients, clientsSection } from '../data';

/**
 * Client wall, set as a type grid rather than a logo strip.
 *
 * Real logos would be either borrowed marks (a false endorsement) or grey rectangles, and both
 * are worse than simply setting the names — which is also what a lot of studios do, because at
 * this scale the list *is* the credential.
 *
 * The cascade runs left-to-right through the grid because `stagger` follows DOM order, and the
 * grid's DOM order is its reading order.
 */
export function Clients() {
  return (
    <Section
      as="section"
      width="wide"
      rhythm="compact"
      className="border-b border-border-subtle bg-bg-subtle"
    >
      <Reveal preset="fade" className="flex items-center gap-3">
        <Div aria-hidden className="h-px w-8 bg-primary" />
        <Typography
          variant="overline"
          weight="medium"
          color="fg.subtle"
          transform="upper"
          letterSpacing="widest"
          className="text-xs"
        >
          {clientsSection.eyebrow}
        </Typography>
      </Reveal>

      <Reveal
        as="ul"
        stagger="row"
        columns={4}
        className="mt-8 grid list-none grid-cols-2 gap-x-8 gap-y-5 p-0 sm:grid-cols-3 lg:grid-cols-4"
      >
        {clients.map((client) => (
          <Reveal as="li" key={client}>
            {/*
              `as="span"` is load-bearing. `variant` drives BOTH the type scale and the default
              element, so `variant="h4"` alone emitted eight real `<h4>`s for what are just names
              in a list — putting an h1 → h4 skip at the top of the document outline and telling
              assistive tech this band had eight subheadings.

              Invisible in the source and in the design; only the rendered outline shows it. Take
              the size from `variant`, the element from `as`.
            */}
            <Typography
              as="span"
              variant="h4"
              weight="medium"
              letterSpacing="tight"
              fontFamily="display"
              color="fg.muted"
              className="block text-xl sm:text-2xl"
            >
              {client}
            </Typography>
          </Reveal>
        ))}
      </Reveal>
    </Section>
  );
}
