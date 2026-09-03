/**
 * Content for the Fade & Co. barbershop landing page.
 *
 * Unlike `lyli-coffee` this is not a port — there is no upstream source, so the copy here is
 * original and written for the gallery. The convention it does keep is the important one: no
 * copy lives in the layout, every string a section renders comes from this file, so re-skinning
 * the page for a different shop is a single-file edit.
 *
 * Photography is Unsplash, referenced by URL with the same `w/h/fit` query params the rest of
 * the gallery uses.
 */

export const brand = {
  /** The wordmark renders as `FADE` + a brass ampersand + `CO.` */
  name: 'Fade',
  connector: '&',
  suffix: 'Co.',
  legalName: 'Fade & Co. Barbershop',
};

export const navLinks = [
  { href: '#services', label: 'Services' },
  { href: '#barbers', label: 'Barbers' },
  { href: '#visit', label: 'Visit' },
] as const;

export const headerCta = { href: '#book', label: 'Book a chair' };

export const headerPhone = { href: 'tel:+13125550148', label: '(312) 555-0148' };

export const hero = {
  eyebrow: 'Est. 2012 · Wells Street, Chicago',
  title: 'A sharp cut is never an accident',
  body: 'Traditional barbering with a modern edge — hot towels, straight razors, and a chair that stays yours for the full hour.',
  primaryCta: { href: '#book', label: 'Book a chair' },
  secondaryCta: { href: '#services', label: 'See the menu' },
  /** Small availability strip under the CTAs — the one live-ish detail on the page. */
  status: 'Open today until 8pm · Walk-ins welcome after 6',
  image: {
    src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&h=1400&fit=crop',
    alt: 'Barber finishing a fade with clippers',
  },
};

/** The numbers band under the hero. `value` is pre-formatted — `Stat` renders strings verbatim. */
export const stats: readonly { value: string; label: string; caption: string }[] = [
  { value: '12', label: 'Years on Wells St.', caption: 'Same corner since 2012' },
  { value: '41,000+', label: 'Cuts finished', caption: 'And counting' },
  { value: '6', label: 'Barbers on the floor', caption: 'Five years minimum behind the chair' },
];

/** Average rating shown beside the numbers, rendered with a read-only `Rating`. */
export const ratingSummary = {
  value: 4.9,
  label: 'Average rating',
  caption: '1,284 reviews across Google and Yelp',
};

export const servicesSection = {
  eyebrow: 'The menu',
  title: 'Every cut finished properly',
  body: 'Prices are flat — hot towel, neck shave and a styling finish are included on every cut. No upsell at the mirror.',
};

export interface Service {
  id: string;
  name: string;
  description: string;
  /** Minutes of chair time, formatted at the call site. */
  duration: number;
  price: number;
  /** Marks the one row that gets the accent treatment. */
  popular?: boolean;
}

export const services: readonly Service[] = [
  {
    id: 'signature-cut',
    name: 'Signature cut',
    description: 'Consultation, scissor and clipper work, hot towel, styled with your product.',
    duration: 45,
    price: 42,
  },
  {
    id: 'skin-fade',
    name: 'Skin fade',
    description: 'Bald-to-blend taper worked in three guards, razor-finished at the neckline.',
    duration: 45,
    price: 48,
  },
  {
    id: 'cut-and-beard',
    name: 'Cut & beard',
    description: 'The signature cut plus a full beard shape, line-up and oil. Our busiest hour.',
    duration: 70,
    price: 65,
    popular: true,
  },
  {
    id: 'beard-sculpt',
    name: 'Beard sculpt',
    description: 'Shaped with shears, cheek and neck lines cut in with a straight razor.',
    duration: 30,
    price: 28,
  },
  {
    id: 'hot-towel-shave',
    name: 'Hot towel shave',
    description: 'Three towels, pre-shave oil, two passes with a straight razor, cold finish.',
    duration: 40,
    price: 45,
  },
  {
    id: 'buzz-and-lineup',
    name: 'Buzz & line-up',
    description: 'One guard all over, edges and neckline squared off. In and out.',
    duration: 20,
    price: 22,
  },
  {
    id: 'grey-blending',
    name: 'Grey blending',
    description: 'Softens grey by two shades without going flat. Grows out with no line.',
    duration: 30,
    price: 35,
  },
  {
    id: 'father-and-son',
    name: 'Father & son',
    description: 'Two chairs side by side, two cuts, one appointment. Under-12s only.',
    duration: 60,
    price: 60,
  },
];

export const craftSection = {
  eyebrow: 'Why here',
  title: 'Built on the details',
  body: 'Three promises the shop has kept since the first chair went in.',
};

/** Glyphs map to `@apx-ui/icons` components in the section — see `Craft.tsx`. */
export type CraftIcon = 'scissors' | 'clock' | 'award';

export const craftPoints: readonly { icon: CraftIcon; title: string; description: string }[] = [
  {
    icon: 'scissors',
    title: 'Trained, not rushed',
    description:
      'Every barber on the floor has at least five years behind the chair, and the whole shop trains together for an hour every Tuesday before we open.',
  },
  {
    icon: 'clock',
    title: 'On time, every time',
    description:
      'Book a slot and it is yours. We hold the chair ten minutes past, we never double-book it, and we do not run three deep on a Saturday.',
  },
  {
    icon: 'award',
    title: 'Finished properly',
    description:
      'Hot towel, neck shave and a styling finish are in the price of every cut. You leave looking the way you will look tomorrow, not just tonight.',
  },
];

export const barbersSection = {
  eyebrow: 'The floor',
  title: 'Pick your barber',
  body: 'Six chairs, six regulars-only waitlists. Request whoever you like when you book.',
};

export interface Barber {
  id: string;
  name: string;
  role: string;
  /** Two or three things this barber is asked for by name. */
  specialties: readonly string[];
  years: number;
  imageUrl: string;
}

export const barbers: readonly Barber[] = [
  {
    id: 'marcus-vale',
    name: 'Marcus Vale',
    role: 'Master barber · Owner',
    specialties: ['Skin fades', 'Straight razor'],
    years: 18,
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=700&fit=crop',
  },
  {
    id: 'rosa-mendel',
    name: 'Rosa Mendel',
    role: 'Senior barber',
    specialties: ['Curl work', 'Grey blending'],
    years: 9,
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=700&fit=crop',
  },
  {
    id: 'dev-okonkwo',
    name: 'Dev Okonkwo',
    role: 'Senior barber',
    specialties: ['Textured crops', 'Beard sculpting'],
    years: 8,
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=700&fit=crop',
  },
  {
    id: 'ilan-baruch',
    name: 'Ilan Baruch',
    role: 'Barber',
    specialties: ['Scissor work', 'Classic partings'],
    years: 5,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=700&fit=crop',
  },
];

export const testimonialsSection = {
  eyebrow: 'The chair talks',
  title: 'What regulars say',
};

export const testimonials: readonly {
  quote: string;
  name: string;
  role: string;
  rating: number;
}[] = [
  {
    quote:
      'Twelve years and four barbers in this city — Marcus is the first one who asked what I do for work before he touched my hair. It shows.',
    name: 'Theo A.',
    role: 'Regular since 2016',
    rating: 5,
  },
  {
    quote:
      'Booked at 6:40, sat down at 6:40. The hot towel shave is worth the trip on its own, and nobody tries to sell you pomade on the way out.',
    name: 'Danny K.',
    role: 'First visit',
    rating: 5,
  },
  {
    quote:
      'Rosa is the only barber who has ever cut my curls dry and got it right. I drive in from Evanston every three weeks for it.',
    name: 'Priya S.',
    role: 'Regular since 2021',
    rating: 5,
  },
];

export const booking = {
  eyebrow: 'Reserve',
  title: 'Take the chair',
  body: 'Send a request and we text back within the hour to lock the time. Same-day slots usually open around 4pm.',
  nameLabel: 'Your name',
  namePlaceholder: 'Alex Moreno',
  phoneLabel: 'Mobile number',
  phonePlaceholder: '(312) 555-0148',
  serviceLabel: 'Service',
  servicePlaceholder: 'Pick a service',
  barberLabel: 'Barber',
  barberPlaceholder: 'No preference',
  anyBarber: { value: 'any', label: 'No preference' },
  submitLabel: 'Request a chair',
  confirmation: 'Got it — we will text you within the hour to confirm the time.',
  footnote: 'Rather talk to someone?',
};

export const visit = {
  eyebrow: 'Find us',
  title: 'Wells Street, second door from the corner',
  body: 'Metered parking on Wells, Brown line two blocks east. The green barber pole is ours.',
  addressTitle: 'Address',
  address: ['1412 N Wells Street', 'Chicago, IL 60610'],
  hoursTitle: 'Hours',
  contactTitle: 'Contact',
  walkIns: 'Walk-ins welcome after 6pm — put your name on the board by the door.',
  image: {
    src: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=900&h=700&fit=crop',
    alt: 'Interior of the barbershop with leather chairs and a mirrored wall',
  },
};

export const hours: readonly { days: string; time: string }[] = [
  { days: 'Mon – Thu', time: '9:00 – 20:00' },
  { days: 'Friday', time: '9:00 – 21:00' },
  { days: 'Saturday', time: '8:00 – 18:00' },
  { days: 'Sunday', time: 'Closed' },
];

export const contact = {
  phone: headerPhone,
  email: 'shop@fadeandco.com',
};

export const footer = {
  blurb:
    'A six-chair barbershop on Wells Street. Traditional barbering, flat prices, and a cut that still looks right on day fourteen.',
  exploreTitle: 'Explore',
  visitTitle: 'Visit',
  copyright: (year: number) => `© ${year} Fade & Co. Barbershop. All rights reserved.`,
};

export const footerLinks = [...navLinks, headerCta] as const;

export const socials = [
  { href: 'https://instagram.com', label: 'IG', name: 'Instagram' },
  { href: 'https://twitter.com', label: 'X', name: 'Twitter' },
] as const;

/** Whole-dollar prices, the way the menu board writes them. */
export function formatPrice(price: number): string {
  return `$${price}`;
}

/** `45` → `45 min`. Kept here so the services list and the booking select agree. */
export function formatDuration(minutes: number): string {
  return `${minutes} min`;
}
