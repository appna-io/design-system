/**
 * Content for the Vantage brand-studio site.
 *
 * Original copy written for the gallery — Vantage is not a real studio, and the clients, case
 * studies, people and quotes are invented. Naming a real brand as a client would be a false
 * endorsement, so every name here is fictional and the trades are plausible rather than
 * borrowed.
 *
 * Same convention as the other templates: no copy lives in the layout, so re-skinning the page
 * for a different studio is a single-file edit.
 */

export const brand = {
  name: 'Vantage',
  legalName: 'Vantage Brand Studio Ltd.',
  tagline: 'Brand, product and the space between.',
};

export const navLinks = [
  { href: '#work', label: 'Work' },
  { href: '#services', label: 'Services' },
  { href: '#approach', label: 'Approach' },
  { href: '#studio', label: 'Studio' },
] as const;

export const headerCta = { href: '#contact', label: 'Start a project' };

/**
 * The hero headline is split into lines rather than one string so the reveal can cascade line by
 * line. Wrapping is therefore authored, not accidental — which is the point for display type at
 * this size, where a browser break in the wrong place changes the reading rhythm.
 */
export const hero = {
  eyebrow: 'Independent studio · Est. 2014',
  titleLines: ['We build brands', 'that behave', 'like products'],
  body: 'Vantage is a fifteen-person studio working with founders and in-house teams on identity, product design and the systems that keep both consistent long after launch.',
  primaryCta: { href: '#contact', label: 'Start a project' },
  secondaryCta: { href: '#work', label: 'See the work' },
  marquee: [
    'Brand identity',
    'Design systems',
    'Product design',
    'Motion',
    'Art direction',
    'Packaging',
  ],
};

export const heroStats = [
  { value: '11 yrs', label: 'Independent' },
  { value: '140+', label: 'Projects shipped' },
  { value: '15', label: 'People, no layers' },
  { value: '4', label: 'Cannes Lions' },
] as const;

export const clientsSection = {
  eyebrow: 'Selected clients',
  title: 'Teams we have worked beside',
};

export const clients = [
  'Halcyon Foods',
  'Nortide',
  'Ferrous Bank',
  'Studio Anser',
  'Palewater',
  'Kestrel Health',
  'Aureli',
  'Mornsound',
] as const;

export const workSection = {
  eyebrow: 'Selected work',
  title: 'Nine years of shipping, four we can show',
  body: 'Every engagement ends with a system somebody else can run without us. These are the ones the clients let us publish.',
};

/**
 * Case-study cards. `size` drives the grid span — `wide` cards take two columns on desktop, which
 * is what stops a four-card grid reading as a spreadsheet.
 */
export const work = [
  {
    id: 'halcyon',
    client: 'Halcyon Foods',
    title: 'A pantry brand that stopped shouting',
    discipline: 'Identity · Packaging',
    year: '2025',
    size: 'wide',
    image:
      'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1400&h=900&fit=crop',
    alt: 'Overhead view of prepared food on a pale surface',
  },
  {
    id: 'ferrous',
    client: 'Ferrous Bank',
    title: 'Forty screens, one grammar',
    discipline: 'Design system',
    year: '2025',
    size: 'tall',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=1200&fit=crop',
    alt: 'Analytics dashboard on a dark screen',
  },
  {
    id: 'nortide',
    client: 'Nortide',
    title: 'Wayfinding for a port that never closes',
    discipline: 'Environmental · Identity',
    year: '2024',
    size: 'tall',
    image:
      'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=900&h=1200&fit=crop',
    alt: 'Shipping containers stacked at a port at dusk',
  },
  {
    id: 'palewater',
    client: 'Palewater',
    title: 'A skincare line with nothing to hide',
    discipline: 'Art direction · Packaging',
    year: '2024',
    size: 'wide',
    image:
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1400&h=900&fit=crop',
    alt: 'Minimal skincare bottles on a stone surface',
  },
] as const;

export const servicesSection = {
  eyebrow: 'What we do',
  title: 'Four things, done properly',
  body: 'We are deliberately narrow. Anything outside this list we will happily recommend someone better for.',
};

export const services = [
  {
    number: '01',
    title: 'Brand identity',
    body: 'Naming, marks, type, colour and the written rules that keep them intact when we are not in the room.',
    deliverables: ['Naming & narrative', 'Identity system', 'Guidelines', 'Asset library'],
  },
  {
    number: '02',
    title: 'Design systems',
    body: 'Component libraries your engineers actually adopt, because we build them with your engineers rather than for them.',
    deliverables: ['Token architecture', 'Component library', 'Documentation', 'Adoption support'],
  },
  {
    number: '03',
    title: 'Product design',
    body: 'End-to-end interface work — research, flows, screens and the unglamorous states everyone else skips.',
    deliverables: ['Discovery', 'Flows & prototypes', 'UI design', 'Handoff'],
  },
  {
    number: '04',
    title: 'Motion & art direction',
    body: 'How the brand moves, shoots and sounds. The layer that turns a static identity into something people recognise.',
    deliverables: ['Motion principles', 'Art direction', 'Photography', 'Templates'],
  },
] as const;

export const approachSection = {
  eyebrow: 'How it goes',
  title: 'Six weeks, four moments',
  body: 'Most engagements run six to ten weeks. The shape rarely changes.',
};

export const approach = [
  {
    week: 'Week 1',
    title: 'Immersion',
    body: 'We read everything, talk to your customers and come back with the uncomfortable version of what we found.',
  },
  {
    week: 'Week 2–3',
    title: 'Territories',
    body: 'Three genuinely different directions, each taken far enough to judge. No safe middle option padding the deck.',
  },
  {
    week: 'Week 4–5',
    title: 'Build',
    body: 'The chosen route gets built out across every surface it will actually live on — not just the hero shot.',
  },
  {
    week: 'Week 6',
    title: 'Handover',
    body: 'Systems, files and a working session with the team who inherit it. We stay reachable after.',
  },
] as const;

export const studioSection = {
  eyebrow: 'The studio',
  title: 'Fifteen people, no account layer',
  body: 'You work with the people doing the work. There is no team behind the team.',
};

export const people = [
  {
    name: 'Ines Barros',
    role: 'Founder, Creative Director',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  },
  {
    name: 'Tomas Reiner',
    role: 'Design Director',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  },
  {
    name: 'Adaeze Okonkwo',
    role: 'Systems Lead',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
  },
  {
    name: 'Ruben Castellanos',
    role: 'Motion Director',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  },
  {
    name: 'Mei Sasaki',
    role: 'Strategy',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
  },
  {
    name: 'Joris Vandal',
    role: 'Producer',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
  },
] as const;

export const testimonial = {
  quote:
    'We had been through two agencies who gave us a logo and a shrug. Vantage gave us a system our engineers could build against on day one, and eighteen months later nobody has quietly forked it.',
  name: 'Dana Okafor',
  role: 'VP Design, Ferrous Bank',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
};

export const cta = {
  eyebrow: 'Next intake',
  title: 'We take four projects a quarter',
  body: 'Two slots left for the coming quarter. Tell us what you are working on and we will tell you honestly whether we are the right studio for it.',
  primary: { href: '#contact', label: 'Start a project' },
  secondary: { href: '#work', label: 'See the work first' },
};

export const footer = {
  blurb: 'An independent brand and product studio working with founders and in-house teams.',
  address: ['Unit 4, Whitlock Yard', 'London E2 8HD'],
  email: 'hello@vantage.example',
  columns: [
    {
      title: 'Studio',
      links: [
        { href: '#work', label: 'Work' },
        { href: '#services', label: 'Services' },
        { href: '#approach', label: 'Approach' },
        { href: '#studio', label: 'People' },
      ],
    },
    {
      title: 'Contact',
      links: [
        { href: '#contact', label: 'Start a project' },
        { href: '#careers', label: 'Careers' },
        { href: '#press', label: 'Press kit' },
      ],
    },
  ],
  social: [
    { href: '#instagram', label: 'Instagram' },
    { href: '#linkedin', label: 'LinkedIn' },
    { href: '#are-na', label: 'Are.na' },
  ],
};
