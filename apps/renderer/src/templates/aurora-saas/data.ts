/**
 * All the copy + structured content for the Aurora landing page.
 *
 * Keeping everything here (rather than inline inside JSX) means template authors
 * can quickly fork this template — swap product name, feature list, pricing tiers,
 * testimonials — without touching layout code.
 */

export const productMeta = {
  brand: 'Aurora',
  tagline: 'Build, ship, and observe — in one place.',
  badge: 'Now generally available',
  description:
    'The unified workspace your team actually opens every morning. Plan work, ship code, and watch it run — all from a single, fast surface that respects the way you already think.',
  primaryCta: { label: 'Start free trial', href: '#trial' },
  secondaryCta: { label: 'Watch the tour', href: '#tour' },
};

export const navLinks = [
  { label: 'Product', href: '#product' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Customers', href: '#customers' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '#docs' },
] as const;

export type FeatureColor = 'primary' | 'success' | 'warning' | 'info';

export interface Feature {
  iconKey: 'spark' | 'gauge' | 'shield' | 'workflow';
  title: string;
  description: string;
  color: FeatureColor;
}

export const features: readonly Feature[] = [
  {
    iconKey: 'spark',
    color: 'primary',
    title: 'Composable everything',
    description:
      'Every surface is built from the same primitives — swap, theme, or extend any piece without forking the library.',
  },
  {
    iconKey: 'gauge',
    color: 'success',
    title: 'Fast where it matters',
    description:
      'Virtualized lists, debounced queries, and tree-shakeable bundles. Performance budgets baked into every component.',
  },
  {
    iconKey: 'shield',
    color: 'info',
    title: 'Accessible by default',
    description:
      'Keyboard, screen-reader, RTL, reduced-motion — covered upfront. Ship to global teams without an a11y backlog.',
  },
  {
    iconKey: 'workflow',
    color: 'warning',
    title: 'Themeable, not skinned',
    description:
      'Tokens flow from a single source of truth. Light/dark + four identity variants, all with the same component contract.',
  },
];

export interface MetricStat {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
}

export const stats: readonly MetricStat[] = [
  { label: 'Build time saved / week', value: '14h', delta: '+22%', trend: 'up' },
  { label: 'Teams shipped to prod', value: '1,284', delta: '+8.4%', trend: 'up' },
  { label: 'Open incidents', value: '3', delta: '-46%', trend: 'down' },
  { label: 'P95 page load', value: '184ms', delta: '-12%', trend: 'down' },
];

export interface PricingTier {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  cta: string;
  highlight?: boolean;
  features: readonly string[];
}

export const pricingTiers: readonly PricingTier[] = [
  {
    name: 'Starter',
    price: '$0',
    cadence: 'forever, up to 5 seats',
    blurb: 'Everything you need to evaluate Aurora on a small team.',
    cta: 'Get started',
    features: [
      'Unlimited projects',
      'Up to 5 collaborators',
      'Community support',
      '7-day audit log',
    ],
  },
  {
    name: 'Team',
    price: '$12',
    cadence: 'per seat / month, billed yearly',
    blurb: 'For growing teams that need richer collaboration & analytics.',
    cta: 'Start 14-day trial',
    highlight: true,
    features: [
      'Everything in Starter',
      'Unlimited collaborators',
      'Advanced analytics dashboards',
      '90-day audit log + SSO',
      'Priority email support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'tailored to your org',
    blurb: 'Procurement, security, and scale that hold up in regulated industries.',
    cta: 'Talk to sales',
    features: [
      'Everything in Team',
      'SAML SSO + SCIM',
      'Dedicated success manager',
      'Custom DPA, BAA & MSA',
      'Self-hosted regional deployment',
    ],
  },
];

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export const testimonials: readonly Testimonial[] = [
  {
    quote:
      'We rebuilt our entire admin surface in three weeks. The tokens make it trivial to match our brand without forking a single component.',
    author: 'Priya Anand',
    role: 'Staff Engineer, Helios',
  },
  {
    quote:
      'The RTL story alone saved us a quarter of work. Everything just flips and the components stay accessible.',
    author: 'Karim El-Sayed',
    role: 'Design Systems Lead, Kismet',
  },
  {
    quote:
      "Best DX I've had since switching to TypeScript. The compound APIs feel like they were written by people who actually use them.",
    author: 'Hannah Möller',
    role: 'Principal Engineer, Northrise',
  },
];

export const trustedLogos = [
  'Helios',
  'Kismet',
  'Northrise',
  'Atlas Pay',
  'Looplane',
  'Verdant',
] as const;

export const footerLinks = {
  Product: ['Features', 'Integrations', 'Changelog', 'Roadmap'],
  Company: ['About', 'Careers', 'Press', 'Contact'],
  Resources: ['Docs', 'Guides', 'API reference', 'Status'],
  Legal: ['Privacy', 'Terms', 'Security', 'Cookies'],
} as const;