import { ArrowDown } from '@apx-ui/icons';
import { Div, Typography } from '@apx-ui/ds';

import { hero } from '../content';

/**
 * Four words, set as large as the scale goes, with almost nothing around them.
 *
 * This is the acceptance test for #2's G1: `variant="display2Xl"` resolves to
 * `clamp(3.5rem, 9vw + 1rem, 7.5rem)` — 120px at the cap, which clears the board's "6rem+" and is
 * the first thing in the gallery to actually reach the top of the scale. Before G1 this hero would
 * have been a hand-rolled `clamp()`, which is exactly what Northbound had to do.
 *
 * ## Why the three lines are three elements
 *
 * A single string with `<br>`s cannot stagger, and the line break is the composition here — the
 * hang of "itself." under "the thing" is the whole image. Three spans in a stagger parent means
 * the lines arrive in reading order, 90ms apart, which is the one place this template lets motion
 * be theatrical.
 *
 * They sit inside **one** `h1`, not three. Three would be three top-level headings for a single
 * title, and the version before this had none at all — the lines were bare spans, so the page's
 * whole argument was invisible to the document outline.
 *
 * It plays on mount rather than on scroll (#2: above the fold does not scroll-reveal) and is
 * finished in about half a second.
 *
 * ## The measure
 *
 * `max-w-[14ch]` on the headline block, not a `rem` width. At 120px the line length that reads
 * well is a function of the *type size*, and `ch` is the only unit that tracks it — a fixed `rem`
 * measure that works at the 3.5rem floor is far too wide at the cap.
 */
export function Hero() {
  return (
    <Div as="section" id="top" className="relative overflow-hidden">
      <Div
        stagger={0.09}
        className="mx-auto w-full max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-32 lg:pt-28"
      >
        {/* The `h1` is the wrapper, not each line. Three headings would be three top-level
            headings for one title, and a page whose title is only `<span>`s has no `h1` at all —
            which is what this was before the #2 checklist caught it. `h1` takes phrasing content
            only, so the animated children are spans rather than divs. */}
        <Div as="h1" className="max-w-[14ch]">
          {[hero.line1, hero.line2, hero.line3].map((line) => (
            <Div key={line} as="span" animation="riseIn" className="block">
              <Typography as="span" variant="display2Xl" className="block">
                {line}
              </Typography>
            </Div>
          ))}
        </Div>

        <Div
          animation="fadeIn"
          className="mt-14 flex flex-col gap-8 border-t border-border-subtle pt-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <Typography
            variant="bodyLarge"
            lineHeight="relaxed"
            color="fg.muted"
            className="max-w-md"
          >
            {hero.standfirst}
          </Typography>

          <Typography
            actLike="a"
            href={hero.cta.href}
            variant="bodySmall"
            weight="medium"
            transform="upper"
            letterSpacing="wider"
            className="group inline-flex shrink-0 items-center gap-3 transition hover:text-secondary"
          >
            {hero.cta.label}
            <ArrowDown size={16} className="transition-transform group-hover:translate-y-1" />
          </Typography>
        </Div>
      </Div>
    </Div>
  );
}
