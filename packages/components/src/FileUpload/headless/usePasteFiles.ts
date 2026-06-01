'use client';

import { useEffect, type RefObject } from 'react';

export interface UsePasteFilesOptions {
  enabled?: boolean | undefined;
  disabled?: boolean | undefined;
  rootRef: RefObject<HTMLElement | null>;
  onPaste: (files: File[]) => void;
}

/**
 * Opt-in clipboard paste listener — extracts `clipboardData.files` from paste events.
 */
export function usePasteFiles({
  enabled = false,
  disabled = false,
  rootRef,
  onPaste,
}: UsePasteFilesOptions): void {
  useEffect(() => {
    if (!enabled || disabled) return;
    const root = rootRef.current;
    if (!root) return;

    const handler = (event: ClipboardEvent) => {
      const files = event.clipboardData?.files;
      if (!files || files.length === 0) return;
      event.preventDefault();
      onPaste(Array.from(files));
    };

    root.addEventListener('paste', handler);
    return () => root.removeEventListener('paste', handler);
  }, [disabled, enabled, onPaste, rootRef]);
}