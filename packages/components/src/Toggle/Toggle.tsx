'use client';

import { forwardRef, useControllableState, warn } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { Children, isValidElement } from 'react';

import { toggleRecipe } from './Toggle.recipe';
import type { ToggleProps } from './Toggle.types';

/**
 * A single binary-state button. Pressed-state lives in `aria-pressed` (the W3C-recommended
 * affordance for a toggle button) and is mirrored to `data-state="on"|"off"` for the recipe.
 *
 * Toggle is independent of `<ToggleGroup>` — useful for sidebar collapse, "Show/Hide", or any
 * one-off binary affordance. For coordinated multi-toggle behavior (segmented controls,
 * toolbars), reach for `<ToggleGroup>`.
 *
 * @example
 *   <Toggle pressed={bold} onPressedChange={setBold} aria-label="Toggle bold">
 *     <BoldIcon />
 *   </Toggle>
 *
 *   <Toggle defaultPressed variant="outline" color="primary">
 *     <BookmarkIcon /> Save for later
 *   </Toggle>
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(props, ref) {
  const {
    pressed: pressedProp,
    defaultPressed = false,
    onPressedChange,
    variant,
    size,
    color,
    disabled,
    className,
    style,
    sx,
    children,
    type, // shadow native <button type> default → 'button' below
    onClick,
    ...rest
  } = props;

  const [pressedRaw, setPressed] = useControllableState<boolean>({
    value: pressedProp,
    defaultValue: defaultPressed,
    onChange: onPressedChange,
  });
  const pressed = pressedRaw ?? defaultPressed ?? false;

  // Dev-mode safety net: a Toggle whose children is icon-only (single element, no string
  // descendant) needs an explicit `aria-label`. Without one the button reads as "button" to
  // screen readers — useless. Toolbar-style toggles MUST hit this branch.
  const hasAccessibleName =
    typeof children === 'string' ||
    (Array.isArray(children) && children.some((c) => typeof c === 'string')) ||
    'aria-label' in props ||
    'aria-labelledby' in props;
  warn(
    hasAccessibleName,
    '<Toggle> with icon-only children needs an `aria-label` or `aria-labelledby`.',
    'TOGGLE_NO_ACCESSIBLE_NAME',
  );

  const { className: cls, style: rootStyle } = useThemedClasses({
    recipe: toggleRecipe,
    componentName: 'Toggle',
    props: { variant, size, color, className, sx, style },
  });

  // Skip the dev warn on `Children.toArray(...).length === 0` — empty children is the consumer
  // explicitly asking for a square icon shell; we leave it to them to add `aria-label`.
  if (process.env.NODE_ENV !== 'production') {
    const arr = Children.toArray(children);
    void arr.every(isValidElement);
  }

  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      aria-pressed={pressed}
      data-state={pressed ? 'on' : 'off'}
      data-disabled={disabled || undefined}
      disabled={disabled}
      className={cls}
      style={rootStyle ?? undefined}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (disabled) return;
        setPressed(!pressed);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}, 'Toggle');