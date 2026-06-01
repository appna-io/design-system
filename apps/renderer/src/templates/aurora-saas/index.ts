import type { TemplateEntry } from '../types';
import { AuroraSaas } from './AuroraSaas';

export const auroraSaasTemplate: TemplateEntry = {
  meta: {
    slug: 'aurora-saas',
    name: 'Aurora — SaaS Landing',
    description:
      'A polished marketing surface for a developer tool — hero, feature grid, metrics, pricing tiers, testimonials, and a final CTA. Built entirely from library primitives.',
    category: 'Marketing',
    tags: ['landing', 'pricing', 'hero', 'testimonials'],
    credit: 'Internal preview',
    inspectable: [
      { id: 'site-header', label: 'Site header', file: 'sections/SiteHeader.tsx' },
      { id: 'hero', label: 'Hero', file: 'sections/Hero.tsx' },
      { id: 'logo-cloud', label: 'Logo cloud', file: 'sections/LogoCloud.tsx' },
      { id: 'feature-grid', label: 'Feature grid', file: 'sections/FeatureGrid.tsx' },
      { id: 'metrics-band', label: 'Metrics band', file: 'sections/MetricsBand.tsx' },
      { id: 'pricing', label: 'Pricing', file: 'sections/Pricing.tsx' },
      { id: 'testimonials', label: 'Testimonials', file: 'sections/Testimonials.tsx' },
      { id: 'cta-band', label: 'Final CTA', file: 'sections/CtaBand.tsx' },
      { id: 'site-footer', label: 'Site footer', file: 'sections/SiteFooter.tsx' },
    ],
  },
  Component: AuroraSaas,
};