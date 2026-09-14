'use client';

import { useMode } from '@apx-ui/ds';
import { Monitor, Moon, Sun } from 'lucide-react';

import { cn } from '../primitives/cn';
import { useTemplateSeed } from './TemplateSeedContext';

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const;

/**
 * The preview's mode control. Same shape as the docs' `<ModeToggle>`, with one difference that is
 * the entire reason it exists: **while a template's `preferredMode` seed is still active, it
 * reports the seed rather than the root.**
 *
 * The plain toggle reads `useMode()`, which reaches the root provider — and the seed deliberately
 * never touches the root, so a dark-first template opened with the docs on "System" showed a page
 * rendering dark above a control reading `System`. Accurate about the root, wrong about the thing
 * on screen, and unreadable from outside the scope: an audit sampled that entry state as "light
 * mode", got the dark palette, and concluded a correct template was authored backwards (#10, #11).
 *
 * Clicking still drives the **root**, exactly as before — it just releases the seed first, so the
 * control and the page cannot disagree afterwards either.
 */
export function PreviewModeToggle() {
  const { mode, setMode } = useMode();
  const seed = useTemplateSeed();

  // While seeded, the page is showing the seed — so that is what the control must say.
  const shown = seed?.mode ?? mode;

  return (
    <div
      role="radiogroup"
      aria-label="Color mode"
      className="inline-flex items-center rounded-md border border-border bg-bg-paper p-0.5"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = shown === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => {
              // Release first: the seed outranks the root while active, so setting the root
              // without releasing would change nothing visible and look like a dead control.
              seed?.release();
              setMode(value);
            }}
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
