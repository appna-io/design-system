// Streaming fallback for `/components/[slug]`. Next.js mounts this as the Suspense boundary
// while the server is rendering the component page (and, in dev, while webpack JIT-compiles the
// route on first visit). The skeleton mirrors the real page's structure — header band, one
// example tile, prop-table strip — so the visible jank between routes is minimal.

export default function ComponentLoading() {
  return (
    <>
      <div className="h-12 border-b border-border bg-bg-paper" />
      <main className="mx-auto w-full max-w-4xl flex-1 px-8 py-10">
        <header className="space-y-3">
          <SkeletonLine className="w-24" />
          <SkeletonLine className="h-8 w-72" />
          <SkeletonLine className="w-full max-w-2xl" />
          <SkeletonLine className="w-2/3 max-w-xl" />
        </header>

        <section className="mt-10 space-y-3">
          <SkeletonLine className="h-7 w-40" />
          <div className="h-56 animate-pulse rounded-lg border border-border bg-bg-paper" />
          <div className="h-32 animate-pulse rounded-lg border border-border bg-bg-paper" />
        </section>

        <section className="mt-10 space-y-3">
          <SkeletonLine className="h-7 w-32" />
          <div className="h-48 animate-pulse rounded-lg border border-border bg-bg-paper" />
        </section>
      </main>
    </>
  );
}

function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`h-4 animate-pulse rounded bg-neutral-subtle ${className}`} />;
}
