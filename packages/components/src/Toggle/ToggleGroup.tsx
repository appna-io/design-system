'use client';

import { forwardRef, warn } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { Children, isValidElement, useCallback, useMemo, useRef } from 'react';

import { toggleGroupRecipe } from './Toggle.recipe';
import { ToggleGroupContext } from './ToggleGroupContext';
import { useToggleGroup } from './useToggleGroup';
import type {
  ToggleColor,
  ToggleGroupContextValue,
  ToggleGroupProps,
  ToggleGroupRootHTMLAttributes,
  ToggleSize,
  ToggleVariant,
} from './Toggle.types';

/**
 * Coordinates a row (or column) of `<ToggleGroup.Item>` buttons. Mode is selected via the
 * discriminated `type` prop:
 *
 *  - `type="single"` → behaves like `<RadioGroup>`. Root is `role="radiogroup"`. Items get
 *    `role="radio"` + `aria-checked` + roving tabindex (only the pressed item is `tabIndex=0`;
 *    others are `-1`). Arrow keys move focus AND activate.
 *  - `type="multiple"` → behaves like a checkbox group. Root is `role="group"`. Items get
 *    `role="button"` + `aria-pressed` + `tabIndex=0` on each. Arrow keys move focus but
 *    don't auto-activate; Space/Enter toggle.
 *
 * `attached` joins neighboring items into a segmented control (shared borders, flat inner
 * corners) — driven by the `position` axis on `toggleAttachedRecipe`. Position is computed
 * once per group render by walking `Children` and reading each `<ToggleGroup.Item>`'s
 * `value` prop, so item ordering is known synchronously (no post-mount lag).
 */
export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps & ToggleGroupRootHTMLAttributes>(
  function ToggleGroup(props, ref) {
    const {
      type = 'single',
      value: valueProp,
      defaultValue,
      onValueChange,
      variant,
      size,
      color,
      attached = false,
      orientation = 'horizontal',
      disabled = false,
      className,
      style,
      sx,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      children,
      ...rest
    } = props as ToggleGroupProps &
      ToggleGroupRootHTMLAttributes & {
        type?: 'single' | 'multiple';
        value?: string | string[];
        defaultValue?: string | string[];
        onValueChange?: (value: string | string[]) => void;
        required?: boolean;
      };

    // `required` only exists on the single-mode branch of the discriminated union. Read once
    // through a focused cast; `useToggleGroup` itself ignores it in multi-mode.
    const required =
      type === 'single' ? ((props as { required?: boolean }).required ?? false) : false;

    const { isPressed, toggle } = useToggleGroup({
      type,
      ...(valueProp !== undefined && { value: valueProp }),
      ...(defaultValue !== undefined && { defaultValue }),
      ...(onValueChange && { onValueChange }),
      required,
    });

    // Loud dev warn so silent groups don't slip past axe / story authoring.
    warn(
      Boolean(ariaLabel) || Boolean(ariaLabelledBy),
      '<ToggleGroup> needs `aria-label` or `aria-labelledby` for screen reader users.',
      'TOGGLEGROUP_NO_LABEL',
    );

    // Pre-compute the item-index map from React children. This runs synchronously per render,
    // so items get their position info on the first paint — not on a second pass after refs
    // have stabilized. Non-`<ToggleGroup.Item>` children (e.g. a stray divider) are skipped.
    const itemIndexById = useMemo(() => {
      const map = new Map<string, number>();
      let i = 0;
      Children.forEach(children, (child) => {
        if (!isValidElement(child)) return;
        const props = child.props as { value?: unknown };
        if (typeof props.value !== 'string') return;
        map.set(props.value, i++);
      });
      return map;
    }, [children]);

    // Item registry → DOM elements. Used for keyboard nav (arrow / home / end) and for
    // `focusValue(v)` calls from inside the item's key handler. Mutating a ref doesn't cause
    // re-renders, which is exactly what we want — re-running the group on every focus move
    // would be wasted work.
    const itemsRef = useRef<Map<string, HTMLButtonElement>>(new Map());

    const registerItem = useCallback((value: string, element: HTMLButtonElement | null) => {
      if (element) {
        itemsRef.current.set(value, element);
      } else {
        itemsRef.current.delete(value);
      }
    }, []);

    const getOrderedEnabledValues = useCallback((): string[] => {
      const entries: Array<[string, HTMLButtonElement]> = [];
      itemsRef.current.forEach((el, v) => {
        if (!el.disabled) entries.push([v, el]);
      });
      entries.sort(([, a], [, b]) => {
        const position = a.compareDocumentPosition(b);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
      });
      return entries.map(([v]) => v);
    }, []);

    const focusValue = useCallback((value: string) => {
      itemsRef.current.get(value)?.focus();
    }, []);

    // Cheap once-per-render check used by items to choose between "first item is the entry
    // point" and "the pressed item is the entry point" tabindex strategies in single-mode.
    const hasAnyPressed = useMemo(() => {
      for (const v of itemIndexById.keys()) {
        if (isPressed(v)) return true;
      }
      return false;
    }, [itemIndexById, isPressed]);

    const ctxValue: ToggleGroupContextValue = useMemo(
      () => ({
        type,
        variant: resolveVariant(variant),
        size: resolveSize(size),
        color: resolveColor(color),
        orientation,
        attached,
        disabled,
        itemIndexById,
        itemCount: itemIndexById.size,
        hasAnyPressed,
        isPressed,
        toggle,
        registerItem,
        getOrderedEnabledValues,
        focusValue,
      }),
      [
        type,
        variant,
        size,
        color,
        orientation,
        attached,
        disabled,
        itemIndexById,
        hasAnyPressed,
        isPressed,
        toggle,
        registerItem,
        getOrderedEnabledValues,
        focusValue,
      ],
    );

    const { className: rootClass, style: rootStyle } = useThemedClasses({
      recipe: toggleGroupRecipe,
      componentName: 'ToggleGroup',
      slot: 'root',
      props: { orientation, attached, className, sx, style },
    });

    const role = type === 'single' ? 'radiogroup' : 'group';

    // exactOptionalPropertyTypes refuses to spread `string | undefined` ARIA keys; gather
    // explicitly so the wire shape only carries the keys that are actually set.
    const ariaProps: { 'aria-label'?: string; 'aria-labelledby'?: string } = {};
    if (ariaLabel) ariaProps['aria-label'] = ariaLabel;
    if (ariaLabelledBy) ariaProps['aria-labelledby'] = ariaLabelledBy;

    // `aria-orientation` is only defined on `role="radiogroup"`. Emitting it on `role="group"`
    // (multi-mode) trips axe's aria-allowed-attr rule. `data-orientation` is what our recipes
    // and consumers should target instead.
    const ariaOrientationProps =
      type === 'single' ? ({ 'aria-orientation': orientation } as const) : {};

    return (
      <ToggleGroupContext.Provider value={ctxValue}>
        <div
          ref={ref}
          role={role}
          data-orientation={orientation}
          data-attached={attached || undefined}
          className={rootClass}
          style={rootStyle ?? undefined}
          {...ariaOrientationProps}
          {...ariaProps}
          {...rest}
        >
          {children}
        </div>
      </ToggleGroupContext.Provider>
    );
  },
);

ToggleGroup.displayName = 'ToggleGroup';

function resolveVariant(value: ToggleGroupProps['variant']): ToggleVariant {
  if (value === undefined) return 'ghost';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, ToggleVariant>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'ghost';
  }
  return 'ghost';
}

function resolveSize(value: ToggleGroupProps['size']): ToggleSize {
  if (value === undefined) return 'md';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, ToggleSize>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'md';
  }
  return 'md';
}

function resolveColor(value: ToggleGroupProps['color']): ToggleColor {
  if (value === undefined) return 'neutral';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, ToggleColor>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'neutral';
  }
  return 'neutral';
}
