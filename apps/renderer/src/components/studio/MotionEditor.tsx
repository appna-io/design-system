'use client';

import { useTheme, useThemeOverrides } from '@apx-ui/ds';
import { RotateCcw } from 'lucide-react';

const STEPS: Array<{ key: 'fast' | 'normal' | 'slow'; label: string; max: number }> = [
  { key: 'fast', label: 'fast', max: 500 },
  { key: 'normal', label: 'normal', max: 1000 },
  { key: 'slow', label: 'slow', max: 1500 },
];

/**
 * Edits the three motion duration tokens. Values are stored as raw numbers (ms); the theme
 * serializer (`themeToCssVars`) appends the `ms` suffix when writing CSS variables, so this
 * editor stays unit-free.
 */
export function MotionEditor() {
  const { theme } = useTheme();
  const { patchOverrides, setOverrides, overrides } = useThemeOverrides();

  const handleChange = (key: (typeof STEPS)[number]['key'], ms: number) => {
    patchOverrides({ motion: { duration: { [key]: ms } } });
  };

  const handleReset = (key: (typeof STEPS)[number]['key']) => {
    const next = stripMotionOverride(overrides, key);
    setOverrides(next);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-fg-muted">
        Drive hover / press transitions on every component. Decrease for a snappier feel,
        increase for a &ldquo;settling&rdquo; feel.
      </p>

      <ul className="space-y-3">
        {STEPS.map(({ key, label, max }) => {
          const value = theme.motion.duration[key];
          const isOverridden = Boolean(overrides.motion?.duration?.[key]);
          return (
            <li key={key} className="rounded-md border border-border bg-bg-paper px-3 py-2.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-mono font-medium text-fg">duration.{label}</span>
                <span className="font-mono text-fg-muted">{value}ms</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={max}
                  step={10}
                  value={value}
                  onChange={(e) => handleChange(key, Number(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer accent-primary"
                  aria-label={`duration ${label}`}
                />
                <button
                  type="button"
                  onClick={() => handleReset(key)}
                  disabled={!isOverridden}
                  className="inline-flex h-7 w-7 items-center justify-center rounded text-fg-muted transition hover:text-fg disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={`Reset duration ${label}`}
                  title={
                    isOverridden
                      ? `Reset duration.${label}`
                      : `duration.${label} is at DS default`
                  }
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

function stripMotionOverride(current: unknown, key: string): Record<string, unknown> {
  const c = (current ?? {}) as { motion?: { duration?: Record<string, unknown> } };
  if (!c.motion?.duration) return { ...c };
  const duration = { ...c.motion.duration };
  delete duration[key];
  const motion: Record<string, unknown> = { ...c.motion };
  if (Object.keys(duration).length === 0) {
    delete motion.duration;
  } else {
    motion.duration = duration;
  }
  const next: Record<string, unknown> = { ...c };
  if (Object.keys(motion).length === 0) {
    delete next.motion;
  } else {
    next.motion = motion;
  }
  return next;
}