'use client';

import {
  resolveRovingNextIndex,
  useRovingTabindexDom,
  type RovingItem,
  type UseRovingTabindexDomReturn,
} from '@apx-ui/engine';
import type { RefObject } from 'react';

import type { ToolbarOrientation } from './Toolbar.types';

/**
 * Phase 58 RFC #1 — Toolbar's roving-tabindex implementation now lives in
 * `@apx-ui/engine`'s `useRovingTabindexDom`. This file is the Toolbar-shaped wrapper:
 *
 *  - `useToolbarKeyboard` returns the capture-phase handler the Toolbar root binds via
 *    `onKeyDownCapture`. Behavior is byte-identical to the previous local implementation
 *    (Toolbar's 68 tests gate this).
 *  - `resolveNextToolbarIndex` stays exported as a backwards-compatible alias over
 *    `resolveRovingNextIndex` so external consumers (and the existing unit tests under
 *    `useToolbarKeyboard.test.ts`) continue to work without rewrites.
 *  - The MutationObserver + focusin tracking that previously lived in `useToolbarRoving` is
 *    now owned by the engine hook (`observe: true` is the default).
 */

export function useToolbarKeyboard(args: {
  rootRef: RefObject<HTMLDivElement | null>;
  orientation: ToolbarOrientation;
  loop: boolean;
  /**
   * A token that bumps when the inline child list could have changed (overflow recount,
   * applyTooltips re-render). Drives the engine hook's roving-tabindex pass as an effect
   * dependency so dynamically inserted items pick up `tabindex` immediately.
   */
  renderToken?: unknown;
}): UseRovingTabindexDomReturn['onKeyDownCapture'] {
  const { rootRef, orientation, loop, renderToken } = args;

  const { onKeyDownCapture } = useRovingTabindexDom({
    rootRef,
    orientation,
    loop,
    rtlAware: true,
    // Toolbar's pre-existing skip boundary — items inside `[data-toolbar-skip]` are excluded
    // from the focusable set (overflow menu trigger, separators, spacers).
    skipBoundarySelector: '[data-toolbar-skip="true"]',
    observe: true,
    ignoreTextInputs: true,
    renderToken,
  });

  return onKeyDownCapture;
}

/**
 * Backwards-compatible pure resolver. Wraps the engine's `resolveRovingNextIndex` while
 * preserving the toolbar's original `(items, focused)` signature.
 *
 * Continues to handle the "focus lives on a descendant of an item" case via the same upward
 * walk the local impl used. Returns `-1` for keys the resolver doesn't own.
 *
 * @deprecated Prefer `resolveRovingNextIndex` from `@apx-ui/engine` for new code.
 */
export function resolveNextToolbarIndex(args: {
  items: HTMLElement[];
  focused: HTMLElement | null;
  key: string;
  orientation: ToolbarOrientation;
  isRtl: boolean;
  loop: boolean;
}): number {
  const { items, focused, key, orientation, isRtl, loop } = args;
  if (items.length === 0) return -1;

  // Walk up from a focused descendant to find the enclosing toolbar item.
  let focusedIndex = -1;
  if (focused) {
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it) continue;
      if (it === focused || it.contains(focused)) {
        focusedIndex = i;
        break;
      }
    }
  }

  const rovingItems: RovingItem[] = items.map((el) => ({ id: el }));
  return resolveRovingNextIndex({
    items: rovingItems,
    focusedIndex,
    key,
    orientation,
    isRtl,
    loop,
  });
}
