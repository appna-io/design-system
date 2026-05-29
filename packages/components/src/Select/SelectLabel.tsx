'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { forwardRef, type ForwardedRef, type ReactElement } from 'react';

import { selectLabelRecipe } from './Select.recipe';
import type { SelectLabelProps } from './Select.types';

/**
 * Non-interactive section heading. `role="presentation"` (not `heading`) because the parent
 * `<Select.Group>` already carries the group role; adding a heading semantic on top would over-
 * specify the tree for screen readers.
 */
function SelectLabelImpl(
  props: SelectLabelProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const { className, style, sx, children, ...rest } = props;

  const { className: labelClass, style: labelStyle } = useThemedClasses({
    recipe: selectLabelRecipe,
    componentName: 'Select',
    slot: 'label',
    props: { className, sx, style },
  });

  return (
    <div
      ref={forwardedRef}
      role="presentation"
      className={labelClass}
      style={labelStyle}
      {...rest}
    >
      {children}
    </div>
  );
}

export const SelectLabel = forwardRef<HTMLDivElement, SelectLabelProps>(SelectLabelImpl);
SelectLabel.displayName = 'Select.Label';
