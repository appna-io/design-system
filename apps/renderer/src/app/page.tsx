import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { Badge, Div, Typography } from '@apx-ui/ds';

import { TopBar } from '../components/chrome/TopBar';
import { ComponentCard } from '../components/docs/ComponentCard';
import { discoverComponents } from '../lib/discover';
import { getTemplates } from '../templates';

export default async function HomePage() {
  const components = await discoverComponents();
  const templates = getTemplates();

  return (
    <>
      <TopBar title="apx-ds — Renderer" />
      <Div as="main" className="mx-auto w-full max-w-5xl flex-1 px-8 py-10">
        <Div as="section">
          <Typography
            variant="overline"
            weight="semibold"
            color="fg.muted"
            letterSpacing="wider"
          >
            Welcome
          </Typography>
          <Typography
            as="h1"
            variant="h2"
            weight="semibold"
            letterSpacing="tight"
            className="mt-2 text-3xl"
          >
            The apx-ds local renderer
          </Typography>
          <Typography
            variant="bodySmall"
            color="fg.muted"
            className="mt-3 max-w-2xl"
          >
            This is the live development preview for the apx-ds component library. Browse
            components from the sidebar, or jump straight to{' '}
            <Typography asChild variant="bodySmall" color="primary">
              <Link href="/getting-started" className="hover:underline">
                getting started
              </Link>
            </Typography>
            ,{' '}
            <Typography asChild variant="bodySmall" color="primary">
              <Link href="/theming" className="hover:underline">
                theming
              </Link>
            </Typography>
            , or the optional{' '}
            <Typography asChild variant="bodySmall" color="primary">
              <Link href="/icons" className="hover:underline">
                icons package
              </Link>
            </Typography>
            . Use the top bar controls to flip mode, variant, and direction in real time — every
            preview below reflects the current theme.
          </Typography>
        </Div>

        <TemplatesPromo count={templates.length} />

        <Div as="section" className="mt-10">
          <Typography as="h2" variant="h4" weight="semibold">
            Components
          </Typography>
          <Typography variant="bodySmall" color="fg.muted" className="mt-1">
            Discovered from{' '}
            <Typography as="code" variant="code">
              packages/components/src/
            </Typography>
            .
          </Typography>
          {components.length === 0 ? (
            <Typography
              variant="bodySmall"
              color="fg.muted"
              className="mt-6 rounded-lg border border-dashed border-border bg-bg-paper p-6"
            >
              No components found. Add a folder under{' '}
              <Typography as="code" variant="code">
                packages/components/src/
              </Typography>{' '}
              with a README and examples to populate this list.
            </Typography>
          ) : (
            <Div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {components.map((c) => (
                <ComponentCard
                  key={c.slug}
                  slug={c.slug}
                  name={c.meta.displayName}
                  description={c.meta.description}
                  category={c.meta.category}
                />
              ))}
            </Div>
          )}
        </Div>
      </Div>
    </>
  );
}

/**
 * Eye-catching CTA that points users at the new template preview surface from the
 * very first paint. Uses semantic tokens so the gradient backdrop tracks the active
 * theme variant.
 */
function TemplatesPromo({ count }: { count: number }) {
  return (
    <Div as="section" className="mt-10 overflow-hidden rounded-2xl border border-border bg-bg-paper">
      <Div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-[1.4fr_1fr] md:items-center">
        <Div decorative gradient={{ position: 'left' }} />
        <Div className="relative">
          <Badge variant="soft" color="primary" shape="pill" size="sm">
            <Sparkles size={12} aria-hidden />
            New · Preview mode
          </Badge>
          <Typography
            as="h2"
            variant="h3"
            weight="semibold"
            letterSpacing="tight"
            className="mt-3 text-2xl"
          >
            Switch to template mode
          </Typography>
          <Typography
            variant="bodySmall"
            color="fg.muted"
            className="mt-2 max-w-xl"
          >
            Step out of the docs and into a real product surface — full-page templates assembled
            from the same primitives, so you can feel the redesign end-to-end. Flip mode, swap
            variants, and toggle direction from a floating dock without leaving the preview.
          </Typography>
        </Div>
        <Div className="relative flex flex-col items-start gap-2 md:items-end">
          <Link
            href="/templates"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-primary-contrast shadow-sm transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Typography as="span" variant="bodySmall" weight="medium">
              Browse templates
            </Typography>
            <ArrowUpRight
              size={14}
              aria-hidden
              className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
          <Typography variant="caption" color="fg.muted">
            {count} template{count === 1 ? '' : 's'} available · easy to add more
          </Typography>
        </Div>
      </Div>
    </Div>
  );
}