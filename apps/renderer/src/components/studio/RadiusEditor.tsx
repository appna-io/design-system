'use client';

import { useTheme, useThemeOverrides } from '@apx-ui/ds';
import { RotateCcw } from 'lucide-react';

const STEPS: Array<{ key: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'; label: string }> = [
  { key: 'sm', label: 'sm' },
  { key: 'md', label: 'md' },
  { key: 'lg', label: 'lg' },
  { key: 'xl', label: 'xl' },
  { key: '2xl', label: '2xl' },
  { key: '3xl', label: '3xl' },
];

const MAX_PX = 48;

/**
 * Edits the radius scale. Each step is a slider 0-48px (1px step). Values are stored as `rem`
 * for consistency with the rest of the token system.
 */
export function RadiusEditor() {
  const { theme } = useTheme();
  const { patchOverrides, setOverrides, overrides } = useThemeOverrides();

  const handleChange = (key: (typeof STEPS)[number]['key'], px: number) => {
    patchOverrides({ radius: { [key]: `${(px / 16).toFixed(3).replace(/\.?0+$/, '')}rem` } });
  };

  const handleResetStep = (key: (typeof STEPS)[number]['key']) => {
    const next = stripRadiusOverride(overrides, key);
    setOverrides(next);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-fg-muted">
        Radii apply across every surface that uses{' '}
        <code className="font-mono">rounded-&lt;size&gt;</code>. Variants (
        <code className="font-mono">tetsu</code>, <code className="font-mono">origami</code>,{' '}
        <code className="font-mono">katana</code>) still apply on top — these overrides win.
      </p>

      <ul className="space-y-3">
        {STEPS.map(({ key, label }) => {
          const rawValue = theme.radius[key] ?? '0px';
          const px = toPx(rawValue);
          const display = formatDisplay(rawValue, px);
          const isOverridden = Boolean(overrides.radius?.[key]);
          const sliderValue = Number.isFinite(px) ? Math.min(MAX_PX, Math.max(0, px)) : 0;

          return (
            <li key={key} className="rounded-md border border-border bg-bg-paper px-3 py-2.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-mono font-medium text-fg">radius.{label}</span>
                <span className="font-mono text-fg-muted">{display}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={MAX_PX}
                  step={1}
                  value={sliderValue}
                  onChange={(e) => handleChange(key, Number(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer accent-primary"
                  aria-label={`radius ${label}`}
                />
                <button
                  type="button"
                  onClick={() => handleResetStep(key)}
                  disabled={!isOverridden}
                  className="inline-flex h-7 w-7 items-center justify-center rounded text-fg-muted transition hover:text-fg disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={`Reset radius ${label}`}
                  title={isOverridden ? `Reset radius.${label}` : `radius.${label} is at DS default`}
                >
                  <RotateCcw size={13} aria-hidden />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function toPx(raw: string): number {
  if (typeof raw !== 'string') return 0;
  const trimmed = raw.trim();
  // Multi-value forms (e.g. katana's "8px 0px") — show the first value as the canonical size.
  const first = trimmed.split(/\s+/)[0] ?? trimmed;
  if (first.endsWith('rem')) return Math.round(parseFloat(first) * 16);
  if (first.endsWith('px')) return Math.round(parseFloat(first));
  const n = parseFloat(first);
  return Number.isFinite(n) ? n : 0;
}

function formatDisplay(raw: string, px: number): string {
  if (raw.includes(' ')) return raw;
  return `${px}px (${raw})`;
}

function stripRadiusOverride(current: unknown, key: string): Record<string, unknown> {
  const c = (current ?? {}) as { radius?: Record<string, unknown> };
  if (!c.radius) return { ...c };
  const radius = { ...c.radius };
  delete radius[key];
  const next: Record<string, unknown> = { ...c };
  if (Object.keys(radius).length === 0) {
    delete next.radius;
  } else {
    next.radius = radius;
  }
  return next;
}