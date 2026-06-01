'use client';

import { useCallback } from 'react';
import { useControllableState } from '@apx-ui/engine';

/**
 * Shared state machine for `<ToggleGroup>`. Wraps `useControllableState` and exposes a binary
 * `isPressed(value)` + `toggle(value)` pair that handles both single-select (radio-like) and
 * multi-select (checkbox-like) semantics.
 *
 *  - **Single**: `toggle(v)` swaps the active value. If `required` is set, clicking the active
 *    item is a no-op (one item is always pressed). Otherwise clicking the active item clears
 *    the selection (`value = ''`).
 *  - **Multiple**: `toggle(v)` adds or removes `v` from the array.
 *
 * The hook is local to the Toggle phase. Accordion's value plumbing has a different shape
 * (DOM-order-aware focus registry), and the Radio/Checkbox state machines live in their own
 * components — extracting a shared `useGroupValue` is premature until a third consumer with
 * the same shape needs it.
 */
export interface UseToggleGroupOptions {
  type: 'single' | 'multiple';
  value?: string | string[] | undefined;
  defaultValue?: string | string[] | undefined;
  onValueChange?: ((value: string | string[]) => void) | undefined;
  required?: boolean | undefined;
}

export interface UseToggleGroupReturn {
  value: string | string[];
  isPressed: (value: string) => boolean;
  toggle: (value: string) => void;
}

export function useToggleGroup({
  type,
  value: valueProp,
  defaultValue,
  onValueChange,
  required = false,
}: UseToggleGroupOptions): UseToggleGroupReturn {
  // Both branches start with a different fallback to keep the `value` type honest at the
  // first render — multi-mode gets `[]`, single gets `''`.
  const fallback: string | string[] = type === 'multiple' ? [] : '';
  const [valueRaw, setValueRaw] = useControllableState<string | string[]>({
    value: valueProp,
    defaultValue: defaultValue ?? fallback,
    onChange: onValueChange,
  });
  const value = valueRaw ?? fallback;

  const isPressed = useCallback(
    (candidate: string) => {
      if (type === 'multiple') {
        return Array.isArray(value) && value.includes(candidate);
      }
      return value === candidate;
    },
    [type, value],
  );

  const toggle = useCallback(
    (candidate: string) => {
      if (type === 'multiple') {
        const arr = Array.isArray(value) ? value : [];
        const next = arr.includes(candidate)
          ? arr.filter((v) => v !== candidate)
          : [...arr, candidate];
        setValueRaw(next);
        return;
      }
      const current = typeof value === 'string' ? value : '';
      if (current === candidate) {
        if (required) return; // single + required: clicking the active item is a no-op.
        setValueRaw('');
      } else {
        setValueRaw(candidate);
      }
    },
    [type, value, required, setValueRaw],
  );

  return { value, isPressed, toggle };
}