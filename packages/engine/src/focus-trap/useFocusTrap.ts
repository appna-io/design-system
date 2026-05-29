import { useEffect, useRef, type RefObject } from 'react';
import { getFocusableBoundaries, getFocusableElements } from './focusable';

export interface UseFocusTrapOptions {
  /** When `false`, the trap is dormant — no listeners, no focus moves. */
  active: boolean;
  /**
   * Where to focus when the trap activates. Either a ref to the desired element, or a function
   * that returns one (handy when the element doesn't exist yet at hook-time). When omitted, the
   * first focusable descendant is focused — or the container itself (with `tabIndex={-1}`) when
   * there are none.
   */
  initialFocus?: RefObject<HTMLElement | null> | (() => HTMLElement | null) | undefined;
  /**
   * Where to return focus when the trap deactivates. Defaults to whatever was focused when the
   * trap activated, which is what every overlay component wants.
   */
  finalFocus?: RefObject<HTMLElement | null> | (() => HTMLElement | null) | undefined;
  /** Default: `true`. Disable when the consumer wants to manage return-focus manually. */
  returnFocusOnDeactivate?: boolean | undefined;
}

/**
 * Resolve a `RefObject | () => element` initialFocus / finalFocus argument to an element.
 */
function resolveTarget(
  target: RefObject<HTMLElement | null> | (() => HTMLElement | null) | undefined,
): HTMLElement | null {
  if (!target) return null;
  if (typeof target === 'function') return target();
  return target.current;
}

/**
 * Trap focus inside `containerRef` while `active` is true.
 *
 * - On activation: store `document.activeElement` (for return-focus), then move focus to
 *   `initialFocus` (or the first focusable child, or the container itself).
 * - While active: a `keydown` listener intercepts Tab/Shift+Tab and wraps focus around the
 *   container's boundaries; a `focusin` listener catches focus that leaks out (e.g. via a
 *   programmatic `.focus()` outside) and pushes it back to the first focusable child.
 * - On deactivation: restore focus to the saved element (or to `finalFocus` if provided).
 *
 * Hand-rolled (no `focus-trap-react` dep) because the DS only needs the canonical 80% — no
 * shadow DOM, no inert ancestors, no positive-tabindex sorting. Adding those edge cases later is
 * a one-file extension here.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  options: UseFocusTrapOptions,
): void {
  const { active, initialFocus, finalFocus, returnFocusOnDeactivate = true } = options;

  // Refs avoid stale closures inside the listeners while keeping the effect's dep array minimal.
  const initialFocusRef = useRef(initialFocus);
  const finalFocusRef = useRef(finalFocus);
  initialFocusRef.current = initialFocus;
  finalFocusRef.current = finalFocus;

  useEffect(() => {
    if (!active) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;
    if (typeof document === 'undefined') return undefined;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Every `.focus()` inside the trap is called with `preventScroll: true`. Overlays activate
    // their trap synchronously on open, but their floating element gets its real `top`/`left`
    // one frame later (Floating UI measures inside a `useLayoutEffect`, runs after the
    // current commit). For that one frame the container lives at (0, 0); without
    // `preventScroll`, the browser would scrollIntoView the focused container and snap the
    // page to scrollTop=0. Reported by Ahmad against Popover (2026-05-24); the same bug
    // would affect Menu / Drawer / Select / Combobox the moment they auto-focus.
    const focus = (el: HTMLElement): void => {
      el.focus({ preventScroll: true });
    };

    // Move initial focus. If there are no focusable descendants we focus the container itself —
    // it must have `tabIndex={-1}` for that to actually work; the consumer is expected to set
    // that on the wrapper they pass to us. The `<FocusTrap>` component does this automatically.
    const explicit = resolveTarget(initialFocusRef.current);
    if (explicit) {
      focus(explicit);
    } else {
      const all = getFocusableElements(container);
      if (all.length > 0) {
        focus(all[0]!);
      } else {
        focus(container);
      }
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Tab') return;
      const boundaries = getFocusableBoundaries(container);
      if (!boundaries) {
        // No focusables — keep focus on the container itself.
        event.preventDefault();
        focus(container);
        return;
      }
      const { first, last } = boundaries;
      const activeEl = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (activeEl === first || !container.contains(activeEl)) {
          event.preventDefault();
          focus(last);
        }
      } else {
        if (activeEl === last || !container.contains(activeEl)) {
          event.preventDefault();
          focus(first);
        }
      }
    };

    const handleFocusIn = (event: FocusEvent): void => {
      const target = event.target as Node | null;
      if (!target || container.contains(target)) return;
      // Focus escaped the trap (e.g. a programmatic .focus() in another part of the app). Pull it
      // back. Prefer the first focusable; fall back to the container for empty traps.
      const all = getFocusableElements(container);
      if (all.length > 0) {
        focus(all[0]!);
      } else {
        focus(container);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
      if (!returnFocusOnDeactivate) return;
      const explicitFinal = resolveTarget(finalFocusRef.current);
      const restoreTarget = explicitFinal ?? previouslyFocused ?? null;
      if (restoreTarget && typeof restoreTarget.focus === 'function') {
        // Defer to the next microtask to let the unmount finish before returning focus, otherwise
        // React occasionally moves focus back to body in between. `preventScroll: true` matches
        // the trap-active focuses above so closing an overlay never jumps the page.
        queueMicrotask(() => restoreTarget.focus({ preventScroll: true }));
      }
    };
  }, [active, containerRef, returnFocusOnDeactivate]);
}
