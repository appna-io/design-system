'use client';

import { cv } from 'apx-ds';
import { useMode, useTheme, useThemeDirection, useVariant } from 'apx-ds';

const card = cv({
  base: 'rounded-md border p-4 transition',
  variants: {
    tone: {
      surface: 'bg-bg-paper border-border',
      primary: 'bg-primary-subtle border-primary-border text-primary-hover',
      success: 'bg-success-subtle border-success-border text-success-hover',
      danger: 'bg-danger-subtle border-danger-border text-danger-hover',
    },
  },
  defaultVariants: { tone: 'surface' },
});

const button = cv({
  base: 'inline-flex items-center justify-center rounded-md font-medium transition focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none',
  variants: {
    color: {
      primary: 'bg-primary text-primary-contrast hover:bg-primary-hover',
      success: 'bg-success text-success-contrast hover:bg-success-hover',
      danger: 'bg-danger text-danger-contrast hover:bg-danger-hover',
      ghost: 'bg-transparent text-fg hover:bg-neutral-subtle',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    },
  },
  defaultVariants: { color: 'primary', size: 'md' },
});

function ModeSegment() {
  const { mode, setMode } = useMode();
  return (
    <div className="inline-flex rounded-md border border-border bg-bg-paper p-1">
      {(['light', 'dark', 'system'] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setMode(m)}
          className={
            mode === m
              ? 'rounded px-3 py-1 text-sm font-medium bg-primary text-primary-contrast'
              : 'rounded px-3 py-1 text-sm font-medium text-fg-muted hover:text-fg'
          }
        >
          {m}
        </button>
      ))}
    </div>
  );
}

function VariantSegment() {
  const { variant, setVariant } = useVariant();
  return (
    <div className="inline-flex rounded-md border border-border bg-bg-paper p-1">
      {['default', 'tetsu', 'origami', 'katana'].map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => setVariant(v)}
          className={
            variant === v
              ? 'rounded px-3 py-1 text-sm font-medium bg-primary text-primary-contrast'
              : 'rounded px-3 py-1 text-sm font-medium text-fg-muted hover:text-fg'
          }
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function DirSegment() {
  const { dir, setDir } = useThemeDirection();
  return (
    <div className="inline-flex rounded-md border border-border bg-bg-paper p-1">
      {(['ltr', 'rtl'] as const).map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => setDir(d)}
          className={
            dir === d
              ? 'rounded px-3 py-1 text-sm font-medium bg-primary text-primary-contrast'
              : 'rounded px-3 py-1 text-sm font-medium text-fg-muted hover:text-fg'
          }
        >
          {d.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function ThemeDebug() {
  const { mode, resolvedMode, variant, dir } = useTheme();
  return (
    <pre className="text-xs rounded-md border border-border bg-bg-subtle p-4 overflow-x-auto">
      {JSON.stringify({ mode, resolvedMode, variant, dir }, null, 2)}
    </pre>
  );
}

export default function ThemeDemoPage() {
  return (
    <main className="min-h-screen p-12 max-w-4xl mx-auto space-y-10 bg-bg text-fg">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Theme Engine Demo</h1>
        <p className="text-fg-muted">
          Three independent axes — mode (light/dark/system), theme variant (default · tetsu ·
          origami · katana), and direction (RTL). The <code className="font-mono">default</code>{' '}
          variant quietly adapts to the host browser (Safari → Cupertino, everything else →
          apx-base); <code className="font-mono">katana</code> uses diagonal{' '}
          <code className="font-mono">8px 0px</code> radii for a single-stroke blade identity.
          Persisted to <code className="font-mono">localStorage</code>.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">Mode</h2>
        <ModeSegment />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
          Theme Variant
        </h2>
        <VariantSegment />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">Direction</h2>
        <DirSegment />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
          Live preview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={card({ tone: 'surface' })}>
            <h3 className="font-semibold text-fg">Surface card</h3>
            <p className="mt-1 text-sm text-fg-muted">
              Uses <code>bg-bg-paper</code> and <code>border-border</code>. Watch the colors shift
              between light/dark.
            </p>
          </div>
          <div className={card({ tone: 'primary' })}>
            <h3 className="font-semibold">Primary card</h3>
            <p className="mt-1 text-sm">
              Uses <code>bg-primary-subtle</code> — the subtle role inverts in dark mode.
            </p>
          </div>
          <div className={card({ tone: 'success' })}>
            <h3 className="font-semibold">Success card</h3>
            <p className="mt-1 text-sm">Same recipe, different role.</p>
          </div>
          <div className={card({ tone: 'danger' })}>
            <h3 className="font-semibold">Danger card</h3>
            <p className="mt-1 text-sm">Danger role with subtle background.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button type="button" className={button({ color: 'primary', size: 'sm' })}>
            sm primary
          </button>
          <button type="button" className={button({ color: 'primary', size: 'md' })}>
            md primary
          </button>
          <button type="button" className={button({ color: 'primary', size: 'lg' })}>
            lg primary
          </button>
          <button type="button" className={button({ color: 'success' })}>
            success
          </button>
          <button type="button" className={button({ color: 'danger' })}>
            danger
          </button>
          <button type="button" className={button({ color: 'ghost' })}>
            ghost
          </button>
        </div>

        <p className="text-sm text-fg-muted">
          The buttons above use <code>bg-primary</code> / <code>hover:bg-primary-hover</code> from
          the Tailwind preset. Switching mode/variant updates the CSS variables, the classes stay
          the same.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
          Theme context
        </h2>
        <ThemeDebug />
      </section>
    </main>
  );
}
