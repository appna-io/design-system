'use client';

import { Div } from '@apx-ui/ds';

import { Inspectable } from '../../components/templates/inspector';

import { Barbers } from './sections/Barbers';
import { Booking } from './sections/Booking';
import { Craft } from './sections/Craft';
import { Hero } from './sections/Hero';
import { Numbers } from './sections/Numbers';
import { Services } from './sections/Services';
import { SiteFooter } from './sections/SiteFooter';
import { SiteHeader } from './sections/SiteHeader';
import { Testimonials } from './sections/Testimonials';
import { Visit } from './sections/Visit';

/**
 * Orchestrator for the Fade & Co. barbershop page.
 *
 * Order follows how a shop actually converts: the room, the proof, the price list, the promise,
 * the people, the reviews, the booking form, then how to get there. Nothing is defined inline
 * here and no section imports another; the two pieces several sections share (`BrandMark`,
 * `SectionHeading`) sit at the template root.
 *
 * The ink bands (hero, craft, booking, footer) alternate with bone ones on purpose — four dark
 * sections at four different points down the page is what keeps a mostly-monochrome palette
 * from reading flat.
 *
 * The header's `sticky` lives on the wrapper, not inside the section: an `<Inspectable>` is
 * exactly its child's height, so a sticky child inside it could never move.
 */
export function FadeAndCo() {
  return (
    <Div className="min-h-screen bg-bg text-fg">
      <Inspectable id="site-header" label="Site header" className="sticky top-0 z-50">
        <SiteHeader />
      </Inspectable>

      <Div as="main">
        <Inspectable id="hero" label="Hero">
          <Hero />
        </Inspectable>

        <Inspectable id="numbers" label="Numbers band">
          <Numbers />
        </Inspectable>

        <Inspectable id="services" label="Services">
          <Services />
        </Inspectable>

        <Inspectable id="craft" label="Why here">
          <Craft />
        </Inspectable>

        <Inspectable id="barbers" label="Barbers">
          <Barbers />
        </Inspectable>

        <Inspectable id="testimonials" label="Testimonials">
          <Testimonials />
        </Inspectable>

        <Inspectable id="booking" label="Booking">
          <Booking />
        </Inspectable>

        <Inspectable id="visit" label="Visit">
          <Visit />
        </Inspectable>
      </Div>

      <Inspectable id="site-footer" label="Site footer">
        <SiteFooter />
      </Inspectable>
    </Div>
  );
}
