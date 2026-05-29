import { forwardRef as reactForwardRef } from 'react';
import type { ForwardedRef, ReactElement, RefAttributes } from 'react';

/**
 * Thin wrapper around `React.forwardRef` that:
 *  - Preserves generic prop types better than the built-in (no `PropsWithoutRef` widening).
 *  - Accepts a `displayName` second argument so DevTools shows useful names.
 *
 * Use this in every DS component instead of `React.forwardRef`.
 */
export function forwardRef<T, P = object>(
  render: (props: P, ref: ForwardedRef<T>) => ReactElement | null,
  displayName?: string,
): ((props: P & RefAttributes<T>) => ReactElement | null) & { displayName?: string } {
  const Component = reactForwardRef(render as never) as unknown as ((
    props: P & RefAttributes<T>,
  ) => ReactElement | null) & { displayName?: string };
  if (displayName) Component.displayName = displayName;
  return Component;
}
