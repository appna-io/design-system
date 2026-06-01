'use client';

import { DirectionProvider, useThemeDirection } from '@apx-ui/ds';
import { ChevronDown, Code2 } from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';

import { usePortalSize } from '../chrome/portal-size-context';
import { cn } from '../primitives/cn';
import { CopyButton } from '../primitives/CopyButton';
import { IframePreview } from './IframePreview';

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
 *
 * The Direction toggle in the topbar is **scoped to the preview frame**: the renderer's `<body>`
 * is pinned to `dir="ltr"`, so chrome / source code / file name stay LTR no matter what. We
 * re-apply the user's choice here, on the preview wrapper only, via both a `dir` attribute (so
 * CSS logical properties inside the example resolve correctly) and `<DirectionProvider>` (so
 * components calling `useDirection()` see the same value without depending on `<html dir>`).
 */
export function ExampleViewer({ preview, code, source, fileName }: ExampleViewerProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const { dir } = useThemeDirection();
  const { width: portalWidth } = usePortalSize();

  // When the user picks a non-default viewport size in the topbar selector, we hand the
  // preview off to a same-origin iframe sized to that width. That makes `@media` queries,
  // `matchMedia`, and Tailwind responsive utilities evaluate against the simulated viewport
  // instead of the docs page width — a plain `max-width` wrapper would only shrink the box.
  // `Default` keeps the original flush layout (no iframe overhead, no portal indirection).
  const inner = (
    <div
      dir={dir}
      className="flex min-h-[180px] flex-wrap items-center justify-center gap-4"
    >
      {preview}
    </div>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-bg-paper shadow-sm">
      <DirectionProvider dir={dir}>
        <div className="renderer-preview bg-bg-paper p-10" dir={dir}>
          {portalWidth === null ? inner : <IframePreview width={portalWidth}>{inner}</IframePreview>}
        </div>
      </DirectionProvider>
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