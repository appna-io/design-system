'use client';

import { Div } from '@apx-ui/ds';

import { Inspectable } from '../../components/templates/inspector';

import { CtaBand } from './sections/CtaBand';
import { FeatureGrid } from './sections/FeatureGrid';
import { Hero } from './sections/Hero';
import { LogoCloud } from './sections/LogoCloud';
import { MetricsBand } from './sections/MetricsBand';
import { Pricing } from './sections/Pricing';
import { SiteFooter } from './sections/SiteFooter';
import { SiteHeader } from './sections/SiteHeader';
import { Testimonials } from './sections/Testimonials';

/**
 * Orchestrator for the Aurora landing page.
 *
 * Each section is a top-level file under `./sections/` — kept that way so the
 * inspector can read + highlight one section's source on click without having
 * to parse a giant page-level component. Reordering or swapping a section is
 * a one-line edit; adding a new one means dropping a file in `sections/` and
 * adding an `<Inspectable>` row below + an entry in `meta.inspectable` in
 * `./index.ts`.
 */
export function AuroraSaas() {
  return (
    <Div className="min-h-screen bg-bg text-fg">
      <Inspectable id="site-header" label="Site header">
        <SiteHeader />
      </Inspectable>

      <Div as="main">
        <Inspectable id="hero" label="Hero">
          <Hero />
        </Inspectable>

        <Inspectable id="logo-cloud" label="Logo cloud">
          <LogoCloud />
        </Inspectable>

        <Inspectable id="feature-grid" label="Feature grid">
          <FeatureGrid />
        </Inspectable>

        <Inspectable id="metrics-band" label="Metrics band">
          <MetricsBand />
        </Inspectable>

        <Inspectable id="pricing" label="Pricing">
          <Pricing />
        </Inspectable>

        <Inspectable id="testimonials" label="Testimonials">
          <Testimonials />
        </Inspectable>

        <Inspectable id="cta-band" label="Final CTA">
          <CtaBand />
        </Inspectable>
      </Div>

      <Inspectable id="site-footer" label="Site footer">
        <SiteFooter />
      </Inspectable>
    </Div>
  );
}