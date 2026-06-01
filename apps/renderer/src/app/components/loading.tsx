// Streaming fallback for `/components`. Renders a sparse grid of card placeholders matching the
// real "All components" layout so the navigation feels continuous instead of blank.

export default function ComponentsIndexLoading() {
  return (
    <>
      <div className="h-12 border-b border-border bg-bg-paper" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-8 py-10">
        <div className="h-8 w-56 animate-pulse rounded bg-neutral-subtle" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-neutral-subtle" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg border border-border bg-bg-paper"
            />
          ))}
        </div>
      </main>
    </>
  );
}