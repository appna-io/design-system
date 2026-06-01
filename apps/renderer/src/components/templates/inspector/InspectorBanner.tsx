'use client';

import { MousePointerClick, X } from 'lucide-react';
import { Div, Typography } from '@apx-ui/ds';

import { useInspector } from './inspector-context';

/**
 * Sticky status chip that signals "inspector mode is on". Pinned just above the
 * floating preview toolbar so it sits in the "controls" zone of the viewport and
 * never overlaps a template's own sticky header / hero / scroll content.
 *
 * The chip is `pointer-events-none` apart from the small × control — that way
 * the wider band of the chip never intercepts clicks on the template behind it.
 */
export function InspectorBanner() {
  const { active, setActive } = useInspector();
  if (!active) return null;
  return (
    <Div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-16 z-40 flex justify-center"
    >
      <Div className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-primary-border bg-primary-subtle/95 px-2.5 py-1 text-primary shadow-lg backdrop-blur">
        <MousePointerClick size={13} aria-hidden />
        <Typography as="span" variant="caption" weight="medium" className="hidden sm:inline">
          Inspector on — hover a section, click to view its code
        </Typography>
        <Typography as="span" variant="caption" weight="medium" className="sm:hidden">
          Inspector on
        </Typography>
        <Div
          as="button"
          type="button"
          onClick={() => setActive(false)}
          aria-label="Exit inspector mode"
          className="ms-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-primary transition hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X size={12} aria-hidden />
        </Div>
      </Div>
    </Div>
  );
}