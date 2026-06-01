'use client';

import { mergeRefs } from '@apx-ui/engine';
import { Children, cloneElement, isValidElement, useCallback } from 'react';
import type { MouseEvent, ReactElement, Ref } from 'react';

import { usePopoverContext } from './PopoverContext';
import type { PopoverTriggerProps } from './Popover.types';

/**
 * The clickable / focusable trigger. Two render modes:
 *
 *  - **`asChild={true}` (default)** — clone the single child element. The child must be a single
 *    React element; we attach `ref`, `onClick` (toggle open), `aria-haspopup`, `aria-expanded`,
 *    `aria-controls`, `id`, and `data-state` to it. This lets the consumer pass any focusable
 *    element (`<Button>`, `<IconButton>`, `<a>`, even a `<div role="button">`) and have Popover
 *    wire it up without an extra wrapper.
 *  - **`asChild={false}`** — render an inline `<button type="button">` carrying the children
 *    inside it. Useful when the child content is purely visual (icons, text) and you don't want
 *    a wrapper.
 *
 * The trigger always carries `data-state="open"` / `data-state="closed"` so consumers can style
 * the open state (e.g. a chevron rotation) without a context read.
 *
 * **Why `Children.only` and not `Slot.tsx`?** The DS doesn't ship a Radix-style `<Slot>` yet.
 * Using `Children.only` + `cloneElement` gives us 80% of the same ergonomics; if a future
 * compound (Menu / Select) needs polymorphic `as`, we'll factor it then.
 */
export function PopoverTrigger(props: PopoverTriggerProps): ReactElement {
  const { asChild = true, children, onClick, ...rest } = props;
  const ctx = usePopoverContext('Popover.Trigger');

  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      onClick?.(event as MouseEvent<HTMLButtonElement>);
      if (event.defaultPrevented) return;
      ctx.setOpen(!ctx.open);
    },
    [ctx, onClick],
  );

  const sharedProps = {
    id: ctx.triggerId,
    'aria-haspopup': ctx.modal ? ('dialog' as const) : ('true' as const),
    'aria-expanded': ctx.open,
    'aria-controls': ctx.open ? ctx.contentId : undefined,
    'data-state': ctx.open ? ('open' as const) : ('closed' as const),
    onClick: handleClick,
  };

  // The trigger is the source of truth for the trigger DOM node — both the root context (for
  // outside-click) and Floating UI (for positioning) need to know it the moment it mounts. We
  // forward into both via a single `mergeRefs` chain so there is no race or order dependency
  // between Trigger and Content. `ctx.triggerRef` already forwards into Floating UI's
  // `setReference` whenever Content has registered one, so a single ref attach is enough.
  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) {
      throw new Error('<Popover.Trigger asChild> requires a single React element as its child.');
    }

    const childProps = child.props as {
      ref?: Ref<HTMLElement>;
      onClick?: (e: MouseEvent<HTMLElement>) => void;
    };

    const mergedRef = mergeRefs<HTMLElement>(childProps.ref, ctx.triggerRef);

    return cloneElement(child, {
      ref: mergedRef,
      ...sharedProps,
      onClick: (event: MouseEvent<HTMLElement>) => {
        childProps.onClick?.(event);
        if (event.defaultPrevented) return;
        handleClick(event);
      },
      ...rest,
    } as Record<string, unknown>);
  }

  // Non-asChild path — render an inline button. Most consumers use the asChild form so this is
  // the rarer branch but we still wire it up identically.
  return (
    <button
      type="button"
      ref={ctx.triggerRef as unknown as Ref<HTMLButtonElement>}
      {...sharedProps}
      {...rest}
    >
      {children}
    </button>
  );
}

PopoverTrigger.displayName = 'Popover.Trigger';