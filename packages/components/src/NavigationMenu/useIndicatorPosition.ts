'use client';

import { useEffect, useState, type RefObject } from 'react';
import { useIsomorphicLayoutEffect } from '@apx-ui/engine';

import type { NavigationMenuOrientation } from './NavigationMenu.types';

/**
 * The geometry the Indicator needs to position itself relative to the root.
 *
 *   - `x` / `y` — offset from the root's content-box origin (logical, NOT
 *     physical — RTL math is centralised here so the recipe just consumes
 *     `transform: translate(...)` directly).
 *   - `w` / `h` — span of the focused item.
 *   - `rtl`     — true when the root is laid out right-to-left. Used by the
 *     transform to write `translateX(-x)` instead of `translateX(x)` for
 *     horizontal menus.
 */
export interface IndicatorRect {
  x: number;
  y: number;
  w: number;
  h: number;
  rtl: boolean;
}

export interface UseIndicatorPositionArgs {
  /** Live ref to the root `<nav>` element. */
  rootRef: RefObject<HTMLElement | null>;
  /** The id of the item the indicator should track (active or focused). */
  targetId: string | null;
  /** Layout axis. Determines which dimension the indicator slides along. */
  orientation: NavigationMenuOrientation;
}

/**
 * Computes the rectangle of the target item relative to the root, with a
 * `ResizeObserver` re-measuring on root resize (responsive layouts) and a
 * `MutationObserver` re-measuring on item-list changes (mounting / unmounting
 * triggers, label edits, language switches).
 *
 * Returns `null` when:
 *   - SSR / no `targetId` — the Indicator should be invisible.
 *   - The target id has no matching `[data-nav-item-id]` element under the root.
 *
 * **Why `useLayoutEffect`** — the Indicator must paint at the right place on the
 * very first frame. `useEffect` would let one frame slip with the indicator at
 * (0,0). The engine `useIsomorphicLayoutEffect` falls back to `useEffect` on the
 * server so SSR doesn't warn.
 */
export function useIndicatorPosition(args: UseIndicatorPositionArgs): IndicatorRect | null {
  const { rootRef, targetId, orientation } = args;
  const [rect, setRect] = useState<IndicatorRect | null>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !targetId) {
      setRect(null);
      return;
    }

    const measure = (): void => {
      const target = root.querySelector<HTMLElement>(`[data-nav-item-id="${cssEscape(targetId)}"]`);
      if (!target) {
        setRect(null);
        return;
      }
      const rootRect = root.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      // Detect RTL via computed direction. We read from the root rather than the
      // target so a single source-of-truth survives the LTR-island-inside-RTL-page
      // edge case (the root is what the indicator anchors against).
      const rtl = window.getComputedStyle(root).direction === 'rtl';

      // Logical X: distance from the root's logical start edge to the target's
      // logical start edge. In LTR that's `target.left - root.left`; in RTL it's
      // `root.right - target.right` (so positive x always means "further from
      // start"). We then write `transform: translateX(x)` and rely on the writing
      // mode for direction — but since `transform` is direction-agnostic, we
      // expose `rtl` to the consumer so they can flip the sign when needed.
      const x = rtl
        ? rootRect.right - targetRect.right
        : targetRect.left - rootRect.left;
      const y = targetRect.top - rootRect.top;

      // Avoid spurious re-renders when geometry didn't change. `setRect` is
      // referentially compared so we shallow-compare numerically here.
      setRect((prev) => {
        if (
          prev &&
          prev.x === x &&
          prev.y === y &&
          prev.w === targetRect.width &&
          prev.h === targetRect.height &&
          prev.rtl === rtl
        ) {
          return prev;
        }
        return { x, y, w: targetRect.width, h: targetRect.height, rtl };
      });
    };

    measure();

    // Re-measure on root resize (responsive layouts) AND on item DOM changes
    // (a Trigger mounting / unmounting changes neighbour widths in a flex row).
    const ro = new ResizeObserver(measure);
    ro.observe(root);

    const mo = new MutationObserver(measure);
    mo.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-nav-item-id', 'data-active', 'data-disabled'],
    });

    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [rootRef, targetId, orientation]);

  // Ensure indicator hides when target disappears mid-flight (e.g. Item unmounts).
  useEffect(() => {
    if (!targetId) setRect(null);
  }, [targetId]);

  return rect;
}

/**
 * Minimal CSS.escape polyfill — `CSS.escape` is supported everywhere we ship,
 * but `useId`-generated values include `:` which the spec already escapes; we
 * still wrap defensively so a consumer-supplied id with quirky characters
 * doesn't break the selector lookup.
 */
function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/(["\\\]\s])/g, '\\$1');
}
