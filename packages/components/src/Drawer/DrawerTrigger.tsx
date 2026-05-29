'use client';

import { mergeRefs } from '@apx-ui/engine';
import { Children, cloneElement, isValidElement, useCallback } from 'react';
import type { MouseEvent, ReactElement, Ref } from 'react';

import { useDrawerContext } from './DrawerContext';
import type { DrawerTriggerProps } from './Drawer.types';

/**
 * The trigger button that opens the Drawer. Same `asChild` shape as Modal / Popover —
 * `asChild={true}` (default) clones the single child and merges click + ARIA + ref;
 * `asChild={false}` renders an inline `<button>`.
 *
 * Drawer triggers carry `aria-haspopup="dialog"` and `aria-expanded` while open. `data-state`
 * lets consumers style the open state.
 */
export function DrawerTrigger(props: DrawerTriggerProps): ReactElement {
  const { asChild = true, children, onClick, ...rest } = props;
  const ctx = useDrawerContext('Drawer.Trigger');

  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      onClick?.(event as MouseEvent<HTMLButtonElement>);
      if (event.defaultPrevented) return;
      ctx.setOpen(true);
    },
    [ctx, onClick],
  );

  const sharedProps = {
    id: ctx.triggerId,
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': ctx.open,
    'data-state': ctx.open ? ('open' as const) : ('closed' as const),
    onClick: handleClick,
  };

  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) {
      throw new Error('<Drawer.Trigger asChild> requires a single React element as its child.');
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

DrawerTrigger.displayName = 'Drawer.Trigger';
