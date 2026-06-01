'use client';

import { mergeRefs, Portal, usePosition } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { AnimatePresence, motion } from 'motion/react';
import {
  forwardRef,
  useEffect,
  useMemo,
  type ForwardedRef,
  type PointerEvent,
  type ReactElement,
  type Ref,
} from 'react';

import { hoverCardMotion } from './HoverCard.motion';
import { hoverCardContentRecipe } from './HoverCard.recipe';
import { HoverCardContentContext } from './HoverCardContentContext';
import { useHoverCardContext } from './HoverCardContext';
import { HoverCardArrow } from './HoverCardArrow';
import type {
  HoverCardContentProps,
  HoverCardPlacement,
  HoverCardSize,
} from './HoverCard.types';

/**
 * The portal-rendered, positioned, animated floating panel. Same shape as `<Popover.Content>`
 * minus the focus trap (HoverCard is additive — Tab continues through Content as part of the
 * natural document order; see plan A11y section).
 *
 *  - `<Portal container={portalContainer}>` — SSR-safe, optional custom target.
 *  - `usePosition({ placement, offset, arrow, open })` — anchored to the Trigger ref captured in
 *    the root context via `registerPositionReference`.
 *  - `<motion.div>` + `AnimatePresence` — entry / exit animation with `active: open` discipline.
 *  - **Bridge handlers** — `onPointerEnter` cancels the in-flight close timer (so users can move
 *    the cursor onto the panel without it dismissing); `onPointerLeave` re-arms the close timer.
 *    This is the "bridge" pattern called out in the plan: the trigger's leave timer is cancelled
 *    the moment the cursor enters Content, then re-armed when it leaves Content.
 *
 * The Content also publishes `<HoverCardContentContext>` so an optional `<HoverCard.Arrow>` child
 * can read positioning data without prop-threading. Same shape as Popover's content-context.
 */
function HoverCardContentImpl(
  props: HoverCardContentProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    variant,
    size,
    color,
    placement: placementProp,
    offset = 8,
    showArrow = true,
    portalContainer,
    className,
    style,
    sx,
    children,
    onPointerEnter,
    onPointerLeave,
    ...rest
  } = props;

  const ctx = useHoverCardContext('HoverCard.Content');

  const placement: HoverCardPlacement =
    typeof placementProp === 'string' ? (placementProp as HoverCardPlacement) : 'top';

  const {
    triggerRef,
    floatingRef,
    arrowRef,
    placement: actualPlacement,
    middlewareData,
    floatingStyles,
  } = usePosition({
    placement,
    offset,
    arrow: showArrow,
    open: ctx.open,
  });

  // Register Floating UI's `setReference` with the root so `<HoverCard.Trigger>` can fan it into
  // the cloned trigger's ref via `mergeRefs`. Same architecture as Popover (post-bug-fix).
  const { registerPositionReference } = ctx;
  useEffect(() => {
    registerPositionReference(triggerRef);
    return () => registerPositionReference(null);
  }, [registerPositionReference, triggerRef]);

  const { className: contentClass, style: contentStyle } = useThemedClasses({
    recipe: hoverCardContentRecipe,
    componentName: 'HoverCard',
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

  const sizeKey: HoverCardSize = typeof size === 'string' ? size : 'md';

  const arrowCtx = useMemo(
    () => ({
      arrowRef: arrowRef ?? ((() => {}) as (node: HTMLElement | null) => void),
      arrowData: middlewareData.arrow,
      placement: actualPlacement as HoverCardPlacement,
      size: sizeKey,
    }),
    [arrowRef, middlewareData.arrow, actualPlacement, sizeKey],
  );

  // Compose the floating ref: Floating UI's setFloating + the user's forwarded ref.
  const composedFloatingRef = mergeRefs<HTMLDivElement>(
    floatingRef as unknown as Ref<HTMLDivElement>,
    forwardedRef as Ref<HTMLDivElement>,
  );

  // Surface bridge handlers — entering Content cancels the close timer; leaving re-arms it.
  // Consumer-supplied handlers are called first; if they `preventDefault`, we skip our logic.
  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    onPointerEnter?.(event);
    if (event.defaultPrevented) return;
    ctx.cancelClose();
  };
  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    if (event.defaultPrevented) return;
    ctx.scheduleClose();
  };

  const surfaceStyle: Record<string, unknown> = {
    ...floatingStyles,
    ...(contentStyle ?? {}),
  };

  const motionExtraProps: Record<string, unknown> = { ...rest };

  return (
    <Portal container={portalContainer}>
      <AnimatePresence>
        {ctx.open ? (
          <HoverCardContentContext.Provider value={arrowCtx}>
            <motion.div
              ref={composedFloatingRef}
              id={ctx.contentId}
              role="tooltip"
              data-state="open"
              data-placement={actualPlacement}
              data-variant={typeof variant === 'string' ? variant : 'solid'}
              className={contentClass}
              style={surfaceStyle as never}
              onPointerEnter={handlePointerEnter}
              onPointerLeave={handlePointerLeave}
              {...hoverCardMotion(actualPlacement as HoverCardPlacement)}
              {...motionExtraProps}
            >
              {children}
              {showArrow ? <HoverCardArrow /> : null}
            </motion.div>
          </HoverCardContentContext.Provider>
        ) : null}
      </AnimatePresence>
    </Portal>
  );
}

export const HoverCardContent = forwardRef<HTMLDivElement, HoverCardContentProps>(
  HoverCardContentImpl,
);
HoverCardContent.displayName = 'HoverCard.Content';