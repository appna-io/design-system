'use client';

import { useThemeOverrides } from 'apx-ds';
import { Palette, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../primitives/Tabs';
import { CopyAsCode } from './CopyAsCode';
import { MotionEditor } from './MotionEditor';
import { PaletteEditor } from './PaletteEditor';
import { RadiusEditor } from './RadiusEditor';

/**
 * Theme Studio — a slide-out right-side drawer that exposes the runtime override layer through
 * a tabbed editor (palette, radii, motion) plus a copy-as-code panel. All edits stream into
 * `useThemeOverrides()` and reflect across every component on the page instantly.
 */
export function ThemeStudio() {
  const [open, setOpen] = useState(false);
  const { hasOverrides, resetOverrides } = useThemeOverrides();

  // Close on `Escape` while the drawer is open — non-modal, so we leave click-outside alone
  // (designers want to interact with the page while editing).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open theme studio"
        aria-expanded={open}
        className="relative inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-bg-paper px-2.5 text-xs font-medium text-fg transition hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Palette size={14} aria-hidden />
        Studio
        {hasOverrides ? (
          <span
            className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary ring-2 ring-bg"
            title="Custom overrides applied"
          />
        ) : null}
      </button>

      {/* Drawer panel. Slid off-screen to the right when closed; the body has `overflow-x: clip`
          so the off-screen panel never produces a horizontal scrollbar. `pointer-events-none`
          while closed ensures the hidden panel can't intercept clicks at the viewport edge. */}
      <aside
        aria-label="Theme Studio"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 flex h-screen w-[400px] max-w-[92vw] transform flex-col border-l border-border bg-bg shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} aria-hidden className="text-fg-muted" />
            <h2 className="text-sm font-semibold text-fg">Theme Studio</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={resetOverrides}
              disabled={!hasOverrides}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-fg-muted transition hover:text-fg disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Reset all overrides"
              title="Reset all overrides"
            >
              <RotateCcw size={12} aria-hidden /> Reset all
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-fg-muted transition hover:text-fg"
              aria-label="Close theme studio"
            >
              <X size={16} aria-hidden />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="palette" className="space-y-3">
            <TabsList className="w-full">
              <TabsTrigger value="palette" className="flex-1">
                Palette
              </TabsTrigger>
              <TabsTrigger value="radius" className="flex-1">
                Radii
              </TabsTrigger>
              <TabsTrigger value="motion" className="flex-1">
                Motion
              </TabsTrigger>
              <TabsTrigger value="code" className="flex-1">
                Code
              </TabsTrigger>
            </TabsList>
            <TabsContent value="palette">
              <PaletteEditor />
            </TabsContent>
            <TabsContent value="radius">
              <RadiusEditor />
            </TabsContent>
            <TabsContent value="motion">
              <MotionEditor />
            </TabsContent>
            <TabsContent value="code">
              <CopyAsCode />
            </TabsContent>
          </Tabs>
        </div>
      </aside>
    </>
  );
}
