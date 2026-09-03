'use client';

import { Div } from '@apx-ui/ds';

import { Inspectable } from '../../components/templates/inspector';

import { FeaturedBeans } from './sections/FeaturedBeans';
import { Hero } from './sections/Hero';
import { Newsletter } from './sections/Newsletter';
import { Process } from './sections/Process';
import { SiteFooter } from './sections/SiteFooter';
import { SiteHeader } from './sections/SiteHeader';
import { Story } from './sections/Story';
import { Testimonials } from './sections/Testimonials';
import { ValueProps } from './sections/ValueProps';

/**
 * Orchestrator for the Beans. landing page, ported from the Lyli source.
 *
 * Section order matches `src/app/(marketing)/page.tsx` exactly — Hero, FeaturedBeans,
 * ValueProps, Story, Process, Testimonials, Newsletter — inside the layout's sticky header and
 * footer. Nothing is defined inline here and no section imports another; the two pieces two
 * sections share (`BrandMark`, `SectionHeading`) sit at the template root.
 *
 * The header's `sticky` lives on the wrapper, not inside the section: an `<Inspectable>` is
 * exactly its child's height, so a sticky child inside it could never move.
 */
export function LyliCoffee() {
  return (
    <Div className="min-h-screen bg-bg text-fg">
      <Inspectable id="site-header" label="Site header" className="sticky top-0 z-50">
        <SiteHeader />
      </Inspectable>

      <Div as="main">
        <Inspectable id="hero" label="Hero">
          <Hero />
        </Inspectable>

        <Inspectable id="featured-beans" label="Featured beans">
          <FeaturedBeans />
        </Inspectable>

        <Inspectable id="value-props" label="Why Beans?">
          <ValueProps />
        </Inspectable>

        <Inspectable id="story" label="Our story">
          <Story />
        </Inspectable>

        <Inspectable id="process" label="How it works">
          <Process />
        </Inspectable>

        <Inspectable id="testimonials" label="Testimonials">
          <Testimonials />
        </Inspectable>

        <Inspectable id="newsletter" label="Newsletter">
          <Newsletter />
        </Inspectable>
      </Div>

      <Inspectable id="site-footer" label="Site footer">
        <SiteFooter />
      </Inspectable>
    </Div>
  );
}
