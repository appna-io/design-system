'use client';

import { mergeRefs } from '@apx-ui/engine';
import { Children, cloneElement, isValidElement, useCallback } from 'react';
import type { MouseEvent, ReactElement, Ref } from 'react';

import { useModalContext } from './ModalContext';
import type { ModalTriggerProps } from './Modal.types';

/**
 * Trigger button that opens the Modal. Same `asChild` / inline-button shape as
 * `<Popover.Trigger>` — clone the single child + attach ARIA + click + ref by default; render an
 * inline `<button>` when `asChild={false}`.
 *
 * Modal triggers carry `aria-haspopup="dialog"` (always, since Modal is always modal) and
 * `aria-expanded` while open. `data-state="open"|"closed"` lets consumers style the open state.
 */
export function ModalTrigger(props: ModalTriggerProps): ReactElement {
  const { asChild = true, children, onClick, ...rest } = props;
  const ctx = useModalContext('Modal.Trigger');

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
      throw new Error('<Modal.Trigger asChild> requires a single React element as its child.');
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

ModalTrigger.displayName = 'Modal.Trigger';
