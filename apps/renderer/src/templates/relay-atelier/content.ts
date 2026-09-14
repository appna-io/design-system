/**
 * All of Relay Atelier's copy, in one typed tree, on #5's schema — same primitives as the other
 * two Worker2 templates, so all three change only their imports when `_kit/content.ts` lands.
 *
 * A portfolio's content is unusual in one way worth naming: **there is very little of it.** The
 * whole art direction is type scale and whitespace, so a section that would carry a paragraph
 * elsewhere carries a clause here. Resisting the urge to pad this file is most of the design.
 */

export interface Cta {
  href: string;
  label: string;
}

export interface NavLink {
  href: string;
  label: string;
}

export interface SectionIntro {
  eyebrow?: string;
  title: string;
  body?: string;
}

export interface StatItem {
  value: string;
  label: string;
  countTo?: number;
}

/** A case study. `year` and `discipline` are the only metadata — a portfolio is not a CV. */
export interface CaseStudy {
  id: string;
  client: string;
  title: string;
  discipline: string;
  year: string;
  summary: string;
  /** Shown in the kit's browser frame. Decorative — the work itself is the subject. */
  url: string;
  outcome: string;
}

export const brand = {
  name: 'Relay',
  suffix: 'Atelier',
  tagline: 'A four-person studio in Lisbon. Brand systems and the sites that carry them.',
} as const;

export const nav: { links: readonly NavLink[]; cta: Cta } = {
  links: [
    { href: '#work', label: 'Work' },
    { href: '#practice', label: 'Practice' },
    { href: '#studio', label: 'Studio' },
  ],
  cta: { href: '#contact', label: 'Start a project' },
};

/**
 * The hero is four words and a line. Anything longer competes with the type, and the type *is*
 * the argument this page makes.
 */
export const hero = {
  line1: 'We build',
  line2: 'the thing',
  line3: 'itself.',
  standfirst:
    'Not a deck about the thing. Four people, one project at a time, from the first sketch to the last deploy.',
  cta: { href: '#work', label: 'Selected work' },
} as const;

export const clients: readonly string[] = [
  'Öre Bank',
  'Hallgren',
  'Norvik Press',
  'Studio Bramble',
  'Fjord & Co',
  'Meridian Type',
  'Kestrel Wines',
];

export const workIntro: SectionIntro = {
  eyebrow: 'Selected work',
  title: 'Four projects, in full',
  body: 'We show fewer than we have made, and we show them properly. Every one of these was designed and built by the same four people.',
};

export const caseStudies: readonly CaseStudy[] = [
  {
    id: 'ore',
    client: 'Öre Bank',
    title: 'A retail bank that stopped shouting',
    discipline: 'Identity · Design system · Web',
    year: '2026',
    summary:
      'Öre had eleven product sites and no shared type scale. We built one system, migrated all eleven, and deleted 40,000 lines of CSS on the way through.',
    url: 'ore.bank',
    outcome: '11 sites, one system',
  },
  {
    id: 'norvik',
    client: 'Norvik Press',
    title: 'Two hundred years of backlist, readable at last',
    discipline: 'Editorial · Typography · Web',
    year: '2025',
    summary:
      'An academic publisher whose entire catalogue was a PDF index. We built a reading system for scholarship — footnotes, citations and marginalia that survive a phone screen.',
    url: 'norvikpress.com',
    outcome: '9,400 titles online',
  },
  {
    id: 'hallgren',
    client: 'Hallgren',
    title: 'A furniture maker who does not do lifestyle photography',
    discipline: 'Art direction · Web',
    year: '2025',
    summary:
      'Every competitor sells a sofa in a living room. Hallgren sells joinery. We photographed the joints, at scale, on white, and let the craft carry the page.',
    url: 'hallgren.se',
    outcome: '+64% enquiries',
  },
  {
    id: 'meridian',
    client: 'Meridian Type',
    title: 'A type foundry that lets you actually try the type',
    discipline: 'Product · Web',
    year: '2024',
    summary:
      'A specimen site where every block of text on the page is editable, at any size, in any weight — because a foundry site whose type you cannot test is a poster, not a shop.',
    url: 'meridiantype.co',
    outcome: '4 families shipped',
  },
];

export const practiceIntro: SectionIntro = {
  eyebrow: 'Practice',
  title: 'How we work',
};

/**
 * Three, not six. A capabilities list long enough to cover everything is a list that says nothing;
 * the point of naming three is that we are declining the others.
 */
export const practice: readonly { id: string; title: string; body: string }[] = [
  {
    id: 'one',
    title: 'One project at a time',
    body: 'Four people, fully on it. It is why we take six a year and why we can say what a project will cost in the first week.',
  },
  {
    id: 'design-build',
    title: 'The people who design it build it',
    body: 'No handover, no spec document, no "that is not what the mockup said". The design is the code by the second week.',
  },
  {
    id: 'systems',
    title: 'Systems, not pages',
    body: 'Every project leaves behind something the client can extend without us. If you need us to add a page in a year, we have failed.',
  },
];

export const studioIntro: SectionIntro = {
  eyebrow: 'Studio',
  title: 'Four people, one room, Lisbon',
  body: 'We started in 2019 doing identity work for other studios. We still take that work. The rest of the time we do this.',
};

/**
 * `2019` carries no `countTo` on purpose. It is a *year*, not a quantity — counting up to it is
 * nonsense, and it would run four times longer than the two beside it because the number is three
 * orders of magnitude larger. This is exactly the distinction the separate `countTo` field exists
 * to let content make: the display string and the thing worth animating are not the same value.
 */
export const studioStats: readonly StatItem[] = [
  { value: '4', label: 'People', countTo: 4 },
  { value: '6', label: 'Projects a year', countTo: 6 },
  { value: '2019', label: 'Since' },
];

export const contact = {
  eyebrow: 'Contact',
  title: 'Tell us what you are making',
  body: 'We reply to everything, usually within a day. If we are not the right studio we will say so and suggest someone who is.',
  email: { href: 'mailto:hello@relay.atelier', label: 'hello@relay.atelier' },
  location: 'Rua da Boavista 84, Lisbon',
} as const;

export const footer = {
  links: [
    { href: '#work', label: 'Work' },
    { href: '#practice', label: 'Practice' },
    { href: '#studio', label: 'Studio' },
    { href: '#contact', label: 'Contact' },
  ] as readonly NavLink[],
  legal: '© Relay Atelier. Lisbon.',
} as const;
