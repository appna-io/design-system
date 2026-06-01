import { useCallback, useRef, useState } from 'react';

export interface UseControllableStateOptions<T> {
  /** The controlled value provided by the consumer (if any). Pass `undefined` to be uncontrolled. */
  value?: T | undefined;
  /** The initial value when uncontrolled. Falls back to `undefined`. */
  defaultValue?: T | undefined;
  /** Called when the value changes, in both controlled and uncontrolled modes. */
  onChange?: ((next: T) => void) | undefined;
}

/**
 * A state hook that transparently supports both controlled (`value` prop) and uncontrolled
 * (`defaultValue` prop) usage. Always returns `[currentValue, setValue]`.
 *
 * Mirrors the pattern used by Radix UI's `useControllableState`. Warns once if a component
 * transitions between controlled and uncontrolled during its lifetime (a common bug).
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>): [T | undefined, (next: T) => void] {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<T | undefined>(defaultValue);
  const wasControlled = useRef(isControlled);

  if (wasControlled.current !== isControlled && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(
      `[apx-ds] useControllableState: a component switched between controlled (${String(wasControlled.current)}) and uncontrolled (${String(isControlled)}). Decide one at mount time.`,
    );
  }
  wasControlled.current = isControlled;

  const current = isControlled ? value : internal;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [current, setValue];
}