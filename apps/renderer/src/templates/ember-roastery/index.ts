import type { TemplateEntry } from '../types';
import { EmberRoastery } from './EmberRoastery';

export const emberRoasteryTemplate: TemplateEntry = {
  meta: {
    slug: 'ember-roastery',
    name: 'Ember — Specialty Coffee',
    description:
      'A café surface for people who want to see the coffee — a browsable drinks menu, single-origin beans with tasting notes, brewing methods, reviews, and the visit details. Built entirely from library primitives.',
    category: 'Marketing',
    tags: ['coffee', 'café', 'menu', 'roastery'],
    preferredMode: 'dark',
    credit: 'Internal preview',
    inspectable: [
      { id: 'site-header', label: 'Site header', file: 'sections/SiteHeader.tsx' },
      { id: 'hero', label: 'Hero', file: 'sections/Hero.tsx' },
      { id: 'menu-showcase', label: 'Menu showcase', file: 'sections/MenuShowcase.tsx' },
      { id: 'bean-origins', label: 'Bean origins', file: 'sections/BeanOrigins.tsx' },
      { id: 'brew-methods', label: 'Brewing methods', file: 'sections/BrewMethods.tsx' },
      { id: 'metrics-band', label: 'Metrics band', file: 'sections/MetricsBand.tsx' },
      { id: 'reviews', label: 'Reviews', file: 'sections/Reviews.tsx' },
      { id: 'visit-cta', label: 'Visit the café', file: 'sections/VisitCta.tsx' },
      { id: 'site-footer', label: 'Site footer', file: 'sections/SiteFooter.tsx' },
    ],
  },
  Component: EmberRoastery,
};
