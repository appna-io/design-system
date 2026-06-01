'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { Check } from 'lucide-react';
import {
  forwardRef,
  type ForwardedRef,
  type ReactElement,
} from 'react';

import { selectItemIndicatorRecipe } from './Select.recipe';
import type { SelectItemIndicatorProps } from './Select.types';

/**
 * Standalone indicator subpart. The default `<Select.Item>` already renders a `<Check>` icon
 * when selected, so most consumers will never reach for this directly. It exists so that:
 *
 *  - Theme `styleOverrides.itemIndicator` has a slot to target.
 *  - Power consumers can opt into custom rendering by passing their own children:
 *    `<Select.Item>Foo <Select.ItemIndicator><Star /></Select.ItemIndicator></Select.Item>`.
 *
 * Rendered absolutely-positioned at the logical end of the item via the recipe. Whether it's
 * visible is up to the consumer's containing `[data-selected="true"]` selector — this component
 * does not gate its own visibility.
 */
function SelectItemIndicatorImpl(
  props: SelectItemIndicatorProps,
  forwardedRef: ForwardedRef<HTMLSpanElement>,
): ReactElement {
  const { className, style, sx, children, ...rest } = props;

  const { className: indicatorClass, style: indicatorStyle } = useThemedClasses({
    recipe: selectItemIndicatorRecipe,
    componentName: 'Select',
    slot: 'itemIndicator',
    props: { className, sx, style },
  });

  return (
    <span
      ref={forwardedRef}
      aria-hidden="true"
      className={indicatorClass}
      style={indicatorStyle}
      {...rest}
    >
      {children ?? <Check className="size-4" />}
    </span>
  );
}

export const SelectItemIndicator = forwardRef<HTMLSpanElement, SelectItemIndicatorProps>(
  SelectItemIndicatorImpl,
);
SelectItemIndicator.displayName = 'Select.ItemIndicator';