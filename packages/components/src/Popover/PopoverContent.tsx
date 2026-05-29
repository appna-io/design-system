'use client';

import { mergeRefs, Portal, useFocusTrap, usePosition } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { AnimatePresence, motion } from 'motion/react';
import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  type ForwardedRef,
  type ReactElement,
  type Ref,
} from 'react';

import { popoverBackdropMotion, popoverMotion } from './Popover.motion';
import { popoverBackdropRecipe, popoverContentRecipe } from './Popover.recipe';
import { PopoverContentContext } from './PopoverContentContext';
import { usePopoverContext } from './PopoverContext';
import type {
  PopoverContentProps,
  PopoverPlacement,
  PopoverSize,
} from './Popover.types';

/**
 * The portal-rendered, positioned, focus-trapped, animated floating panel. This is the engine's
 * full overlay surface in one component:
 *
 *  - `<Portal container={portalContainer}>` — SSR-safe, optional custom target. Defaults to
 *    `document.body`. Pass a Modal's body when nesting.
 *  - `usePosition({ placement, offset, arrow, open })` — positions Content relative to the
 *    Trigger ref captured in the root context. Trigger ref is wired through the root's
 *    `triggerRef` callback that **also** updates the root's `triggerNodeRef` so outside-click
 *    can `contains()` it without a re-render.
 *  - `useFocusTrap` — activated only while `open && trapFocus` is true. Initial focus moves to
 *    `initialFocus` (or first focusable, or Content itself). Return-focus to Trigger on close.
 *  - `<motion.div>` + `AnimatePresence` — entry / exit animation. Same `active: open` (not
 *    `mounted`) discipline Tooltip uses, so the focus-trap doesn't stay attached during exit.
 *  - `data-state="open"` for selector-based styling. `data-placement` for animation-direction
 *    awareness on consumers' end.
 *
 * The Content also publishes `<PopoverContentContext>` so an optional `<Popover.Arrow>` child
 * can read positioning data without prop-threading.
 */
function PopoverContentImpl(
  props: PopoverContentProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    variant,
    size,
    color,
    placement: placementProp,
    offset = 8,
    showArrow = false,
    portalContainer,
    initialFocus,
    className,
    style,
    sx,
    children,
    ...rest
  } = props;

  const ctx = usePopoverContext('Popover.Content');

  // `placement` is responsive at the public API but `usePosition` accepts a single value. Resolve
  // to a primitive; `useThemedClasses` still resolves the responsive value for the recipe.
  const placement: PopoverPlacement =
    typeof placementProp === 'string' ? (placementProp as PopoverPlacement) : 'bottom';

  const { triggerRef, floatingRef, arrowRef, placement: actualPlacement, middlewareData, floatingStyles } =
    usePosition({
      placement,
      offset,
      arrow: showArrow,
      open: ctx.open,
    });

  // Register Floating UI's `setReference` with the root context so `<Popover.Trigger>` can fan
  // it directly into the cloned trigger's ref via `mergeRefs`. This is the mechanism that
  // guarantees Floating UI sees the trigger node — the previous one-shot `useEffect` could miss
  // hydration-order edge cases (sibling Trigger / Content mount order, child remounts) and leave
  // Floating UI without a reference, pinning the popover at top-left of the viewport.
  //
  // We depend on `registerPositionReference` (stable, defined once in the root via `useCallback`)
  // and `triggerRef` (Floating UI's stable `setReference`), not the whole `ctx` object — `ctx`
  // changes every render when `open` flips and would re-fire this effect spuriously.
  const { registerPositionReference } = ctx;
  useEffect(() => {
    registerPositionReference(triggerRef);
    return () => registerPositionReference(null);
  }, [registerPositionReference, triggerRef]);

  // Local ref for the floating element so `useFocusTrap` has a stable container.
  const localFloatingRef = useRef<HTMLDivElement | null>(null);

  // Float trap. `active: ctx.open && ctx.trapFocus` — note `ctx.open`, not `mounted`. The trap
  // unsubscribes the moment we set `open: false`, even while the AnimatePresence exit animation
  // is still running. (Same lesson Tooltip's escape-stack documented.)
  useFocusTrap(localFloatingRef, {
    active: ctx.open && ctx.trapFocus,
    initialFocus,
    finalFocus: () => ctx.triggerNodeRef.current,
    returnFocusOnDeactivate: true,
  });

  const { className: contentClass, style: contentStyle } = useThemedClasses({
    recipe: popoverContentRecipe,
    componentName: 'Popover',
    slot: 'content',
    props: {
      variant,
      size,
      color,
      className,
      sx,
      style,
    },
  });

  const { className: backdropClass } = useThemedClasses({
    recipe: popoverBackdropRecipe,
    componentName: 'Popover',
    slot: 'backdrop',
    props: {},
  });

  const sizeKey: PopoverSize = typeof size === 'string' ? size : 'md';

  const arrowCtx = useMemo(
    () => ({
      arrowRef: arrowRef ?? ((() => {}) as (node: HTMLElement | null) => void),
      arrowData: middlewareData.arrow,
      placement: actualPlacement as PopoverPlacement,
      size: sizeKey,
    }),
    [arrowRef, middlewareData.arrow, actualPlacement, sizeKey],
  );

  const surfaceStyle: Record<string, unknown> = {
    ...floatingStyles,
    ...(contentStyle ?? {}),
  };

  const motionExtraProps: Record<string, unknown> = { ...rest };

  // Compose the floating ref: Floating UI's setFloating + our local ref + the root's
  // registerContent + the user's forwarded ref. mergeRefs fan-outs cleanly.
  const composedFloatingRef = mergeRefs<HTMLDivElement>(
    floatingRef as unknown as Ref<HTMLDivElement>,
    localFloatingRef as unknown as Ref<HTMLDivElement>,
    (node) => ctx.registerContent(node as HTMLElement | null),
    forwardedRef as Ref<HTMLDivElement>,
  );

  return (
    <Portal container={portalContainer}>
      <AnimatePresence>
        {ctx.open ? (
          <PopoverContentContext.Provider value={arrowCtx}>
            {ctx.modal ? (
              <motion.div
                aria-hidden="true"
                className={backdropClass}
                {...popoverBackdropMotion}
              />
            ) : null}
            <motion.div
              ref={composedFloatingRef}
              id={ctx.contentId}
              role="dialog"
              tabIndex={-1}
              aria-modal={ctx.modal ? true : undefined}
              aria-labelledby={ctx.triggerId}
              data-state="open"
              data-placement={actualPlacement}
              data-variant={typeof variant === 'string' ? variant : 'solid'}
              className={contentClass}
              style={surfaceStyle as never}
              {...popoverMotion(actualPlacement as PopoverPlacement)}
              {...motionExtraProps}
            >
              {children}
            </motion.div>
          </PopoverContentContext.Provider>
        ) : null}
      </AnimatePresence>
    </Portal>
  );
}

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(PopoverContentImpl);
PopoverContent.displayName = 'Popover.Content';
