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

import { drawerCloseRecipe } from './Drawer.recipe';
import { useDrawerContext } from './DrawerContext';
import type { DrawerCloseProps } from './Drawer.types';

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
 * Close button. Two shapes (mirrors `<Modal.Close>`):
 *
 *   - `asChild={true}` — clone a single child element, attach `onClick` that calls
 *     `ctx.setOpen(false)` (and merges with the child's own onClick if provided).
 *   - `asChild={false}` (default) — render a built-in icon button (the small "×" tucked into
 *     the top-end corner). Children become its visual content; passing nothing renders the
 *     default `<XIcon />`.
 *
 * Carries `aria-label="Close"` by default — overrideable via `rest`.
 */
function DrawerCloseImpl(
  props: DrawerCloseProps,
  forwardedRef: ForwardedRef<HTMLButtonElement>,
): ReactElement {
  const { asChild = false, className, style, sx, children, onClick, ...rest } = props;
  const ctx = useDrawerContext('Drawer.Close');

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
    recipe: drawerCloseRecipe,
    componentName: 'Drawer',
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
      throw new Error('<Drawer.Close asChild> requires a single React element as its child.');
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

export const DrawerClose = forwardRef<HTMLButtonElement, DrawerCloseProps>(DrawerCloseImpl);
DrawerClose.displayName = 'Drawer.Close';