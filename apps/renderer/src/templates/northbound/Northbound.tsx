'use client';

import { Div } from '@apx-ui/ds';

import { Inspectable } from '../../components/templates/inspector';

import { Agenda } from './sections/Agenda';
import { CtaBand } from './sections/CtaBand';
import { Faq } from './sections/Faq';
import { Hero } from './sections/Hero';
import { SiteFooter } from './sections/SiteFooter';
import { SiteHeader } from './sections/SiteHeader';
import { Speakers } from './sections/Speakers';
import { Stats } from './sections/Stats';
import { Tickets } from './sections/Tickets';
import { TopicBand } from './sections/TopicBand';
import { Venue } from './sections/Venue';

/**
 * Orchestrator for the Northbound conference page.
 *
 * Order is the sequence a reader actually decides in: what is it (hero) → what is it about
 * (topics) → how big is it (stats) → who is speaking (speakers) → **what is on when** (agenda) →
 * can I get there (venue) → what does it cost (tickets) → the things that would stop me (faq) →
 * the deadline (cta). The agenda sits in the middle rather than at the end because it is the
 * thing the page is selling; burying it under pricing would be selling a day nobody has read.
 *
 * ## The duotone, as a sequence
 *
 * ```
 *   hero        primary     ink navy
 *   topics      secondary   signal orange
 *   stats       default     paper
 *   speakers    default     paper
 *   agenda      default     paper
 *   venue       inverted    the page's own ink
 *   tickets     default     paper
 *   faq         default     paper
 *   cta         secondary   signal orange
 * ```
 *
 * Two brand grounds, one inverted, and paper between them — the bands are *events*, not the
 * rhythm. #2's rule that adjacent sections never share a vertical rhythm across a colour change
 * is why the paper runs get the standard `py-20 lg:py-28` while the two brand bands run
 * `lg:py-32`: the eye needs the break to read as a break.
 *
 * Nothing is defined inline here and no section imports another. The three shared pieces —
 * `BrandMark`, `SectionHeading`, `Countdown` — sit at the template root, and `Countdown` is used
 * by two sections, which is why it lives there rather than inside the hero.
 *
 * The header's `sticky` lives on the wrapper, not inside the section: an `<Inspectable>` is
 * exactly its child's height, so a sticky child inside it could never move.
 */
export function Northbound() {
  return (
    <Div className="min-h-screen bg-bg text-fg">
      <Inspectable id="site-header" label="Site header" className="sticky top-0 z-50">
        <SiteHeader />
      </Inspectable>

      <Div as="main">
        <Inspectable id="hero" label="Hero poster">
          <Hero />
        </Inspectable>

        <Inspectable id="topics" label="Topic marquee">
          <TopicBand />
        </Inspectable>

        <Inspectable id="stats" label="Day at a glance">
          <Stats />
        </Inspectable>

        <Inspectable id="speakers" label="Speakers">
          <Speakers />
        </Inspectable>

        <Inspectable id="agenda" label="Agenda">
          <Agenda />
        </Inspectable>

        <Inspectable id="venue" label="Venue">
          <Venue />
        </Inspectable>

        <Inspectable id="tickets" label="Tickets">
          <Tickets />
        </Inspectable>

        <Inspectable id="faq" label="Practicalities">
          <Faq />
        </Inspectable>

        <Inspectable id="cta" label="Closing CTA">
          <CtaBand />
        </Inspectable>
      </Div>

      <Inspectable id="site-footer" label="Site footer">
        <SiteFooter />
      </Inspectable>
    </Div>
  );
}
