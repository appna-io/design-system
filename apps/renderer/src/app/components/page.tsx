import { TopBar } from '../../components/chrome/TopBar';
import { ComponentCard } from '../../components/docs/ComponentCard';
import { discoverComponents } from '../../lib/discover';

export default async function ComponentsPage() {
  const components = await discoverComponents();

  return (
    <>
      <TopBar title="Components" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">All components</h1>
        <p className="mt-2 text-sm text-fg-muted">
          {components.length} component{components.length === 1 ? '' : 's'} discovered.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </main>
    </>
  );
}