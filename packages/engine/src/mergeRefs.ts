import type { Ref } from 'react';

/**
 * Combine an arbitrary set of refs (callback or object) into a single callback ref. Each ref
 * receives the same node (or `null` on unmount). Falsy refs are skipped.
 *
 * Why it lives here: every overlay compound (Tooltip, Popover, Modal, Drawer, …) needs to fan a
 * single DOM node out to the component's own internal ref + a `forwardRef`'d ref + sometimes the
 * trigger context's ref. Each consumer was previously redeclaring this helper inline. Three
 * consumers → engine promotion. The shape is stable: an array of refs in, a single callback ref out.
 *
 * @example
 *   const composedRef = mergeRefs(localRef, forwardedRef, ctx.triggerRef);
 *   return <button ref={composedRef} />;
 */
export function mergeRefs<T>(
  ...refs: Array<Ref<T> | undefined>
): (node: T | null) => void {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        // React's `MutableRefObject` is what `useRef<T>()` returns. The cast is safe because we
        // checked the function-vs-object branch above.
        (ref as { current: T | null }).current = node;
      }
    }
  };
}