'use client';

import { mergeRefs, Portal, useEscapeStack, usePosition } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { AnimatePresence, motion } from 'motion/react';
import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useId,
  useMemo,
  type ReactElement,
  type Ref,
} from 'react';

import { tooltipContentRecipe } from './Tooltip.recipe';
import { tooltipMotion } from './Tooltip.motion';
import { TooltipArrow } from './TooltipArrow';
import { useTooltipDelay } from './useTooltipDelay';
import type { TooltipPlacement, TooltipProps } from './Tooltip.types';

/**
 * The canonical hover/focus hint primitive. The first overlay consumer of `@apx-ui/engine`'s
 * positioning sub-phase (`usePosition` + `<Portal>` + `useEscapeStack`).
 *
 * Behaviour notes:
 * - **Single-child trigger**: `children` must be a single React element. Tooltip clones it to
 *   attach `ref`, pointer / focus handlers, and `aria-describedby` while open. Wrap multi-element
 *   triggers in a `<span>` first.
 * - **Delay state**: `openDelay=400` / `closeDelay=150` defaults match MUI / Radix UX research
 *   on attention thresholds. Hovering the floating surface itself cancels the close timer so
 *   users can move from trigger → tooltip without it vanishing.
 * - **ARIA**: tooltip content carries `role="tooltip"` and the trigger gets `aria-describedby`
 *   while open. Tooltip never receives focus itself (`pointer-events-none` + no tabIndex) — for
 *   interactive overlays use `<Popover>`.
 * - **Escape handling**: integrated with the engine's `useEscapeStack` so nested overlays close
 *   in the right order without per-component coordination.
 *
 * @example
 *   <Tooltip content="Saved 3 minutes ago">
 *     <Button>Saved</Button>
 *   </Tooltip>
 *
 *   <Tooltip
 *     content="Hint"
 *     variant="outline"
 *     color="primary"
 *     placement={{ base: 'bottom', md: 'top' }}
 *     openDelay={200}
 *   >
 *     <Button>Hover me</Button>
 *   </Tooltip>
 */
export function Tooltip(props: TooltipProps): ReactElement {
  const {
    content,
    variant,
    size,
    color,
    placement: placementProp,
    offset = 6,
    showArrow = true,
    openDelay = 400,
    closeDelay = 150,
    open: openProp,
    defaultOpen,
    onOpenChange,
    disabled = false,
    portalContainer,
    className,
    style,
    sx,
    children,
    ...rest
  } = props;

  // Placement is responsive at the prop level but `usePosition` accepts a single value. We accept
  // either, default to `'top'`, and pass through the (already resolved by the engine recipe in
  // most consumer trees) primitive placement string.
  const placement: TooltipPlacement =
    typeof placementProp === 'string' ? (placementProp as TooltipPlacement) : 'top';

  const tooltipId = useId();
  const { open, triggerHandlers, surfaceHandlers, closeImmediately } = useTooltipDelay({
    openDelay,
    closeDelay,
    open: openProp,
    defaultOpen,
    onOpenChange,
    disabled,
  });

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
    open,
  });

  // Esc closes the topmost tooltip. We use the escape stack so nested overlays sort themselves out
  // — a Tooltip rendered above a Popover only closes itself, not the Popover beneath.
  const onEscape = useCallback(() => closeImmediately(), [closeImmediately]);
  useEscapeStack({ active: open, onEscape });

  const { className: contentClass, style: contentStyle } = useThemedClasses({
    recipe: tooltipContentRecipe,
    componentName: 'Tooltip',
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

  // Validate + clone the trigger child. Throwing on a multi-child consumer pattern catches the
  // most common authoring bug ("I wrapped two buttons in a Tooltip and nothing positions").
  const trigger = Children.only(children);
  if (!isValidElement(trigger)) {
    throw new Error('<Tooltip> requires a single React element as its child.');
  }

  // The trigger is a generic ReactElement so we coerce its props bag. We carefully merge the
  // child's existing ref + handlers with our own so cloning doesn't strip what the consumer set.
  const triggerProps = trigger.props as {
    ref?: Ref<unknown>;
    'aria-describedby'?: string;
    onPointerEnter?: (e: unknown) => void;
    onPointerLeave?: (e: unknown) => void;
    onFocus?: (e: unknown) => void;
    onBlur?: (e: unknown) => void;
  };

  const mergedTriggerRef = useMemo(
    () => mergeRefs<unknown>(triggerProps.ref, triggerRef as unknown as Ref<unknown>),
    [triggerProps.ref, triggerRef],
  );

  const triggerEl = disabled
    ? trigger
    : cloneElement(trigger, {
        ref: mergedTriggerRef,
        'aria-describedby': open
          ? [triggerProps['aria-describedby'], tooltipId].filter(Boolean).join(' ') || tooltipId
          : triggerProps['aria-describedby'],
        onPointerEnter: (e: unknown) => {
          triggerProps.onPointerEnter?.(e);
          triggerHandlers.onPointerEnter();
        },
        onPointerLeave: (e: unknown) => {
          triggerProps.onPointerLeave?.(e);
          triggerHandlers.onPointerLeave();
        },
        onFocus: (e: unknown) => {
          triggerProps.onFocus?.(e);
          triggerHandlers.onFocus();
        },
        onBlur: (e: unknown) => {
          triggerProps.onBlur?.(e);
          triggerHandlers.onBlur();
        },
      } as Record<string, unknown>);

  // Compose the floating surface's style: Floating UI's positioning styles → recipe `style` →
  // consumer `style`. Recipe + consumer go through `useThemedClasses` which already merged them.
  // Motion's `MotionStyle` rejects `CSSProperties` under `exactOptionalPropertyTypes` because
  // transforms like `x` cannot be `undefined`; we spread through `Record<string, unknown>` to
  // bypass the deep type-error chain (same workaround Alert uses).
  const surfaceStyle: Record<string, unknown> = {
    ...floatingStyles,
    ...(contentStyle ?? {}),
  };

  const motionExtraProps: Record<string, unknown> = { ...rest };

  return (
    <>
      {triggerEl}
      <Portal container={portalContainer}>
        <AnimatePresence>
          {open ? (
            <motion.div
              ref={floatingRef as unknown as Ref<HTMLDivElement>}
              id={tooltipId}
              role="tooltip"
              data-state="open"
              data-placement={actualPlacement}
              data-variant={typeof variant === 'string' ? variant : 'solid'}
              className={contentClass}
              style={surfaceStyle as never}
              onPointerEnter={surfaceHandlers.onPointerEnter}
              onPointerLeave={surfaceHandlers.onPointerLeave}
              {...tooltipMotion(actualPlacement)}
              {...motionExtraProps}
            >
              {content}
              {showArrow ? (
                <TooltipArrow
                  arrowRef={arrowRef ?? (() => {})}
                  data={middlewareData.arrow}
                  placement={actualPlacement}
                  size={typeof size === 'string' ? size : undefined}
                  className={undefined}
                  style={undefined}
                />
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Portal>
    </>
  );
}

Tooltip.displayName = 'Tooltip';