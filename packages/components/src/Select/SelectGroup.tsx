'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { forwardRef, type ForwardedRef, type ReactElement } from 'react';

import { selectGroupRecipe } from './Select.recipe';
import type { SelectGroupProps } from './Select.types';

/** Visual + ARIA grouping wrapper. Pair with `<Select.Label>` for a section heading. */
function SelectGroupImpl(
  props: SelectGroupProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const { className, style, sx, children, ...rest } = props;

  const { className: groupClass, style: groupStyle } = useThemedClasses({
    recipe: selectGroupRecipe,
    componentName: 'Select',
    slot: 'group',
    props: { className, sx, style },
  });

  return (
    <div
      ref={forwardedRef}
      role="group"
      className={groupClass}
      style={groupStyle}
      {...rest}
    >
      {children}
    </div>
  );
}

export const SelectGroup = forwardRef<HTMLDivElement, SelectGroupProps>(SelectGroupImpl);
SelectGroup.displayName = 'Select.Group';