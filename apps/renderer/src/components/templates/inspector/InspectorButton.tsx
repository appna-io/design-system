'use client';

import { MousePointerClick } from 'lucide-react';
import { useEffect } from 'react';
import { Div } from '@apx-ui/ds';

import { useInspector } from './inspector-context';
import { cn } from '../../primitives/cn';

/**
 * Pill button that toggles inspector mode. Lives inside `<PreviewToolbar>` and
 * is also hotkey-bound: pressing `i` flips the mode on/off as long as no input
 * is focused (so it doesn't fight typing inside the source modal).
 */
export function InspectorButton() {
  const { active, toggle, setActive } = useInspector();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Don't hijack typing inside an input / textarea / contenteditable.
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === 'i' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        toggle();
      } else if (e.key === 'Escape' && active) {
        // While inspector is on, Esc turns it off (modal close is handled by the
        // Modal's own escape-stack, which fires first for the source modal).
        setActive(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, toggle, setActive]);

  return (
    <Div
      as="button"
      type="button"
      onClick={toggle}
      aria-pressed={active}
      aria-label="Toggle inspector"
      title="Inspect components (i)"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        active
          ? 'bg-primary text-primary-contrast shadow-sm'
          : 'text-fg-muted hover:bg-neutral-subtle hover:text-fg',
      )}
    >
      <MousePointerClick size={14} aria-hidden />
      Inspector
    </Div>
  );
}