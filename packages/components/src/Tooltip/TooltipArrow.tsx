import { forwardRef } from '@apx-ui/engine';
import type { CSSProperties, ForwardedRef, ReactElement, RefCallback } from 'react';
import { tooltipArrowRecipe } from './Tooltip.recipe';
import type { TooltipPlacement, TooltipSize } from './Tooltip.types';

interface TooltipArrowProps {
  /**
   * Floating UI's arrow middleware data: `{ x, y, centerOffset }`. We translate the SVG to
   * sit at `(x, y)` relative to the surface and rotate it according to the parent's `placement`
   * so the tip always points back at the trigger.
   */
  data?: { x?: number; y?: number; centerOffset?: number } | undefined;
  /** Final placement after Floating UI's `flip()` resolves. Drives the rotation. */
  placement: TooltipPlacement;
  /** Tooltip size — selects the arrow recipe size axis (height-px scales with text size). */
  size: TooltipSize | undefined;
  /** Spread to the arrow element so consumers can tag it with `aria-hidden`. */
  className: string | undefined;
  /** Inline style hook used to merge in theme `styleOverrides.arrow.style`. */
  style: CSSProperties | undefined;
  /** Floating UI's `arrowRef` — attached to the SVG so the middleware can measure it. */
  arrowRef: RefCallback<HTMLElement | null>;
}

/**
 * Map placement → CSS transform that places the arrow against the correct edge of the surface
 * with the tip pointing outward (toward the trigger). Floating UI's middleware gives us the
 * offset along the surface's edge; we add the rotation + cross-axis pin separately.
 *
 * The transform composes:
 * 1. `translate(arrowX, arrowY)` from Floating UI's middleware data.
 * 2. A constant offset that pins the arrow to the appropriate edge.
 * 3. A rotation so the arrow's tip faces the trigger.
 */
function buildArrowTransform(placement: TooltipPlacement, x: number, y: number): {
  inset: CSSProperties;
  transform: string;
} {
  const side = placement.split('-')[0] as 'top' | 'right' | 'bottom' | 'left';
  // The non-rotated arrow points up (▲). For each side we set the arrow's pinned edge with
  // explicit `top` / `bottom` / `left` / `right` and add the perpendicular Floating UI offset.
  switch (side) {
    case 'top':
      // Surface is above the trigger → arrow pins to the bottom edge of the surface, points down.
      return {
        inset: { left: x, bottom: 0 },
        transform: 'translateY(100%) rotate(180deg)',
      };
    case 'bottom':
      // Surface is below the trigger → arrow pins to the top edge of the surface, points up.
      return {
        inset: { left: x, top: 0 },
        transform: 'translateY(-100%) rotate(0deg)',
      };
    case 'left':
      // Surface is to the left of the trigger → arrow pins to the right edge, points right.
      return {
        inset: { top: y, right: 0 },
        transform: 'translateX(100%) rotate(90deg)',
      };
    case 'right':
      // Surface is to the right of the trigger → arrow pins to the left edge, points left.
      return {
        inset: { top: y, left: 0 },
        transform: 'translateX(-100%) rotate(-90deg)',
      };
  }
}

/**
 * The SVG arrow rendered inside the floating surface. Two stacked paths:
 *
 *   - the **fill** path (`data-arrow-fill`) is colored by the surface's `[&_[data-arrow-fill]]:fill-*`
 *     compound rule, so the arrow's body matches the surface's background.
 *   - the **stroke** path (`data-arrow-stroke`) is colored by the surface's
 *     `[&_[data-arrow-stroke]]:stroke-*` compound rule, so the arrow's edges match the surface's
 *     border. For `outline` and `soft` variants this is what makes the arrow visually continue
 *     the box border into a triangular tip.
 *
 * The recipe is variant-agnostic (just sizes the SVG); colors flow through the parent's group
 * selectors. This keeps the arrow's component code static and the variant matrix in one place.
 */
function TooltipArrowImpl(
  { data, placement, size, className, style, arrowRef }: TooltipArrowProps,
  forwardedRef: ForwardedRef<SVGSVGElement>,
): ReactElement {
  const x = data?.x ?? 0;
  const y = data?.y ?? 0;
  const { inset, transform } = buildArrowTransform(placement, x, y);

  const sizeKey: TooltipSize = size ?? 'md';
  const recipeClass = tooltipArrowRecipe({ size: sizeKey });

  // We need both refs on the SVG: Floating UI's `arrowRef` for measurement, and a forwarded
  // ref for theme integrations / consumer reach. A small ref-merger covers both.
  const setRef = (node: SVGSVGElement | null): void => {
    arrowRef(node as unknown as HTMLElement | null);
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  return (
    <svg
      ref={setRef}
      aria-hidden="true"
      className={[recipeClass, className].filter(Boolean).join(' ')}
      style={{ ...inset, transform, ...style }}
      // Use the recipe-driven height/width via Tailwind utilities; viewBox keeps the arrow shape
      // sharp at any size.
      viewBox="0 0 16 8"
      preserveAspectRatio="none"
    >
      {/* The fill path traces a clean triangle. */}
      <path data-arrow-fill d="M0 0 L8 8 L16 0 Z" />
      {/* The stroke path draws the two outer edges only (skipping the top edge so the arrow
          appears continuous with the surface's border). */}
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

export const TooltipArrow = forwardRef<SVGSVGElement, TooltipArrowProps>(
  TooltipArrowImpl,
  'TooltipArrow',
);
