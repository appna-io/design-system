'use client';

import { useMode } from '@apx-ui/ds';
import { Monitor, Moon, Sun } from 'lucide-react';

import { cn } from '../primitives/cn';

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const;

export function ModeToggle() {
  const { mode, setMode } = useMode();

  return (
    <div
      role="radiogroup"
      aria-label="Color mode"
      className="inline-flex items-center rounded-md border border-border bg-bg-paper p-0.5"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => setMode(value)}
            className={cn(
              'inline-flex h-7 w-7 items-center justify-center rounded transition',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              active ? 'bg-bg text-fg shadow-sm' : 'text-fg-muted hover:text-fg',
            )}
          >
            <Icon size={14} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
