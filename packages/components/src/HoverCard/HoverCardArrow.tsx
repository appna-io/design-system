'use client';

import { useContext, type ReactElement } from 'react';

import { hoverCardArrowRecipe } from './HoverCard.recipe';
import { HoverCardContentContext } from './HoverCardContentContext';
import type { HoverCardArrowProps } from './HoverCard.types';

/**
 * The optional SVG arrow rendered inside `<HoverCard.Content>`. Reads positioning data from the
 * private content-level context (placement, arrow ref, middleware data) — same architecture as
 * `<PopoverArrow>`.
 *
 * `<HoverCard.Content>` already auto-renders an arrow when `showArrow={true}` (the default), so
 * consumers rarely need to drop `<HoverCard.Arrow>` directly. We export it so advanced consumers
 * can position the arrow manually inside complex Content layouts (e.g., when wrapping Content's
 * children in a custom layout primitive) — set `showArrow={false}` on Content and render
 * `<HoverCard.Arrow>` at the desired DOM position.
 */
export function HoverCardArrow(props: HoverCardArrowProps): ReactElement {
  const { className, style, ...rest } = props;
  const arrowCtx = useContext(HoverCardContentContext);

  if (!arrowCtx) {
    throw new Error(
      '<HoverCard.Arrow> must be rendered inside a <HoverCard.Content>.',
    );
  }

  const { arrowRef, arrowData, placement, size } = arrowCtx;
  const x = arrowData?.x ?? 0;
  const y = arrowData?.y ?? 0;

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

  const recipeClass = hoverCardArrowRecipe({ size });
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

HoverCardArrow.displayName = 'HoverCard.Arrow';
