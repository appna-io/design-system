'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { forwardRef, type ForwardedRef, type ReactElement } from 'react';

import { menuLabelRecipe } from './Menu.recipe';
import type { MenuLabelProps } from './Menu.types';

/**
 * Non-interactive section header. Sits above a `<Menu.Group>` (or just above a run of items) to
 * caption them. Not part of the keyboard registry — never receives focus or highlight.
 *
 * When rendered as a direct child of `<Menu.Group>`, the group will associate it via
 * `aria-labelledby` so screen readers announce the group's name. Standalone labels are still
 * useful as visual section headings.
 */
function MenuLabelImpl(
  props: MenuLabelProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const { className, sx, style, children, ...rest } = props;

  const { className: labelClass, style: labelStyle } = useThemedClasses({
    recipe: menuLabelRecipe,
    componentName: 'Menu',
    slot: 'label',
    props: { className, sx, style },
  });

  return (
    <div ref={forwardedRef} role="presentation" className={labelClass} style={labelStyle} {...rest}>
      {children}
    </div>
  );
}

export const MenuLabel = forwardRef<HTMLDivElement, MenuLabelProps>(MenuLabelImpl);
MenuLabel.displayName = 'Menu.Label';
