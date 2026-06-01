'use client';

import { type ReactNode } from 'react';
import { Div, Typography } from '@apx-ui/ds';

import { useOptionalInspector } from './inspector-context';
import { cn } from '../../primitives/cn';

interface InspectableProps {
  /** Stable id. Must match an entry in the template meta's `inspectable` list. */
  id: string;
  /** Human label. Falls back to the id. Shown in the hover badge. */
  label?: string;
  /** The section component(s) being made inspectable. */
  children: ReactNode;
  /**
   * Override the wrapper className. Inspectable injects a couple of utility
   * classes for the inspector-mode outline; pass any layout classes alongside.
   */
  className?: string;
}

/**
 * Marks its subtree as one inspectable region of a template.
 *
 * - In normal viewing, the wrapper is a plain `<Div>` — no outline, no extra
 *   pointer behavior — so the template renders exactly as it would without
 *   the inspector.
 * - When the user enables Inspector mode via the floating toolbar, the wrapper
 *   responds to hover (inset primary outline + label badge) and clicks (opens
 *   the source modal). The capture-phase click handler stops the underlying
 *   `<Button>` / `<a>` from also firing, so inspecting a CTA doesn't navigate.
 */
export function Inspectable({ id, label, children, className }: InspectableProps) {
  const inspector = useOptionalInspector();

  if (!inspector) {
    // Embedded outside the viewer — render the children directly so the section
    // looks identical with or without the inspector chrome.
    return (
      <Div className={className} data-inspect-id={id}>
        {children}
      </Div>
    );
  }

  const { active, openSource } = inspector;

  return (
    <Div
      data-inspect-id={id}
      data-inspect-label={label ?? id}
      data-inspect-active={active ? '' : undefined}
      role={active ? 'button' : undefined}
      tabIndex={active ? 0 : undefined}
      aria-label={active ? `Inspect source for ${label ?? id}` : undefined}
      onClickCapture={(e) => {
        if (!active) return;
        e.preventDefault();
        e.stopPropagation();
        openSource(id);
      }}
      onKeyDown={(e) => {
        if (!active) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openSource(id);
        }
      }}
      className={cn(
        'group/inspectable relative outline-none',
        // Outline + cursor only kick in when inspector mode is engaged. The
        // outline rides on a box-shadow so it sits inside the section's own
        // padding and doesn't push siblings around. Tokenized color so it
        // tracks the active theme variant.
        active && 'cursor-zoom-in transition-shadow',
        active &&
          'hover:[box-shadow:inset_0_0_0_2px_var(--sds-palette-primary)] focus-visible:[box-shadow:inset_0_0_0_2px_var(--sds-palette-primary)]',
        className,
      )}
    >
      {children}
      {active && (
        <Typography
          as="span"
          variant="caption"
          weight="medium"
          aria-hidden
          className={cn(
            'pointer-events-none absolute end-3 top-3 z-50',
            'inline-flex items-center gap-1 rounded-md bg-primary px-2 py-0.5',
            'text-primary-contrast shadow-lg',
            // Fades in on hover / focus-within of the group.
            'opacity-0 transition-opacity',
            'group-hover/inspectable:opacity-100 group-focus-within/inspectable:opacity-100',
          )}
        >
          {label ?? id}
        </Typography>
      )}
    </Div>
  );
}