'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { progressRecipes } from './Progress.recipe';
import type { ProgressProps } from './Progress.types';
import { useProgressValue } from './useProgressValue';

/**
 * Linear progress indicator. CSS-only animation (no Motion library) — the `striped` overlay is a
 * pure background-image gradient and the `indeterminate` sweep is a Tailwind-preset keyframe.
 *
 * `<Progress />` ships in three slots — `track` (the wrapper), `bar` (the inner fill), `label`
 * (the optional inline percentage). Every slot is themable through
 * `theme.components.Progress.styleOverrides.{track,bar,label}`.
 *
 * @example
 *   <Progress value={66} />
 *   <Progress value={40} variant="soft" color="success" showLabel />
 *   <Progress indeterminate color="info" />
 *   <Progress variant="striped" value={75} />
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(props, ref) {
  const {
    value,
    min = 0,
    max = 100,
    indeterminate = false,
    variant,
    size,
    color,
    rounded,
    showLabel = false,
    labelFormat,
    animated = true,
    striped = false,
    className,
    style,
    sx,
    ...rest
  } = props;

  const { clampedValue, percent } = useProgressValue({ value, min, max, indeterminate });

  const { className: trackClass, style: trackStyle } = useThemedClasses({
    recipe: progressRecipes.track,
    componentName: 'Progress',
    slot: 'track',
    props: { variant, size, color, rounded, className, sx, style },
  });

  const { className: barClass } = useThemedClasses({
    recipe: progressRecipes.bar,
    componentName: 'Progress',
    slot: 'bar',
    props: { color },
  });

  const { className: labelClass } = useThemedClasses({
    recipe: progressRecipes.label,
    componentName: 'Progress',
    slot: 'label',
    props: { size },
  });

  // `striped` (boolean shortcut) and `variant='striped'` both feed the same data attribute. We
  // resolve the effective base value of the responsive `variant` prop here so the recipe and the
  // data-attribute agree on every breakpoint that doesn't override it.
  const baseVariant = resolveBaseVariant(variant);
  const isStriped = striped || baseVariant === 'striped';

  const formattedValue = labelFormat
    ? labelFormat(clampedValue, max)
    : `${Math.round(percent)}%`;
  const ariaValueText = indeterminate ? 'Loading' : formattedValue;

  return (
    <div
      ref={ref}
      className={trackClass}
      style={trackStyle ?? undefined}
      role="progressbar"
      aria-valuemin={min}
      aria-valuemax={max}
      {...(indeterminate ? {} : { 'aria-valuenow': clampedValue })}
      aria-valuetext={ariaValueText}
      data-variant={baseVariant ?? 'solid'}
      data-indeterminate={indeterminate || undefined}
      {...rest}
    >
      <div
        className={barClass}
        style={indeterminate ? undefined : { width: `${percent}%` }}
        data-indeterminate={indeterminate || undefined}
        data-striped={isStriped || undefined}
        data-animated={animated ? undefined : 'false'}
      />
      {showLabel && !indeterminate ? (
        <span className={labelClass} aria-hidden="true">
          {formattedValue}
        </span>
      ) : null}
    </div>
  );
}, 'Progress');

/**
 * Resolve the responsive `variant` prop down to its non-responsive base. Compound matching in
 * the engine does the same internally; we re-derive it here so the data-attribute matches what
 * the recipe applied at the `base` breakpoint.
 */
function resolveBaseVariant(value: ProgressProps['variant']): 'solid' | 'soft' | 'striped' | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, 'solid' | 'soft' | 'striped'>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? undefined;
  }
  return undefined;
}
