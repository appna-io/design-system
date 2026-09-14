/**
 * All of Northbound's copy, in one typed tree.
 *
 * Shaped to the content schema proposed in #5 rather than to this template's convenience: the
 * eyebrow/title/body unit is one `SectionIntro` (it appears eight times below and would otherwise
 * become eight differently-named exports, which is the exact drift #5 measured across the first
 * three templates), stats carry a separate numeric `countTo` so a count-up never has to
 * reverse-engineer a display string, and every `Media` states its own `alt`.
 *
 * The local types below are deliberately structural copies of #5's primitives, not new shapes —
 * when `_kit/content.ts` lands this file changes its imports and nothing else. Extending the
 * schema is allowed; redefining it is not, so the two additions this template needs
 * (`AgendaSlot`, `VenueFact`) are written as extensions and flagged for the kit.
 */

/* ── #5 primitives ─────────────────────────────────────────────────────────────────────────── */

export interface Cta {
  href: string;
  label: string;
}

export interface NavLink {
  href: string;
  label: string;
}

/** The eyebrow / title / body unit. Feeds `<SectionHeading>` 1:1. */
export interface SectionIntro {
  eyebrow?: string;
  title: string;
  body?: string;
}

export interface StatItem {
  value: string;
  label: string;
  /** The number behind `value`, when there is one. `'6 tracks'` counts; `'all day'` does not. */
  countTo?: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: readonly string[];
  cta: string;
  highlighted?: boolean;
}

/* ── Northbound's two extensions ───────────────────────────────────────────────────────────── */

/**
 * A track. The agenda filters by these, and each carries the palette role its chip is cut from —
 * a *role*, never a colour, so recolouring the theme recolours the schedule.
 */
export interface Track {
  id: string;
  name: string;
  color: 'primary' | 'secondary' | 'neutral';
}

/**
 * One row of the schedule. `start`/`end` are 24-hour local strings rather than `Date`s: the
 * agenda is a printed timetable, not a calendar, and a Date would drag a timezone question into
 * content that has no timezone (the event has one; the reader's device does not matter).
 *
 * `trackId` is `null` for the whole-room moments — registration, lunch, the closing party. Those
 * are the rows that make a schedule feel like a real day rather than a list of talks.
 */
export interface AgendaSlot {
  id: string;
  start: string;
  end: string;
  title: string;
  speakerId?: string;
  trackId: string | null;
  room: string;
}

export interface Speaker {
  id: string;
  name: string;
  role: string;
  company: string;
  /** Two letters. The DS `Avatar` draws initials when there is no image, which is the honest
   *  placeholder for a template — a stock headshot would be a lie about a real person. */
  initials: string;
  topic: string;
  trackId: string;
}

export interface VenueFact {
  icon: 'MapPin' | 'Clock' | 'Globe' | 'Coffee';
  label: string;
  value: string;
  detail?: string;
}

/* ── The content ───────────────────────────────────────────────────────────────────────────── */

export const brand = {
  name: 'Northbound',
  tagline: 'One day. Six tracks. No keynote theatre.',
  /** ISO local time of the first session. The countdown reads this; nothing else does. */
  startsAt: '2026-11-12T09:00:00',
  dateLabel: '12 November 2026',
  cityLabel: 'Oslo',
} as const;

export const nav: { links: readonly NavLink[]; cta: Cta } = {
  links: [
    { href: '#speakers', label: 'Speakers' },
    { href: '#agenda', label: 'Agenda' },
    { href: '#venue', label: 'Venue' },
    { href: '#tickets', label: 'Tickets' },
  ],
  cta: { href: '#tickets', label: 'Get a ticket' },
};

export const hero = {
  eyebrow: 'Oslo · 12 November 2026',
  title: 'Northbound',
  standfirst:
    'A one-day conference for the people who actually ship — design systems, front-end platform, and the unglamorous work in between.',
  primaryCta: { href: '#tickets', label: 'Get a ticket' },
  secondaryCta: { href: '#agenda', label: 'See the agenda' },
  footnote: '340 seats. Last year sold out in nine days.',
} as const;

export const marquee: readonly string[] = [
  'Design systems',
  'Front-end platform',
  'Accessibility',
  'Type & motion',
  'Build tooling',
  'Research',
];

export const statsIntro: SectionIntro = {
  eyebrow: 'The shape of the day',
  title: 'Nine hours, planned to the minute',
  body: 'Six parallel tracks, one room for the talks nobody should miss, and enough break time to actually meet someone.',
};

export const stats: readonly StatItem[] = [
  { value: '24', label: 'Talks', countTo: 24 },
  { value: '6', label: 'Tracks', countTo: 6 },
  { value: '340', label: 'Seats', countTo: 340 },
  { value: '1', label: 'Day', countTo: 1 },
];

export const tracks: readonly Track[] = [
  { id: 'systems', name: 'Design systems', color: 'primary' },
  { id: 'platform', name: 'Platform', color: 'secondary' },
  { id: 'craft', name: 'Craft', color: 'neutral' },
];

export const speakersIntro: SectionIntro = {
  eyebrow: 'Speakers',
  title: 'Practitioners, not pundits',
  body: 'Everyone on this list ships the thing they are talking about. No vendor keynotes, no roadmap slides.',
};

export const speakers: readonly Speaker[] = [
  {
    id: 'ingrid',
    name: 'Ingrid Halvorsen',
    role: 'Principal engineer',
    company: 'Kartverket',
    initials: 'IH',
    topic: 'Deleting a design system without anyone noticing',
    trackId: 'systems',
  },
  {
    id: 'tobias',
    name: 'Tobias Lindqvist',
    role: 'Staff front-end',
    company: 'Klarna',
    initials: 'TL',
    topic: 'Your bundle is fine. Your waterfall is not.',
    trackId: 'platform',
  },
  {
    id: 'amara',
    name: 'Amara Boateng',
    role: 'Accessibility lead',
    company: 'NRK',
    initials: 'AB',
    topic: 'The four bugs that make a page unusable',
    trackId: 'craft',
  },
  {
    id: 'ruben',
    name: 'Rubén Ortega',
    role: 'Design systems lead',
    company: 'Spotify',
    initials: 'RO',
    topic: 'Tokens are an API. Version them like one.',
    trackId: 'systems',
  },
  {
    id: 'mei',
    name: 'Mei Tanaka',
    role: 'Infrastructure',
    company: 'Vercel',
    initials: 'MT',
    topic: 'Builds that fail loudly and early',
    trackId: 'platform',
  },
  {
    id: 'jonas',
    name: 'Jonas Kirkegaard',
    role: 'Type designer',
    company: 'Independent',
    initials: 'JK',
    topic: 'Fluid type without the clamp() soup',
    trackId: 'craft',
  },
];

export const agendaIntro: SectionIntro = {
  eyebrow: 'Agenda',
  title: 'The whole day, in public',
  body: 'Filter by track. Rooms and times are final — we publish the schedule before tickets go on sale, not after.',
};

export const agenda: readonly AgendaSlot[] = [
  {
    id: 's1',
    start: '08:15',
    end: '09:00',
    title: 'Registration & coffee',
    trackId: null,
    room: 'Foyer',
  },
  { id: 's2', start: '09:00', end: '09:20', title: 'Opening', trackId: null, room: 'Storsalen' },
  {
    id: 's3',
    start: '09:30',
    end: '10:10',
    title: 'Deleting a design system without anyone noticing',
    speakerId: 'ingrid',
    trackId: 'systems',
    room: 'Storsalen',
  },
  {
    id: 's4',
    start: '09:30',
    end: '10:10',
    title: 'Your bundle is fine. Your waterfall is not.',
    speakerId: 'tobias',
    trackId: 'platform',
    room: 'Verkstedet',
  },
  {
    id: 's5',
    start: '10:20',
    end: '11:00',
    title: 'Tokens are an API. Version them like one.',
    speakerId: 'ruben',
    trackId: 'systems',
    room: 'Storsalen',
  },
  {
    id: 's6',
    start: '10:20',
    end: '11:00',
    title: 'The four bugs that make a page unusable',
    speakerId: 'amara',
    trackId: 'craft',
    room: 'Loftet',
  },
  {
    id: 's7',
    start: '11:00',
    end: '12:00',
    title: 'Long break — hallway track',
    trackId: null,
    room: 'Foyer',
  },
  {
    id: 's8',
    start: '12:00',
    end: '12:40',
    title: 'Builds that fail loudly and early',
    speakerId: 'mei',
    trackId: 'platform',
    room: 'Verkstedet',
  },
  {
    id: 's9',
    start: '12:00',
    end: '12:40',
    title: 'Fluid type without the clamp() soup',
    speakerId: 'jonas',
    trackId: 'craft',
    room: 'Loftet',
  },
  { id: 's10', start: '12:40', end: '14:00', title: 'Lunch', trackId: null, room: 'Kantina' },
  {
    id: 's11',
    start: '14:00',
    end: '15:30',
    title: 'Workshops (all tracks, sign-up on the day)',
    trackId: null,
    room: 'All rooms',
  },
  {
    id: 's12',
    start: '16:00',
    end: '16:30',
    title: 'Closing & drinks',
    trackId: null,
    room: 'Foyer',
  },
];

export const venueIntro: SectionIntro = {
  eyebrow: 'Venue',
  title: 'Sentralen, Øvre Slottsgate 3',
  body: 'A former bank in the middle of Oslo, ten minutes on foot from Oslo S and step-free throughout.',
};

export const venueFacts: readonly VenueFact[] = [
  {
    icon: 'MapPin',
    label: 'Address',
    value: 'Øvre Slottsgate 3, 0157 Oslo',
    detail: '10 min walk from Oslo S',
  },
  { icon: 'Clock', label: 'Doors', value: '08:15', detail: 'First talk at 09:00 sharp' },
  { icon: 'Globe', label: 'Language', value: 'English', detail: 'Live captions in all rooms' },
  {
    icon: 'Coffee',
    label: 'Included',
    value: 'Lunch & coffee',
    detail: 'Vegan and gluten-free by default',
  },
];

export const ticketsIntro: SectionIntro = {
  eyebrow: 'Tickets',
  title: 'Three ways in',
  body: 'Prices include lunch, coffee and the after-party. No early-bird games — the price goes up once, on 1 October.',
};

export const tiers: readonly PricingTier[] = [
  {
    id: 'community',
    name: 'Community',
    price: 'kr 890',
    cadence: 'per person',
    blurb: 'Students, career changers, and anyone paying their own way.',
    features: ['Full day, all six tracks', 'Lunch and coffee', 'Talk recordings', 'After-party'],
    cta: 'Get a community ticket',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 'kr 2 490',
    cadence: 'per person',
    blurb: 'The normal ticket. Most people want this one.',
    features: [
      'Full day, all six tracks',
      'Lunch and coffee',
      'Talk recordings',
      'After-party',
      'Afternoon workshop seat',
    ],
    cta: 'Get a standard ticket',
    highlighted: true,
  },
  {
    id: 'team',
    name: 'Team of four',
    price: 'kr 8 400',
    cadence: 'for four',
    blurb:
      'Bring the people you actually work with. It is the only way anything changes on Monday.',
    features: [
      'Four standard tickets',
      'Reserved seating together',
      'Four workshop seats',
      'One invoice',
    ],
    cta: 'Book for a team',
  },
];

export const faqIntro: SectionIntro = {
  eyebrow: 'Practicalities',
  title: 'Before you ask',
};

export const faqs: readonly FaqItem[] = [
  {
    id: 'refund',
    question: 'Can I get a refund?',
    answer:
      'Full refund up to 14 days before. After that you can transfer the ticket to someone else at any point, including on the morning of the event — email us the name.',
  },
  {
    id: 'recordings',
    question: 'Are the talks recorded?',
    answer:
      'Every talk, published free within three weeks. The workshops are not recorded, because nobody behaves normally on camera.',
  },
  {
    id: 'access',
    question: 'Is the venue accessible?',
    answer:
      'Step-free throughout, an accessible toilet on every floor, and a lift to all three rooms. Live captions run in every room. Tell us what you need when you book and we will confirm it in writing.',
  },
  {
    id: 'quiet',
    question: 'Is there somewhere quiet?',
    answer:
      'Yes — a marked quiet room, no talks piped in, open all day. The hallway track is the best part of a conference and also the most exhausting.',
  },
  {
    id: 'kids',
    question: 'Can I bring a baby?',
    answer:
      'Yes, and infants do not need a ticket. There is a private feeding and changing room next to the foyer.',
  },
];

export const cta = {
  eyebrow: 'Last thing',
  title: 'Nine days is how long the seats lasted last year',
  body: 'There is no waiting list and we do not release extras. Tickets go up on 1 October.',
  primaryCta: { href: '#tickets', label: 'Get a ticket' },
  secondaryCta: { href: '#agenda', label: 'Read the agenda first' },
} as const;

export const footer = {
  links: [
    { href: '#speakers', label: 'Speakers' },
    { href: '#agenda', label: 'Agenda' },
    { href: '#venue', label: 'Venue' },
    { href: '#tickets', label: 'Tickets' },
    { href: '#faq', label: 'Practicalities' },
  ] as readonly NavLink[],
  email: { href: 'mailto:hei@northbound.no', label: 'hei@northbound.no' },
  legal: 'Northbound is run at cost by six volunteers. Any surplus funds community tickets.',
} as const;
