'use client';

import { Div } from '@apx-ui/ds';

import { Inspectable } from '../../components/templates/inspector';

import { Faq } from './sections/Faq';
import { Hero } from './sections/Hero';
import { Lookbook } from './sections/Lookbook';
import { Makers } from './sections/Makers';
import { Newsletter } from './sections/Newsletter';
import { Promises } from './sections/Promises';
import { Reviews } from './sections/Reviews';
import { Shop } from './sections/Shop';
import { SiteFooter } from './sections/SiteFooter';
import { SiteHeader } from './sections/SiteHeader';
import { Stats } from './sections/Stats';

/**
 * Orchestrator for the Fernwood storefront.
 *
 * The order is the argument a goods shop has to make, and it deliberately puts the product before
 * the story: show it (hero) → de-risk it (promises) → sell it (shop) → widen it (lookbook) →
 * prove it (stats) → justify the price (makers) → other people agree (reviews) → objections (faq)
 * → stay in touch (newsletter). A storefront that opens with its founder story is a brand site
 * wearing a shop's clothes.
 *
 * Nothing is defined inline here and no section imports another. The three pieces several sections
 * share — `BrandMark`, `SectionHeading`, `Stars` — sit at the template root.
 *
 * The header's `sticky` lives on the wrapper, not inside the section: an `<Inspectable>` is
 * exactly its child's height, so a sticky child inside it could never move.
 */
export function Fernwood() {
  return (
    <Div id="top" className="min-h-screen bg-bg text-fg">
      <Inspectable id="site-header" label="Site header" className="sticky top-0 z-50">
        <SiteHeader />
      </Inspectable>

      <Div as="main">
        <Inspectable id="hero" label="Hero">
          <Hero />
        </Inspectable>

        <Inspectable id="promises" label="Promises marquee">
          <Promises />
        </Inspectable>

        <Inspectable id="shop" label="Product grid">
          <Shop />
        </Inspectable>

        <Inspectable id="lookbook" label="Lookbook band">
          <Lookbook />
        </Inspectable>

        <Inspectable id="stats" label="Proof band">
          <Stats />
        </Inspectable>

        <Inspectable id="makers" label="The makers">
          <Makers />
        </Inspectable>

        <Inspectable id="reviews" label="Reviews">
          <Reviews />
        </Inspectable>

        <Inspectable id="faq" label="FAQ">
          <Faq />
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
