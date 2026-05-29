'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { circularProgressRecipes } from './CircularProgress.recipe';
import type { CircularProgressProps, ProgressSize } from './Progress.types';
import { useProgressValue } from './useProgressValue';

/**
 * SVG diameter when `size` is a token rather than a number. Mirrors the Tailwind `size-*`
 * utilities used by `circularProgressRecipes.svg.size` so `width` / `height` (the SVG geometry
 * basis for the circle math) match the box model.
 */
const TOKEN_SIZE_PX: Record<ProgressSize, number> = {
  sm: 24,
  md: 40,
  lg: 56,
};

/** Default stroke widths for token-sized rings; numeric `size` derives its own. */
const TOKEN_THICKNESS_PX: Record<ProgressSize, number> = {
  sm: 3,
  md: 4,
  lg: 5,
};

/**
 * Circular progress indicator. SVG-driven, CSS-only animation. Uses the same value/min/max API as
 * the linear `<Progress />` and shares the `useProgressValue` clamp helper — adding a 7th color is
 * one palette entry + one row in `track`, `arc`, and the linear `bar` recipes.
 *
 * The SVG circle is rotated `-90deg` (the recipe handles this) so 0% sits at 12 o'clock and the
 * arc grows clockwise — the convention every dialed progress UI follows.
 *
 * @example
 *   <CircularProgress value={66} />
 *   <CircularProgress value={40} variant="soft" color="success" showLabel />
 *   <CircularProgress indeterminate />
 *   <CircularProgress value={50} size={120} thickness={8} />
 */
export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  function CircularProgress(props, ref) {
    const {
      value,
      min = 0,
      max = 100,
      indeterminate = false,
      variant = 'solid',
      size = 'md',
      color,
      thickness,
      showLabel = false,
      labelFormat,
      animated = true,
      trackOpacity = 0.2,
      className,
      style,
      sx,
      ...rest
    } = props;

    const { clampedValue, percent } = useProgressValue({ value, min, max, indeterminate });

    // Diameter resolution: numeric `size` → use directly; token → look up in the size table.
    const isNumericSize = typeof size === 'number';
    const diameter = isNumericSize ? size : TOKEN_SIZE_PX[size];
    const resolvedThickness =
      thickness ??
      (isNumericSize ? Math.max(2, Math.round(diameter / 10)) : TOKEN_THICKNESS_PX[size]);

    // Geometry. `r` keeps the stroke fully inside the SVG box (subtract half the stroke width on
    // each side); `circumference` is the dasharray reference; `dashoffset` shrinks as percent
    // grows — the visible arc length.
    const r = (diameter - resolvedThickness) / 2;
    const circumference = 2 * Math.PI * r;
    const dashOffset = circumference * (1 - percent / 100);

    const { className: rootClass, style: rootStyle } = useThemedClasses({
      recipe: circularProgressRecipes.root,
      componentName: 'CircularProgress',
      slot: 'root',
      props: { className, sx, style },
    });

    const { className: svgClass } = useThemedClasses({
      recipe: circularProgressRecipes.svg,
      componentName: 'CircularProgress',
      slot: 'svg',
      // The size variant only fires when `size` is a token; for numeric we suppress it so the
      // recipe doesn't apply a conflicting `size-*` Tailwind utility on top of our inline w/h.
      props: { size: isNumericSize ? undefined : size },
    });

    const { className: trackClass } = useThemedClasses({
      recipe: circularProgressRecipes.track,
      componentName: 'CircularProgress',
      slot: 'track',
      props: { variant, color },
    });

    const { className: arcClass } = useThemedClasses({
      recipe: circularProgressRecipes.arc,
      componentName: 'CircularProgress',
      slot: 'arc',
      props: { color },
    });

    const { className: labelClass } = useThemedClasses({
      recipe: circularProgressRecipes.label,
      componentName: 'CircularProgress',
      slot: 'label',
      props: { size: isNumericSize ? 'md' : size },
    });

    const formattedValue = labelFormat
      ? labelFormat(clampedValue, max)
      : `${Math.round(percent)}%`;
    const ariaValueText = indeterminate ? 'Loading' : formattedValue;

    // Track length under indeterminate: paint a partial arc (75% of the circumference) so the
    // dash-grow keyframe has something to chase. The keyframe modulates `stroke-dashoffset`
    // around this baseline — see `circular-indeterminate-dash` in the Tailwind preset.
    const arcDashArray = circumference;
    const arcDashOffset = indeterminate ? circumference * 0.25 : dashOffset;

    return (
      <div
        ref={ref}
        className={rootClass}
        style={{
          width: diameter,
          height: diameter,
          ...(rootStyle ?? {}),
        }}
        role="progressbar"
        aria-valuemin={min}
        aria-valuemax={max}
        {...(indeterminate ? {} : { 'aria-valuenow': clampedValue })}
        aria-valuetext={ariaValueText}
        data-variant={variant}
        data-indeterminate={indeterminate || undefined}
        {...rest}
      >
        <svg
          className={svgClass}
          width={diameter}
          height={diameter}
          viewBox={`0 0 ${diameter} ${diameter}`}
          data-indeterminate={indeterminate || undefined}
          aria-hidden="true"
          focusable="false"
        >
          <circle
            className={trackClass}
            cx={diameter / 2}
            cy={diameter / 2}
            r={r}
            strokeWidth={resolvedThickness}
            style={{ opacity: trackOpacity }}
          />
          <circle
            className={arcClass}
            cx={diameter / 2}
            cy={diameter / 2}
            r={r}
            strokeWidth={resolvedThickness}
            strokeDasharray={arcDashArray}
            strokeDashoffset={arcDashOffset}
            data-indeterminate={indeterminate || undefined}
            data-animated={animated ? undefined : 'false'}
          />
        </svg>
        {showLabel && !indeterminate ? (
          <span className={labelClass} aria-hidden="true">
            {formattedValue}
          </span>
        ) : null}
      </div>
    );
  },
  'CircularProgress',
);
