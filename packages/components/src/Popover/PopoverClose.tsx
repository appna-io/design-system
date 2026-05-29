'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { X } from 'lucide-react';
import { forwardRef, type MouseEvent, type ReactElement } from 'react';

import { popoverCloseRecipe } from './Popover.recipe';
import { usePopoverContext } from './PopoverContext';
import type { PopoverCloseProps } from './Popover.types';

/**
 * The built-in × button. Sits in the logical-end / top corner of `<Popover.Content>` (so it
 * RTL-flips automatically). Calls `ctx.setOpen(false)` on activation; consumers can intercept
 * via `onClick` and call `event.preventDefault()` to keep the Popover open.
 *
 * Carries `aria-label="Close"` by default. Pass `aria-label` in `...rest` to override (e.g.
 * `<Popover.Close aria-label="Dismiss" />`).
 */
function PopoverCloseImpl(
  props: PopoverCloseProps,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
): ReactElement {
  const { className, style, children, onClick, ...rest } = props;
  const ctx = usePopoverContext('Popover.Close');

  const { className: closeClass, style: closeStyle } = useThemedClasses({
    recipe: popoverCloseRecipe,
    componentName: 'Popover',
    slot: 'close',
    props: { className, style },
  });

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    ctx.setOpen(false);
  };

  return (
    <button
      ref={forwardedRef}
      type="button"
      aria-label="Close"
      {...rest}
      className={closeClass}
      style={closeStyle ?? undefined}
      onClick={handleClick}
    >
      {children ?? <X aria-hidden="true" size={14} />}
    </button>
  );
}

export const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseProps>(PopoverCloseImpl);
PopoverClose.displayName = 'Popover.Close';
