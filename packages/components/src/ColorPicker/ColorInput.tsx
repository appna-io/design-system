'use client';

import { forwardRef, useControllableState, useId } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useEffect, useState, type ChangeEvent, type FocusEvent, type KeyboardEvent } from 'react';

import { detectFormat, formatColor, parseColor } from './_shared/color';
import { useFormFieldA11y } from '../_shared/useFormFieldA11y';
import { colorPickerRecipes } from './ColorPicker.recipe';
import type { ColorInputProps } from './ColorPicker.types';

/**
 * Text-only color form control. A simple text input + leading swatch — no popover, no
 * saturation square. Use when consumers want hex / rgb / hsl entry without the visual picker
 * (e.g. inside a Theme Studio token row, or as a CLI-like color field).
 *
 * Commits on Enter / blur. Invalid input on commit reverts to the previous canonical value.
 */
export const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(function ColorInput(
  props,
  ref,
) {
  const {
    value: valueProp,
    defaultValue,
    onChange,
    format = 'auto',
    enableAlpha = false,
    size = 'md',
    label,
    description,
    helperText,
    error,
    hideLabel = false,
    required = false,
    disabled = false,
    readOnly = false,
    name,
    id: providedId,
    ariaLabel,
    className,
    style,
    sx,
    ...rest
  } = props;

  const [committed, setCommitted] = useControllableState<string>({
    value: valueProp,
    defaultValue: defaultValue ?? '#000000',
    onChange: undefined,
  });
  const value = committed ?? '#000000';

  const invalid = error != null && error !== false && error !== '';
  const a11y = useFormFieldA11y({ id: providedId, invalid, required });
  const reactId = useId(providedId);
  const labelId = label != null ? `${a11y.id}-label` : undefined;
  const descriptionId = description != null ? `${a11y.id}-desc` : undefined;
  const helperId = helperText != null && !invalid ? `${a11y.id}-helper` : undefined;
  const errorId = invalid ? `${a11y.id}-error` : undefined;

  const [draft, setDraft] = useState<string>(value);
  useEffect(() => {
    setDraft(value);
  }, [value]);

  const { className: wrapperCls, style: wrapperStyle } = useThemedClasses({
    recipe: colorPickerRecipes.wrapper,
    componentName: 'ColorInput',
    slot: 'wrapper',
    props: { className, sx, style },
  });
  const { className: labelCls } = useThemedClasses({
    recipe: colorPickerRecipes.label,
    componentName: 'ColorInput',
    slot: 'label',
    props: { hidden: hideLabel, disabled },
  });
  const { className: descriptionCls } = useThemedClasses({
    recipe: colorPickerRecipes.description,
    componentName: 'ColorInput',
    slot: 'description',
    props: {},
  });
  const { className: helperCls } = useThemedClasses({
    recipe: colorPickerRecipes.helperText,
    componentName: 'ColorInput',
    slot: 'helperText',
    props: { invalid },
  });
  const { className: triggerCls } = useThemedClasses({
    recipe: colorPickerRecipes.trigger,
    componentName: 'ColorInput',
    slot: 'trigger',
    props: { triggerVariant: 'input', size, disabled },
  });
  const { className: chipCls } = useThemedClasses({
    recipe: colorPickerRecipes.triggerSwatch,
    componentName: 'ColorInput',
    slot: 'triggerSwatch',
    props: { size },
  });
  const { className: textCls } = useThemedClasses({
    recipe: colorPickerRecipes.triggerInput,
    componentName: 'ColorInput',
    slot: 'triggerInput',
    props: { size },
  });

  const chipStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(${value}, ${value}), repeating-conic-gradient(var(--sds-palette-background-subtle) 0% 25%, transparent 0% 50%)`,
    backgroundSize: '100% 100%, 8px 8px',
  };

  const describedByIds =
    [descriptionId, helperId, errorId].filter((s): s is string => Boolean(s)).join(' ') ||
    undefined;

  const commit = () => {
    const text = draft.trim();
    if (!text) {
      setDraft(value);
      return;
    }
    const parsed = parseColor(text);
    if (parsed.r === 0 && parsed.g === 0 && parsed.b === 0 && !/(^#?0{3,}|black|^rgb)/i.test(text)) {
      // Couldn't actually parse — revert silently.
      setDraft(value);
      return;
    }
    const outputFormat = format === 'auto' ? detectFormat(text) : format;
    const normalized = enableAlpha
      ? formatColor(parsed, outputFormat)
      : formatColor({ ...parsed, a: 1 }, outputFormat);
    setCommitted(normalized);
    setDraft(normalized);
    onChange?.(normalized, { format: outputFormat, source: 'input' });
  };

  const onKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setDraft(value);
      event.currentTarget.blur();
    }
  };

  const onBlur = (event: FocusEvent<HTMLInputElement>) => {
    commit();
    rest.onBlur?.(event as unknown as FocusEvent<HTMLDivElement>);
  };

  return (
    <div className={wrapperCls} style={wrapperStyle ?? undefined} {...rest}>
      {label != null ? (
        <label htmlFor={a11y.id} id={labelId} className={labelCls}>
          {label}
          {required ? (
            <span aria-hidden="true" className="ms-0.5 text-danger">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {description != null ? (
        <span id={descriptionId} className={descriptionCls}>
          {description}
        </span>
      ) : null}
      <div className={triggerCls} data-invalid={invalid || undefined}>
        <span aria-hidden="true" className={chipCls} style={chipStyle} />
        <input
          ref={ref}
          id={a11y.id}
          type="text"
          autoComplete="off"
          spellCheck={false}
          className={textCls}
          value={draft}
          disabled={disabled}
          readOnly={readOnly}
          aria-label={label == null ? ariaLabel ?? 'Color' : undefined}
          aria-labelledby={label != null ? labelId : undefined}
          aria-describedby={describedByIds}
          aria-invalid={a11y['aria-invalid']}
          aria-required={a11y['aria-required']}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft(event.target.value)}
          onKeyDown={onKey}
          onBlur={onBlur}
        />
      </div>
      {name ? (
        <input
          id={`${reactId}-hidden`}
          type="hidden"
          name={name}
          value={value}
          {...(required ? { required: true } : {})}
        />
      ) : null}
      {invalid ? (
        <span id={errorId} className={helperCls} role="alert">
          {error}
        </span>
      ) : helperText != null ? (
        <span id={helperId} className={helperCls}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
}, 'ColorInput');