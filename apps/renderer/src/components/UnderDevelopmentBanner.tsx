'use client';

import { useEffect, useState } from 'react';
import { Hammer, X } from 'lucide-react';

const DISMISS_KEY = 'apx-ds:under-development-dismissed';

/**
 * Slim, full-width strip pinned above the app chrome announcing that the design
 * system / renderer is still under active development. Dismissible — the choice
 * is remembered in `localStorage` so it doesn't nag on every navigation, but it
 * returns for anyone who hasn't dismissed it yet.
 *
 * Rendered once in the root layout so it sits above both the docs chrome and the
 * full-bleed template surfaces.
 */
export function UnderDevelopmentBanner() {
  // Start hidden to avoid a hydration flash; reveal after we've read localStorage.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) !== '1') setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="relative z-40 flex items-center justify-center gap-2 border-b border-warning/30 bg-warning-subtle px-10 py-1.5 text-center text-xs font-medium text-warning"
    >
      <Hammer size={13} aria-hidden className="shrink-0" />
      <span>
        <strong className="font-semibold">Under development</strong> — apx-ds is a work in progress.
        Components and APIs may change.
      </span>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          try {
            localStorage.setItem(DISMISS_KEY, '1');
          } catch {
            /* storage unavailable — dismiss for this session only */
          }
        }}
        aria-label="Dismiss notice"
        className="absolute end-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-md text-warning/80 transition hover:bg-warning/15 hover:text-warning focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning"
      >
        <X size={12} />
      </button>
    </div>
  );
}
