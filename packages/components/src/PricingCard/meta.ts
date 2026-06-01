import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'pricing-card',
  displayName: 'PricingCard',
  description:
    'Opinionated pricing tier card. Wraps `<Card>` with typed props for name, price, cadence, blurb, feature list, CTA, and a `highlighted` flag that wires the canonical recommended-tier visual (elevated + selected ring + "Most popular" badge) in one switch.',
  category: 'Surfaces',
  tags: ['card', 'pricing', 'tier', 'plan', 'compound', 'surface', 'marketing'],
};