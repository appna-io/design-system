'use client';

import { Div } from '@apx-ui/ds';

import { Inspectable } from '../../components/templates/inspector';

import { CtaBand } from './sections/CtaBand';
import { Faq } from './sections/Faq';
import { Features } from './sections/Features';
import { Hero } from './sections/Hero';
import { LogoBand } from './sections/LogoBand';
import { Metrics } from './sections/Metrics';
import { Pricing } from './sections/Pricing';
import { Product } from './sections/Product';
import { SiteFooter } from './sections/SiteFooter';
import { SiteHeader } from './sections/SiteHeader';
import { Testimonial } from './sections/Testimonial';
import { Workflow } from './sections/Workflow';

/**
 * Orchestrator for the Cadence product page.
 *
 * Order is the standard B2B argument and each step earns the next: claim (hero) → who else
 * (logos) → what it does (product) → what it handles (features) → how a week runs (workflow) →
 * what it changed (metrics) → what it costs (pricing) → someone who did it (testimonial) →
 * objections (faq) → ask (cta).
 *
 * Nothing is defined inline here and no section imports another. The three pieces several
 * sections share — `BrandMark`, `SectionHeading`, `HeroPreview` — sit at the template root.
 *
 * The header's `sticky` lives on the wrapper, not inside the section: an `<Inspectable>` is
 * exactly its child's height, so a sticky child inside it could never move.
 */
export function CadenceOps() {
  return (
    <Div className="min-h-screen bg-bg text-fg">
      <Inspectable id="site-header" label="Site header" className="sticky top-0 z-50">
        <SiteHeader />
      </Inspectable>

      <Div as="main">
        <Inspectable id="hero" label="Hero">
          <Hero />
        </Inspectable>

        <Inspectable id="logos" label="Customer band">
          <LogoBand />
        </Inspectable>

        <Inspectable id="product" label="Product tabs">
          <Product />
        </Inspectable>

        <Inspectable id="features" label="Feature grid">
          <Features />
        </Inspectable>

        <Inspectable id="workflow" label="Workflow timeline">
          <Workflow />
        </Inspectable>

        <Inspectable id="metrics" label="Outcome metrics">
          <Metrics />
        </Inspectable>

        <Inspectable id="pricing" label="Pricing">
          <Pricing />
        </Inspectable>

        <Inspectable id="testimonial" label="Testimonial">
          <Testimonial />
        </Inspectable>

        <Inspectable id="faq" label="FAQ">
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
