'use client';

import { Div } from '@apx-ui/ds';

import { Inspectable } from '../../components/templates/inspector';

import { Clients } from './sections/Clients';
import { Contact } from './sections/Contact';
import { Hero } from './sections/Hero';
import { Practice } from './sections/Practice';
import { SiteFooter } from './sections/SiteFooter';
import { SiteHeader } from './sections/SiteHeader';
import { Studio } from './sections/Studio';
import { Work } from './sections/Work';

/**
 * Orchestrator for the Relay Atelier studio page.
 *
 * Seven sections, which is the fewest in the gallery — and the point. A portfolio's argument is
 * that the work is good; every section that is not work is a section arguing about the argument.
 * Order: claim (hero) → who trusted us (clients) → **the work** → how we work → who we are →
 * how to reach us.
 *
 * ## Nothing is sticky
 *
 * Alone in the gallery, this page has no sticky header. That is a design decision rather than an
 * omission: a studio site whose chrome follows you down the page is one that does not trust its
 * work to hold you. The nav is three links and you can scroll back.
 *
 * ## The colour budget
 *
 * Near-monochrome, with the accent appearing in exactly **three** places on the whole page — the
 * section numerals, the dots in the client band, and the email address in `Contact`. The board
 * asked for "one accent, used maybe three times"; this is that, counted rather than estimated.
 *
 * One inverted band (`Practice`) and no brand-filled band at all. On a page whose second colour is
 * the ink, inverting is the strongest available move and it costs no chroma; a `tone="primary"`
 * band would spend the accent budget on a container.
 */
export function RelayAtelier() {
  return (
    <Div className="min-h-screen bg-bg text-fg">
      <Inspectable id="site-header" label="Site header">
        <SiteHeader />
      </Inspectable>

      <Div as="main">
        <Inspectable id="hero" label="Hero">
          <Hero />
        </Inspectable>

        <Inspectable id="clients" label="Client band">
          <Clients />
        </Inspectable>

        <Inspectable id="work" label="Selected work">
          <Work />
        </Inspectable>

        <Inspectable id="practice" label="Practice">
          <Practice />
        </Inspectable>

        <Inspectable id="studio" label="Studio">
          <Studio />
        </Inspectable>

        <Inspectable id="contact" label="Contact">
          <Contact />
        </Inspectable>
      </Div>

      <Inspectable id="site-footer" label="Site footer">
        <SiteFooter />
      </Inspectable>
    </Div>
  );
}
