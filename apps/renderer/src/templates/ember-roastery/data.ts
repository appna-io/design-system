/**
 * All the copy + structured content for the Ember Roastery landing page.
 *
 * Keeping everything here (rather than inline inside JSX) means template authors
 * can quickly fork this template — swap the café name, drinks menu, bean origins,
 * and opening hours — without touching layout code.
 */

export const cafeMeta = {
  brand: 'Ember',
  tagline: 'See the coffee before you taste it.',
  badge: 'Roasted fresh every morning',
  description:
    'A neighbourhood roastery for people who actually want to look at what they are drinking. Browse the cups, meet the beans, and find the brew that fits your morning.',
  primaryCta: { label: 'See the menu', href: '#menu' },
  secondaryCta: { label: 'Find the café', href: '#visit' },
};

export const navLinks = [
  { label: 'Menu', href: '#menu' },
  { label: 'Beans', href: '#beans' },
  { label: 'Brewing', href: '#brewing' },
  { label: 'Visit', href: '#visit' },
] as const;

export type DrinkTemp = 'hot' | 'iced';

export interface Drink {
  name: string;
  description: string;
  price: string;
  temp: DrinkTemp;
  popular?: boolean;
}

export const menu: readonly Drink[] = [
  {
    name: 'Espresso',
    temp: 'hot',
    price: '$3.50',
    description: 'A single, dense shot — caramel sweetness with a clean, lingering finish.',
    popular: true,
  },
  {
    name: 'Flat White',
    temp: 'hot',
    price: '$4.50',
    description: 'Double ristretto under a thin layer of velvety, micro-foamed milk.',
  },
  {
    name: 'Cortado',
    temp: 'hot',
    price: '$4.00',
    description: 'Equal parts espresso and warm milk. Balanced, smooth, no foam to hide behind.',
  },
  {
    name: 'Pour Over',
    temp: 'hot',
    price: '$5.00',
    description: 'Single origin, brewed to order. Bright, tea-like, and endlessly aromatic.',
    popular: true,
  },
  {
    name: 'Cold Brew',
    temp: 'iced',
    price: '$5.00',
    description: 'Steeped 18 hours for a low-acid, chocolatey cup served over fresh ice.',
  },
  {
    name: 'Iced Latte',
    temp: 'iced',
    price: '$5.50',
    description: 'Espresso poured over cold milk and ice — creamy, mellow, all-day easy.',
    popular: true,
  },
];

export interface BeanOrigin {
  origin: string;
  region: string;
  roast: 'Light' | 'Medium' | 'Dark';
  notes: readonly string[];
}

export const beans: readonly BeanOrigin[] = [
  {
    origin: 'Ethiopia',
    region: 'Yirgacheffe',
    roast: 'Light',
    notes: ['Jasmine', 'Bergamot', 'Stone fruit'],
  },
  {
    origin: 'Colombia',
    region: 'Huila',
    roast: 'Medium',
    notes: ['Red apple', 'Caramel', 'Cocoa'],
  },
  {
    origin: 'Sumatra',
    region: 'Mandheling',
    roast: 'Dark',
    notes: ['Dark chocolate', 'Cedar', 'Brown sugar'],
  },
];

export interface BrewMethod {
  iconKey: 'espresso' | 'pourover' | 'coldbrew' | 'frenchpress';
  title: string;
  description: string;
  time: string;
  color: 'primary' | 'success' | 'info' | 'warning';
}

export const brewMethods: readonly BrewMethod[] = [
  {
    iconKey: 'espresso',
    color: 'primary',
    title: 'Espresso',
    time: '25 sec',
    description: 'Nine bars of pressure pull a concentrated, syrupy shot — the heart of every milk drink.',
  },
  {
    iconKey: 'pourover',
    color: 'info',
    title: 'Pour Over',
    time: '3 min',
    description: 'A slow hand-poured drip that highlights the bright, delicate notes of single origins.',
  },
  {
    iconKey: 'coldbrew',
    color: 'success',
    title: 'Cold Brew',
    time: '18 hrs',
    description: 'Coarse grounds steeped overnight in cold water for a smooth, low-acid cup.',
  },
  {
    iconKey: 'frenchpress',
    color: 'warning',
    title: 'French Press',
    time: '4 min',
    description: 'Full immersion brewing that keeps the oils in for a rich, full-bodied mug.',
  },
];

export interface CafeStat {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
}

export const stats: readonly CafeStat[] = [
  { label: 'Cups poured / week', value: '4,200', delta: '+12%', trend: 'up' },
  { label: 'Single origins on bar', value: '8', delta: '+2', trend: 'up' },
  { label: 'Days from roast to cup', value: '5', delta: '-30%', trend: 'down' },
  { label: 'Regulars who know your name', value: '600+', delta: '+18%', trend: 'up' },
];

export interface Review {
  quote: string;
  author: string;
  role: string;
}

export const reviews: readonly Review[] = [
  {
    quote:
      'The pour over bar is a show in itself. You can watch your cup being made and the staff actually tells you what you are tasting.',
    author: 'Maya Okafor',
    role: 'Regular since opening day',
  },
  {
    quote:
      'Best cold brew in the neighbourhood — chocolatey, never bitter. I come in three mornings a week and they start it before I reach the counter.',
    author: 'Daniel Reyes',
    role: 'Work-from-café local',
  },
  {
    quote:
      'They let me smell the beans before choosing. It feels less like a coffee shop and more like a tasting room.',
    author: 'Sofia Lindqvist',
    role: 'First-time visitor, now hooked',
  },
];

export const visit = {
  address: '14 Kiln Street, Old Town',
  hours: [
    { day: 'Mon – Fri', time: '7:00 – 18:00' },
    { day: 'Saturday', time: '8:00 – 17:00' },
    { day: 'Sunday', time: '8:00 – 14:00' },
  ],
  note: 'Walk-ins only. Beans bagged to take home while the bar is open.',
} as const;

export const footerLinks = {
  Menu: ['Espresso bar', 'Pour over', 'Cold brew', 'Pastries'],
  Beans: ['Single origins', 'House blend', 'Subscriptions', 'Wholesale'],
  Café: ['Our story', 'The roastery', 'Events', 'Careers'],
  Visit: ['Hours', 'Location', 'Parking', 'Contact'],
} as const;
