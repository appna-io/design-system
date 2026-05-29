// Generic top-level loading fallback. Triggers for any route that doesn't define its own
// `loading.tsx` (Getting Started, Theming, Engine Demo, Theme Demo, …). Keeps the chrome
// stable and shows a faint stripe of activity in the main column.

export default function RootLoading() {
  return (
    <>
      <div className="h-12 border-b border-border bg-bg-paper" />
      <main className="mx-auto w-full max-w-4xl flex-1 px-8 py-10">
        <div className="h-8 w-64 animate-pulse rounded bg-neutral-subtle" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-neutral-subtle" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-neutral-subtle" />
        <div className="mt-8 h-64 animate-pulse rounded-lg border border-border bg-bg-paper" />
      </main>
    </>
  );
}
