'use client';

import {
  forwardRef,
  useControllableState,
  useId,
  warn,
} from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useCallback, useEffect, useRef, type ChangeEvent, type Ref } from 'react';

import { useFormFieldA11y } from '../_shared/useFormFieldA11y';
import { CheckIcon, MinusIcon } from './Checkbox.icons';
import { checkboxRecipes } from './Checkbox.recipe';
import type { CheckboxProps, CheckboxSize } from './Checkbox.types';

/**
 * The canonical boolean control. Renders a real `<input type="checkbox">` (visually hidden but
 * keyboard-reachable + form-participating) inside a `<label>` along with a custom-painted
 * indicator span. Establishes the **hidden-input + custom-indicator** pattern reused by Switch
 * (Phase 10) and Radio (Phase 11).
 *
 * Tri-state: `indeterminate && !checked` paints the indeterminate look and sets
 * `aria-checked="mixed"`. Native HTML lets `indeterminate` coexist with either `checked` value;
 * we follow that semantics.
 *
 * Three-slot recipe via `useThemedClasses({ slot })`:
 *  - `root`   → the `<label>` wrapper
 *  - `control` → the indicator `<span>` (where the variant × color matrix lives)
 *  - `label`   → the text span beside the indicator
 *
 * @example
 *   <Checkbox onCheckedChange={setAccepted}>Accept terms</Checkbox>
 *   <Checkbox indeterminate>Some selected</Checkbox>
 *   <Checkbox color="danger" invalid description="Required.">Delete account</Checkbox>
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(props, ref) {
  const {
    variant,
    size,
    color,
    shape,
    labelPosition,
    checked: checkedProp,
    defaultChecked,
    indeterminate = false,
    invalid = false,
    disabled = false,
    required = false,
    name,
    value,
    description,
    children,
    onCheckedChange,
    onChange,
    className,
    style,
    sx,
    id: providedId,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...rest
  } = props;

  const [checked = false, setChecked] = useControllableState<boolean>({
    value: checkedProp,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });

  const internalId = useId(providedId);
  const descriptionAutoId = useId();
  const hasDescription = description != null && description !== false && description !== '';
  const composedDescribedBy = mergeDescribedBy(
    ariaDescribedBy,
    hasDescription ? descriptionAutoId : undefined,
  );

  const a11y = useFormFieldA11y({
    id: internalId,
    invalid,
    required,
    'aria-describedby': composedDescribedBy,
  });

  const state = indeterminate && !checked ? 'indeterminate' : checked ? 'checked' : 'unchecked';
  const effectiveSize = resolveBaseSize(size);

  warn(
    Boolean(children) || Boolean(ariaLabel) || Boolean(ariaLabelledBy),
    '<Checkbox> needs an accessible name. Pass children, `aria-label`, or `aria-labelledby`.',
    'CHECKBOX_NO_LABEL',
  );

  const { className: rootCls, style: rootStyle } = useThemedClasses({
    recipe: checkboxRecipes.root,
    componentName: 'Checkbox',
    slot: 'root',
    props: { size, labelPosition, className, sx, style },
  });
  const { className: controlCls } = useThemedClasses({
    recipe: checkboxRecipes.control,
    componentName: 'Checkbox',
    slot: 'control',
    props: { variant, size, color, shape },
  });
  const { className: labelCls } = useThemedClasses({
    recipe: checkboxRecipes.label,
    componentName: 'Checkbox',
    slot: 'label',
    props: { size },
  });

  const inputRef = useIndeterminateRef(indeterminate);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      setChecked(event.target.checked);
    },
    [onChange, setChecked],
  );

  return (
    <label
      htmlFor={a11y.id}
      className={rootCls}
      style={rootStyle ?? undefined}
      data-disabled={disabled || undefined}
      data-state={state}
    >
      <input
        ref={mergeRefs(ref, inputRef)}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        name={name}
        value={value}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-checked={indeterminate && !checked ? 'mixed' : undefined}
        onChange={handleChange}
        {...rest}
        {...a11y}
      />
      <span
        aria-hidden="true"
        className={controlCls}
        data-state={state}
        data-invalid={invalid || undefined}
      >
        {state === 'checked' ? <CheckIcon /> : null}
        {state === 'indeterminate' ? <MinusIcon /> : null}
      </span>
      {hasDescription || children ? (
        <span className={textWrapperClass(effectiveSize)}>
          {children ? <span className={labelCls}>{children}</span> : null}
          {hasDescription ? (
            <span
              id={descriptionAutoId}
              className="text-xs text-fg-muted leading-snug mt-0.5"
            >
              {description}
            </span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
}, 'Checkbox');

/**
 * Tiny ref callback factory that writes the `indeterminate` DOM property (not an HTML attribute,
 * so React can't set it declaratively). Returns a stable callback ref that mirrors prop changes.
 */
function useIndeterminateRef(indeterminate: boolean): Ref<HTMLInputElement> {
  const inputElRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputElRef.current) {
      inputElRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  return useCallback((node: HTMLInputElement | null) => {
    inputElRef.current = node;
    if (node) {
      node.indeterminate = indeterminate;
    }
    // `indeterminate` deliberately omitted from deps — the useEffect above mirrors prop changes
    // after mount. This callback only runs on attach / detach.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Per-size wrapper around the label + description column. The `mt-` value approximately
 * vertically centers the label baseline with the checkbox box center.
 */
function textWrapperClass(size: CheckboxSize): string {
  switch (size) {
    case 'sm':
      return 'flex flex-col -mt-px';
    case 'lg':
      return 'flex flex-col';
    case 'md':
    default:
      return 'flex flex-col';
  }
}

/**
 * Merge two `aria-describedby` strings (space-separated, dedup). Returns `undefined` when both
 * are empty so the input doesn't pick up an empty attribute.
 */
function mergeDescribedBy(a: string | undefined, b: string | undefined): string | undefined {
  if (!a && !b) return undefined;
  if (!a) return b;
  if (!b) return a;
  const tokens = new Set<string>();
  for (const t of `${a} ${b}`.split(/\s+/)) {
    if (t) tokens.add(t);
  }
  return Array.from(tokens).join(' ') || undefined;
}

/**
 * Pull the non-responsive `size` value used for the text-column wrapper. Mirrors the same
 * pattern used by Input + Badge.
 */
function resolveBaseSize(value: CheckboxProps['size']): CheckboxSize {
  if (value === undefined) return 'md';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, CheckboxSize>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'md';
  }
  return 'md';
}

type AnyRef<T> = React.RefCallback<T> | React.MutableRefObject<T | null> | null | undefined;

function mergeRefs<T>(...refs: AnyRef<T>[]): React.RefCallback<T> {
  return (value) => {
    for (const r of refs) {
      if (typeof r === 'function') {
        r(value);
      } else if (r != null) {
        (r as React.MutableRefObject<T | null>).current = value;
      }
    }
  };
}
