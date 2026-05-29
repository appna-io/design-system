'use client';

import { useThemeDirection } from '@apx-ui/ds';

import { cn } from '../primitives/cn';

export function DirectionToggle() {
  const { dir, setDir } = useThemeDirection();
  return (
    <div
      role="radiogroup"
      aria-label="Text direction"
      className="inline-flex items-center rounded-md border border-border bg-bg-paper p-0.5"
    >
      {(['ltr', 'rtl'] as const).map((value) => {
        const active = dir === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setDir(value)}
            className={cn(
              'inline-flex h-7 min-w-[36px] items-center justify-center rounded px-2 text-xs font-semibold uppercase tracking-wider transition',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              active ? 'bg-bg text-fg shadow-sm' : 'text-fg-muted hover:text-fg',
            )}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
