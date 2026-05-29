'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { forwardRef, type ForwardedRef, type ReactElement } from 'react';

import { selectSeparatorRecipe } from './Select.recipe';
import type { SelectSeparatorProps } from './Select.types';

/** Horizontal rule between sections. `role="separator"` so screen readers announce the boundary. */
function SelectSeparatorImpl(
  props: SelectSeparatorProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const { className, style, sx, ...rest } = props;

  const { className: sepClass, style: sepStyle } = useThemedClasses({
    recipe: selectSeparatorRecipe,
    componentName: 'Select',
    slot: 'separator',
    props: { className, sx, style },
  });

  return (
    <div
      ref={forwardedRef}
      role="separator"
      aria-orientation="horizontal"
      className={sepClass}
      style={sepStyle}
      {...rest}
    />
  );
}

export const SelectSeparator = forwardRef<HTMLDivElement, SelectSeparatorProps>(SelectSeparatorImpl);
SelectSeparator.displayName = 'Select.Separator';
