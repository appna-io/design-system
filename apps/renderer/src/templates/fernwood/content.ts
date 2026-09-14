/**
 * Content for the Fernwood storefront.
 *
 * Original copy written for the gallery — Fernwood is not a real shop, and the products, prices,
 * reviews and people are invented. Naming a real brand would be a false endorsement.
 *
 * Shaped to [#5]'s content tree from the start, as agreed: one typed object rather than twenty
 * loose exports, `SectionIntro` used for every eyebrow/title/body block instead of a new name per
 * section, and `StatItem.countTo` carried separately from the display string so a count-up never
 * has to parse `'4.9'` or `'12k+'` back into a number.
 *
 * Two extensions flagged for the kit, written as extensions rather than redefinitions:
 *   - `ProductCard.compareAtPrice` — a struck original price. Every storefront has one; the kit's
 *     `ProductCard` has `price` only.
 *   - `ProductCard.swatches` — colourways as palette-role names, not hexes, so they re-skin with
 *     the theme. Same argument as Northbound's `Track.color`.
 */

export interface SectionIntro {
  eyebrow?: string;
  title: string;
  body?: string;
}

export interface Cta {
  href: string;
  label: string;
}

export interface Media {
  src: string;
  /** Required, never optional — optional alt text is missing alt text. Decorative images pass ''. */
  alt: string;
  hoverSrc?: string;
}

export interface ProductCard {
  id: string;
  name: string;
  price: string;
  /** Struck-through original. Kit extension. */
  compareAtPrice?: string;
  blurb: string;
  media: Media;
  badge?: string;
  href: string;
  rating: number;
  reviewCount: number;
}

export interface StatItem {
  value: string;
  label: string;
  /** Numeric twin of `value`, so a count-up never parses the display string. */
  countTo?: number;
}

export const brand = {
  name: 'Fernwood',
  legalName: 'Fernwood Goods Ltd.',
  tagline: 'Things worth keeping.',
};

export const nav = {
  links: [
    { href: '#shop', label: 'Shop' },
    { href: '#collections', label: 'Collections' },
    { href: '#makers', label: 'Makers' },
    { href: '#journal', label: 'Journal' },
  ],
  cta: { href: '#shop', label: 'Shop all' } satisfies Cta,
};

export const announcement = 'Free shipping over £60 · 60-day returns, no questions';

export const hero = {
  eyebrow: 'New — the Autumn table',
  title: 'Made to be used, not admired',
  body: 'Kitchen and table goods from small workshops in Britain and Portugal. Built heavy, finished by hand, and sold with the name of the person who made it.',
  primaryCta: { href: '#shop', label: 'Shop the collection' } satisfies Cta,
  secondaryCta: { href: '#makers', label: 'Meet the makers' } satisfies Cta,
  media: {
    src:
      'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=1400&h=1100&fit=crop',
    alt: 'A bright kitchen with copper and enamel cookware on the range',
  } satisfies Media,
};

/** The marquee band under the hero — the promises, stated flatly. */
export const promises = [
  'Free shipping over £60',
  '60-day returns',
  'Made in small batches',
  'Named makers',
  'Repair, don’t replace',
  'Plastic-free packing',
] as const;

export const shopSection: SectionIntro = {
  eyebrow: 'Best sellers',
  title: 'What people keep coming back for',
  body: 'Restocked when the workshop finishes a run, which is why some of these sell out. We do not pre-order against stock we do not have.',
};

export const products: readonly ProductCard[] = [
  {
    id: 'stoneware-set',
    name: 'Ridgeline stoneware set',
    price: '£78',
    compareAtPrice: '£94',
    blurb: 'Four bowls, thrown and glazed in Stoke. Oven, dishwasher and drop safe.',
    media: {
      src:
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&h=1000&fit=crop',
      alt: 'A stack of glazed stoneware plates and bowls on a wooden table',
    },
    badge: 'Restocked',
    href: '#stoneware-set',
    rating: 4.9,
    reviewCount: 412,
  },
  {
    id: 'linen-apron',
    name: 'Heavyweight linen apron',
    price: '£54',
    blurb: 'Portuguese linen, 320gsm, cross-back so it stays put through a long service.',
    media: {
      src:
        'https://images.unsplash.com/photo-1758874960422-01db639167e7?w=800&h=1000&fit=crop',
      alt: 'Someone in a heavy linen apron working dough on a kitchen counter',
      hoverSrc:
        'https://images.unsplash.com/photo-1758874960436-c97920a559cf?w=800&h=1000&fit=crop',
    },
    href: '#linen-apron',
    rating: 4.8,
    reviewCount: 268,
  },
  {
    id: 'copper-pan',
    name: 'Hammered copper pan',
    price: '£165',
    blurb: 'Two millimetres of copper, tin-lined by hand. Re-lining service included for life.',
    media: {
      src:
        'https://images.unsplash.com/photo-1551905445-85602af27f47?w=800&h=1000&fit=crop',
      alt: 'Three hammered copper pans stacked on a dark surface',
      hoverSrc:
        'https://images.unsplash.com/photo-1562491691-f9633b1af312?w=800&h=1000&fit=crop',
    },
    badge: 'Last few',
    href: '#copper-pan',
    rating: 5.0,
    reviewCount: 96,
  },
  {
    id: 'olive-board',
    name: 'Olive wood board',
    price: '£42',
    blurb: 'Cut from a single piece, so the grain runs unbroken. No two are the same shape.',
    media: {
      src:
        'https://images.unsplash.com/photo-1587302108992-20648821725d?w=800&h=1000&fit=crop',
      alt: 'An olive wood serving board with the grain running end to end',
      hoverSrc:
        'https://images.unsplash.com/photo-1760445529356-fc1fcfdf7fba?w=800&h=1000&fit=crop',
    },
    href: '#olive-board',
    rating: 4.7,
    reviewCount: 531,
  },
];

export const lookbook = {
  eyebrow: 'The Autumn table',
  title: 'Everything on this table is still for sale in ten years',
  body: 'We only stock what the workshop can keep making and what we can keep repairing. That rules out most things.',
  cta: { href: '#collections', label: 'See the collection' } satisfies Cta,
  media: {
    src:
      'https://images.unsplash.com/photo-1536392706976-e486e2ba97af?w=1800&h=1000&fit=crop',
    alt: 'A long table laid for dinner by candlelight',
  } satisfies Media,
};

export const stats: readonly StatItem[] = [
  { value: '4.9', label: 'Average rating', countTo: 4.9 },
  { value: '12k+', label: 'Orders shipped', countTo: 12000 },
  { value: '31', label: 'Workshops we buy from', countTo: 31 },
  { value: '60', label: 'Day returns', countTo: 60 },
];

export const makersSection: SectionIntro = {
  eyebrow: 'The makers',
  title: 'We put the name on the box',
  body: 'Every piece is stamped by the person who made it, and every workshop is paid before the run starts rather than on sale.',
};

export const makers = [
  {
    id: 'aoife',
    name: 'Aoife Brennan',
    craft: 'Stoneware · Stoke-on-Trent',
    quote: 'The glaze is the only thing I will not tell you how to do.',
    media: {
      src: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=700&h=900&fit=crop',
      alt: 'A potter shaping a vessel on a spinning wheel',
    } satisfies Media,
  },
  {
    id: 'tiago',
    name: 'Tiago Ferreira',
    craft: 'Linen · Guimarães',
    quote: 'A good apron gets better for about two years, then it stays there.',
    media: {
      src: 'https://images.unsplash.com/photo-1578680152095-d65d3497264b?w=700&h=900&fit=crop',
      alt: 'A weaver working at a floor loom',
    } satisfies Media,
  },
  {
    id: 'marta',
    name: 'Marta Oliveira',
    craft: 'Copper · Porto',
    quote: 'Tin lining is a dying trade. That is exactly why we still teach it.',
    media: {
      src: 'https://images.unsplash.com/photo-1528717384022-f8d665c86909?w=700&h=900&fit=crop',
      alt: 'A metalworker hammering at a forge',
    } satisfies Media,
  },
] as const;

export const reviewsSection: SectionIntro = {
  eyebrow: 'Reviews',
  title: 'What people say once they have used it',
};

export const reviews = [
  {
    id: 'r1',
    quote:
      'Four years of daily use, through a dishwasher twice a day, and the glaze has not crazed once. I have replaced two supposedly nicer sets in that time.',
    name: 'Priya Raman',
    detail: 'Ridgeline stoneware set',
    rating: 5,
  },
  {
    id: 'r2',
    quote:
      'I cook for a living and I am hard on aprons. This one has outlasted six. The cross-back is the difference — nothing pulling on your neck at hour nine.',
    name: 'Callum Reid',
    detail: 'Heavyweight linen apron',
    rating: 5,
  },
  {
    id: 'r3',
    quote:
      'They re-lined the pan for free, four years after I bought it, and sent it back with a note from the person who did it. That is not normal and it should be.',
    name: 'Yusuf Demir',
    detail: 'Hammered copper pan',
    rating: 5,
  },
] as const;

export const faqSection: SectionIntro = {
  eyebrow: 'Before you ask',
  title: 'The questions we actually get',
};

export const faqs = [
  {
    id: 'f1',
    question: 'Why is some of it out of stock so often?',
    answer:
      'Because the workshops are small and we do not ask them to go faster. When a run sells out, the next one is made rather than pulled forward from a warehouse. Sign up on a product page and you are told the day it lands.',
  },
  {
    id: 'f2',
    question: 'Do you actually repair things?',
    answer:
      'Yes, and it is not a marketing line. Copper is re-lined for life, stoneware is replaced at cost if it breaks in the first two years, and linen is re-hemmed free. Send it back and we route it to the maker.',
  },
  {
    id: 'f3',
    question: 'Is it made in the UK?',
    answer:
      'Some of it. Stoneware is Stoke-on-Trent, linen and copper are Portugal. We say where each thing is made on its own page rather than averaging it into one claim.',
  },
  {
    id: 'f4',
    question: 'What does the 60-day return cover?',
    answer:
      'Anything, used or not, as long as it is not damaged. Cook with the pan. If it is not right, send it back and we pay the postage.',
  },
] as const;

export const newsletter = {
  eyebrow: 'The Journal',
  title: 'One letter a month, from the workshops',
  body: 'What is being made, what is landing, and the occasional piece about why a thing costs what it costs. No discount codes.',
  cta: { href: '#subscribe', label: 'Subscribe' } satisfies Cta,
  footnote: 'One email a month. Unsubscribe in a click.',
};

export const footer = {
  blurb: 'Kitchen and table goods from small workshops, sold with the maker’s name on the box.',
  columns: [
    {
      title: 'Shop',
      links: [
        { href: '#shop', label: 'All goods' },
        { href: '#collections', label: 'Collections' },
        { href: '#gifts', label: 'Gift cards' },
        { href: '#sale', label: 'Last few' },
      ],
    },
    {
      title: 'Care',
      links: [
        { href: '#repairs', label: 'Repairs' },
        { href: '#shipping', label: 'Shipping' },
        { href: '#returns', label: 'Returns' },
        { href: '#contact', label: 'Contact' },
      ],
    },
    {
      title: 'About',
      links: [
        { href: '#makers', label: 'Our makers' },
        { href: '#journal', label: 'Journal' },
        { href: '#sourcing', label: 'Sourcing' },
      ],
    },
  ],
  social: [
    { href: '#instagram', label: 'Instagram' },
    { href: '#pinterest', label: 'Pinterest' },
  ],
};
