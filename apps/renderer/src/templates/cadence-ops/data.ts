/**
 * Content for the Cadence product landing page.
 *
 * Original copy written for the gallery — Cadence is not a real product and nothing here is
 * ported from an upstream source. Company names in `logos` are invented for the same reason:
 * a fake logo wall of real brands would be a false endorsement, so these are made-up firms in
 * plausible trades.
 *
 * Same convention as the other templates: no copy lives in the layout, so re-skinning the page
 * for a different product is a single-file edit.
 */

export const brand = {
  name: 'Cadence',
  legalName: 'Cadence Field Ops, Inc.',
  tagline: 'Field operations, in step.',
};

export const navLinks = [
  { href: '#product', label: 'Product' },
  { href: '#workflow', label: 'Workflow' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
] as const;

export const headerCtas = {
  secondary: { href: '#demo', label: 'Book a demo' },
  primary: { href: '#pricing', label: 'Start free' },
};

export const hero = {
  eyebrow: 'New — live GPS timesheets',
  title: 'Run the field like it is in the room',
  body: 'Cadence puts shift plans, timesheets and job status on one live board, so dispatch, the crew and payroll are all looking at the same thing at the same time.',
  primaryCta: { href: '#pricing', label: 'Start free trial' },
  secondaryCta: { href: '#demo', label: 'Book a demo' },
  footnote: 'Free for 14 days · No card required · SOC 2 Type II',
};

/**
 * The in-page product preview. It is assembled from DS primitives rather than a screenshot —
 * a picture of a dashboard would not re-skin with the theme, and would not prove the DS can
 * build the thing the page is selling. See `HeroPreview.tsx`.
 */
export const heroPreview = {
  boardTitle: 'Thursday · Crew board',
  boardMeta: 'Live · updated 30s ago',
  stats: [
    { label: 'On shift', value: '38' },
    { label: 'Jobs closed', value: '112' },
    { label: 'Hours logged', value: '291' },
  ],
  crewsTitle: 'Crews',
  crews: [
    { id: 'north', name: 'North crew', jobsDone: 9, jobsTotal: 11, lead: 'Priya Raman' },
    { id: 'harbour', name: 'Harbour crew', jobsDone: 6, jobsTotal: 12, lead: 'Marcus Vale' },
    { id: 'south', name: 'South crew', jobsDone: 11, jobsTotal: 11, lead: 'Dana Okafor' },
  ],
};

export const logos = {
  title: 'Keeping the schedule for field teams at',
  companies: [
    'Halvorsen Utilities',
    'BrightPath Solar',
    'Meridian Facilities',
    'Redcliff Plumbing',
    'NorthAxis Telecom',
  ],
};

export const productSection = {
  eyebrow: 'The product',
  title: 'One board, three jobs it does properly',
  body: 'Dispatch, timesheets and payroll are usually three tools that disagree. Cadence is one record the whole chain reads from.',
};

export interface ProductTab {
  id: string;
  label: string;
  title: string;
  body: string;
  points: readonly string[];
}

export const productTabs: readonly ProductTab[] = [
  {
    id: 'dispatch',
    label: 'Dispatch',
    title: 'Move a job, everyone knows',
    body: 'Drag a job to another crew and the change lands on their phones before you let go of the mouse. No ring-around, no "which version of the sheet is this".',
    points: [
      'Drag-and-drop reassignment across crews and days',
      'Conflict and travel-time warnings before you commit',
      'Push to crew phones instantly, offline queued',
    ],
  },
  {
    id: 'timesheets',
    label: 'Timesheets',
    title: 'Hours that close themselves',
    body: 'Crews clock in from the job site and the timesheet writes itself. Supervisors approve exceptions instead of retyping a week of paper.',
    points: [
      'GPS-stamped clock in and out, geofenced per site',
      'Overtime and break rules applied as hours accrue',
      'Approve by exception — only what is out of policy',
    ],
  },
  {
    id: 'payroll',
    label: 'Payroll',
    title: 'Export once, reconcile never',
    body: 'Approved hours map to your pay codes and leave as a file your payroll system already accepts. The reconciliation meeting stops being a meeting.',
    points: [
      'Pay-code mapping per award, union and jurisdiction',
      'Locked pay periods with a full change audit trail',
      'Direct export to the major payroll providers',
    ],
  },
];

export const featuresSection = {
  eyebrow: 'Built in',
  title: 'The unglamorous half, done',
  body: 'The parts of field software nobody demos and everybody depends on.',
};

/** Glyph keys map to `@apx-ui/icons` components in the section — see `Features.tsx`. */
export type FeatureIcon = 'clock' | 'mapPin' | 'shield' | 'repeat' | 'phone' | 'zap';

export const features: readonly { icon: FeatureIcon; title: string; description: string }[] = [
  {
    icon: 'clock',
    title: 'Live hours',
    description:
      'Running totals per person, per crew and per job, recalculated as clocks tick rather than at the end of the week.',
  },
  {
    icon: 'mapPin',
    title: 'Geofenced check-in',
    description:
      'Clock-ins land against a site, not a guess. Out-of-fence attempts are flagged, never silently accepted.',
  },
  {
    icon: 'shield',
    title: 'Compliance rules',
    description:
      'Break, rest and maximum-shift rules are enforced at scheduling time, so the roster cannot be built illegal.',
  },
  {
    icon: 'repeat',
    title: 'Recurring shifts',
    description:
      'Build the pattern once and roll it forward. Exceptions stay exceptions instead of forking the whole roster.',
  },
  {
    icon: 'phone',
    title: 'Offline mobile',
    description:
      'Basements, plant rooms, rural sites. The app queues everything and syncs the moment there is signal again.',
  },
  {
    icon: 'zap',
    title: 'Payroll export',
    description:
      'Approved hours become a payroll file in one action, with the mapping and the audit trail attached.',
  },
];

export const workflowSection = {
  eyebrow: 'How it runs',
  title: 'A week on Cadence',
  body: 'Four moments, and the software is quiet for the rest of them.',
};

export const workflowSteps: readonly {
  id: string;
  icon: FeatureIcon;
  title: string;
  description: string;
  active?: boolean;
}[] = [
  {
    id: 'plan',
    icon: 'repeat',
    title: 'Monday — plan',
    description: 'Roll the recurring pattern forward, fill the gaps, publish to the crews.',
  },
  {
    id: 'clock',
    icon: 'mapPin',
    title: 'All week — clock',
    description: 'Crews clock in on site. Hours, travel and job status write themselves.',
  },
  {
    id: 'adjust',
    icon: 'zap',
    title: 'When it changes — adjust',
    description: 'Reassign a job and the affected phones update before you close the tab.',
    active: true,
  },
  {
    id: 'pay',
    icon: 'clock',
    title: 'Friday — pay',
    description: 'Approve the exceptions, lock the period, export the file. Done before lunch.',
  },
];

export const metrics: readonly { value: string; label: string; caption: string }[] = [
  {
    value: '6.5 hrs',
    label: 'Saved per supervisor, weekly',
    caption: 'Median across onboarded teams',
  },
  { value: '98.2%', label: 'Timesheets approved untouched', caption: 'No manual edit needed' },
  {
    value: '<30s',
    label: 'Dispatch change to crew phone',
    caption: 'Median, including offline queue',
  },
  {
    value: '4 days',
    label: 'Average time to go live',
    caption: 'From first import to first payroll',
  },
];

export const pricingSection = {
  eyebrow: 'Pricing',
  title: 'Per person on shift, nothing else',
  body: 'No dispatcher seats, no module licences, no per-export fee. If someone did not work this month, you are not billed for them.',
};

export interface Tier {
  id: string;
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: readonly string[];
  cta: string;
  highlighted?: boolean;
}

export const tiers: readonly Tier[] = [
  {
    id: 'crew',
    name: 'Crew',
    price: '$6',
    cadence: 'per active worker / month',
    blurb: 'For a single crew getting off spreadsheets and paper timesheets.',
    features: [
      'Up to 25 active workers',
      'Scheduling and GPS timesheets',
      'CSV payroll export',
      'Email support',
    ],
    cta: 'Start free trial',
  },
  {
    id: 'operations',
    name: 'Operations',
    price: '$11',
    cadence: 'per active worker / month',
    blurb: 'For multi-crew operations that need the rules enforced, not documented.',
    features: [
      'Unlimited workers and crews',
      'Compliance and award rule engine',
      'Direct payroll provider export',
      'Locked pay periods with audit trail',
      'Priority support, 4-hour response',
    ],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'annual agreement',
    blurb: 'For regulated operators with procurement, SSO and data-residency requirements.',
    features: [
      'Everything in Operations',
      'SAML SSO and SCIM provisioning',
      'Regional data residency',
      'Custom DPA and MSA',
      'Named success manager',
    ],
    cta: 'Talk to sales',
  },
];

export const testimonial = {
  eyebrow: 'From the field',
  quote:
    'We ran 40 sparkies off a whiteboard and a group chat for nine years. The thing that sold me was not the scheduling — it was Friday. Payroll used to eat my whole afternoon and now it is a twenty-minute job I do standing up.',
  name: 'Dana Okafor',
  role: 'Operations manager, Halvorsen Utilities',
  detail: '210 workers · Live since March',
};

export const faqSection = {
  eyebrow: 'Questions',
  title: 'The ones people actually ask',
};

export const faqs: readonly { id: string; question: string; answer: string }[] = [
  {
    id: 'migrate',
    question: 'What does moving off our current roster take?',
    answer:
      'An import of your people, sites and recurring patterns, which we do with you on a call. Most teams are running a parallel week within four days and cut over at the next pay period. Nothing is deleted from your old system — you keep it read-only for as long as you like.',
  },
  {
    id: 'offline',
    question: 'Our sites have no signal. Does the app still work?',
    answer:
      'Yes. The mobile app holds the full schedule locally, accepts clock-ins and job updates offline, and syncs when signal returns. Clock times are stamped when they happen, not when they sync, so a basement shift does not become a late one.',
  },
  {
    id: 'billing',
    question: 'What counts as an active worker?',
    answer:
      'Someone who was on at least one published shift in the billing month. Seasonal crews, apprentices between placements and anyone on leave are not billed. Dispatchers, supervisors and payroll staff use Cadence for free.',
  },
  {
    id: 'payroll',
    question: 'Does it work with our payroll provider?',
    answer:
      'Direct export covers the major providers, and every other system is served by a mapped CSV built to that provider’s import spec. Pay-code mapping is configured per award or agreement, so the file lands ready to post rather than ready to fix.',
  },
  {
    id: 'security',
    question: 'Where does our data live and who can see it?',
    answer:
      'SOC 2 Type II, encrypted in transit and at rest, with role-based access down to the crew. Enterprise plans pin storage to a region. We do not sell or share operational data, and access by our staff requires a ticket and leaves an audit entry.',
  },
];

export const ctaBand = {
  title: 'Put next week on Cadence',
  body: 'Import your roster, run one week in parallel, and decide with real data instead of a demo.',
  primaryCta: { href: '#pricing', label: 'Start free trial' },
  secondaryCta: { href: '#demo', label: 'Book a demo' },
  footnote: 'Fourteen days, full product, no card.',
};

export const footer = {
  blurb: 'Scheduling, timesheets and payroll export for teams whose work happens away from a desk.',
  columns: [
    {
      title: 'Product',
      links: [
        { href: '#product', label: 'Dispatch' },
        { href: '#product', label: 'Timesheets' },
        { href: '#product', label: 'Payroll' },
        { href: '#pricing', label: 'Pricing' },
      ],
    },
    {
      title: 'Company',
      links: [
        { href: '#workflow', label: 'How it works' },
        { href: '#faq', label: 'FAQ' },
        { href: '#demo', label: 'Book a demo' },
      ],
    },
  ],
  contact: {
    title: 'Contact',
    email: 'hello@cadence.example',
    phone: { href: 'tel:+16175550142', label: '(617) 555-0142' },
  },
  copyright: (year: number) => `© ${year} Cadence Field Ops, Inc. All rights reserved.`,
};

/** `9 / 11` → `82`. Shared by the hero preview's bars and their accessible labels. */
export function completionPercent(done: number, total: number): number {
  return Math.round((done / total) * 100);
}
