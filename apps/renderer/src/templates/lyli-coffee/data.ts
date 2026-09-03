/**
 * Content for the Beans. landing page, ported 1:1 from the Lyli source at
 * `workspace/lyle-coffee`.
 *
 * Every string here is **verbatim** from the original — nothing is paraphrased and nothing is
 * invented. Where the source had copy inline in JSX it has been lifted here unchanged so the
 * template follows the same "no copy in the layout" convention as the rest of the gallery.
 *
 * Source map:
 *   `src/lib/beans.ts`                    → `beans` (the `fallbackBeans` fixture, verbatim)
 *   `src/components/layout/Header.tsx`    → `brand`, `navLinks`, `headerCta`
 *   `src/components/landing/Hero.tsx`     → `hero`
 *   `src/components/landing/FeaturedBeans.tsx` → `featuredBeans`
 *   `src/components/landing/ValueProps.tsx`    → `valueProps`, `values`
 *   `src/components/landing/Story.tsx`    → `story`
 *   `src/components/landing/Process.tsx`  → `process`, `steps`
 *   `src/components/landing/Testimonials.tsx`  → `testimonialsSection`, `testimonials`
 *   `src/components/landing/Newsletter.tsx`    → `newsletter`
 *   `src/components/layout/Footer.tsx`    → `footer`, `footerLinks`, `socials`
 */

export const brand = {
  /** The wordmark renders as `Beans` + a roast-coloured full stop. */
  name: 'Beans',
  punctuation: '.',
  legalName: 'Beans Coffee',
};

export const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/#beans', label: 'Beans' },
  { href: '/#about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export const headerCta = { href: '/contact', label: 'Get in touch' };

export const hero = {
  eyebrow: 'Specialty coffee dealer',
  title: 'Exceptional beans for every brew',
  body: 'From farm to cup — ethically sourced, small-batch roasted, delivered fresh to your door.',
  primaryCta: { href: '/#beans', label: 'Shop beans' },
  secondaryCta: { href: '/contact', label: 'Get in touch' },
  image: {
    src: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=800&fit=crop',
    alt: 'Fresh roasted coffee beans in a wooden bowl',
  },
};

/**
 * Mirrors `FeaturedBean` in `src/lib/beans.ts`. `price` stays a number — the source formats it
 * at the call site with `toFixed(2)`, and so does this template.
 */
export interface Bean {
  id: string;
  name: string;
  slug: string;
  origin: string;
  roastLevel: string;
  tastingNotes: string;
  price: number;
  imageUrl: string;
}

/**
 * The `fallbackBeans` fixture, verbatim. The live site reads published beans from Postgres and
 * falls back to exactly this list, so it is the canonical seed content for the page.
 */
export const beans: readonly Bean[] = [
  {
    id: '1',
    name: 'Ethiopian Yirgacheffe',
    slug: 'ethiopian-yirgacheffe',
    origin: 'Ethiopia',
    roastLevel: 'Light',
    tastingNotes: 'Jasmine, bergamot, honey',
    price: 18.5,
    imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&h=600&fit=crop',
  },
  {
    id: '2',
    name: 'Colombian Supremo',
    slug: 'colombian-supremo',
    origin: 'Colombia',
    roastLevel: 'Medium',
    tastingNotes: 'Caramel, red apple, cocoa',
    price: 16.0,
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop',
  },
  {
    id: '3',
    name: 'Sumatra Mandheling',
    slug: 'sumatra-mandheling',
    origin: 'Indonesia',
    roastLevel: 'Dark',
    tastingNotes: 'Dark chocolate, cedar, spice',
    price: 17.25,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&h=600&fit=crop',
  },
  {
    id: '4',
    name: 'Kenya AA',
    slug: 'kenya-aa',
    origin: 'Kenya',
    roastLevel: 'Medium',
    tastingNotes: 'Blackcurrant, grapefruit, brown sugar',
    price: 19.0,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop',
  },
];

export const featuredBeans = {
  title: 'Featured beans',
  body: 'Hand-picked single origins and blends, roasted weekly for peak freshness.',
};

export const valueProps = {
  title: 'Why Beans?',
  body: 'We obsess over every step so you can simply enjoy an extraordinary cup.',
};

/** The three icons match the heroicons glyphs the source inlined: fire, globe-alt, lightning. */
export type ValueIcon = 'flame' | 'globe' | 'zap';

export const values: readonly { icon: ValueIcon; title: string; description: string }[] = [
  {
    icon: 'flame',
    title: 'Freshly roasted',
    description: 'Roasted in small batches every week — never sitting on a shelf for months.',
  },
  {
    icon: 'globe',
    title: 'Ethically sourced',
    description: 'Direct trade relationships with farmers who grow exceptional coffee sustainably.',
  },
  {
    icon: 'zap',
    title: 'Fast delivery',
    description: 'Shipped within 48 hours of roasting so you taste coffee at its absolute best.',
  },
];

export const story = {
  title: 'Our story',
  body: 'Beans started with a simple belief: great coffee begins with great relationships.',
  paragraphs: [
    'Founded in Portland, we travel to origin countries to meet the farmers behind every lot we buy. That direct connection lets us pay fair prices and bring you traceable, exceptional coffee.',
    'Every bag is roasted on our Loring S35 to highlight each bean’s unique character — whether you prefer a bright Ethiopian pour-over or a rich Sumatra espresso.',
  ],
  image: {
    src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop',
    alt: 'Barista pouring freshly brewed coffee',
  },
};

export const process = {
  title: 'How it works',
  body: 'From farm to your kitchen in three simple steps.',
};

export const steps: readonly { step: string; title: string; description: string }[] = [
  {
    step: '01',
    title: 'Source',
    description:
      'We visit farms and cup hundreds of samples to find the finest lots each harvest season.',
  },
  {
    step: '02',
    title: 'Roast',
    description:
      'Small-batch roasting on our Loring drum — calibrated profiles for each origin and blend.',
  },
  {
    step: '03',
    title: 'Deliver',
    description: 'Packaged and shipped within 48 hours so your beans arrive at peak freshness.',
  },
];

export const testimonialsSection = {
  title: 'What our customers say',
  body: 'Trusted by home brewers and cafés alike.',
};

export const testimonials: readonly { quote: string; name: string; role: string }[] = [
  {
    quote:
      'The Ethiopian Yirgacheffe is the best pour-over I’ve ever had at home. Bright, floral, and always fresh.',
    name: 'Sarah M.',
    role: 'Home barista',
  },
  {
    quote:
      'We switched our café to Beans for all our espresso — our customers notice the difference every single day.',
    name: 'Marcus T.',
    role: 'Café owner',
  },
  {
    quote:
      'Fast shipping, beautiful packaging, and coffee that actually tastes like the tasting notes say. Five stars.',
    name: 'Elena R.',
    role: 'Coffee enthusiast',
  },
];

export const newsletter = {
  title: 'Stay in the loop',
  body: 'Get new arrivals, brewing tips, and exclusive offers — straight to your inbox.',
  placeholder: 'you@example.com',
  submitLabel: 'Subscribe',
  emailLabel: 'Email address',
  footnote: 'Ready to order or have questions?',
  footnoteLink: { href: '/contact', label: 'Contact us' },
};

export const footer = {
  blurb:
    'Specialty coffee beans, ethically sourced and roasted in small batches for the perfect cup.',
  exploreTitle: 'Explore',
  contactTitle: 'Contact',
  email: 'hello@beans.coffee',
  hours: 'Mon–Fri, 9am–5pm',
  location: 'Portland, OR',
  /** The source renders the current year via `new Date().getFullYear()`. */
  copyright: (year: number) => `© ${year} Beans Coffee. All rights reserved.`,
};

export const footerLinks = navLinks;

export const socials = [
  { href: 'https://instagram.com', label: 'IG', name: 'Instagram' },
  { href: 'https://twitter.com', label: 'X', name: 'Twitter' },
] as const;

/** Formats a bean price the way the source does — `$` + two decimals. */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
