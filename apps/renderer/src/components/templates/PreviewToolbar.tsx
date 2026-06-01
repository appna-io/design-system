'use client';

import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Div, Typography } from '@apx-ui/ds';

import type { TemplateMeta } from '../../templates';
import { DirectionToggle } from '../chrome/DirectionToggle';
import { ModeToggle } from '../chrome/ModeToggle';
import { VariantSelect } from '../chrome/VariantSelect';
import { cn } from '../primitives/cn';
import { InspectorButton, useOptionalInspector } from './inspector';

interface PreviewToolbarProps {
  meta: TemplateMeta;
}

/**
 * Floating dock pinned to the bottom of the viewport while a template is open.
 *
 * It carries:
 *   - A "back to gallery" affordance (so users never get stranded in full-bleed mode).
 *   - The same Mode / Variant / Direction toggles the regular renderer TopBar uses, so
 *     users can experience the redesign across every supported axis without leaving the
 *     preview.
 *   - A hide-toggle that collapses the dock to a tiny pill — useful for screenshots / when
 *     evaluating the design without UI chrome in the way.
 *
 * Keyboard: `?` reveals the dock if hidden; `Esc` collapses it.
 */
export function PreviewToolbar({ meta }: PreviewToolbarProps) {
  const [hidden, setHidden] = useState(false);
  // Inspector is wired in only when its provider is present; the button stays out
  // of the toolbar otherwise (e.g. for a future template without inspectable sections).
  const inspector = useOptionalInspector();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        setHidden(false);
      } else if (e.key === 'Escape') {
        // Defer to inspector mode (its own handler turns the mode off first) and
        // to any open modal. Only collapse the toolbar when nothing else is going on.
        if (inspector?.active || inspector?.openId) return;
        setHidden(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inspector?.active, inspector?.openId]);

  if (hidden) {
    return (
      <Div
        as="button"
        type="button"
        onClick={() => setHidden(false)}
        aria-label="Show preview controls"
        className={cn(
          'fixed bottom-4 left-1/2 z-50 -translate-x-1/2',
          'inline-flex items-center gap-2 rounded-full border border-border bg-bg-paper/95 px-3 py-1.5',
          'text-xs font-medium text-fg-muted shadow-lg backdrop-blur transition',
          'hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        )}
      >
        <Eye size={14} aria-hidden />
        Show controls
      </Div>
    );
  }

  return (
    <Div
      role="toolbar"
      aria-label="Template preview controls"
      className={cn(
        'fixed bottom-4 left-1/2 z-50 -translate-x-1/2',
        'flex max-w-[calc(100vw-2rem)] items-center gap-3 overflow-x-auto',
        'rounded-full border border-border bg-bg-paper/95 px-2 py-1.5 shadow-xl backdrop-blur',
      )}
    >
      <Link
        href="/templates"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5',
          'transition hover:bg-neutral-subtle hover:text-fg',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        )}
      >
        <ArrowLeft size={14} aria-hidden />
        <Typography as="span" variant="caption" weight="medium" color="fg.muted">
          Templates
        </Typography>
      </Link>

      <Div as="span" className="hidden h-5 w-px bg-border sm:block" aria-hidden />

      <Typography
        as="span"
        variant="caption"
        weight="medium"
        truncate
        className="hidden sm:inline"
      >
        {meta.name}
      </Typography>

      <Div as="span" className="hidden h-5 w-px bg-border sm:block" aria-hidden />

      <Div className="flex items-center gap-2">
        <VariantSelect />
        <DirectionToggle />
        <ModeToggle />
      </Div>

      {/* Inspector button renders only when an <InspectorProvider> is in the tree —
          kept optional so the toolbar can be reused in surfaces that don't ship
          inspectable sources. */}
      {inspector && (
        <>
          <Div as="span" className="h-5 w-px bg-border" aria-hidden />
          <InspectorButton />
        </>
      )}

      <Div as="span" className="h-5 w-px bg-border" aria-hidden />

      <Div
        as="button"
        type="button"
        onClick={() => setHidden(true)}
        aria-label="Hide preview controls"
        title="Hide controls (Esc)"
        className={cn(
          'inline-flex h-7 w-7 items-center justify-center rounded-full text-fg-muted transition',
          'hover:bg-neutral-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        )}
      >
        <EyeOff size={14} aria-hidden />
      </Div>
    </Div>
  );
}