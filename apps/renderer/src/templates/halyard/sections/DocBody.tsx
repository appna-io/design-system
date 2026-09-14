'use client';

import {
  Accordion,
  Badge,
  Button,
  Div,
  Reveal,
  SectionHeading,
  Table,
  Tabs,
  Typography,
} from '@apx-ui/ds';

import { CodeMock, TerminalMock } from '../../_kit';
import {
  api,
  apiRows,
  delivery,
  errorCodes,
  errors,
  hero,
  install,
  installCommands,
  overview,
  overviewFacts,
  quickstart,
  quickstartCode,
  quickstartOutput,
  retrySchedule,
  signing,
  signingCode,
  support,
  supportLinks,
  type ApiRow,
} from '../content';

/**
 * The document itself — every section in `docSections` order, since the sidebar and the rail are
 * both derived from that list and would point at nothing if this file disagreed.
 *
 * ## Motion, or the lack of it
 *
 * The board asked for the template that proves our motion rules include knowing when not to move,
 * so: **reveals are `fadeIn` only, no travel, and there is no stagger anywhere.** A docs page is
 * read non-linearly — people arrive at `#errors` from a search result and scroll up — and content
 * that slides in from below on a page you are scrolling *through* is content that is moving while
 * you try to read it. Fading is the most that can be justified, and even that is close to the
 * line.
 *
 * The one thing that does move is the reader's own position marker in the two rails, which is
 * navigation state rather than decoration.
 *
 * ## Section spacing
 *
 * `py-14` rather than #2's marketing rhythm. That scale (`py-20 → lg:py-28`) is tuned for bands a
 * reader scrolls past; these are sections a reader scrolls *within*, and marketing whitespace
 * between them turns a reference page into a scroll hunt.
 */
const API_COLUMNS = [
  {
    id: 'name',
    header: 'Parameter',
    width: '13rem',
    cell: (row: ApiRow) => (
      <Div className="flex flex-wrap items-center gap-2">
        <Typography as="code" variant="bodySmall" weight="semibold" fontFamily="display">
          {row.name}
        </Typography>
        {row.required && (
          <Badge variant="soft" color="primary" shape="square" size="sm">
            required
          </Badge>
        )}
      </Div>
    ),
  },
  {
    id: 'type',
    header: 'Type',
    width: '11rem',
    cell: (row: ApiRow) => (
      <Typography as="code" variant="bodySmall" color="fg.muted" fontFamily="display">
        {row.type}
      </Typography>
    ),
  },
  {
    id: 'default',
    header: 'Default',
    width: '6rem',
    cell: (row: ApiRow) => (
      <Typography as="code" variant="bodySmall" color="fg.subtle" fontFamily="display">
        {row.default}
      </Typography>
    ),
  },
  {
    id: 'description',
    header: 'Description',
    minWidth: '20rem',
    cell: (row: ApiRow) => (
      <Typography variant="bodySmall" color="fg.muted">
        {row.description}
      </Typography>
    ),
  },
];

const RETRY_COLUMNS = [
  {
    id: 'attempt',
    header: 'Attempt',
    width: '8rem',
    accessor: (r: { attempt: string }) => r.attempt,
  },
  { id: 'delay', header: 'Delay', width: '11rem', accessor: (r: { delay: string }) => r.delay },
  {
    id: 'cumulative',
    header: 'Elapsed',
    width: '9rem',
    accessor: (r: { cumulative: string }) => r.cumulative,
  },
];

export function DocBody() {
  return (
    <Div className="mx-auto w-full max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
      {/* ── Lede ─────────────────────────────────────────────────────────────────────────── */}
      <Reveal preset="fade" className="py-14">
        <Badge variant="soft" color="primary" shape="square" size="sm">
          {hero.eyebrow}
        </Badge>
        <Typography
          as="h1"
          variant="h1"
          weight="bold"
          lineHeight="tight"
          letterSpacing="tight"
          fontFamily="display"
          className="mt-5 text-3xl sm:text-4xl"
        >
          {hero.title}
        </Typography>
        <Typography variant="bodyLarge" lineHeight="relaxed" color="fg.muted" className="mt-5">
          {hero.body}
        </Typography>
        <Div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <a href={hero.primaryCta.href}>{hero.primaryCta.label}</a>
          </Button>
          <Button variant="outline" color="neutral" asChild>
            <a href={hero.secondaryCta.href}>{hero.secondaryCta.label}</a>
          </Button>
        </Div>
      </Reveal>

      {/* ── Overview ─────────────────────────────────────────────────────────────────────── */}
      <Reveal as="section" preset="fade" className="border-t border-border-subtle py-14">
        <SectionHeading
          headingId="overview"
          eyebrow={overview.eyebrow}
          title={overview.title}
          body={overview.body}
          eyebrowVariant="plain"
          size="sub"
        />
        <Div as="dl" className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {overviewFacts.map((fact) => (
            <Div key={fact.term}>
              <Typography
                as="dt"
                variant="bodySmall"
                weight="semibold"
                fontFamily="display"
                className="block"
              >
                {fact.term}
              </Typography>
              <Typography as="dd" variant="bodySmall" color="fg.muted" className="mt-1 block">
                {fact.definition}
              </Typography>
            </Div>
          ))}
        </Div>
      </Reveal>

      {/* ── Install ──────────────────────────────────────────────────────────────────────── */}
      <Reveal as="section" preset="fade" className="border-t border-border-subtle py-14">
        <SectionHeading
          headingId="install"
          eyebrow={install.eyebrow}
          title={install.title}
          body={install.body}
          eyebrowVariant="plain"
          size="sub"
        />
        {/* Four package managers as tabs rather than four stacked blocks: nobody reads the three
            they do not use, and stacking them puts 12 lines of noise before the quickstart. */}
        <Tabs defaultValue={installCommands[0]!.id} className="mt-8">
          <Tabs.List>
            {installCommands.map((command) => (
              <Tabs.Trigger key={command.id} value={command.id}>
                {command.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {installCommands.map((command) => (
            <Tabs.Panel key={command.id} value={command.id} className="pt-4">
              <CodeMock code={command.code} ariaLabel={`Install with ${command.label}`} />
            </Tabs.Panel>
          ))}
        </Tabs>
      </Reveal>

      {/* ── Quickstart ───────────────────────────────────────────────────────────────────── */}
      <Reveal as="section" preset="fade" className="border-t border-border-subtle py-14">
        <SectionHeading
          headingId="quickstart"
          eyebrow={quickstart.eyebrow}
          title={quickstart.title}
          body={quickstart.body}
          eyebrowVariant="plain"
          size="sub"
        />
        <Div className="mt-8 flex flex-col gap-4">
          <CodeMock code={quickstartCode} label="send-event.ts" />
          {/* What actually happens when you run it — the half of a quickstart most docs omit. */}
          <TerminalMock lines={quickstartOutput} />
        </Div>
      </Reveal>

      {/* ── Delivery ─────────────────────────────────────────────────────────────────────── */}
      <Reveal as="section" preset="fade" className="border-t border-border-subtle py-14">
        <SectionHeading
          headingId="delivery"
          eyebrow={delivery.eyebrow}
          title={delivery.title}
          body={delivery.body}
          eyebrowVariant="plain"
          size="sub"
        />
        <Div className="mt-8 rounded-md border border-border-subtle">
          <Table columns={RETRY_COLUMNS} data={[...retrySchedule]} ariaLabel="Retry schedule" />
        </Div>
      </Reveal>

      {/* ── Signing ──────────────────────────────────────────────────────────────────────── */}
      <Reveal as="section" preset="fade" className="border-t border-border-subtle py-14">
        <SectionHeading
          headingId="signing"
          eyebrow={signing.eyebrow}
          title={signing.title}
          body={signing.body}
          eyebrowVariant="plain"
          size="sub"
        />
        <Div className="mt-8">
          <CodeMock code={signingCode} label="app/api/webhooks/route.ts" />
        </Div>
      </Reveal>

      {/* ── API reference ────────────────────────────────────────────────────────────────── */}
      <Reveal as="section" preset="fade" className="border-t border-border-subtle py-14">
        <SectionHeading
          headingId="api"
          eyebrow={api.eyebrow}
          title={api.title}
          body={api.body}
          eyebrowVariant="plain"
          size="sub"
        />
        <Div className="mt-8 rounded-md border border-border-subtle">
          <Table
            columns={API_COLUMNS}
            data={[...apiRows]}
            getRowId={(row: ApiRow) => row.id}
            ariaLabel="Publish endpoint parameters"
          />
        </Div>
      </Reveal>

      {/* ── Errors ───────────────────────────────────────────────────────────────────────── */}
      <Reveal as="section" preset="fade" className="border-t border-border-subtle py-14">
        <SectionHeading
          headingId="errors"
          eyebrow={errors.eyebrow}
          title={errors.title}
          body={errors.body}
          eyebrowVariant="plain"
          size="sub"
        />
        {/* `type="multiple"` here, unlike every other template's FAQ. Someone debugging is
            comparing two error codes, and single-open would close the one they were reading. */}
        <Accordion type="multiple" className="mt-8">
          {errorCodes.map((code) => (
            <Accordion.Item key={code.id} value={code.id}>
              <Accordion.Trigger>
                <Typography as="span" variant="body" weight="semibold" fontFamily="display">
                  {code.question}
                </Typography>
              </Accordion.Trigger>
              <Accordion.Content>{code.answer}</Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion>
      </Reveal>

      {/* ── Support ──────────────────────────────────────────────────────────────────────── */}
      <Reveal as="section" preset="fade" className="border-t border-border-subtle py-14">
        <SectionHeading
          headingId="support"
          eyebrow={support.eyebrow}
          title={support.title}
          body={support.body}
          eyebrowVariant="plain"
          size="sub"
        />
        <Div className="mt-8 flex flex-wrap gap-3">
          {supportLinks.map((link) => (
            <Button key={link.label} variant="outline" color="neutral" size="sm" asChild>
              <a href={link.href}>{link.label}</a>
            </Button>
          ))}
        </Div>
      </Reveal>
    </Div>
  );
}
