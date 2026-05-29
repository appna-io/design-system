import {
  arrow as arrowMiddleware,
  autoUpdate,
  flip as flipMiddleware,
  offset as offsetMiddleware,
  shift as shiftMiddleware,
  size as sizeMiddleware,
  useFloating,
  type Middleware,
  type Placement,
  type UseFloatingReturn,
} from '@floating-ui/react';
import { useMemo, useState, type RefCallback } from 'react';

export type { Placement };

export interface UsePositionOptions {
  /**
   * Preferred placement; `flip()` may swap to the opposite side at viewport edges. Default: `'bottom'`.
   */
  placement?: Placement;
  /** Px gap between the trigger and the floating element. Default: `8`. */
  offset?: number;
  /**
   * When `true`, register the arrow middleware and return a stable `arrowRef` callback. Set on the
   * arrow `<span>` to position it at the floating element's tip.
   */
  arrow?: boolean;
  /**
   * When `true`, the floating element's `width` is synced to the trigger's width via the `size`
   * middleware. Used by Select / Combobox to make the listbox match the trigger.
   */
  matchTriggerWidth?: boolean;
  /** Default: `true`. Disable to lock placement (rare; mostly useful in tests). */
  flip?: boolean;
  /** Default: `true`. Disable to skip viewport-edge nudging. */
  shift?: boolean;
  /**
   * When `true` (default), Floating UI subscribes to scroll/resize and recomputes the position.
   * The `open` flag below toggles the subscription on/off without unmounting the consumer, which
   * is what every overlay component wants for performance.
   */
  autoUpdate?: boolean;
  /**
   * When `false`, the autoUpdate subscription is paused. Components should pass their own `open`
   * state here so that closed overlays don't pay the listener cost.
   */
  open?: boolean;
}

export interface UsePositionReturn {
  /** Attach to the trigger element. Forwarded straight from Floating UI's `setReference`. */
  triggerRef: RefCallback<HTMLElement | null>;
  /** Attach to the floating element. Forwarded straight from Floating UI's `setFloating`. */
  floatingRef: RefCallback<HTMLElement | null>;
  /**
   * Attach to the arrow element when `opts.arrow` is `true`. `null` otherwise so consumers can
   * conditionally render based on a truthy check.
   */
  arrowRef: RefCallback<HTMLElement | null> | null;
  /** Computed x coordinate (CSS px). `null` until the first measurement completes. */
  x: number | null;
  /** Computed y coordinate (CSS px). `null` until the first measurement completes. */
  y: number | null;
  /** Final placement after `flip` resolves. Use this to render arrow / animation direction. */
  placement: Placement;
  /** Floating UI's middleware data — primarily used to read `arrow.{x,y}` for arrow positioning. */
  middlewareData: UseFloatingReturn['middlewareData'];
  /**
   * Floating UI's `context` object, exposed for advanced integrations (interactions, tree, focus
   * manager). Most consumers will not need it.
   */
  context: UseFloatingReturn['context'];
  /** Inline styles to apply to the floating element (`position`, `top`, `left`). */
  floatingStyles: UseFloatingReturn['floatingStyles'];
}

/**
 * DS-flavoured wrapper around `@floating-ui/react`'s `useFloating`. Pre-bakes the middleware
 * stack every overlay needs (`offset → flip → shift → arrow? → size?`) and pauses the
 * `autoUpdate` listener while the overlay is closed for free perf. Floating UI lives behind this
 * single import so the rest of the DS only depends on `@apx-ui/engine`.
 */
export function usePosition(opts: UsePositionOptions = {}): UsePositionReturn {
  const {
    placement = 'bottom',
    offset = 8,
    arrow = false,
    matchTriggerWidth = false,
    flip = true,
    shift = true,
    autoUpdate: autoUpdateEnabled = true,
    open = true,
  } = opts;

  // The arrow middleware needs a live DOM reference. We use `useState` so writing the ref also
  // triggers a re-render — Floating UI then re-runs the middleware with the new arrow element.
  const [arrowEl, setArrowEl] = useState<HTMLElement | null>(null);

  const middleware = useMemo<Middleware[]>(() => {
    const stack: Middleware[] = [offsetMiddleware(offset)];
    if (flip) stack.push(flipMiddleware());
    if (shift) stack.push(shiftMiddleware({ padding: 8 }));
    if (arrow && arrowEl) stack.push(arrowMiddleware({ element: arrowEl }));
    if (matchTriggerWidth) {
      stack.push(
        sizeMiddleware({
          apply({ rects, elements }) {
            // Sync the floating element's width to the trigger's width — used by Select.
            Object.assign(elements.floating.style, {
              width: `${rects.reference.width}px`,
            });
          },
        }),
      );
    }
    return stack;
  }, [offset, flip, shift, arrow, arrowEl, matchTriggerWidth]);

  // Pause the resize/scroll subscription while closed — saves listeners on every closed Tooltip.
  // `whileElementsMounted` does not accept `undefined` under exactOptionalPropertyTypes, so we
  // conditionally compose the options object instead of inlining a ternary.
  //
  // `transform: false` makes Floating UI emit positioning as `top` / `left` instead of a
  // `transform: translate(...)`. Every overlay in the DS (Menu, Popover, Tooltip, HoverCard,
  // Select, Combobox, …) wraps its floating node in a `<motion.div>` whose entry animation
  // writes its own `transform`. With the default transform-based strategy, Motion's transform
  // wins and the floating element lands at the body origin (0, 0) instead of next to the
  // trigger — visible as "click the trigger, nothing appears" when the trigger is offscreen
  // / scrolled (reported by Ahmad against Menu, 2026-05-24). Switching to layout positioning
  // costs nothing perceptible (overlays are tiny, the listener fires on scroll/resize only)
  // and frees Motion to own `transform` for animation.
  const floatingOptions = {
    placement,
    middleware,
    transform: false as const,
    ...(autoUpdateEnabled && open ? { whileElementsMounted: autoUpdate } : {}),
  };
  const floating = useFloating(floatingOptions);

  const arrowRef = useMemo<RefCallback<HTMLElement | null> | null>(() => {
    if (!arrow) return null;
    return (node) => setArrowEl(node);
  }, [arrow]);

  // Pre-measurement, Floating UI's `floatingStyles` resolves to `{position, top: 0, left: 0}` —
  // the element renders at the body origin for one paint before the first middleware pass writes
  // the real coordinates. We don't try to hide that one frame here: consumers wrap the floating
  // node in a `<motion.div>` whose `initial: { opacity: 0 }` already masks it, and
  // `useFocusTrap` calls `.focus({ preventScroll: true })` on every focus move so the (0, 0)
  // placement can't snap the page to the top before Floating UI commits the real coordinates.
  return {
    triggerRef: floating.refs.setReference,
    floatingRef: floating.refs.setFloating,
    arrowRef,
    x: floating.isPositioned ? floating.x : null,
    y: floating.isPositioned ? floating.y : null,
    placement: floating.placement,
    middlewareData: floating.middlewareData,
    context: floating.context,
    floatingStyles: floating.floatingStyles,
  };
}
