'use client';

import { forwardRef, warn } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useCallback, useRef, type KeyboardEvent } from 'react';

import { toggleAttachedRecipe, toggleRecipe } from './Toggle.recipe';
import { useToggleGroupContext } from './ToggleGroupContext';
import type { ToggleAttachedPosition, ToggleGroupItemProps } from './Toggle.types';

/**
 * One toggle inside a `<ToggleGroup>`. Reads everything from `ToggleGroupContext` — variant /
 * size / color / orientation / attached / press state / position. Handles two ARIA contracts:
 *
 *  - In a `type="single"` group (`role="radiogroup"`): emits `role="radio"` +
 *    `aria-checked` + roving `tabIndex` (0 for the pressed item, -1 for others, 0 for none-
 *    pressed first item). Arrow keys move focus **and activate** — the canonical radio pattern.
 *  - In a `type="multiple"` group (`role="group"`): emits `role="button"` + `aria-pressed` +
 *    `tabIndex=0` on every item. Arrow keys move focus **without activating**; Space / Enter
 *    activate (native button behavior). Matches checkbox-group convention.
 */
export const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  function ToggleGroupItem(props, ref) {
    const {
      value,
      disabled: itemDisabled = false,
      className,
      style,
      sx,
      children,
      onClick,
      onKeyDown,
      type,
      ...rest
    } = props;

    const group = useToggleGroupContext('ToggleGroup.Item');

    // We want `setRefs` to stay stable across group state changes — otherwise React's "old
    // callback(null) → new callback(el)" ref-detach dance fires on every press, briefly
    // clearing the group's registry mid-render and breaking keyboard nav from any item
    // whose handler runs right after a state update. Stash the latest forwarded `ref` and
    // `registerItem` in mutable refs so the callback identity only depends on `value`.
    const localRef = useRef<HTMLButtonElement | null>(null);
    const forwardedRef = useRef(ref);
    forwardedRef.current = ref;
    const registerItem = group.registerItem;
    const registerRef = useRef(registerItem);
    registerRef.current = registerItem;

    const setRefs = useCallback(
      (el: HTMLButtonElement | null) => {
        localRef.current = el;
        const fwd = forwardedRef.current;
        if (typeof fwd === 'function') {
          fwd(el);
        } else if (fwd) {
          (fwd as React.MutableRefObject<HTMLButtonElement | null>).current = el;
        }
        // setRefs is also invoked with `null` on unmount, which handles deregistration —
        // no separate cleanup effect needed.
        registerRef.current(value, el);
      },
      [value],
    );

    const pressed = group.isPressed(value);
    const resolvedDisabled = itemDisabled || group.disabled;

    // Compute the segmented position from the context's pre-built index map. `single` means
    // either the group only has one item OR `attached={false}` (no rounding adjustments
    // needed). For `attached={true}` with multiple items, first / middle / last drives the
    // corner-radius + negative-margin compound rows in `toggleAttachedRecipe`.
    const position = computePosition(group.itemIndexById.get(value), group.itemCount, group.attached);

    // Dev-warn loudly when an item has no accessible name. Most ToggleGroup items are icon-
    // only ("bold / italic / left-align" toolbars) and silently mounting an unlabelled radio
    // is an axe failure waiting to happen.
    const hasName =
      typeof children === 'string' ||
      'aria-label' in props ||
      'aria-labelledby' in props;
    warn(
      hasName,
      '<ToggleGroup.Item> with icon-only children needs an `aria-label` or `aria-labelledby`.',
      'TOGGLEGROUP_ITEM_NO_NAME',
    );

    const { className: cls, style: rootStyle } = useThemedClasses({
      recipe: toggleRecipe,
      componentName: 'Toggle',
      props: {
        variant: group.variant,
        size: group.size,
        color: group.color,
        className,
        sx,
        style,
      },
    });

    const { className: attachedCls } = useThemedClasses({
      recipe: toggleAttachedRecipe,
      componentName: 'ToggleGroup',
      slot: 'item',
      props: {
        orientation: group.orientation,
        position,
      },
    });

    const finalClassName = group.attached ? `${cls} ${attachedCls}`.trim() : cls;

    // Keyboard handling. For both modes, ArrowDown/Right move forward, ArrowUp/Left move back,
    // Home/End jump to ends. The `orientation` axis remaps logical directions to physical
    // keys: in vertical mode Up/Down navigate; in horizontal mode Left/Right do. We accept
    // both sets in both orientations for forgiveness — power users hitting Right on a
    // vertical group still get a sensible result.
    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;

        const isForward =
          event.key === 'ArrowDown' ||
          event.key === 'ArrowRight' ||
          (group.orientation === 'horizontal' && event.key === 'ArrowRight') ||
          (group.orientation === 'vertical' && event.key === 'ArrowDown');
        const isBackward =
          event.key === 'ArrowUp' ||
          event.key === 'ArrowLeft' ||
          (group.orientation === 'horizontal' && event.key === 'ArrowLeft') ||
          (group.orientation === 'vertical' && event.key === 'ArrowUp');
        const isHome = event.key === 'Home';
        const isEnd = event.key === 'End';

        if (!isForward && !isBackward && !isHome && !isEnd) return;

        const enabled = group.getOrderedEnabledValues();
        if (enabled.length === 0) return;

        event.preventDefault();
        let nextValue: string;
        if (isHome) {
          nextValue = enabled[0]!;
        } else if (isEnd) {
          nextValue = enabled[enabled.length - 1]!;
        } else {
          const current = enabled.indexOf(value);
          const safe = current < 0 ? 0 : current;
          const step = isForward ? 1 : -1;
          const next = (safe + step + enabled.length) % enabled.length;
          nextValue = enabled[next]!;
        }
        group.focusValue(nextValue);
        // In single mode (radiogroup), focus + activation are coupled — moving to a sibling
        // immediately presses it. In multiple mode, focus moves without changing state.
        if (group.type === 'single') {
          group.toggle(nextValue);
        }
      },
      [group, value, onKeyDown],
    );

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (resolvedDisabled) return;
        group.toggle(value);
      },
      [onClick, resolvedDisabled, group, value],
    );

    // ARIA shape per group type. Single = radio semantics; multiple = button + aria-pressed.
    const ariaProps =
      group.type === 'single'
        ? ({ role: 'radio', 'aria-checked': pressed } as const)
        : ({ role: 'button', 'aria-pressed': pressed } as const);

    // Roving tabindex for single mode (only the pressed item is `tabIndex=0`; if none are
    // pressed, the first enabled item gets focus). All items focusable in multi-mode.
    const tabIndex = computeTabIndex(
      group.type,
      pressed,
      group.hasAnyPressed,
      group.itemIndexById.get(value),
    );

    return (
      <button
        ref={setRefs}
        type={type ?? 'button'}
        data-state={pressed ? 'on' : 'off'}
        data-disabled={resolvedDisabled || undefined}
        data-attached={group.attached || undefined}
        data-attached-position={group.attached ? position : undefined}
        disabled={resolvedDisabled}
        tabIndex={tabIndex}
        className={finalClassName}
        style={rootStyle ?? undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...ariaProps}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

ToggleGroupItem.displayName = 'ToggleGroup.Item';

function computePosition(
  index: number | undefined,
  total: number,
  attached: boolean,
): ToggleAttachedPosition {
  if (!attached || total <= 1 || index === undefined) return 'single';
  if (index === 0) return 'first';
  if (index === total - 1) return 'last';
  return 'middle';
}

function computeTabIndex(
  type: 'single' | 'multiple',
  pressed: boolean,
  hasAnyPressed: boolean,
  index: number | undefined,
): number {
  if (type === 'multiple') return 0;
  // Single-mode roving:
  //  - If at least one item is pressed, only the pressed item is tabbable.
  //  - If nothing is pressed, the first item is the entry point so keyboard users can
  //    still tab in; arrow keys take over from there.
  if (pressed) return 0;
  if (!hasAnyPressed && index === 0) return 0;
  return -1;
}