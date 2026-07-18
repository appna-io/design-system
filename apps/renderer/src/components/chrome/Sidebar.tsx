'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import {
  Boxes,
  ChevronRight,
  Command,
  Compass,
  Layers,
  type LucideIcon,
  Palette,
  Search,
  Shapes,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';

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

const FOUNDATION_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/getting-started', label: 'Getting started', icon: Compass },
  { href: '/theming', label: 'Theming', icon: Palette },
  { href: '/templates', label: 'Templates', icon: Layers },
  { href: '/icons', label: 'Icons', icon: Shapes },
];

/**
 * Per-category icon mapping. Falls back to a generic stack icon for unknown categories so
 * brand-new categories still get a visual marker without us having to ship code first.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Inputs: Zap,
  Forms: Zap,
  'Data Display': Boxes,
  Layout: Layers,
  Navigation: Compass,
  Overlays: Sparkles,
  Surfaces: Layers,
  Feedback: Sparkles,
  Primitives: Boxes,
};

function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? Boxes;
}

/** Detect macOS for the search shortcut hint (⌘ vs Ctrl). SSR-safe — defaults to ⌘. */
function useIsMac(): boolean {
  const [isMac, setIsMac] = useState(true);
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const platform =
      (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
        ?.platform ?? navigator.platform;
    setIsMac(/mac/i.test(platform));
  }, []);
  return isMac;
}

export function Sidebar({ components }: SidebarProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const searchRef = useRef<HTMLInputElement>(null);
  const isMac = useIsMac();

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

  const totalCount = items.length;

  // Global ⌘K / Ctrl+K shortcut to focus the search input — the canonical "I want to find
  // something fast" gesture. Escape clears the query when the input is focused so the user
  // can drop back to the full list without lifting their hands off the keyboard.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function toggleCategory(category: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  return (
    <aside
      className={cn(
        'group/sidebar relative isolate flex h-full flex-col overflow-hidden',
        'border-r border-border/80 bg-bg-paper',
      )}
    >
      {/* Ambient gradient backdrop. Two soft radial blooms — one near the brand mark, one near
          the footer — give the surface depth without ever competing with the active item's
          gradient bar. The blobs use `color-mix` against the live `--sds-palette-*` vars so
          they retint correctly when the theme variant flips. `pointer-events-none` keeps the
          decoration out of the hit-testing path. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-90"
        style={{
          background:
            'radial-gradient(60% 40% at 12% 0%, color-mix(in srgb, var(--sds-palette-primary-main) 14%, transparent) 0%, transparent 70%), radial-gradient(50% 30% at 90% 100%, color-mix(in srgb, var(--sds-palette-info-main, var(--sds-palette-primary-main)) 10%, transparent) 0%, transparent 70%)',
        }}
      />

      {/* Brand block. The gradient orb behind the logo "breathes" via a slow pulse animation
          to keep the chrome feeling alive without ever drawing the eye away from active
          content. */}
      <div className="relative px-4 pb-4 pt-5">
        <Link
          href="/"
          className={cn(
            'group/brand relative flex items-center gap-3 rounded-xl p-2 -mx-2 transition',
            'hover:bg-neutral-subtle/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          )}
        >
          <span
            aria-hidden
            className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-border/60 bg-bg shadow-inner"
          >
            <span
              className="absolute inset-0 animate-badge-pulse"
              style={{
                background:
                  'conic-gradient(from 220deg at 50% 50%, var(--sds-palette-primary-main), var(--sds-palette-info-main, var(--sds-palette-primary-hover)), var(--sds-palette-primary-main))',
                filter: 'blur(6px)',
                opacity: 0.55,
              }}
            />
            {/* AppNA brand mark. Drop `appna-icon.svg` in `apps/renderer/public/`
                (see `public/README.md`); the `onError` falls back to the Sparkles
                glyph so the chrome never shows a broken-image icon if it's absent. */}
            <img
              src="/appna-icon.svg"
              alt=""
              className="relative h-5 w-5 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.removeAttribute('hidden');
              }}
            />
            <span hidden className="relative grid place-items-center">
              <Sparkles size={16} className="text-primary-contrast mix-blend-difference" />
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-[15px] font-semibold tracking-tight text-fg">
                apx-ds
              </span>
              <span
                aria-hidden
                className="inline-flex h-4 items-center rounded-full border border-primary/30 bg-primary-subtle px-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary"
                style={{ borderColor: 'color-mix(in srgb, var(--sds-palette-primary-main) 35%, transparent)' }}
              >
                v0.1
              </span>
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-fg-muted">
              <span
                aria-hidden
                className="relative inline-flex h-1.5 w-1.5"
              >
                <span className="absolute inset-0 animate-badge-pulse rounded-full bg-success/70" />
                <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              Local renderer · live
            </span>
          </span>
        </Link>
      </div>

      {/* Search. The chip on the right shows the ⌘K binding and acts as a clear button when
          there's an active query — same target, two affordances, one less keypress. */}
      <div className="relative px-4 pb-3">
        <div
          className={cn(
            'group/search relative flex h-9 items-center gap-2 rounded-lg border border-border/70 bg-bg/70 px-2.5 backdrop-blur-sm transition',
            'focus-within:border-primary/60 focus-within:bg-bg focus-within:shadow-sm',
          )}
          style={
            {
              '--ring-tint': 'color-mix(in srgb, var(--sds-palette-primary-main) 22%, transparent)',
            } as React.CSSProperties
          }
        >
          <Search
            size={14}
            aria-hidden
            className="shrink-0 text-fg-muted transition group-focus-within/search:text-primary"
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components"
            aria-label="Search components"
            className={cn(
              'min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-fg-subtle',
              'focus-visible:outline-none',
              // Hide the native (×) clear button — we render our own.
              '[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden',
            )}
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                searchRef.current?.focus();
              }}
              aria-label="Clear search"
              className="grid h-5 w-5 shrink-0 place-items-center rounded-md text-fg-muted transition hover:bg-neutral-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X size={12} />
            </button>
          ) : (
            <kbd
              aria-hidden
              className="inline-flex shrink-0 items-center gap-0.5 rounded-md border border-border/80 bg-bg-subtle px-1.5 py-0.5 text-[10px] font-medium text-fg-muted shadow-sm"
            >
              {isMac ? <Command size={10} /> : 'Ctrl'}
              <span>K</span>
            </kbd>
          )}
        </div>
      </div>

      {/* Top scroll-fade — masks the first row of the nav so it bleeds into the search block,
          giving the chrome a smooth "no hard edge" handoff. Pointer-events-none so it never
          eats clicks on the items underneath. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[140px] z-10 h-4 bg-gradient-to-b from-bg-paper to-transparent"
      />

      <nav
        className={cn(
          'relative flex-1 overflow-y-auto px-3 pb-6 pt-2',
          // Custom thin scrollbar that tracks the theme. Falls back to the platform default
          // on Firefox where the WebKit-only props are no-ops, which is fine.
          '[scrollbar-width:thin]',
          '[&::-webkit-scrollbar]:w-1.5',
          '[&::-webkit-scrollbar-track]:bg-transparent',
          '[&::-webkit-scrollbar-thumb]:rounded-full',
          '[&::-webkit-scrollbar-thumb]:bg-border',
          '[&::-webkit-scrollbar-thumb:hover]:bg-border-strong',
        )}
      >
        <SidebarSection title="Foundations" count={FOUNDATION_LINKS.length} icon={Compass}>
          <ul className="space-y-0.5">
            {FOUNDATION_LINKS.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <SidebarLink href={link.href} active={active}>
                    <Icon
                      size={14}
                      aria-hidden
                      className={cn(
                        'shrink-0 transition',
                        active ? 'text-primary' : 'text-fg-subtle group-hover/link:text-fg',
                      )}
                    />
                    <span className="truncate">{link.label}</span>
                  </SidebarLink>
                </li>
              );
            })}
          </ul>
        </SidebarSection>

        {byCategory.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border/70 bg-bg-subtle/40 px-3 py-6 text-center">
            <Search size={16} className="mx-auto mb-2 text-fg-subtle" aria-hidden />
            <p className="text-xs text-fg-muted">
              No matches for{' '}
              <span className="font-medium text-fg">&ldquo;{query}&rdquo;</span>
            </p>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="mt-2 text-[11px] font-medium text-primary hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          byCategory.map(([category, list]) => {
            const isCollapsed = collapsed.has(category);
            const Icon = getCategoryIcon(category);
            return (
              <SidebarSection
                key={category}
                title={category}
                count={list.length}
                icon={Icon}
                collapsible
                collapsed={isCollapsed}
                onToggle={() => toggleCategory(category)}
              >
                {!isCollapsed && (
                  <ul className="relative ms-2.5 space-y-0.5 ps-2.5">
                    {/* Subtle tree-guide rail aligned with the section's chevron. The active
                        item's own accent bar overlays this rail for its row, so the guide
                        visually "highlights" right where focus is. */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-1 start-0 w-px"
                      style={{
                        background:
                          'color-mix(in srgb, var(--sds-palette-border-default) 70%, transparent)',
                      }}
                    />
                    {list.map((item) => {
                      const href = `/components/${item.slug}`;
                      const active = pathname === href;
                      return (
                        <li key={item.slug}>
                          <SidebarLink href={href} active={active}>
                            <span className="truncate">{item.displayName}</span>
                          </SidebarLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </SidebarSection>
            );
          })
        )}
      </nav>

      {/* Bottom scroll-fade — twin of the top fade, masks the last row into the footer. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[44px] z-10 h-4 bg-gradient-to-t from-bg-paper to-transparent"
      />

      {/* Footer status strip. Component count + a subtle "system online" pulse give the chrome
          a "control panel" feel without taking real estate. */}
      <div className="relative flex h-11 items-center justify-between gap-2 border-t border-border/60 px-4 text-[11px] text-fg-muted">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-badge-pulse rounded-full bg-primary/70" />
            <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          <span>
            {totalCount} component{totalCount === 1 ? '' : 's'}
          </span>
        </span>
        <span className="inline-flex items-center gap-1 font-mono tracking-tight">
          <span className="opacity-60">apx-ds</span>
          <span className="text-fg-subtle">/</span>
          <span className="text-fg">renderer</span>
        </span>
      </div>
    </aside>
  );
}

/* ─────────────────────────── Internal building blocks ─────────────────────────── */

interface SidebarSectionProps {
  title: string;
  count: number;
  icon: LucideIcon;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}

function SidebarSection({
  title,
  count,
  icon: Icon,
  collapsible = false,
  collapsed = false,
  onToggle,
  children,
}: SidebarSectionProps) {
  const Header = collapsible ? 'button' : 'div';
  return (
    <div className="mb-4">
      <Header
        {...(collapsible
          ? {
              type: 'button' as const,
              onClick: onToggle,
              'aria-expanded': !collapsed,
            }
          : {})}
        className={cn(
          'group/section flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left',
          collapsible &&
            'transition hover:bg-neutral-subtle/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        )}
      >
        {collapsible ? (
          <ChevronRight
            size={12}
            aria-hidden
            className={cn(
              'shrink-0 text-fg-subtle transition-transform duration-fast',
              !collapsed && 'rotate-90',
            )}
          />
        ) : (
          <Icon size={12} aria-hidden className="shrink-0 text-fg-subtle" />
        )}
        <span className="flex-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-fg-muted">
          {title}
        </span>
        <span
          aria-hidden
          className="inline-flex h-4 min-w-[18px] items-center justify-center rounded-full bg-neutral-subtle px-1.5 text-[10px] font-semibold tabular-nums text-fg-muted"
        >
          {count}
        </span>
      </Header>
      <div className="mt-1">{children}</div>
    </div>
  );
}

interface SidebarLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

function SidebarLink({ href, active, children }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group/link relative flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition duration-fast',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        active
          ? 'text-primary'
          : 'text-fg-muted hover:bg-neutral-subtle/70 hover:text-fg hover:translate-x-[1px]',
      )}
      style={
        active
          ? {
              backgroundImage:
                'linear-gradient(90deg, color-mix(in srgb, var(--sds-palette-primary-main) 14%, transparent) 0%, color-mix(in srgb, var(--sds-palette-primary-main) 4%, transparent) 60%, transparent 100%)',
            }
          : undefined
      }
    >
      {/* Active accent bar — sits on the leading edge so it reads from any reading direction.
          Glows softly via box-shadow tinted by the live primary token, so it retints with the
          theme. */}
      <span
        aria-hidden
        className={cn(
          'absolute start-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full transition-opacity duration-fast',
          active ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          background: 'var(--sds-palette-primary-main)',
          boxShadow: '0 0 10px 0 var(--sds-palette-primary-main)',
        }}
      />
      <span className="relative flex min-w-0 flex-1 items-center gap-2 ps-1.5">{children}</span>
    </Link>
  );
}