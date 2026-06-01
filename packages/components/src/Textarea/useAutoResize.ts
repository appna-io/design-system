'use client';

import { useIsomorphicLayoutEffect } from '@apx-ui/engine';
import { useCallback, useRef, useState } from 'react';

export interface UseAutoResizeOptions {
  /** Master toggle. When `false`, the hook still tracks `currentLength` but never sets height. */
  enabled: boolean;
  /**
   * Floor on auto-resize, in CSS line-heights. The textarea never shrinks below this many lines
   * regardless of content. Set to `rows` by the component when `minRows` isn't provided.
   */
  minRows: number;
  /**
   * Ceiling on auto-resize, in CSS line-heights. Once content exceeds this many lines the
   * textarea stops growing and `overflow-y: auto` exposes a scrollbar inside the field.
   * `undefined` means no ceiling — grow forever.
   */
  maxRows?: number | undefined;
  /**
   * The current textarea value (or `undefined` for uncontrolled mode). Re-measures whenever this
   * changes so controlled-mode external value updates also drive the height.
   */
  value: unknown;
}

export interface UseAutoResizeReturn {
  /**
   * Stable ref callback to attach to the `<textarea>`. Subscribes to `input` so uncontrolled
   * mode also drives the resize loop; the consumer's own `onChange` is untouched.
   */
  textareaRef: (node: HTMLTextAreaElement | null) => void;
  /** Length of the textarea's current value, in characters. Drives the optional counter footer. */
  currentLength: number;
}

/**
 * Auto-resize hook for `<Textarea />`. Measures the textarea's natural content height (via the
 * native `scrollHeight` once the height is reset to `auto`) and clamps it between
 * `minRows * line-height` and `maxRows * line-height`.
 *
 * ### Why `scrollHeight` and not a mirror element
 *
 * The Phase 8 plan suggested an off-screen mirror `<div>` to avoid the layout thrash of reading
 * `scrollHeight` after every keystroke. In practice (and per the most common open-source
 * implementations — `react-textarea-autosize`, Chakra, Mantine), `scrollHeight` works fine when:
 *
 *  1. We batch the read inside a layout effect (`useIsomorphicLayoutEffect`) so the browser only
 *     paints once per logical render.
 *  2. We don't recompute when the value hasn't changed (the layout effect's dependency array
 *     skips no-op renders).
 *
 * The mirror strategy is a worthwhile optimization for fields that get hundreds of keystrokes
 * per second; we re-evaluate if profiling ever shows the read in a flame graph.
 *
 * ### Why `padding-box` not `content-box`
 *
 * `scrollHeight` already includes the textarea's own padding, so we don't add it back — adding
 * it would over-compute by `padding-y` on every measure. The line-height we read from
 * `getComputedStyle` is in CSS pixels and matches what the browser uses for content layout.
 *
 * ### What we do NOT do
 *
 *  - We don't touch `box-sizing`; the textarea's `inputRecipe`-set `box-border` stays.
 *  - We don't write inline `width` / `min-width` — only `height` and `overflow-y`.
 *  - We don't suppress the native `Esc → undo` history; the input event we listen to is purely
 *    passive (we never call `preventDefault`).
 */
export function useAutoResize({
  enabled,
  minRows,
  maxRows,
  value,
}: UseAutoResizeOptions): UseAutoResizeReturn {
  const elRef = useRef<HTMLTextAreaElement | null>(null);
  const [currentLength, setCurrentLength] = useState(0);

  /**
   * Read the textarea, set the new height, sync the counter length. Pulled out so the effect
   * (value-driven) and the input listener (uncontrolled-typing-driven) share one code path.
   */
  const measure = useCallback((): void => {
    const el = elRef.current;
    if (!el) return;

    // Counter length tracks the textarea's actual value, controlled or not.
    setCurrentLength(el.value.length);

    if (!enabled) return;

    // 1. Reset height to `auto` so the next `scrollHeight` read reflects content, not the
    //    previously-set inline height.
    el.style.height = 'auto';

    const style = window.getComputedStyle(el);
    // Most browsers expose `line-height` as a px value when the typography is fully resolved.
    // The fallback (NaN guard → font-size × 1.5) keeps us safe in jsdom where `'normal'` is
    // sometimes returned verbatim.
    const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5;
    const borderY =
      parseFloat(style.borderTopWidth || '0') + parseFloat(style.borderBottomWidth || '0');

    // `scrollHeight` already includes the element's own padding, so the only addition is the
    // outer border (which `box-sizing: border-box` excludes from the content area).
    const minHeight = lineHeight * minRows + borderY;
    const maxHeight =
      maxRows === undefined ? Number.POSITIVE_INFINITY : lineHeight * maxRows + borderY;

    const next = Math.max(minHeight, Math.min(el.scrollHeight, maxHeight));
    el.style.height = `${next}px`;
    // Only show the scrollbar once the cap is reached; otherwise the visual jumps every time
    // the textarea brushes against the max height.
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [enabled, minRows, maxRows]);

  // Controlled-mode driver: every external `value` change re-measures. Layout effect runs after
  // DOM mutations but before paint, so the user never sees a frame at the wrong height.
  useIsomorphicLayoutEffect(() => {
    measure();
  }, [value, measure]);

  /**
   * Combined ref + input-listener attachment. The component is free to forward its own `ref`
   * separately via `mergeRefs`; this one owns the auto-resize subscription only.
   *
   * Native `input` event (vs. React's synthetic `onChange`) is the right hook because:
   *  - It fires on every keystroke, paste, IME composition completion, AND `drag-and-drop` text
   *    insertion — the latter two are missed if we listened to React `onChange` only.
   *  - It's passive — we never block the user's typing.
   */
  const handleInput = useCallback((): void => {
    measure();
  }, [measure]);

  const textareaRef = useCallback(
    (node: HTMLTextAreaElement | null): void => {
      const prev = elRef.current;
      if (prev) prev.removeEventListener('input', handleInput);
      elRef.current = node;
      if (node) {
        node.addEventListener('input', handleInput);
        // First measure on mount — the textarea's initial `rows`-derived height drives the
        // wrapper's outer dimensions before any user interaction.
        measure();
      }
    },
    [handleInput, measure],
  );

  return { textareaRef, currentLength };
}