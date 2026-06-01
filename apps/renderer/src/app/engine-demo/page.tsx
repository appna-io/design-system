'use client';

import { cn, cv, Slot, useDirection } from '@apx-ui/ds';

const demoRecipe = cv({
  base: 'inline-flex items-center justify-center rounded-md font-medium transition',
  variants: {
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    },
    tone: {
      indigo: 'bg-indigo-600 text-white hover:bg-indigo-700',
      emerald: 'bg-emerald-600 text-white hover:bg-emerald-700',
      ghost: 'bg-transparent text-zinc-800 hover:bg-zinc-100',
    },
  },
  compoundVariants: [{ size: 'lg', tone: 'indigo', class: 'shadow-lg shadow-indigo-500/30' }],
  defaultVariants: { size: 'md', tone: 'indigo' },
});

export default function EngineDemoPage() {
  const dir = useDirection();

  return (
    <main className="min-h-screen p-12 max-w-3xl mx-auto space-y-12 bg-bg text-fg">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Engine Demo</h1>
        <p className="mt-2 text-fg-muted">
          Page-wide direction is <code className="font-mono">{dir}</code>. This page exercises every
          primitive shipped by <code className="font-mono">@apx-ui/engine</code>.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-3">cv — class variants</h2>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={demoRecipe({ size: 'sm', tone: 'indigo' })}>
            sm indigo
          </button>
          <button type="button" className={demoRecipe({ size: 'md', tone: 'emerald' })}>
            md emerald
          </button>
          <button type="button" className={demoRecipe({ size: 'lg', tone: 'indigo' })}>
            lg indigo (compound shadow)
          </button>
          <button type="button" className={demoRecipe({ size: 'md', tone: 'ghost' })}>
            ghost
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">cv — responsive size</h2>
        <button
          type="button"
          className={demoRecipe({ size: { base: 'sm', md: 'md', lg: 'lg' }, tone: 'indigo' })}
        >
          resize me with viewport
        </button>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">cn — last class wins on conflict</h2>
        <div className={cn('p-2 bg-zinc-100', 'p-6 bg-zinc-200', 'rounded-lg')}>
          padded 6, bg-200 (later classes won)
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Slot — polymorphic via asChild</h2>
        <Slot className="inline-flex items-center gap-2 underline text-indigo-700 hover:text-indigo-900">
          <a href="#top">Slot merges its props onto this anchor — click to scroll up</a>
        </Slot>
      </section>
    </main>
  );
}