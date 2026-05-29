'use client';

import { mergeRefs } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { ChevronDown } from 'lucide-react';
import {
  forwardRef,
  useCallback,
  type ForwardedRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type Ref,
} from 'react';

import { selectTriggerChevronRecipe, selectTriggerRecipe } from './Select.recipe';
import { useSelectContext } from './SelectContext';
import type { SelectTriggerProps } from './Select.types';

/**
 * The focusable, clickable, ARIA-correct combobox button. Renders:
 *
 *  [leftIcon?] [valueLabel | placeholder] [rightIcon ?? ChevronDown]
 *
 * Reads visual axes (`variant` / `size` / `color` / `fullWidth`) from the Select root via
 * context — Trigger has no axis props of its own. That keeps a single source of styling truth
 * and matches Input/Textarea (where the consumer styles the wrapper, not the inner `<input>`).
 *
 * Keyboard story on Trigger (not on Content):
 *
 *  - `Enter` / `Space` → toggle open.
 *  - `ArrowDown` / `ArrowUp` → open the listbox. (Content's keyboard hook takes over once focus
 *    moves there.)
 *  - All other keys → bubble naturally; the Content takes over for arrow nav once it has focus.
 *
 * `data-state="open|closed"`, `data-placeholder="true"` (when no value), and the standard
 * combobox ARIA attributes (`role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`,
 * `aria-controls`) are always present so themed selectors + screen readers both work.
 */
function SelectTriggerImpl(
  props: SelectTriggerProps,
  forwardedRef: ForwardedRef<HTMLButtonElement>,
): ReactElement {
  const {
    leftIcon,
    rightIcon,
    className,
    style,
    sx,
    onClick,
    onKeyDown,
    disabled: disabledProp,
    type,
    'aria-label': ariaLabelProp,
    'aria-labelledby': ariaLabelledbyProp,
    ...rest
  } = props;

  const ctx = useSelectContext('Select.Trigger');
  const {
    value,
    open,
    setOpen,
    setHighlightedId,
    getAllItems,
    getEnabledItems,
    getLabelForValue,
    triggerRef,
    triggerId,
    contentId,
    variant,
    size,
    color,
    fullWidth,
    placeholder,
    a11y,
    disabled: ctxDisabled,
    itemsVersion,
  } = ctx;

  const disabled = disabledProp || ctxDisabled;

  // Look up the currently-selected item's label. Priority order:
  //  1. The persistent value→label cache (survives Content unmount).
  //  2. The live registry (covers the very first render where the cache hasn't seen this value).
  //  3. Fall back to rendering the raw value string (controlled-from-empty mount race).
  // `itemsVersion` is read so the trigger re-renders when items register / re-label.
  void itemsVersion;
  const cachedLabel = value ? getLabelForValue(value) : undefined;
  const selectedItem = value && !cachedLabel
    ? getAllItems().find((it) => it.value === value)
    : undefined;
  const hasValue = Boolean(value);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (disabled) return;
      setOpen(!open);
    },
    [onClick, disabled, open, setOpen],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (disabled) return;
      const key = event.key;
      if (key === ' ' || key === 'Enter') {
        event.preventDefault();
        setOpen(!open);
        return;
      }
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
        if (!open) {
          // Pre-seed the highlight to the current value (or first enabled item) so the listbox
          // appears with the right row already lit — same UX as macOS / Windows native selects.
          const all = getAllItems();
          const enabled = getEnabledItems();
          const selected = value ? all.find((it) => it.value === value && !it.disabled) : undefined;
          const initial = selected ?? (key === 'ArrowUp' ? enabled[enabled.length - 1] : enabled[0]);
          if (initial) setHighlightedId(initial.id);
          setOpen(true);
        }
        // When already open, Content owns arrow nav — we just let the event bubble.
      }
    },
    [
      onKeyDown,
      disabled,
      open,
      setOpen,
      getAllItems,
      getEnabledItems,
      setHighlightedId,
      value,
    ],
  );

  const { className: triggerClass, style: triggerStyle } = useThemedClasses({
    recipe: selectTriggerRecipe,
    componentName: 'Select',
    slot: 'trigger',
    props: {
      variant,
      size,
      color,
      fullWidth,
      className,
      sx,
      style,
    },
  });

  const { className: chevronClass } = useThemedClasses({
    recipe: selectTriggerChevronRecipe,
    componentName: 'Select',
    slot: 'triggerChevron',
    props: {},
  });

  const composedRef = mergeRefs<HTMLButtonElement>(
    triggerRef as unknown as Ref<HTMLButtonElement>,
    forwardedRef as Ref<HTMLButtonElement>,
  );

  // Render the resolved label when we have one (cache > live registry); fall back to the value
  // string for the controlled-from-empty mount race; the placeholder text otherwise.
  const labelContent = cachedLabel ?? selectedItem?.label ?? (hasValue ? value : placeholder ?? '');

  // ARIA accessible-name resolution. `role="combobox"` is a nameFromAuthor role per the WAI-ARIA
  // spec — its accessible name MUST come from `aria-label` / `aria-labelledby` (or an external
  // `<label htmlFor>`); descendant text content does NOT contribute. Resolution order:
  //   1. Consumer-provided `aria-labelledby` (typically wired to a visible `<label>` element).
  //   2. Consumer-provided `aria-label`.
  //   3. Placeholder text — best-effort fallback when the consumer hasn't passed either.
  //   4. Nothing (axe will flag this; intentional, it's a consumer-bug surface).
  // The fallback to placeholder mirrors how native `<select>` derives its name from a
  // surrounding `<label>` when one exists.
  const resolvedAriaLabel = ariaLabelProp ?? (ariaLabelledbyProp ? undefined : placeholder);

  return (
    <button
      ref={composedRef}
      type={type ?? 'button'}
      role="combobox"
      id={triggerId}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={open ? contentId : undefined}
      aria-label={resolvedAriaLabel}
      aria-labelledby={ariaLabelledbyProp}
      aria-invalid={a11y['aria-invalid']}
      aria-required={a11y['aria-required']}
      aria-describedby={a11y['aria-describedby']}
      data-state={open ? 'open' : 'closed'}
      data-placeholder={hasValue ? undefined : 'true'}
      data-invalid={a11y['data-invalid']}
      data-disabled={disabled ? 'true' : undefined}
      disabled={disabled}
      className={`${triggerClass} group/select-trigger`}
      style={triggerStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {leftIcon ? (
        <span aria-hidden="true" className="inline-flex items-center justify-center shrink-0">
          {leftIcon}
        </span>
      ) : null}
      <span className="flex-1 truncate text-start">{labelContent}</span>
      {rightIcon ?? (
        <ChevronDown aria-hidden="true" className={chevronClass} />
      )}
    </button>
  );
}

export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(SelectTriggerImpl);
SelectTrigger.displayName = 'Select.Trigger';
