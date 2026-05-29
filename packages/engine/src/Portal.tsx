import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  children: ReactNode;
  /**
   * Where to mount the portal content. Defaults to `document.body`.
   *
   * Tri-state semantics:
   * - `undefined` → fall back to `document.body`.
   * - `null`      → "not yet ready" (e.g. waiting on a parent ref). Renders nothing.
   * - `HTMLElement` → mount inside the provided element.
   */
  container?: HTMLElement | null | undefined;
  /**
   * When `true`, renders the children inline (no portal). Useful for SSR snapshotting and tests
   * that assert markup co-located with the trigger. Toggling this at runtime moves the children
   * from inline → portal — cheap to support and occasionally needed.
   */
  disabled?: boolean;
}

/**
 * SSR-safe portal primitive. The portal target (`document.body` or the consumer-provided
 * `container`) only exists after hydration, so we defer `createPortal` until a client-side mount
 * via `useEffect`. The component returns `null` during the first render, which matches the
 * server output and prevents hydration mismatches.
 *
 * The component renders no wrapper of its own — the children are mounted directly into the
 * portal target. Consumers that need a wrapper element (for focus trap, scroll lock, etc.)
 * should provide it in their own subtree.
 */
export function Portal({ children, container, disabled = false }: PortalProps): ReactNode {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (disabled) return children;
  if (!mounted) return null;

  // `container === null` is the "not yet ready" signal — render nothing rather than falling back
  // to body. This lets a parent gate "mount inside our portal body once the ref resolves" without
  // a flash of body-level content.
  if (container === null) return null;

  const target = container ?? (typeof document !== 'undefined' ? document.body : null);
  if (!target) return null;

  return createPortal(children, target);
}
