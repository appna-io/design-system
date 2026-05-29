import { useRef } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

/**
 * Returns the previous value of `value` as seen on the prior render. Returns `undefined` on the
 * first render.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
