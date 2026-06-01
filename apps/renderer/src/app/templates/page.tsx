import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Badge, Div, Typography } from '@apx-ui/ds';

import { TopBar } from '../../components/chrome/TopBar';
import { getTemplates } from '../../templates';
import type { TemplateMeta } from '../../templates';

export const metadata = {
  title: 'Templates · Renderer',
  description: 'Full-page templates built with the design system.',
};

export default function TemplatesPage() {
  const templates = getTemplates();

  // Group by category so each section header speaks to a persona.
  const byCategory = new Map<string, TemplateMeta[]>();
  for (const t of templates) {
    const bucket = byCategory.get(t.meta.category) ?? [];
    bucket.push(t.meta);
    byCategory.set(t.meta.category, bucket);
  }
  const sections = Array.from(byCategory.entries()).sort(([a], [b]) => a.localeCompare(b));

  return (
    <>
      <TopBar title="Templates" />
      <Div as="main" className="mx-auto w-full max-w-5xl flex-1 px-8 py-10">
        <Div as="section">
          <Typography
            variant="overline"
            weight="semibold"
            color="fg.muted"
            letterSpacing="wider"
          >
            Preview mode
          </Typography>
          <Typography
            as="h1"
            variant="h2"
            weight="semibold"
            letterSpacing="tight"
            className="mt-2 text-3xl"
          >
            See the system as a real product
          </Typography>
          <Typography
            variant="bodySmall"
            color="fg.muted"
            className="mt-3 max-w-2xl"
          >
            Each template here is a full-page surface composed entirely from the library&apos;s
            primitives. Open one to feel the redesign end-to-end — flip mode, swap variants, and
            toggle direction from the floating toolbar without leaving the preview.
          </Typography>
        </Div>

        {sections.length === 0 ? (
          <Typography
            variant="bodySmall"
            color="fg.muted"
            className="mt-10 rounded-lg border border-dashed border-border bg-bg-paper p-6"
          >
            No templates registered yet. Add one under{' '}
            <Typography as="code" variant="code">
              apps/renderer/src/templates/
            </Typography>{' '}
            and register it in{' '}
            <Typography as="code" variant="code">
              templates/registry.ts
            </Typography>
            .
          </Typography>
        ) : (
          sections.map(([category, items]) => (
            <Div as="section" key={category} className="mt-10">
              <Typography as="h2" variant="h4" weight="semibold">
                {category}
              </Typography>
              <Div className="mt-4 grid gap-4 sm:grid-cols-2">
                {items
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((t) => (
                    <TemplateCard key={t.slug} meta={t} />
                  ))}
              </Div>
            </Div>
          ))
        )}
      </Div>
    </>
  );
}

function TemplateCard({ meta }: { meta: TemplateMeta }) {
  return (
    <Link
      href={`/templates/${meta.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-bg-paper p-6 transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <Div className="flex items-start justify-between gap-3">
        <Div>
          <Typography
            variant="caption"
            weight="semibold"
            transform="upper"
            letterSpacing="wider"
            color="fg.muted"
          >
            {meta.category}
          </Typography>
          <Typography
            as="h3"
            variant="body"
            weight="semibold"
            className="mt-1 group-hover:text-primary"
          >
            {meta.name}
          </Typography>
        </Div>
        <Div
          as="span"
          aria-hidden
          className="rounded-full border border-border bg-bg-subtle p-1.5 text-fg-muted transition group-hover:border-primary group-hover:text-primary"
        >
          <ArrowUpRight size={14} />
        </Div>
      </Div>

      <Typography
        variant="bodySmall"
        color="fg.muted"
        lineClamp={3}
        className="mt-3"
      >
        {meta.description}
      </Typography>

      {meta.tags && meta.tags.length > 0 && (
        <Div as="ul" className="mt-4 flex flex-wrap gap-1.5">
          {meta.tags.map((tag) => (
            <Div as="li" key={tag}>
              <Badge variant="outline" color="neutral" size="sm" shape="pill">
                {tag}
              </Badge>
            </Div>
          ))}
        </Div>
      )}

      {meta.credit && (
        <Typography variant="caption" color="fg.muted" className="mt-auto pt-6">
          {meta.credit}
        </Typography>
      )}
    </Link>
  );
}