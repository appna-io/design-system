'use client';

import { useCallback, type KeyboardEvent } from 'react';

import type { AccordionRootContextValue } from './Accordion.types';

/**
 * W3C ARIA Accordion pattern keyboard handler. Wraps the keyboard navigation between sibling
 * `<Accordion.Trigger>` buttons inside a single `<Accordion>`:
 *
 *  - `ArrowDown` / `ArrowUp`: move focus to the next / previous **enabled** trigger,
 *    wrapping at the edges. Disabled items are skipped.
 *  - `Home`: focus the first enabled trigger.
 *  - `End`: focus the last enabled trigger.
 *  - `Enter` / `Space`: native `<button>` activation handles toggling — we don't intercept.
 *  - `Tab` / `Shift+Tab`: exits the accordion to the next focusable element on the page;
 *    we deliberately don't trap focus.
 *
 * The hook is **local to Accordion** (per the plan's DRY self-check) until a third consumer
 * needs the same arrow-list pattern; only then should it be promoted to `_shared/`. Menu and
 * Select have non-trivial differences (typeahead, async items) that argue against premature
 * extraction.
 */
export function useAccordionKeyboard(root: AccordionRootContextValue, itemValue: string) {
  return useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      const { key } = event;
      if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') {
        return;
      }
      const enabled = root.getOrderedEnabledValues();
      if (enabled.length === 0) return;

      event.preventDefault();

      let nextValue: string;
      if (key === 'Home') {
        nextValue = enabled[0]!;
      } else if (key === 'End') {
        nextValue = enabled[enabled.length - 1]!;
      } else {
        // Direction-aware step. Wrap at the edges so users on long FAQ lists can cycle
        // from the last trigger back to the first without lifting focus.
        const currentIndex = enabled.indexOf(itemValue);
        const step = key === 'ArrowDown' ? 1 : -1;
        const safeIndex = currentIndex < 0 ? 0 : currentIndex;
        const nextIndex = (safeIndex + step + enabled.length) % enabled.length;
        nextValue = enabled[nextIndex]!;
      }

      root.focusValue(nextValue);
    },
    [root, itemValue],
  );
}