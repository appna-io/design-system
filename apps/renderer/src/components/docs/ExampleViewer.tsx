'use client';

import { ChevronDown, Code2 } from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';

import { cn } from '../primitives/cn';
import { CopyButton } from '../primitives/CopyButton';

interface ExampleViewerProps {
  /** Live, rendered example. Already wrapped in a server component (e.g. PreviewLoader). */
  preview: ReactNode;
  /** Syntax-highlighted CodeBlock. Pre-rendered server-side, shown only when toggled on. */
  code: ReactNode;
  /** Raw source text — used by the always-available Copy button so users can grab the snippet
   *  without first revealing the code panel. */
  source: string;
  /** File name shown in the toolbar (e.g. `Basic.tsx`). */
  fileName: string;
}

/**
 * Shell around a single example: prominent live preview on top, slim toolbar underneath with a
 * "Show code" toggle and a Copy button. The CodeBlock itself is rendered server-side and passed
 * down as a node so we keep Shiki out of the client bundle — we just mount/unmount it on toggle.
 */
export function ExampleViewer({ preview, code, source, fileName }: ExampleViewerProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-bg-paper shadow-sm">
      <div className="renderer-preview bg-bg-paper p-10">
        <div className="flex min-h-[180px] flex-wrap items-center justify-center gap-4">
          {preview}
        </div>
      </div>
      <div
        className={cn(
          'flex items-center justify-between gap-2 border-t border-border bg-bg-paper px-3 py-2',
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-fg-muted transition',
            'hover:bg-neutral-subtle hover:text-fg',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          )}
        >
          <Code2 aria-hidden size={14} />
          {open ? 'Hide code' : 'Show code'}
          <ChevronDown
            aria-hidden
            size={14}
            className={cn('transition-transform duration-150', open && 'rotate-180')}
          />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-fg-muted">{fileName}</span>
          <CopyButton text={source} />
        </div>
      </div>
      {open && (
        <div id={panelId} className="border-t border-border">
          {code}
        </div>
      )}
    </div>
  );
}
