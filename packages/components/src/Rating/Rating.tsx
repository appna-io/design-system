'use client';

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import { forwardRef, useControllableState, useDirection, warn } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { useFormFieldA11y } from '../_shared/useFormFieldA11y';

import { ratingFillFraction } from './ratingFillFraction';
import { ratingRecipes } from './Rating.recipe';
import { ratingValueFromPointer } from './ratingValueFromPointer';
import { RatingStar } from './RatingStar';
import { useRatingKeyboard } from './useRatingKeyboard';
import type {
  RatingChangeMeta,
  RatingColor,
  RatingPrecision,
  RatingProps,
  RatingSize,
  RatingValueFormatter,
} from './Rating.types';

const DEFAULT_MAX = 5;
const DEFAULT_VALUE_FORMATTER: RatingValueFormatter = (value, max) =>
  `${formatNumber(value)} out of ${max} stars`;

/**
 * The form-grade rating control. Interactive (`<Rating onChange>`) and read-only display
 * (`<Rating readOnly value={3.71} precision="exact">`) live in the same component — they share
 * the slider role, the icon stack, the label/description/helper wiring, and the hidden input.
 *
 * Keyboard support follows the W3C Slider pattern (Arrow / Home / End / PageUp / PageDown +
 * digit shortcuts), routed through the pure `useRatingKeyboard` hook so the keyboard math has
 * its own unit-test surface independent of React. Pointer math lives in
 * `ratingValueFromPointer` for the same reason. Both honor RTL.
 *
 * Hover preview is gated to mouse pointers — touch never gets a sticky preview state. Only
 * committed values update `aria-valuenow` / `aria-valuetext`; previews stay visual-only.
 *
 * @example
 *   <Rating defaultValue={3} onChange={(v) => setRating(v)} />
 *   <Rating value={3.71} readOnly precision="exact" showValue />
 *   <Rating max={10} defaultValue={7} icon={<MyHeart />} emptyIcon={<MyHeartOutline />} />
 *   <Rating label="Rate your experience" required error="Pick a rating" />
 */
export const Rating = forwardRef<HTMLDivElement, RatingProps>(function Rating(props, ref) {
  const {
    value: valueProp,
    defaultValue,
    onChange,
    max = DEFAULT_MAX,
    precision = 1,
    allowClear = false,
    icon,
    emptyIcon,
    readOnly = false,
    disabled = false,
    required = false,
    name,
    size,
    color,
    showValue = false,
    label,
    description,
    helperText,
    error,
    hideLabel = false,
    ariaLabel,
    formatValueText,
    className,
    style,
    sx,
    id: idProp,
    onPointerMove,
    onPointerLeave,
    onPointerUp,
    onKeyDown: onKeyDownProp,
    ...rest
  } = props;

  warn(
    !(precision === 'exact' && !readOnly),
    '<Rating precision="exact"> is only valid with `readOnly`. Falling back to whole-step ' +
      'interaction for keyboard / pointer; the fractional fill is still rendered from `value`.',
    'RATING_EXACT_INTERACTIVE',
  );

  // The visual fill grid: `'exact'` paints arbitrary fractions, `0.5` paints quarters of
  // visible coverage, `1` paints whole stars only.
  const renderPrecision: RatingPrecision = precision;
  // The interaction grid. Pointer + keyboard quantise here. `'exact'` is read-only-only so
  // interactive precision degrades to `1` for the warned case.
  const interactivePrecision: 1 | 0.5 = precision === 0.5 ? 0.5 : 1;

  const [valueState, setValueState] = useControllableState<number>({
    value: valueProp,
    defaultValue: defaultValue ?? 0,
    onChange: undefined,
  });
  const value = clampValue(valueState ?? 0, max);

  const [hover, setHover] = useState<number | null>(null);

  const resolvedSize: RatingSize = resolveResponsive(size, 'md');
  const resolvedColor: RatingColor = resolveResponsive(color, 'warning');

  const invalid = error != null && error !== false && error !== '';
  const formField = useFormFieldA11y({
    id: idProp,
    invalid,
    required,
  });

  const labelId = label != null ? `${formField.id}-label` : undefined;
  const descriptionId = description != null ? `${formField.id}-desc` : undefined;
  const helperId = helperText != null && !invalid ? `${formField.id}-helper` : undefined;
  const errorId = invalid ? `${formField.id}-error` : undefined;

  const formatter = formatValueText ?? DEFAULT_VALUE_FORMATTER;
  const valueText = useMemo(() => formatter(value, max), [formatter, value, max]);

  const dir = useDirection();
  const trackRef = useRef<HTMLDivElement | null>(null);

  const commit = useCallback(
    (next: number, meta: RatingChangeMeta) => {
      if (disabled || readOnly) return;
      const clamped = clampValue(next, max);
      setValueState(clamped);
      onChange?.(clamped, meta);
    },
    [disabled, readOnly, max, setValueState, onChange],
  );

  const handleKeyDown = useRatingKeyboard({
    value,
    max,
    precision: interactivePrecision,
    allowClear,
    dir,
    disabled,
    readOnly,
    onChange: commit,
  });

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      if (disabled || readOnly) return;
      if (event.pointerType !== 'mouse') return;
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return;
      setHover(
        ratingValueFromPointer({
          pointerX: event.clientX,
          rect,
          max,
          precision: interactivePrecision,
          dir,
        }),
      );
    },
    [onPointerMove, disabled, readOnly, max, interactivePrecision, dir],
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(event);
      setHover(null);
    },
    [onPointerLeave],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      onPointerUp?.(event);
      if (disabled || readOnly) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return;
      const picked = ratingValueFromPointer({
        pointerX: event.clientX,
        rect,
        max,
        precision: interactivePrecision,
        dir,
      });
      if (allowClear && picked === value) {
        commit(0, { source: 'clear' });
        return;
      }
      commit(picked, { source: 'click' });
    },
    [onPointerUp, disabled, readOnly, max, interactivePrecision, dir, allowClear, value, commit],
  );

  // The hover preview wins when present so the user sees what their click will commit.
  const displayValue = hover ?? value;

  const { className: wrapperClass, style: wrapperStyle } = useThemedClasses({
    recipe: ratingRecipes.wrapper,
    componentName: 'Rating',
    slot: 'wrapper',
    props: { className, sx, style },
  });
  const { className: labelClass } = useThemedClasses({
    recipe: ratingRecipes.label,
    componentName: 'Rating',
    slot: 'label',
    props: { hidden: hideLabel, disabled },
  });
  const { className: descriptionClass } = useThemedClasses({
    recipe: ratingRecipes.description,
    componentName: 'Rating',
    slot: 'description',
    props: {},
  });
  const { className: trackClass } = useThemedClasses({
    recipe: ratingRecipes.track,
    componentName: 'Rating',
    slot: 'track',
    props: { size: resolvedSize, disabled, readOnly },
  });
  const { className: valueTextClass } = useThemedClasses({
    recipe: ratingRecipes.valueText,
    componentName: 'Rating',
    slot: 'valueText',
    props: {},
  });
  const { className: helperClass } = useThemedClasses({
    recipe: ratingRecipes.helperText,
    componentName: 'Rating',
    slot: 'helperText',
    props: { invalid },
  });

  const iconFilled = icon ?? <StarFilledSvg />;
  const iconEmpty = emptyIcon ?? icon ?? <StarOutlineSvg />;

  const describedByIds =
    [descriptionId, helperId, errorId].filter((s): s is string => Boolean(s)).join(' ') ||
    undefined;

  return (
    <div
      ref={ref}
      className={wrapperClass}
      style={wrapperStyle}
      data-disabled={disabled || undefined}
    >
      {label != null ? (
        <label htmlFor={formField.id} id={labelId} className={labelClass}>
          {label}
          {required ? (
            <span aria-hidden="true" className="ms-0.5 text-danger">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {description != null ? (
        <span id={descriptionId} className={descriptionClass}>
          {description}
        </span>
      ) : null}

      <div
        ref={trackRef}
        id={formField.id}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={valueText}
        aria-readonly={readOnly || undefined}
        aria-disabled={disabled || undefined}
        aria-invalid={formField['aria-invalid']}
        // `aria-required` isn't in `role="slider"`'s supported states (per WAI-ARIA 1.2), so we
        // surface required-ness through the hidden `<input required>` below + the `*` glyph
        // appended to the label. AT users still hear "required" via the input semantics; the
        // slider's `aria-label` / `aria-labelledby` already cover the field's name.
        data-required={required || undefined}
        aria-label={label == null ? (ariaLabel ?? 'Rating') : undefined}
        aria-labelledby={label != null ? labelId : undefined}
        aria-describedby={describedByIds}
        tabIndex={disabled ? -1 : 0}
        data-orientation="horizontal"
        data-precision={String(precision)}
        data-invalid={formField['data-invalid']}
        className={trackClass}
        onKeyDown={(event) => {
          onKeyDownProp?.(event);
          if (!event.defaultPrevented) handleKeyDown(event);
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerUp={handlePointerUp}
        {...rest}
      >
        {Array.from({ length: max }, (_, i) => {
          const rawFill = ratingFillFraction(displayValue, i);
          const fill = renderPrecision === 'exact' ? rawFill : quantize(rawFill, interactivePrecision);
          return (
            <RatingStar
              key={i}
              position={i + 1}
              fill={fill}
              size={resolvedSize}
              color={resolvedColor}
              iconFilled={iconFilled}
              iconEmpty={iconEmpty}
              dir={dir}
            />
          );
        })}

        {showValue ? (
          <span className={valueTextClass}>
            {formatNumber(value)} of {max}
          </span>
        ) : null}
      </div>

      {name != null ? (
        <input
          type="hidden"
          name={name}
          value={value === 0 ? '' : String(value)}
          {...(required ? { required: true } : {})}
        />
      ) : null}

      {invalid ? (
        <span id={errorId} className={helperClass} role="alert">
          {error}
        </span>
      ) : helperText != null ? (
        <span id={helperId} className={helperClass}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
}, 'Rating');

function StarFilledSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function StarOutlineSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function clampValue(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(0, value));
}

function quantize(fraction: number, precision: 1 | 0.5): number {
  if (precision === 1) return fraction >= 0.5 ? 1 : 0;
  return Math.round(fraction * 2) / 2;
}

function resolveResponsive<T>(value: T | { base?: T } | undefined, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === 'object' && value !== null && 'base' in value) {
    return (value as { base?: T }).base ?? fallback;
  }
  return value as T;
}

function formatNumber(value: number): string {
  // Bundle-conscious; consumers wanting locale-aware formatting wire `formatValueText`.
  if (Number.isInteger(value)) return String(value);
  return String(Math.round(value * 100) / 100);
}

export { DEFAULT_VALUE_FORMATTER };