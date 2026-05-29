'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { Search } from 'lucide-react';

import type { ComponentEntry } from '../../lib/discover';
import { cn } from '../primitives/cn';

interface SidebarProps {
  components: Pick<ComponentEntry, 'slug' | 'meta'>[];
}

interface SidebarItem {
  slug: string;
  displayName: string;
  category: string;
  tags: readonly string[];
}

const FOUNDATION_LINKS = [
  { href: '/getting-started', label: 'Getting started' },
  { href: '/theming', label: 'Theming' },
];

export function Sidebar({ components }: SidebarProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState('');

  const items: SidebarItem[] = useMemo(
    () =>
      components.map((c) => ({
        slug: c.slug,
        displayName: c.meta.displayName,
        category: c.meta.category ?? 'Uncategorized',
        tags: c.meta.tags ?? [],
      })),
    [components],
  );

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ['displayName', 'tags', 'category'],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [items],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    return fuse.search(query).map((r) => r.item);
  }, [fuse, items, query]);

  const byCategory = useMemo(() => {
    const map = new Map<string, SidebarItem[]>();
    for (const item of filtered) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <aside className="flex h-full flex-col border-r border-border bg-bg-paper">
      <div className="border-b border-border px-4 py-4">
        <Link href="/" className="block">
          <span className="text-base font-semibold tracking-tight text-fg">apx-ds</span>
          <span className="mt-0.5 block text-xs text-fg-muted">Local renderer</span>
        </Link>
      </div>

      <div className="border-b border-border px-3 py-3">
        <div className="relative">
          <Search
            size={14}
            aria-hidden
            className="pointer-events-none absolute start-2 top-1/2 -translate-y-1/2 text-fg-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components…"
            aria-label="Search components"
            className={cn(
              'h-8 w-full rounded-md border border-border bg-bg ps-7 pe-2 text-sm text-fg placeholder:text-fg-muted',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            )}
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-6">
          <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
            Foundations
          </h3>
          <ul className="space-y-0.5">
            {FOUNDATION_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'block rounded-md px-2 py-1.5 text-sm transition',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      active
                        ? 'bg-primary-subtle text-primary'
                        : 'text-fg-muted hover:bg-neutral-subtle hover:text-fg',
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {byCategory.length === 0 ? (
          <p className="px-2 text-xs text-fg-muted">No matches.</p>
        ) : (
          byCategory.map(([category, list]) => (
            <div key={category} className="mb-6">
              <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
                {category}
              </h3>
              <ul className="space-y-0.5">
                {list.map((item) => {
                  const href = `/components/${item.slug}`;
                  const active = pathname === href;
                  return (
                    <li key={item.slug}>
                      <Link
                        href={href}
                        className={cn(
                          'block rounded-md px-2 py-1.5 text-sm transition',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                          active
                            ? 'bg-primary-subtle text-primary'
                            : 'text-fg-muted hover:bg-neutral-subtle hover:text-fg',
                        )}
                      >
                        {item.displayName}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </nav>
    </aside>
  );
}
