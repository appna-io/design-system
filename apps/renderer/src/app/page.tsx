import Link from 'next/link';

import { TopBar } from '../components/chrome/TopBar';
import { ComponentCard } from '../components/docs/ComponentCard';
import { discoverComponents } from '../lib/discover';

export default async function HomePage() {
  const components = await discoverComponents();

  return (
    <>
      <TopBar title="apx-ds — Renderer" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-8 py-10">
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Welcome</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-fg">
            The apx-ds local renderer
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-fg-muted">
            This is the live development preview for the apx-ds component library. Browse
            components from the sidebar, or jump straight to{' '}
            <Link href="/getting-started" className="text-primary hover:underline">
              getting started
            </Link>{' '}
            or{' '}
            <Link href="/theming" className="text-primary hover:underline">
              theming
            </Link>
            . Use the top bar controls to flip mode, variant, and direction in real time — every
            preview below reflects the current theme.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-fg">Components</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Discovered from <code className="font-mono text-xs">packages/components/src/</code>.
          </p>
          {components.length === 0 ? (
            <p className="mt-6 rounded-lg border border-dashed border-border bg-bg-paper p-6 text-sm text-fg-muted">
              No components found. Add a folder under{' '}
              <code className="font-mono text-xs">packages/components/src/</code> with a README and
              examples to populate this list.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {components.map((c) => (
                <ComponentCard
                  key={c.slug}
                  slug={c.slug}
                  name={c.meta.displayName}
                  description={c.meta.description}
                  category={c.meta.category}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
