'use client';

import { useDeferredValue, useId, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ICON_MANIFEST } from '@apx-ui/icons';

import { cn } from '../../components/primitives/cn';

function matchesQuery(needle: string, entry: (typeof ICON_MANIFEST)[number]): boolean {
  if (!needle) return true;
  const q = needle.toLowerCase();
  if (entry.name.toLowerCase().includes(q)) return true;
  if (entry.description.toLowerCase().includes(q)) return true;
  return entry.keywords.some((kw) => kw.includes(q));
}

export function IconsGallery() {
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const [copied, setCopied] = useState<string | null>(null);
  const inputId = useId();

  const filtered = useMemo(
    () => ICON_MANIFEST.filter((entry) => matchesQuery(deferred.trim(), entry)),
    [deferred],
  );

  const handleCopy = async (name: string) => {
    const snippet = `import { ${name} } from '@apx-ui/icons';`;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(name);
      window.setTimeout(() => {
        setCopied((current) => (current === name ? null : current));
      }, 1500);
    } catch {
      // Clipboard can fail in insecure contexts; the snippet is still visible in the tooltip.
    }
  };

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor={inputId} className="sr-only">
          Filter icons
        </label>
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={14}
            aria-hidden
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-fg-muted"
          />
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name or keyword…"
            className={cn(
              'h-10 w-full rounded-md border border-border bg-bg ps-9 pe-3 text-sm text-fg placeholder:text-fg-muted',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            )}
          />
        </div>
        <p className="text-xs text-fg-muted" aria-live="polite">
          {filtered.length} of {ICON_MANIFEST.length} icon{ICON_MANIFEST.length === 1 ? '' : 's'}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-border bg-bg-paper p-8 text-center text-sm text-fg-muted">
          No icons match <span className="font-medium text-fg">&ldquo;{deferred}&rdquo;</span>.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map(({ name, Component, description }) => {
            const justCopied = copied === name;
            const snippet = `import { ${name} } from '@apx-ui/icons';`;
            return (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => handleCopy(name)}
                  title={snippet}
                  className={cn(
                    'group flex h-full w-full flex-col items-center gap-3 rounded-lg border border-border bg-bg-paper px-4 py-5 text-center transition',
                    'hover:border-primary hover:bg-neutral-subtle',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  )}
                  aria-label={`Copy import statement for ${name}`}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center text-fg transition group-hover:text-primary"
                    aria-hidden
                  >
                    <Component size={28} />
                  </span>
                  <span className="block w-full truncate font-mono text-xs font-medium text-fg">
                    {name}
                  </span>
                  <span className="line-clamp-2 text-[11px] leading-snug text-fg-muted">
                    {description}
                  </span>
                  <span
                    className={cn(
                      'mt-auto text-[10px] font-semibold uppercase tracking-wider transition',
                      justCopied ? 'text-primary' : 'text-fg-muted opacity-0 group-hover:opacity-100',
                    )}
                    aria-hidden
                  >
                    {justCopied ? 'Copied!' : 'Click to copy import'}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}