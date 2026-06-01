'use client';

import { useControllableState } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  forwardRef,
  useCallback,
  useMemo,
  type ForwardedRef,
  type ReactElement,
} from 'react';

import { menuGroupRecipe } from './Menu.recipe';
import { MenuRadioGroupContext } from './MenuContext';
import type {
  MenuRadioGroupContextValue,
  MenuRadioGroupProps,
} from './Menu.types';

/**
 * Container for `<Menu.RadioItem>`s. Owns the single-pick state via `useControllableState` and
 * publishes the value + setter through `MenuRadioGroupContext`. The container itself is
 * `role="group"` (paired with an optional leading `<Menu.Label>` via the consumer's grouping).
 */
function MenuRadioGroupImpl(
  props: MenuRadioGroupProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    children,
    className,
    style,
    ...rest
  } = props;

  const [value, setValueInternal] = useControllableState<string>({
    value: valueProp,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange ?? undefined,
  });

  const setValue = useCallback(
    (next: string) => {
      setValueInternal(next);
    },
    [setValueInternal],
  );

  const ctxValue = useMemo<MenuRadioGroupContextValue>(
    () => ({ value: value || undefined, setValue }),
    [value, setValue],
  );

  const { className: groupClass, style: groupStyle } = useThemedClasses({
    recipe: menuGroupRecipe,
    componentName: 'Menu',
    slot: 'group',
    props: { className, style },
  });

  return (
    <MenuRadioGroupContext.Provider value={ctxValue}>
      <div
        ref={forwardedRef}
        role="group"
        className={groupClass}
        style={groupStyle}
        {...rest}
      >
        {children}
      </div>
    </MenuRadioGroupContext.Provider>
  );
}

export const MenuRadioGroup = forwardRef<HTMLDivElement, MenuRadioGroupProps>(MenuRadioGroupImpl);
MenuRadioGroup.displayName = 'Menu.RadioGroup';