import { useEffect, useId, useRef } from 'react';

export interface UseEscapeStackOptions {
  /**
   * When `false`, this consumer is not part of the stack — equivalent to unmounting it. Useful for
   * `open`-driven overlays that mount once and toggle visibility.
   */
  active: boolean;
  /** Called when Escape is pressed AND this consumer is the topmost active entry. */
  onEscape: () => void;
  /**
   * Optional explicit priority. Higher number wins. When omitted, mount order is used: the most
   * recently registered consumer is the topmost. This matches the natural "nested overlay closes
   * inner first" behaviour without any extra wiring.
   */
  priority?: number | undefined;
}

interface StackEntry {
  id: string;
  onEscape: () => void;
  priority: number;
  /** Monotonic mount counter — used as a tiebreaker so equal-priority consumers still resolve in mount order. */
  order: number;
}

/**
 * Module-level singleton stack. Lives at the module scope (not inside React state) so the global
 * keydown listener can read the current topmost handler without re-renders. We expose a few
 * private helpers below the public hook for testing.
 */
let stack: StackEntry[] = [];
let mountCounter = 0;
let listenerAttached = false;

function getTopmost(): StackEntry | undefined {
  if (stack.length === 0) return undefined;
  let top = stack[0]!;
  for (let i = 1; i < stack.length; i += 1) {
    const entry = stack[i]!;
    if (
      entry.priority > top.priority ||
      (entry.priority === top.priority && entry.order > top.order)
    ) {
      top = entry;
    }
  }
  return top;
}

function handleKeyDown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return;
  const top = getTopmost();
  if (!top) return;
  top.onEscape();
}

function ensureListener(): void {
  if (listenerAttached) return;
  if (typeof document === 'undefined') return;
  document.addEventListener('keydown', handleKeyDown);
  listenerAttached = true;
}

function maybeDetachListener(): void {
  if (!listenerAttached) return;
  if (stack.length > 0) return;
  if (typeof document === 'undefined') return;
  document.removeEventListener('keydown', handleKeyDown);
  listenerAttached = false;
}

/**
 * Register an Escape handler in the global escape-stack. Only the topmost active entry receives
 * the keystroke, which makes nested overlays (Modal → Popover → Tooltip) close in the right order
 * without any per-component coordination.
 *
 * Implementation choices:
 * - Module-level stack so the keydown listener is attached **once** (not per consumer).
 * - `active=false` deregisters without unmount — useful for `open`-driven overlays.
 * - `priority` is optional; mount order is the default and is correct for the common nested case.
 */
export function useEscapeStack({ active, onEscape, priority }: UseEscapeStackOptions): void {
  const id = useId();
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!active) return undefined;

    mountCounter += 1;
    const entry: StackEntry = {
      id,
      onEscape: () => onEscapeRef.current(),
      priority: priority ?? 0,
      order: mountCounter,
    };
    stack.push(entry);
    ensureListener();

    return () => {
      stack = stack.filter((e) => e.id !== id);
      maybeDetachListener();
    };
  }, [active, id, priority]);
}

/**
 * Test-only helpers. Exposed so unit tests can assert internal state (current depth, listener
 * attachment) without exporting the singleton itself. Not part of the public package surface.
 */
export const __escapeStackInternals = {
  getStackSize: (): number => stack.length,
  isListenerAttached: (): boolean => listenerAttached,
  reset: (): void => {
    stack = [];
    mountCounter = 0;
    if (listenerAttached && typeof document !== 'undefined') {
      document.removeEventListener('keydown', handleKeyDown);
    }
    listenerAttached = false;
  },
};