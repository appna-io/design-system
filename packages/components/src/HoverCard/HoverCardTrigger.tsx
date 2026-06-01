'use client';

import { mergeRefs } from '@apx-ui/engine';
import { Children, cloneElement, isValidElement, useMemo } from 'react';
import type { FocusEvent, PointerEvent, ReactElement, Ref } from 'react';

import { useHoverCardContext } from './HoverCardContext';
import type { HoverCardTriggerProps } from './HoverCard.types';

/**
 * The hover/focus trigger. Two render modes (same convention as Popover):
 *
 *  - **`asChild={true}` (default)** — clone the single child element. The child must be a single
 *    React element; we attach `ref`, pointer / focus handlers, and `aria-describedby` to it.
 *    This lets the consumer pass any focusable element (`<a>`, `<Button>`, `<Avatar>`) and have
 *    HoverCard wire up the trigger semantics without an extra wrapper.
 *  - **`asChild={false}`** — render an inline `<button type="button">` containing the children.
 *    Useful when the children are purely visual (icons, text) and you don't want a wrapper, but
 *    note that wrapping arbitrary content in a button is rarely what you want for HoverCard
 *    (the canonical pattern is a link / avatar trigger). `asChild={true}` is the default.
 *
 * **Focus handlers are gated by `trigger` mode** — when `trigger="hover"` we omit `onFocus` /
 * `onBlur` so the card never opens via keyboard. Default is `trigger="hover-focus"` which keeps
 * the card keyboard-reachable. The plan calls hover-only "discouraged"; we honor it but make the
 * a11y implication explicit.
 *
 * **No click handler** — hover cards do NOT toggle on click. Clicking the trigger should follow
 * the trigger's natural action (`<a>` navigates, `<button>` runs its onClick). HoverCard is
 * additive; it never replaces the trigger's primary affordance.
 */
export function HoverCardTrigger(props: HoverCardTriggerProps): ReactElement {
  const {
    asChild = true,
    children,
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
    ...rest
  } = props;
  const ctx = useHoverCardContext('HoverCard.Trigger');

  const allowFocus = ctx.trigger === 'hover-focus';

  // Shared event handlers + ARIA. `aria-describedby` paired with the content id once open; we
  // intentionally don't carry `aria-haspopup` / `aria-expanded` because HoverCard isn't a
  // disclosure widget — it's an additive description, not a button that "expands" a panel.
  // See W3C ARIA Authoring Practices: hover-cards are tooltip-like, not button/disclosure.
  const sharedHandlers = useMemo(
    () => ({
      onPointerEnter: (event: PointerEvent<HTMLElement>) => {
        onPointerEnter?.(event);
        if (event.defaultPrevented) return;
        ctx.scheduleOpen();
      },
      onPointerLeave: (event: PointerEvent<HTMLElement>) => {
        onPointerLeave?.(event);
        if (event.defaultPrevented) return;
        ctx.scheduleClose();
      },
      onFocus: (event: FocusEvent<HTMLElement>) => {
        onFocus?.(event);
        if (event.defaultPrevented) return;
        if (allowFocus) ctx.scheduleOpen();
      },
      onBlur: (event: FocusEvent<HTMLElement>) => {
        onBlur?.(event);
        if (event.defaultPrevented) return;
        if (allowFocus) ctx.closeImmediately();
      },
    }),
    [ctx, onPointerEnter, onPointerLeave, onFocus, onBlur, allowFocus],
  );

  const sharedAria = {
    id: ctx.triggerId,
    'aria-describedby': ctx.open ? ctx.contentId : undefined,
    'data-state': ctx.open ? ('open' as const) : ('closed' as const),
  };

  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) {
      throw new Error(
        '<HoverCard.Trigger asChild> requires a single React element as its child.',
      );
    }

    const childProps = child.props as {
      ref?: Ref<HTMLElement>;
      'aria-describedby'?: string;
      onPointerEnter?: (e: PointerEvent<HTMLElement>) => void;
      onPointerLeave?: (e: PointerEvent<HTMLElement>) => void;
      onFocus?: (e: FocusEvent<HTMLElement>) => void;
      onBlur?: (e: FocusEvent<HTMLElement>) => void;
    };

    const mergedRef = mergeRefs<HTMLElement>(childProps.ref, ctx.triggerRef);

    // Merge `aria-describedby`: keep any consumer-supplied id and append the content id when open.
    const mergedDescribedBy = ctx.open
      ? [childProps['aria-describedby'], ctx.contentId].filter(Boolean).join(' ') || ctx.contentId
      : childProps['aria-describedby'];

    return cloneElement(child, {
      ref: mergedRef,
      ...sharedAria,
      'aria-describedby': mergedDescribedBy,
      onPointerEnter: (event: PointerEvent<HTMLElement>) => {
        childProps.onPointerEnter?.(event);
        sharedHandlers.onPointerEnter(event);
      },
      onPointerLeave: (event: PointerEvent<HTMLElement>) => {
        childProps.onPointerLeave?.(event);
        sharedHandlers.onPointerLeave(event);
      },
      onFocus: (event: FocusEvent<HTMLElement>) => {
        childProps.onFocus?.(event);
        sharedHandlers.onFocus(event);
      },
      onBlur: (event: FocusEvent<HTMLElement>) => {
        childProps.onBlur?.(event);
        sharedHandlers.onBlur(event);
      },
      ...rest,
    } as Record<string, unknown>);
  }

  return (
    <button
      type="button"
      ref={ctx.triggerRef as unknown as Ref<HTMLButtonElement>}
      {...sharedAria}
      {...sharedHandlers}
      {...rest}
    >
      {children}
    </button>
  );
}

HoverCardTrigger.displayName = 'HoverCard.Trigger';