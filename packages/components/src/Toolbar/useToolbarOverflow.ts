'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Pure measurement step extracted so unit tests can exercise it without a live ResizeObserver.
 *
 * Walks the DOM-order children of `itemsContainer`, summing their `offsetWidth + gap` until the
 * running total exceeds `availableWidth - reservedTriggerWidth`. The first child that doesn't
 * fit (and every child after it) is considered overflowed.
 *
 * `itemsContainer` is the element whose direct element children represent the inline items —
 * the trigger placeholder is excluded from the walk because it's measured separately via
 * `reservedTriggerWidth`. The result is clamped to `[0, totalItems]` so an unrealistic input
 * (negative width, e.g. during a layout shift) doesn't yield a negative count.
 */
export function measureOverflowCount(args: {
  itemsContainer: HTMLElement;
  availableWidth: number;
  reservedTriggerWidth: number;
  gap: number;
}): number {
  const { itemsContainer, availableWidth, reservedTriggerWidth, gap } = args;
  const children = Array.from(itemsContainer.children) as HTMLElement[];
  const total = children.length;
  if (total === 0) return 0;
  if (availableWidth <= 0) return total;

  // Optimistic pass: do all children fit without the trigger?
  let sum = 0;
  for (let i = 0; i < children.length; i++) {
    sum += children[i]!.offsetWidth;
    if (i > 0) sum += gap;
  }
  if (sum <= availableWidth) return 0;

  // Pessimistic pass: items must coexist with the menu trigger. Walk from the start and count
  // how many fit alongside the reserved trigger width.
  const budget = availableWidth - reservedTriggerWidth;
  if (budget <= 0) return total;
  let running = 0;
  for (let i = 0; i < children.length; i++) {
    const next = running + children[i]!.offsetWidth + (i === 0 ? 0 : gap);
    if (next > budget) return total - i;
    running = next;
  }
  return 0;
}

/**
 * React hook that returns the current overflow count. When `enabled` is false (the default
 * for `overflow="none"`) the observer is never created — overflow detection is opt-in and
 * costs nothing for toolbars that don't request it.
 *
 * The measurement uses `requestAnimationFrame` to coalesce multiple ResizeObserver ticks into
 * a single layout read. This is important during window resize where ResizeObserver fires
 * dozens of times per second.
 */
export function useToolbarOverflow(args: {
  enabled: boolean;
  rootRef: RefObject<HTMLDivElement | null>;
  itemsContainerRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLDivElement | null>;
  /** Item-to-item gap in px, sourced from the toolbar's resolved `size`. */
  gap: number;
  /**
   * A render token that bumps whenever the inline child list could have changed (e.g. consumer
   * passed a new `children` array). Used to re-measure after React reconciliation completes.
   */
  renderToken: unknown;
}): number {
  const { enabled, rootRef, itemsContainerRef, triggerRef, gap, renderToken } = args;
  const [overflowCount, setOverflowCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setOverflowCount(0);
      return;
    }
    const root = rootRef.current;
    const itemsContainer = itemsContainerRef.current;
    if (!root || !itemsContainer) return;

    let raf = 0;
    const measure = () => {
      const trigger = triggerRef.current;
      const reservedTriggerWidth = trigger ? trigger.offsetWidth : 36;
      const availableWidth = root.clientWidth;
      const next = measureOverflowCount({
        itemsContainer,
        availableWidth,
        reservedTriggerWidth,
        gap,
      });
      setOverflowCount(next);
    };

    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    schedule();

    const ro = new ResizeObserver(schedule);
    ro.observe(root);
    // Also observe the items container so per-child size changes (icon swap, label change)
    // trigger a re-measure even when the root width is steady.
    ro.observe(itemsContainer);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [enabled, rootRef, itemsContainerRef, triggerRef, gap, renderToken]);

  return enabled ? overflowCount : 0;
}
