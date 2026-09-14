'use client';

import { Div } from '@apx-ui/ds';

import { Inspectable } from '../../components/templates/inspector';

import { Approach } from './sections/Approach';
import { Clients } from './sections/Clients';
import { CtaBand } from './sections/CtaBand';
import { Hero } from './sections/Hero';
import { Services } from './sections/Services';
import { SiteFooter } from './sections/SiteFooter';
import { SiteHeader } from './sections/SiteHeader';
import { Studio } from './sections/Studio';
import { Testimonial } from './sections/Testimonial';
import { Work } from './sections/Work';

/**
 * Orchestrator for the Vantage studio site.
 *
 * The order is the argument a studio actually has to make, and each step earns the next: claim
 * (hero) → who trusted us (clients) → proof (work) → what you would be buying (services) → how it
 * would run (approach) → who you would work with (studio) → someone who did it (testimonial) →
 * ask (cta).
 *
 * Nothing is defined inline here and no section imports another. The two pieces several sections
 * share — `BrandMark` and `SectionHeading` — sit at the template root.
 *
 * The header's `sticky` lives on the wrapper, not inside the section: an `<Inspectable>` is
 * exactly its child's height, so a sticky child inside it could never move.
 */
export function VantageStudio() {
  return (
    <Div id="top" className="min-h-screen bg-bg text-fg">
      <Inspectable id="site-header" label="Site header" className="sticky top-0 z-50">
        <SiteHeader />
      </Inspectable>

      <Div as="main">
        <Inspectable id="hero" label="Hero">
          <Hero />
        </Inspectable>

        <Inspectable id="clients" label="Client wall">
          <Clients />
        </Inspectable>

        <Inspectable id="work" label="Selected work">
          <Work />
        </Inspectable>

        <Inspectable id="services" label="Services">
          <Services />
        </Inspectable>

        <Inspectable id="approach" label="Approach">
          <Approach />
        </Inspectable>

        <Inspectable id="studio" label="The studio">
          <Studio />
        </Inspectable>

        <Inspectable id="testimonial" label="Testimonial">
          <Testimonial />
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
