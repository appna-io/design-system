'use client';

import { useCallback, useRef, type KeyboardEventHandler } from 'react';

import type {
  NavigationMenuContextValue,
  NavigationMenuItemRecord,
  NavigationMenuOrientation,
} from './NavigationMenu.types';

/**
 * W3C ARIA Menubar pattern keyboard handler — top-level (i.e. fires when focus
 * is on a Trigger or Link inside the menubar itself, NOT inside an open dropdown
 * panel).
 *
 *   - `ArrowLeft` / `ArrowRight` — previous / next top-level item (LTR). Wraps.
 *     Direction flipped under RTL. Vertical menus map these to in-axis arrows.
 *   - `ArrowUp` / `ArrowDown` — open the dropdown if the item has one (Down) or
 *     close it (Up). For vertical menus these become previous / next.
 *   - `Home` / `End` — first / last item.
 *   - `Enter` / `Space` — activate the link / toggle the dropdown. We let the
 *     native click handler do this for triggers (we don't preventDefault on
 *     Enter/Space here for buttons), so this hook only wires it for the open-on-
 *     ArrowDown case.
 *   - `Esc` — close any open dropdown.
 *   - Type-to-search — type letters within 500ms to jump to matching items.
 *
 * **Why not the engine's `useRovingTabindexRegistry`** — Menubar needs ArrowDown
 * to *open* a dropdown rather than move focus, ArrowUp to close, plus a type-to-
 * search aggregator. Those don't fit the engine's clean roving-tabindex contract.
 * We hand-roll it here; if a third "Menubar-shaped" consumer materialises (Menu
 * Phase 22 already partially overlaps), we promote a `useMenubarKeyboard` to the
 * `_shared/` folder.
 */
export interface UseNavMenuKeyboardArgs {
  ctx: NavigationMenuContextValue;
  /** This element's id — distinguishes the focus-source from the registered set. */
  itemId: string;
  /** Whether this trigger has a dropdown panel; affects ArrowDown semantics. */
  hasContent: boolean;
  /** Imperatively activate the link/trigger (used by Enter / Space when no panel). */
  onActivate?: () => void;
}

export function useNavMenuKeyboard(
  args: UseNavMenuKeyboardArgs,
): KeyboardEventHandler<HTMLElement> {
  const { ctx, itemId, hasContent, onActivate } = args;

  // Type-to-search aggregator. Letters typed within 500ms are concatenated and
  // matched against the start of each item's `label`. A 500ms window matches the
  // W3C reference impl + every native menu I've benchmarked.
  const searchBuffer = useRef('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetSearch = useCallback(() => {
    if (searchTimer.current !== null) clearTimeout(searchTimer.current);
    searchBuffer.current = '';
    searchTimer.current = null;
  }, []);

  return useCallback(
    (event) => {
      const items = ctx.getOrderedItems().filter((it) => !it.disabled);
      if (items.length === 0) return;

      const currentIndex = items.findIndex((it) => it.id === itemId);
      if (currentIndex === -1) return;

      const dir = directionForKey(event.key, ctx.orientation, isRtl(event.currentTarget));
      // dir = +1 → next in axis, -1 → previous in axis, 0 → not an axis key.

      if (dir !== 0) {
        event.preventDefault();
        event.stopPropagation();
        const nextIndex = (currentIndex + dir + items.length) % items.length;
        const next = items[nextIndex];
        if (next) ctx.focusItem(next.id);
        return;
      }

      switch (event.key) {
        case 'Home': {
          event.preventDefault();
          const first = items[0];
          if (first) ctx.focusItem(first.id);
          return;
        }
        case 'End': {
          event.preventDefault();
          const last = items[items.length - 1];
          if (last) ctx.focusItem(last.id);
          return;
        }
        case 'ArrowDown': {
          // For a horizontal menubar, ArrowDown opens a dropdown if present.
          // For a vertical menubar, ArrowDown is a next-axis key (handled above)
          // — this branch only fires for horizontal here.
          if (ctx.orientation !== 'horizontal') return;
          if (!hasContent) return;
          event.preventDefault();
          ctx.setOpenItemId(itemId, 'keyboard');
          // Focus the first link inside the panel after it mounts. The Content
          // component reads `lastOpenSource === 'keyboard'` and focuses its
          // first link automatically.
          return;
        }
        case 'ArrowUp': {
          if (ctx.orientation !== 'horizontal') return;
          // If a dropdown is currently open under this item, close it.
          if (ctx.openItemId === itemId) {
            event.preventDefault();
            ctx.setOpenItemId(null);
          }
          return;
        }
        case 'Escape': {
          if (ctx.openItemId !== null) {
            event.preventDefault();
            ctx.setOpenItemId(null);
          }
          return;
        }
        case 'Enter':
        case ' ': {
          // Triggers — open the panel (or toggle).
          if (hasContent) {
            event.preventDefault();
            ctx.setOpenItemId(ctx.openItemId === itemId ? null : itemId, 'keyboard');
            return;
          }
          // Links — let the native anchor click fire (consumer's onClick + href
          // navigation). We only call onActivate (if provided) for non-anchor
          // triggers like a `<button>` that decided not to use the dropdown.
          if (event.key === 'Enter' && onActivate) {
            // Anchor's default action handles Enter natively; for buttons we
            // call onActivate. The trigger component decides whether to invoke
            // this branch by passing onActivate (button) or omitting it (link).
            return;
          }
          return;
        }
        default: {
          // Type-to-search — single printable characters only. Modifier keys,
          // Tab, etc. fall through.
          if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
            const char = event.key.toLowerCase();
            // Reset the buffer if it's been > 500ms since the last keystroke.
            if (searchTimer.current !== null) clearTimeout(searchTimer.current);
            searchBuffer.current += char;
            searchTimer.current = setTimeout(resetSearch, 500);

            const match = findFirstMatch(items, searchBuffer.current, currentIndex);
            if (match) {
              event.preventDefault();
              ctx.focusItem(match.id);
            }
          }
        }
      }
    },
    [ctx, itemId, hasContent, onActivate, resetSearch],
  );
}

/**
 * Maps a key name to a direction `+1` / `-1` / `0`. The "axis" key depends on
 * the menubar orientation; under RTL the horizontal arrow keys swap.
 *
 * Returns `0` for non-axis keys; the caller switches on the original key for
 * those (Home / End / Enter / Esc / etc.).
 */
function directionForKey(
  key: string,
  orientation: NavigationMenuOrientation,
  rtl: boolean,
): -1 | 0 | 1 {
  if (orientation === 'horizontal') {
    if (key === 'ArrowRight') return rtl ? -1 : 1;
    if (key === 'ArrowLeft') return rtl ? 1 : -1;
    return 0;
  }
  // vertical
  if (key === 'ArrowDown') return 1;
  if (key === 'ArrowUp') return -1;
  return 0;
}

/** Returns true when the element's computed `direction` is `rtl`. */
function isRtl(el: HTMLElement | null): boolean {
  if (!el || typeof window === 'undefined') return false;
  return window.getComputedStyle(el).direction === 'rtl';
}

/**
 * Finds the first item whose label starts with `query` (case-insensitive). When
 * the current item already matches the buffer, we look starting from the *next*
 * position so repeated keypresses cycle through matches — same UX as native
 * browser menubars.
 */
function findFirstMatch(
  items: NavigationMenuItemRecord[],
  query: string,
  startIndex: number,
): NavigationMenuItemRecord | null {
  if (query.length === 0) return null;
  const len = items.length;
  for (let offset = 1; offset <= len; offset++) {
    const idx = (startIndex + offset) % len;
    const item = items[idx];
    if (!item) continue;
    if (item.label.toLowerCase().startsWith(query)) return item;
  }
  // Fallback — current item itself.
  const current = items[startIndex];
  if (current && current.label.toLowerCase().startsWith(query)) return current;
  return null;
}
