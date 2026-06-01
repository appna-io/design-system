import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { TopBar } from '../../../components/chrome/TopBar';
import { ExampleBlock } from '../../../components/docs/ExampleBlock';
import { Mdx } from '../../../components/docs/Mdx';
import { PropsTable } from '../../../components/docs/PropsTable';
import {
  type ComponentEntry,
  discoverComponents,
  findComponentBySlug,
} from '../../../lib/discover';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const all = await discoverComponents();
  return all.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const component = await findComponentBySlug(slug);
  if (!component) return { title: 'Not found' };
  return {
    title: `${component.meta.displayName} · apx-ds`,
    description: component.meta.description,
  };
}

// Match every `<ExampleBlock for="..." />` (or `<ExampleBlock for='...' />`) embedded inside the
// README, so we can tell which examples already render inline and avoid duplicating them in the
// auto-appended fallback section below. Matches are tolerant of attribute order — `for` may sit
// after a `title=...` or other prop.
const EXAMPLE_REF_PATTERN = /<ExampleBlock\b[^>]*\bfor=(?:"([^"]+)"|'([^']+)')/g;

function extractReferencedExampleIds(source: string): ReadonlySet<string> {
  const ids = new Set<string>();
  for (const match of source.matchAll(EXAMPLE_REF_PATTERN)) {
    const id = match[1] ?? match[2];
    if (id) ids.add(id);
  }
  return ids;
}

function pickUnreferencedExamples(
  component: ComponentEntry,
  referenced: ReadonlySet<string>,
): ComponentEntry['examples'] {
  if (referenced.size === 0) return component.examples;
  return component.examples.filter((example) => !referenced.has(example.id));
}

export default async function ComponentPage({ params }: PageProps) {
  const { slug } = await params;
  const component = await findComponentBySlug(slug);
  if (!component) notFound();

  const hasReadme = component.readmeFormat !== 'none' && component.readme.trim().length > 0;
  const referencedIds = hasReadme
    ? extractReferencedExampleIds(component.readme)
    : new Set<string>();
  // Anything the README didn't embed gets a guaranteed slot at the bottom of the page so no
  // example sitting in `examples/` is ever orphaned. For components without a README, this is
  // the whole set; for ones that document everything, the section collapses to nothing.
  const fallbackExamples = pickUnreferencedExamples(component, referencedIds);
  // Auto-append the props table unless the README already embedded one. We can't tell the
  // difference between `<PropsTable />` and `<PropsTable></PropsTable>`, so check loosely.
  const readmeHasPropsTable = hasReadme && /<PropsTable\b/.test(component.readme);
  const showPropsSection = !readmeHasPropsTable;

  const fallbackHeading = referencedIds.size > 0 ? 'More examples' : 'Examples';

  return (
    <>
      <TopBar title={component.meta.displayName} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-8 py-10">
        <header>
          {component.meta.category && (
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
              {component.meta.category}
            </p>
          )}
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-fg">
            {component.meta.displayName}
          </h1>
          {component.meta.description && (
            <p className="mt-3 max-w-2xl text-sm text-fg-muted">{component.meta.description}</p>
          )}
        </header>

        {hasReadme && (
          <article className="renderer-prose mt-8">
            <Mdx source={component.readme} component={component} />
          </article>
        )}

        {fallbackExamples.length > 0 && (
          <section className="mt-10 space-y-10">
            <h2 className="border-b border-border pb-1.5 text-2xl font-semibold tracking-tight text-fg">
              {fallbackHeading}
            </h2>
            {fallbackExamples.map((example) => (
              <ExampleBlock
                key={example.id}
                dirName={component.dirName}
                exampleId={example.id}
                source={example.source}
              />
            ))}
          </section>
        )}

        {showPropsSection && (
          <section className="mt-10">
            <h2 className="border-b border-border pb-1.5 text-2xl font-semibold tracking-tight text-fg">
              Props
            </h2>
            <div className="mt-6">
              <PropsTable sourcePath={component.sourcePath} />
            </div>
          </section>
        )}
      </main>
    </>
  );
}