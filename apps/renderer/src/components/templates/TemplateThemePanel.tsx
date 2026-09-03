'use client';

import { useThemeOverrides } from '@apx-ui/ds';
import { Palette, RotateCcw, X } from 'lucide-react';
import { useState, type CSSProperties } from 'react';

import { PaletteEditor } from '../studio/PaletteEditor';

/**
 * Floating colour control for a template preview.
 *
 * Rendered **inside** the template's scoped `<ThemeProvider>`, which is the whole trick: the
 * `PaletteEditor` it wraps edits through `useThemeOverrides()`, and that hook targets whichever
 * provider encloses it. Inside the scope it therefore edits *this template's* palette — the
 * page repaints live, and the docs chrome, the gallery and every other route are untouched.
 * The same editor mounted in the TopBar edits the global theme; no component needed changing.
 *
 * Scoped overrides don't persist, so closing the tab or navigating away resets the template to
 * its own default palette.
 *
 * Positioned bottom-end so it clears the `<PreviewToolbar>` (bottom-centre) and the
 * `<InspectorBanner>` (top-centre).
 */
/**
 * The panel sits inside the template's scope (that's what makes it edit the right palette), so
 * it also inherits the template's *shape* tokens. Lyli sets `radius.md` to a pill, which turned
 * every row of the editor into a lozenge. Re-pinning the radius scale locally keeps the tool
 * looking like a tool while its colours still show you the palette you're editing.
 */
const NEUTRAL_SHAPE = {
  '--sds-radius-sm': '0.25rem',
  '--sds-radius-md': '0.375rem',
  '--sds-radius-lg': '0.5rem',
  '--sds-radius-xl': '0.75rem',
} as CSSProperties;

export function TemplateThemePanel() {
  const [open, setOpen] = useState(false);
  const { overrides, setOverrides } = useThemeOverrides();

  /**
   * The template's own palette arrives as `defaultOverrides`, so it is itself an override — which
   * means `hasOverrides` is true before the user has touched anything, and clearing would jump to
   * the DS default rather than back to the template. Capturing the seed on mount gives us the
   * baseline the user actually expects: "edited" means edited *by you*, and reset returns to the
   * template's own colours.
   */
  const [seed] = useState(() => overrides);
  const isEdited = JSON.stringify(overrides) !== JSON.stringify(seed);
  const resetToTemplate = () => setOverrides(seed);

  return (
    <div
      style={NEUTRAL_SHAPE}
      className="fixed bottom-6 end-6 z-40 flex flex-col items-end gap-2"
    >
      {open && (
        <div className="w-[320px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-xl border border-border bg-bg-paper shadow-xl">
          <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-fg">Template colors</p>
              <p className="truncate text-[11px] text-fg-muted">
                Affects this preview only
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetToTemplate}
                disabled={!isEdited}
                title={isEdited ? "Reset to the template's colors" : 'Already at the template default'}
                aria-label="Reset to the template's colors"
                className="inline-flex h-7 w-7 items-center justify-center rounded text-fg-muted transition hover:text-fg disabled:cursor-not-allowed disabled:opacity-30"
              >
                <RotateCcw size={13} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close colors panel"
                className="inline-flex h-7 w-7 items-center justify-center rounded text-fg-muted transition hover:text-fg"
              >
                <X size={14} aria-hidden />
              </button>
            </div>
          </div>

          <div className="max-h-[min(60vh,26rem)] overflow-y-auto p-3">
            <PaletteEditor />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-paper px-4 py-2.5 text-sm font-medium text-fg shadow-lg transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Palette size={15} aria-hidden />
        Colors
        {isEdited && (
          <span
            aria-label="edited"
            className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
          />
        )}
      </button>
    </div>
  );
}
