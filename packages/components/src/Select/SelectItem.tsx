'use client';

import { mergeRefs } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { Check } from 'lucide-react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  type ForwardedRef,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

import { selectItemIndicatorRecipe, selectItemRecipe } from './Select.recipe';
import { useSelectContext } from './SelectContext';
import type { SelectItemProps } from './Select.types';

/**
 * A single `<Select.Item>`. Registers with the root on mount with its `value`, its render label
 * (the `children`), and its type-ahead `textValue`. The Trigger consults the registry to render
 * the label of the currently-selected value; the Content's keyboard hook consults it for arrow
 * nav and prefix matching.
 *
 * Selection is fired from both mouse and keyboard via a single onClick — Content's `onSelect`
 * dispatches a synthetic `node.click()` (same pattern Menu uses), so the item only has to
 * implement onClick once.
 *
 * Highlight state is data-attribute driven. Pointer-move sets the highlight so mouse hover and
 * keyboard nav share a single signal — when the user switches input modes mid-listbox, the
 * highlight doesn't desync.
 *
 * `data-selected="true"` is set when the item's value matches the root's value. The
 * `SelectItemIndicator` slot (rendered inline below for the default look) shows the Check icon
 * only when `data-selected="true"`.
 */
function SelectItemImpl(
  props: SelectItemProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    value: itemValue,
    leftIcon,
    disabled = false,
    textValue: textValueProp,
    sx,
    style,
    className,
    children,
    onClick,
    onPointerMove,
    onPointerLeave,
    ...rest
  } = props;

  const ctx = useSelectContext('Select.Item');
  const {
    value: selectedValue,
    setValue,
    setHighlightedId,
    highlightedId,
    registerItem,
    size,
  } = ctx;

  // Stable per-instance id (the React-provided id is unique per mounted component).
  const id = useId();

  const nodeRef = useRef<HTMLDivElement | null>(null);

  // Type-ahead `textValue`: explicit prop wins, then primitive children, then aria-label, else
  // empty. Matching the consumer-facing fallback chain in Menu.
  const textValue = useMemo(() => {
    if (typeof textValueProp === 'string') return textValueProp;
    if (typeof children === 'string') return children;
    const aria = (rest as { 'aria-label'?: string })['aria-label'];
    return aria ?? '';
  }, [textValueProp, children, rest]);

  // The label we hand to the registry — the Trigger reads it back to render the selected label.
  // We use whatever the consumer passed as children (string, JSX, etc.); the registry consumer
  // (Trigger) renders it inside its label span without modification.
  const label: ReactNode = children;

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    registerItem(id, node, { textValue, label, disabled }, itemValue);
    return () => {
      registerItem(id, null, { textValue, label, disabled }, itemValue);
    };
  }, [id, textValue, label, disabled, itemValue, registerItem]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (disabled) return;
      setValue(itemValue);
    },
    [onClick, disabled, itemValue, setValue],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      if (event.defaultPrevented) return;
      if (disabled) return;
      if (highlightedId !== id) setHighlightedId(id);
    },
    [onPointerMove, disabled, highlightedId, id, setHighlightedId],
  );

  const handlePointerLeave = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(event);
      if (event.defaultPrevented) return;
      if (highlightedId === id) setHighlightedId(null);
    },
    [onPointerLeave, highlightedId, id, setHighlightedId],
  );

  const { className: itemClass, style: itemStyle } = useThemedClasses({
    recipe: selectItemRecipe,
    componentName: 'Select',
    slot: 'item',
    props: {
      size,
      className,
      sx,
      style,
    },
  });

  const { className: indicatorClass } = useThemedClasses({
    recipe: selectItemIndicatorRecipe,
    componentName: 'Select',
    slot: 'itemIndicator',
    props: {},
  });

  const composedRef = mergeRefs<HTMLDivElement>(
    nodeRef as unknown as Ref<HTMLDivElement>,
    forwardedRef as Ref<HTMLDivElement>,
  );

  const highlighted = highlightedId === id;
  const selected = selectedValue === itemValue;

  // Keyboard handling for items lives at <Select.Content>'s onKeyDown — the shared keyboard hook
  // dispatches `node.click()` so this onClick captures both mouse and keyboard. The lint rule
  // can't see across that indirection, so we disable it for this element specifically. Same
  // rationale as MenuItem.tsx.
  return (
    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events */
    <div
      ref={composedRef}
      id={id}
      role="option"
      tabIndex={-1}
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      data-highlighted={highlighted ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      data-selected={selected ? 'true' : undefined}
      data-value={itemValue}
      className={itemClass}
      style={itemStyle}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...rest}
    >
      {leftIcon ? (
        <span aria-hidden="true" className="inline-flex items-center justify-center shrink-0">
          {leftIcon}
        </span>
      ) : null}
      <span className="flex-1 truncate">{children}</span>
      {selected ? (
        <span aria-hidden="true" className={indicatorClass}>
          <Check className="size-4" />
        </span>
      ) : null}
    </div>
  );
}

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(SelectItemImpl);
SelectItem.displayName = 'Select.Item';
