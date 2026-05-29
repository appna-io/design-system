'use client';

import { useCallback, useRef } from 'react';
import type { KeyboardEvent } from 'react';

/**
 * Generalized "list keyboard" hook — translates ARIA Menu / Listbox / Combobox keys into highlight
 * + selection actions. Extracted from `Menu/useMenuKeyboard.ts` when Select (Phase 23) became the
 * second consumer; same shape, identical semantics, plus generic typing so each consumer can
 * supply its own item record shape.
 *
 * Consumers today:
 *
 *  - **Menu** (`<Menu.Content>` + `<Menu.SubContent>`) — uses `onOpenSub` / `onCloseSub` for the
 *    nested-submenu case.
 *  - **Select** (`<Select.Content>`) — uses the core keys (arrows / Home / End / Enter / Space /
 *    Esc / Tab) plus type-ahead; submenu callbacks are omitted (Select has no submenus).
 *
 * The hook intentionally does NOT call `preventDefault()` for ArrowLeft when there's no submenu
 * callback — the consumer might be wiring up a horizontal flyout we don't know about.
 *
 * Future consumers (Combobox) will reuse this hook + add filter-driven item recomputation; the
 * `getItems()` accessor is what makes that possible (the hook re-queries on each keystroke).
 */

/** A list-keyboard "item" — must expose a stable `id`, a `textValue` for type-ahead, and a `disabled` flag. */
export interface ListKeyboardItem {
  id: string;
  textValue: string;
  disabled: boolean;
}

export interface UseListKeyboardOptions<T extends ListKeyboardItem = ListKeyboardItem> {
  /** Returns items in DOM order; the hook re-queries on each key press so dynamic lists work. */
  getItems: () => T[];
  /** Reads the currently highlighted id. */
  getHighlightedId: () => string | null;
  /** Updates the highlighted id (or clears it with `null`). */
  setHighlightedId: (id: string | null) => void;
  /** Whether arrow-key navigation wraps. */
  loop: boolean;
  /** Whether type-ahead prefix matching is active. */
  typeAhead: boolean;
  /** Called for Esc + Tab. */
  onClose: () => void;
  /** Called for Enter / Space on the highlighted item. */
  onSelect: (id: string) => void;
  /** Called for Right arrow when the highlighted item should open a submenu. Optional. */
  onOpenSub?: (id: string) => void;
  /** Called for Left arrow inside a submenu (close it). Optional. */
  onCloseSub?: () => void;
}

export type ListKeyHandler = (event: KeyboardEvent<HTMLElement>) => void;

/**
 * Type-ahead buffer window in ms. Material / Radix / Reach all converge on 500ms; users perceive
 * the menu as "snapping back to the top" if we go shorter, and the buffer feels like it never
 * clears if we go longer.
 */
const TYPEAHEAD_TIMEOUT_MS = 500;

/**
 * "Same letter twice" detection: with a single-character buffer, pressing the same letter again
 * cycles through items that *start* with that letter rather than appending. Universal macOS /
 * Windows menu behavior.
 */
function isCycleRepeat(buffer: string, key: string): boolean {
  return buffer.length === 1 && buffer === key.toLowerCase();
}

/**
 * Returns the index of the first enabled item whose `textValue` starts with `prefix`
 * (case-insensitive), beginning *after* `fromIndex`. Wraps around. Returns -1 if none found.
 */
function findPrefixMatch<T extends ListKeyboardItem>(
  items: T[],
  prefix: string,
  fromIndex: number,
): number {
  const lower = prefix.toLowerCase();
  const n = items.length;
  if (n === 0) return -1;
  for (let i = 0; i < n; i++) {
    const idx = (fromIndex + 1 + i) % n;
    const item = items[idx];
    if (!item) continue;
    if (item.disabled) continue;
    if (item.textValue.toLowerCase().startsWith(lower)) return idx;
  }
  return -1;
}

/**
 * Build the keyboard handler. Translates:
 *
 *  - ArrowDown / ArrowUp  → highlight next / previous enabled item (with optional loop).
 *  - Home / End           → first / last enabled item.
 *  - Enter / Space        → select the highlighted item via `onSelect`.
 *  - Escape               → `onClose` (consumers wire escape-stack at the engine level).
 *  - Tab / Shift+Tab      → `onClose` (matches platform menu convention; we do NOT preventDefault
 *    so the consumer's focus order continues naturally).
 *  - ArrowRight           → `onOpenSub` if provided (Menu's submenu case).
 *  - ArrowLeft            → `onCloseSub` if provided (Menu's submenu case).
 *  - Printable character  → type-ahead prefix match against `textValue`s.
 */
export function useListKeyboard<T extends ListKeyboardItem = ListKeyboardItem>(
  opts: UseListKeyboardOptions<T>,
): ListKeyHandler {
  const {
    getItems,
    getHighlightedId,
    setHighlightedId,
    loop,
    typeAhead,
    onClose,
    onSelect,
    onOpenSub,
    onCloseSub,
  } = opts;

  const typeAheadBufferRef = useRef('');
  const typeAheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleTypeAheadClear = useCallback(() => {
    if (typeAheadTimerRef.current !== null) clearTimeout(typeAheadTimerRef.current);
    typeAheadTimerRef.current = setTimeout(() => {
      typeAheadBufferRef.current = '';
      typeAheadTimerRef.current = null;
    }, TYPEAHEAD_TIMEOUT_MS);
  }, []);

  return useCallback<ListKeyHandler>(
    (event: KeyboardEvent<HTMLElement>) => {
      const key = event.key;
      const items = getItems();

      const highlightedId = getHighlightedId();
      const currentIndex = highlightedId
        ? items.findIndex((it) => it.id === highlightedId)
        : -1;

      switch (key) {
        case 'ArrowDown': {
          event.preventDefault();
          if (items.length === 0) return;
          let nextIndex = currentIndex + 1;
          if (nextIndex >= items.length) nextIndex = loop ? 0 : items.length - 1;
          setHighlightedId(items[nextIndex]?.id ?? null);
          return;
        }

        case 'ArrowUp': {
          event.preventDefault();
          if (items.length === 0) return;
          let prevIndex = currentIndex - 1;
          if (prevIndex < 0) prevIndex = loop ? items.length - 1 : 0;
          setHighlightedId(items[prevIndex]?.id ?? null);
          return;
        }

        case 'Home': {
          event.preventDefault();
          if (items.length === 0) return;
          setHighlightedId(items[0]?.id ?? null);
          return;
        }

        case 'End': {
          event.preventDefault();
          if (items.length === 0) return;
          setHighlightedId(items[items.length - 1]?.id ?? null);
          return;
        }

        case 'Enter':
        case ' ': {
          // Space and Enter both commit; preventDefault stops Space from scrolling.
          if (currentIndex < 0) return;
          const target = items[currentIndex];
          if (!target) return;
          event.preventDefault();
          onSelect(target.id);
          return;
        }

        case 'Escape': {
          event.preventDefault();
          onClose();
          return;
        }

        case 'Tab': {
          // Platform convention — Tab closes the list and lets the page receive focus. We do NOT
          // preventDefault so the consumer's focus order continues naturally.
          onClose();
          return;
        }

        case 'ArrowRight': {
          if (currentIndex < 0) return;
          const target = items[currentIndex];
          if (!target) return;
          if (onOpenSub) {
            event.preventDefault();
            onOpenSub(target.id);
          }
          return;
        }

        case 'ArrowLeft': {
          if (onCloseSub) {
            event.preventDefault();
            onCloseSub();
          }
          return;
        }

        default: {
          // Type-ahead: only single printable characters (no modifier combos). Skip if typeAhead
          // is disabled or the key is a control key (length !== 1).
          if (!typeAhead) return;
          if (event.ctrlKey || event.metaKey || event.altKey) return;
          if (key.length !== 1) return;

          const lower = key.toLowerCase();
          const buffer = typeAheadBufferRef.current;

          if (isCycleRepeat(buffer, lower)) {
            const matchIdx = findPrefixMatch(items, lower, currentIndex);
            const matchItem = matchIdx >= 0 ? items[matchIdx] : undefined;
            if (matchItem) {
              event.preventDefault();
              setHighlightedId(matchItem.id);
            }
            scheduleTypeAheadClear();
            return;
          }

          const nextBuffer = buffer + lower;
          typeAheadBufferRef.current = nextBuffer;
          const matchIdx = findPrefixMatch(items, nextBuffer, -1);
          const matchItem = matchIdx >= 0 ? items[matchIdx] : undefined;
          if (matchItem) {
            event.preventDefault();
            setHighlightedId(matchItem.id);
          }
          scheduleTypeAheadClear();
        }
      }
    },
    [
      getItems,
      getHighlightedId,
      setHighlightedId,
      loop,
      typeAhead,
      onClose,
      onSelect,
      onOpenSub,
      onCloseSub,
      scheduleTypeAheadClear,
    ],
  );
}

/** Exported solely for unit-test introspection — not part of the public API. */
export const __INTERNAL = {
  findPrefixMatch,
  isCycleRepeat,
  TYPEAHEAD_TIMEOUT_MS,
};
