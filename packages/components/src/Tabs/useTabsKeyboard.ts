'use client';

import { useCallback, type KeyboardEventHandler } from 'react';
import { useRovingTabindexRegistry, type RovingItem } from '@apx-ui/engine';

import type { TabsContextValue } from './Tabs.types';

/**
 * W3C ARIA Tabs pattern keyboard handler.
 *
 * Phase 58 RFC #1 migration: this hook is now a thin wrapper over
 * `useRovingTabindexRegistry` from `@apx-ui/engine`. The Tabs context provides the
 * registry-shaped accessors (`getOrderedEnabledValues`, `focusValue`, `setValue`); the engine
 * hook owns the arrow / Home / End / RTL / loop / manual-vs-automatic-activation logic.
 *
 * Behavior is byte-identical to the previous component-local implementation:
 *
 *  - `ArrowRight` / `ArrowLeft` — horizontal axis only; RTL flips the direction.
 *  - `ArrowUp` / `ArrowDown` — vertical axis only.
 *  - `Home` / `End` — jump to first / last enabled trigger.
 *  - `Enter` / `Space` — explicit activation in manual mode (automatic mode lets the native
 *    button click handle activation; this hook intentionally doesn't preventDefault then).
 *  - Disabled triggers are skipped (already filtered out by `ctx.getOrderedEnabledValues()`).
 *
 * Each `<Tabs.Trigger>` calls this hook with its own `triggerValue`. Because each trigger's
 * `onKeyDown` only fires when that trigger has focus, the "focused id" for the registry is
 * just the trigger's own value — no separate focus-tracking state needed.
 */
export function useTabsKeyboard(
  ctx: TabsContextValue,
  triggerValue: string,
): KeyboardEventHandler<HTMLButtonElement> {
  const getItems = useCallback(
    (): RovingItem[] => ctx.getOrderedEnabledValues().map((v) => ({ id: v })),
    [ctx],
  );

  const getFocusedId = useCallback((): string => triggerValue, [triggerValue]);

  const focusItem = useCallback(
    (id: string | HTMLElement) => {
      if (typeof id === 'string') ctx.focusValue(id);
    },
    [ctx],
  );

  const onActivate = useCallback(
    (id: string | HTMLElement) => {
      if (typeof id !== 'string') return;
      // Preserve the original guard: don't re-fire `onValueChange` when the activated id is
      // already the active one. The native button click handler in `<Tabs.Trigger>` enforces
      // the same guard for mouse activation; keeping it here keeps keyboard parity.
      if (ctx.value === id) return;
      ctx.setValue(id);
    },
    [ctx],
  );

  const { onKeyDown } = useRovingTabindexRegistry({
    orientation: ctx.orientation === 'horizontal' ? 'horizontal' : 'vertical',
    activation: ctx.activation,
    loop: true,
    rtlAware: true,
    getItems,
    getFocusedId,
    focusItem,
    onActivate,
  });

  // The engine hook returns a `KeyboardEventHandler<Element>`; trigger binds to a
  // `HTMLButtonElement` callsite so the cast is a no-op widening at the type layer.
  return onKeyDown as KeyboardEventHandler<HTMLButtonElement>;
}
