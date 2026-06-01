'use client';

import { useContext, type ReactElement } from 'react';

import { popoverArrowRecipe } from './Popover.recipe';
import { PopoverContentContext } from './PopoverContentContext';
import type { PopoverArrowProps } from './Popover.types';

/**
 * The optional SVG arrow rendered inside `<Popover.Content>`. It reads positioning data from a
 * private content-level context (placement, arrow ref, middleware data) — so consumers don't have
 * to thread props through manually. The same data drives Tooltip's arrow; we keep the components
 * separate because Popover's arrow recipe carries different default sizes + the `solid` variant
 * is color-neutral (paper-bg) rather than color-filled.
 *
 * Two stacked SVG paths:
 *  - `data-arrow-fill` — colored by the parent surface's `[&_[data-arrow-fill]]:fill-*` rule.
 *  - `data-arrow-stroke` — colored by `[&_[data-arrow-stroke]]:stroke-*`. Renders as the visible
 *    edge so the arrow's outline appears continuous with the surface's border (essential for
 *    `outline` and `soft` variants where the border is the prominent line).
 */
export function PopoverArrow(props: PopoverArrowProps): ReactElement {
  const { className, style, ...rest } = props;
  const arrowCtx = useContext(PopoverContentContext);

  if (!arrowCtx) {
    throw new Error('<Popover.Arrow> must be rendered inside a <Popover.Content>.');
  }

  const { arrowRef, arrowData, placement, size } = arrowCtx;
  const x = arrowData?.x ?? 0;
  const y = arrowData?.y ?? 0;

  // Map placement → CSS transform. Same logic as TooltipArrow but inlined here so the
  // Popover-specific recipe sizes drive the SVG height.
  const side = placement.split('-')[0] as 'top' | 'right' | 'bottom' | 'left';
  let inset: { left?: number; right?: number; top?: number; bottom?: number };
  let transform: string;
  switch (side) {
    case 'top':
      inset = { left: x, bottom: 0 };
      transform = 'translateY(100%) rotate(180deg)';
      break;
    case 'bottom':
      inset = { left: x, top: 0 };
      transform = 'translateY(-100%) rotate(0deg)';
      break;
    case 'left':
      inset = { top: y, right: 0 };
      transform = 'translateX(100%) rotate(90deg)';
      break;
    case 'right':
    default:
      inset = { top: y, left: 0 };
      transform = 'translateX(-100%) rotate(-90deg)';
      break;
  }

  const recipeClass = popoverArrowRecipe({ size });
  const merged = [recipeClass, className].filter(Boolean).join(' ');

  return (
    <svg
      ref={(node) => arrowRef(node as unknown as HTMLElement | null)}
      aria-hidden="true"
      className={merged}
      style={{ ...inset, transform, ...style }}
      viewBox="0 0 16 8"
      preserveAspectRatio="none"
      {...rest}
    >
      <path data-arrow-fill d="M0 0 L8 8 L16 0 Z" />
      <path
        data-arrow-stroke
        d="M0 0 L8 8 L16 0"
        fill="none"
        strokeWidth={1}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

PopoverArrow.displayName = 'Popover.Arrow';