'use client';

import { useThemedClasses } from '@apx-ui/theme';
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  type ForwardedRef,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
} from 'react';

import { modalCloseRecipe } from './Modal.recipe';
import { useModalContext } from './ModalContext';
import type { ModalCloseProps } from './Modal.types';

const XIcon = (): ReactElement => (
  <svg
    aria-hidden
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3 L13 13 M13 3 L3 13" />
  </svg>
);

/**
 * Close button. Two shapes (mirrors `<Popover.Close>`):
 *
 *   - `asChild={true}` — clone a single child element, attach `onClick` that calls
 *     `ctx.setOpen(false)` (and merges with the child's own onClick if provided). Useful when
 *     you want to use a `<Button>` or another fully-styled control.
 *   - `asChild={false}` (default) — render a built-in icon button (the small "×" tucked into
 *     the top-right corner). Children become its visual content; passing nothing renders the
 *     default `<XIcon />`.
 *
 * Carries `aria-label="Close"` by default — overrideable via `rest`.
 */
function ModalCloseImpl(
  props: ModalCloseProps,
  forwardedRef: ForwardedRef<HTMLButtonElement>,
): ReactElement {
  const { asChild = false, className, style, sx, children, onClick, ...rest } = props;
  const ctx = useModalContext('Modal.Close');

  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      onClick?.(event as ReactMouseEvent<HTMLButtonElement>);
      if (event.defaultPrevented) return;
      ctx.setOpen(false);
    },
    [ctx, onClick],
  );

  // Hooks before any early-return — recipe still resolves in the asChild branch but is unused.
  const { className: closeClass, style: closeStyle } = useThemedClasses({
    recipe: modalCloseRecipe,
    componentName: 'Modal',
    slot: 'close',
    props: {
      size: ctx.size,
      className,
      sx,
      style,
    },
  });

  if (asChild && children) {
    const child = Children.only(children);
    if (!isValidElement(child)) {
      throw new Error('<Modal.Close asChild> requires a single React element as its child.');
    }
    const childProps = child.props as {
      onClick?: (e: ReactMouseEvent<HTMLElement>) => void;
    };
    return cloneElement(child, {
      onClick: (event: ReactMouseEvent<HTMLElement>) => {
        childProps.onClick?.(event);
        if (event.defaultPrevented) return;
        handleClick(event);
      },
      ...rest,
    } as Record<string, unknown>);
  }

  return (
    <button
      ref={forwardedRef}
      type="button"
      aria-label="Close"
      onClick={handleClick}
      className={closeClass}
      style={closeStyle ?? undefined}
      {...rest}
    >
      {children ?? <XIcon />}
    </button>
  );
}

export const ModalClose = forwardRef<HTMLButtonElement, ModalCloseProps>(ModalCloseImpl);
ModalClose.displayName = 'Modal.Close';