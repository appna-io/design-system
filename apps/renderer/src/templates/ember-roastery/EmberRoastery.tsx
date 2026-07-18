'use client';

import { Div } from '@apx-ui/ds';

import { Inspectable } from '../../components/templates/inspector';

import { BeanOrigins } from './sections/BeanOrigins';
import { BrewMethods } from './sections/BrewMethods';
import { Hero } from './sections/Hero';
import { MenuShowcase } from './sections/MenuShowcase';
import { MetricsBand } from './sections/MetricsBand';
import { Reviews } from './sections/Reviews';
import { SiteFooter } from './sections/SiteFooter';
import { SiteHeader } from './sections/SiteHeader';
import { VisitCta } from './sections/VisitCta';

/**
 * Orchestrator for the Ember Roastery café page.
 *
 * Each section is a top-level file under `./sections/` — kept that way so the
 * inspector can read + highlight one section's source on click without having
 * to parse a giant page-level component. Reordering or swapping a section is
 * a one-line edit; adding a new one means dropping a file in `sections/` and
 * adding an `<Inspectable>` row below + an entry in `meta.inspectable` in
 * `./index.ts`.
 */
export function EmberRoastery() {
  return (
    <Div className="min-h-screen bg-bg text-fg">
      <Inspectable id="site-header" label="Site header">
        <SiteHeader />
      </Inspectable>

      <Div as="main">
        <Inspectable id="hero" label="Hero">
          <Hero />
        </Inspectable>

        <Inspectable id="menu-showcase" label="Menu showcase">
          <MenuShowcase />
        </Inspectable>

        <Inspectable id="bean-origins" label="Bean origins">
          <BeanOrigins />
        </Inspectable>

        <Inspectable id="brew-methods" label="Brewing methods">
          <BrewMethods />
        </Inspectable>

        <Inspectable id="metrics-band" label="Metrics band">
          <MetricsBand />
        </Inspectable>

        <Inspectable id="reviews" label="Reviews">
          <Reviews />
        </Inspectable>

        <Inspectable id="visit-cta" label="Visit the café">
          <VisitCta />
        </Inspectable>
      </Div>

      <Inspectable id="site-footer" label="Site footer">
        <SiteFooter />
      </Inspectable>
    </Div>
  );
}
