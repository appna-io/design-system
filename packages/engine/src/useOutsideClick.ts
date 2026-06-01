import { useEffect, useRef, type RefObject } from 'react';

export interface UseOutsideClickOptions {
  /** When `false`, the listener is detached entirely — no work, no allocation. */
  active: boolean;
  /**
   * Refs that delineate the "inside" region. A pointer-down hitting any of these elements
   * (or a descendant) is treated as inside and does NOT fire `onOutside`. Multiple refs let the
   * caller mark a trigger + a portalled floating element as a unified "inside" region.
   */
  refs: ReadonlyArray<RefObject<HTMLElement | null>>;
  onOutside: (event: PointerEvent) => void;
  /**
   * Capture phase fires before bubble handlers. This is what users want for "close on outside
   * click" — the close happens before any descendant `onClick` re-opens or otherwise interferes.
   */
  capturePhase?: boolean;
}

/**
 * Pointer-down outside-the-element handler. Uses `pointerdown` (not `click`) so it fires before
 * any descendant `onClick`, matching Radix's pattern. Capture-phase by default for the same reason.
 *
 * The handler is attached only while `active` is true, so unused overlays cost nothing. Multiple
 * refs are supported: a Popover's trigger and its portalled content can both be "inside".
 */
export function useOutsideClick({
  active,
  refs,
  onOutside,
  capturePhase = true,
}: UseOutsideClickOptions): void {
  const onOutsideRef = useRef(onOutside);
  onOutsideRef.current = onOutside;

  // We snapshot the refs array so the effect's dep is stable across renders. Consumers typically
  // pass `[triggerRef, floatingRef]` as a fresh array literal each render; without this snapshot
  // the listener would be re-attached on every re-render.
  const refsRef = useRef(refs);
  refsRef.current = refs;

  useEffect(() => {
    if (!active) return undefined;
    if (typeof document === 'undefined') return undefined;

    const handler = (event: PointerEvent): void => {
      const target = event.target as Node | null;
      if (!target) return;
      const insideRefs = refsRef.current;
      for (let i = 0; i < insideRefs.length; i += 1) {
        const ref = insideRefs[i];
        const node = ref?.current;
        if (node && node.contains(target)) return;
      }
      onOutsideRef.current(event);
    };

    document.addEventListener('pointerdown', handler, capturePhase);
    return () => {
      document.removeEventListener('pointerdown', handler, capturePhase);
    };
  }, [active, capturePhase]);
}