/**
 * All of Halyard's copy, in one typed tree — same #5 schema as `northbound/content.ts`, with the
 * two extensions a documentation site needs (`DocSection`, `ApiRow`) written as extensions rather
 * than as new shapes. `SectionIntro`, `Cta`, `NavLink` and `FaqItem` are structurally identical to
 * the spec, so this file changes its imports and nothing else when `_kit/content.ts` lands.
 *
 * The one genuinely different thing about a docs template: **its navigation and its content are
 * the same tree.** A marketing page has `nav.links` pointing at sections that happen to exist; a
 * docs page's sidebar, its on-this-page rail and its scroll-spy all have to agree with the
 * document, or one of them is lying. So `docSections` is the single source and every one of those
 * three is derived from it — `navTree` below is computed, not authored.
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

export interface SectionIntro {
  eyebrow?: string;
  title: string;
  body?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/* ── Halyard's extensions ──────────────────────────────────────────────────────────────────── */

/**
 * One documented section. `id` is the anchor, the sidebar key, the on-this-page key and the
 * scroll-spy key — deliberately one value, because four ids that must match are four chances for
 * the sidebar to highlight the wrong heading.
 */
export interface DocSection {
  id: string;
  label: string;
  group: string;
}

/** A row of the API table. `type` and `default` are rendered in the mono face. */
export interface ApiRow {
  id: string;
  name: string;
  type: string;
  default: string;
  required: boolean;
  description: string;
}

export interface CodeSample {
  id: string;
  label: string;
  language: string;
  code: string;
}

/* ── The content ───────────────────────────────────────────────────────────────────────────── */

export const brand = {
  name: 'Halyard',
  tagline: 'Typed webhooks that retry themselves.',
  version: 'v2.4.1',
} as const;

export const nav: { links: readonly NavLink[]; ctas: readonly Cta[] } = {
  links: [
    { href: '#quickstart', label: 'Docs' },
    { href: '#api', label: 'API' },
    { href: '#errors', label: 'Errors' },
  ],
  ctas: [
    { href: '#', label: 'GitHub' },
    { href: '#quickstart', label: 'Get an API key' },
  ],
};

/**
 * The document, in order. Everything navigational is derived from this list — see `navTree` and
 * the on-this-page rail. Adding a section here adds it to the sidebar, the rail and the scroll-spy
 * at once; there is no second place to forget.
 */
export const docSections: readonly DocSection[] = [
  { id: 'overview', label: 'Overview', group: 'Getting started' },
  { id: 'install', label: 'Installation', group: 'Getting started' },
  { id: 'quickstart', label: 'Quickstart', group: 'Getting started' },
  { id: 'delivery', label: 'Delivery & retries', group: 'Concepts' },
  { id: 'signing', label: 'Signature verification', group: 'Concepts' },
  { id: 'api', label: 'Endpoint reference', group: 'Reference' },
  { id: 'errors', label: 'Error codes', group: 'Reference' },
  { id: 'support', label: 'Getting help', group: 'Reference' },
];

/** The sidebar tree, derived. Groups keep their first-appearance order. */
export const navTree = docSections.reduce<
  { id: string; label: string; children: { id: string; label: string }[] }[]
>((groups, section) => {
  const existing = groups.find((group) => group.label === section.group);
  const child = { id: section.id, label: section.label };
  if (existing) existing.children.push(child);
  else groups.push({ id: `group-${groups.length}`, label: section.group, children: [child] });
  return groups;
}, []);

export const hero = {
  eyebrow: brand.version,
  title: 'Typed webhooks that retry themselves',
  body: 'Halyard delivers events to your endpoint with exponential backoff, signed payloads and a replay log you can actually query. One dependency, no queue to run.',
  primaryCta: { href: '#quickstart', label: 'Quickstart' },
  secondaryCta: { href: '#api', label: 'API reference' },
} as const;

export const overview: SectionIntro = {
  eyebrow: 'Overview',
  title: 'What Halyard does',
  body: 'You POST an event. We deliver it, retry it on failure with exponential backoff for up to 72 hours, sign every attempt, and keep a replayable log. If your endpoint was down for an afternoon, nothing is lost.',
};

export const overviewFacts: readonly { term: string; definition: string }[] = [
  { term: 'Delivery window', definition: '72 hours, 14 attempts, exponential backoff from 5s' },
  { term: 'Signing', definition: 'HMAC-SHA256 over the raw body, with a rotating secret' },
  { term: 'Ordering', definition: 'Per-destination FIFO; a stuck event does not block others' },
  { term: 'Replay', definition: 'Any delivery, any time in the retention window, by id or filter' },
];

export const install: SectionIntro = {
  eyebrow: 'Installation',
  title: 'Install the SDK',
  body: 'One package, no peer dependencies. Node 20+, Deno and Bun are all supported by the same build.',
};

export const installCommands: readonly CodeSample[] = [
  { id: 'npm', label: 'npm', language: 'bash', code: 'npm install @halyard/sdk' },
  { id: 'pnpm', label: 'pnpm', language: 'bash', code: 'pnpm add @halyard/sdk' },
  { id: 'bun', label: 'bun', language: 'bash', code: 'bun add @halyard/sdk' },
  { id: 'deno', label: 'deno', language: 'bash', code: 'deno add jsr:@halyard/sdk' },
];

export const quickstart: SectionIntro = {
  eyebrow: 'Quickstart',
  title: 'Send your first event',
  body: 'Create a client, register a destination, publish. The destination is created once and reused — publishing to an unknown destination is an error rather than an implicit create, so a typo cannot silently open a new stream.',
};

export const quickstartCode = `import { Halyard } from '@halyard/sdk';

const halyard = new Halyard({ apiKey: process.env.HALYARD_KEY! });

// Destinations are created once, then referenced by id.
const destination = await halyard.destinations.create({
  url: 'https://api.example.com/webhooks/halyard',
  events: ['invoice.paid', 'invoice.voided'],
});

await halyard.publish({
  destination: destination.id,
  type: 'invoice.paid',
  data: { invoiceId: 'in_4f2a', amountMinor: 24_900, currency: 'NOK' },
});`;

export const quickstartOutput: readonly string[] = [
  '$ node send-event.ts',
  '',
  '  halyard  destination created   dst_8Kq2Rm',
  '  halyard  published             evt_01HXQ… → dst_8Kq2Rm',
  '  halyard  delivered             204 in 118ms (attempt 1/14)',
  '',
  'Done in 0.94s',
];

export const delivery: SectionIntro = {
  eyebrow: 'Concepts',
  title: 'Delivery and retries',
  body: 'A delivery is one attempt at one destination. Any 2xx is success; anything else is retried on the schedule below until the window closes.',
};

export const retrySchedule: readonly { attempt: string; delay: string; cumulative: string }[] = [
  { attempt: '1', delay: 'immediate', cumulative: '0s' },
  { attempt: '2', delay: '5s', cumulative: '5s' },
  { attempt: '3', delay: '30s', cumulative: '35s' },
  { attempt: '4', delay: '2m', cumulative: '2m 35s' },
  { attempt: '5–8', delay: '×4 each', cumulative: '~2h' },
  { attempt: '9–14', delay: '×2, capped at 6h', cumulative: '72h' },
];

export const signing: SectionIntro = {
  eyebrow: 'Concepts',
  title: 'Verify the signature',
  body: 'Every attempt carries a `Halyard-Signature` header. Verify it against the raw request body — not the parsed JSON, whose key order your framework is free to change.',
};

export const signingCode = `import { verify } from '@halyard/sdk/webhook';

export async function POST(request: Request) {
  const raw = await request.text();          // raw body, not request.json()
  const signature = request.headers.get('Halyard-Signature');

  if (!verify(raw, signature, process.env.HALYARD_SIGNING_SECRET!)) {
    return new Response('bad signature', { status: 401 });
  }

  const event = JSON.parse(raw);
  // ... handle it, then return any 2xx within 10 seconds.
  return new Response(null, { status: 204 });
}`;

export const api: SectionIntro = {
  eyebrow: 'Reference',
  title: 'POST /v2/publish',
  body: 'Publishes one event to one destination. Idempotent on `idempotencyKey` for 24 hours.',
};

export const apiRows: readonly ApiRow[] = [
  {
    id: 'destination',
    name: 'destination',
    type: 'string',
    default: '—',
    required: true,
    description: 'Destination id. Publishing to an unknown id is a 404, never an implicit create.',
  },
  {
    id: 'type',
    name: 'type',
    type: 'string',
    default: '—',
    required: true,
    description: 'Event type. Must be one the destination subscribes to, or the call is a 422.',
  },
  {
    id: 'data',
    name: 'data',
    type: 'object',
    default: '—',
    required: true,
    description: 'Your payload. Serialised verbatim; the signature covers exactly these bytes.',
  },
  {
    id: 'idempotencyKey',
    name: 'idempotencyKey',
    type: 'string',
    default: 'auto',
    required: false,
    description:
      'Replaying the same key within 24h returns the original event instead of a duplicate.',
  },
  {
    id: 'notBefore',
    name: 'notBefore',
    type: 'string (ISO 8601)',
    default: 'now',
    required: false,
    description: 'Hold the event until this instant. Useful for scheduled reminders.',
  },
  {
    id: 'maxAttempts',
    name: 'maxAttempts',
    type: 'number',
    default: '14',
    required: false,
    description: 'Lower the ceiling for events that stop being useful. Cannot be raised above 14.',
  },
];

export const errors: SectionIntro = {
  eyebrow: 'Reference',
  title: 'Error codes',
  body: 'Every error carries a stable `code`. Match on that, never on the message — messages are written for humans and we improve them.',
};

export const errorCodes: readonly FaqItem[] = [
  {
    id: 'destination_not_found',
    question: 'destination_not_found · 404',
    answer:
      'The destination id does not exist, or belongs to a different project. Destinations are project-scoped; a key from another project will produce this rather than a 403, deliberately — we do not confirm the existence of resources you cannot see.',
  },
  {
    id: 'event_type_not_subscribed',
    question: 'event_type_not_subscribed · 422',
    answer:
      'The destination is not subscribed to this event type. Add it with `destinations.update({ events })`. This is a hard error rather than a silent drop, because a silently dropped webhook is the single most expensive bug in this category of product.',
  },
  {
    id: 'signature_secret_rotating',
    question: 'signature_secret_rotating · 409',
    answer:
      'You called `secrets.rotate()` and the previous secret is still in its grace window. Both secrets verify during the window; wait for it to close, or pass `force: true` to end it immediately and invalidate the old one.',
  },
  {
    id: 'payload_too_large',
    question: 'payload_too_large · 413',
    answer:
      'The serialised `data` exceeds 256 KiB. Send a reference rather than the object — a webhook that carries a whole document tends to become the transport for that document.',
  },
];

export const support: SectionIntro = {
  eyebrow: 'Reference',
  title: 'Getting help',
  body: 'Status, source and a real inbox. There is no chatbot.',
};

export const supportLinks: readonly Cta[] = [
  { href: '#', label: 'status.halyard.dev' },
  { href: '#', label: 'github.com/halyard/sdk' },
  { href: 'mailto:support@halyard.dev', label: 'support@halyard.dev' },
];

export const footer = {
  links: [
    { href: '#overview', label: 'Docs' },
    { href: '#api', label: 'API' },
    { href: '#errors', label: 'Errors' },
    { href: '#support', label: 'Support' },
  ] as readonly NavLink[],
  legal: `Halyard ${brand.version} · MIT licensed`,
} as const;
