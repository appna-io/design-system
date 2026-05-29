import { useId as reactUseId } from 'react';

/**
 * SSR-safe stable id with an optional consumer-provided override. If `providedId` is supplied it's
 * returned as-is; otherwise React's built-in `useId` is used.
 *
 * @example
 *   const id = useId(props.id);
 *   const labelId = `${id}-label`;
 */
export function useId(providedId?: string): string {
  const generated = reactUseId();
  return providedId ?? generated;
}
