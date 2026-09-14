import { Div, Marquee, Surface, Typography } from '@apx-ui/ds';

import { marquee } from '../content';

/**
 * The six subject areas, on a running band. Full-bleed on purpose — it is the one element that
 * breaks the container, and it breaks it because a marquee that stops at a margin reads as a
 * broken carousel rather than a ticker.
 *
 * `speed="slow"` rather than a `duration`: the token scale normalises for track length, so this
 * six-item band travels at the same *rate* as a twenty-item one elsewhere in the gallery instead
 * of the same cycle time. `Marquee` handles reduced-motion itself — it stops and stays legible —
 * which is exactly why this is a DS component and not a local `@keyframes`.
 */
export function TopicBand() {
  return (
    <Surface as="section" tone="secondary" className="border-b-2 border-fg py-5">
      <Marquee speed="slow" gap={12} aria-label="Conference subject areas">
        {marquee.map((topic) => (
          <Div key={topic} className="flex items-center gap-10">
            <Typography
              as="span"
              variant="h4"
              weight="bold"
              fontFamily="display"
              transform="upper"
              letterSpacing="wider"
              className="whitespace-nowrap text-lg sm:text-xl"
            >
              {topic}
            </Typography>
            <Div aria-hidden className="h-2 w-2 shrink-0 rotate-45 bg-current" />
          </Div>
        ))}
      </Marquee>
    </Surface>
  );
}
