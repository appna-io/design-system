'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import {
  SPINNER_DOT_DELAYS_MS,
  SPINNER_SIZE_PX,
  SPINNER_SPEED_MS,
  spinnerDotRecipe,
  spinnerGlyphRecipe,
  spinnerLabelRecipe,
  spinnerWrapperRecipe,
} from './Spinner.recipe';
import type { SpinnerProps, SpinnerSize } from './Spinner.types';

/**
 * Spinner — the standalone loading indicator primitive.
 *
 * Three variants on one component: `ring` (default, an SVG arc rotating around a faint track),
 * `dots` (three staggered scaling dots), and `pulse` (a sonar-style expanding disc). All three
 * are pure CSS animations — no Motion library, no `useEffect`, no per-frame work. Drop the
 * spinner inside a button / link / colored surface and it inherits `currentColor` unless you
 * explicitly pass a `color` role.
 *
 * Accessibility: the wrapper owns `role="status"`, `aria-busy="true"`, and `aria-live="polite"`,
 * and either a sr-only or visible `label` (default: `"Loading"`). The animated glyph itself is
 * `aria-hidden`. Under `prefers-reduced-motion` the animation halts; the label keeps announcing.
 *
 * @example
 *   <Spinner />
 *   <Spinner size="lg" color="primary" />
 *   <Spinner variant="dots" speed="fast" />
 *   <Spinner label="Loading invoices" labelPlacement="end" />
 *   <Button loading><Spinner /></Button>  // inherits currentColor from Button text
 */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(function Spinner(props, ref) {
  const {
    variant = 'ring',
    size = 'md',
    color,
    thickness = 2,
    speed = 'normal',
    trackOpacity = 0.2,
    label = 'Loading',
    labelPlacement = 'hidden',
    className,
    style,
    sx,
    'aria-label': ariaLabelProp,
    ...rest
  } = props;

  const diameter = resolveDiameter(size);
  const speedMs = SPINNER_SPEED_MS[speed];

  // Wrapper: layout direction + sr-only-or-visible label slot. Themed so consumers can override
  // via `theme.components.Spinner.styleOverrides.root` and the gap/direction stay correct.
  const { className: wrapperClass, style: wrapperStyle } = useThemedClasses({
    recipe: spinnerWrapperRecipe,
    componentName: 'Spinner',
    props: { labelPlacement, className, sx, style },
  });

  // Glyph: variant-specific animation utility + optional palette role. Color is intentionally
  // unset when `color` is undefined so `currentColor` flows from the parent text.
  const { className: glyphClass } = useThemedClasses({
    recipe: spinnerGlyphRecipe,
    componentName: 'Spinner',
    slot: 'glyph',
    props: { variant, color },
  });

  // Label: `sr-only` when hidden so AT still announces.
  const { className: labelClass } = useThemedClasses({
    recipe: spinnerLabelRecipe,
    componentName: 'Spinner',
    slot: 'label',
    props: { labelPlacement },
  });

  // When the label is visible, the rendered text is the announcement (no aria-label on the
  // status wrapper, otherwise screen readers double-announce). When the label is hidden we move
  // it to `aria-label` on the wrapper so the announcement still fires — and skip the inner span
  // entirely so there's no competing accessible name.
  const resolvedAriaLabel = ariaLabelProp ?? (labelPlacement === 'hidden' ? label : undefined);

  return (
    <div
      ref={ref}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={resolvedAriaLabel}
      data-variant={variant}
      data-speed={speed}
      className={wrapperClass}
      style={wrapperStyle}
      {...rest}
    >
      {renderGlyph({
        variant,
        diameter,
        thickness,
        trackOpacity,
        speedMs,
        glyphClass,
      })}
      {labelPlacement !== 'hidden' ? <span className={labelClass}>{label}</span> : null}
    </div>
  );
}, 'Spinner');

interface RenderGlyphArgs {
  variant: SpinnerProps['variant'];
  diameter: number;
  thickness: number;
  trackOpacity: number;
  speedMs: number;
  glyphClass: string;
}

function renderGlyph(args: RenderGlyphArgs) {
  const { variant, diameter, thickness, trackOpacity, speedMs, glyphClass } = args;

  if (variant === 'dots') {
    // Each dot is ~28% of total width; the remainder is split across two inter-dot gaps so the
    // row sits flush at the requested diameter regardless of which size token is in play.
    const dotSize = Math.max(2, Math.round(diameter * 0.28));
    const gap = Math.max(1, Math.round((diameter - dotSize * 3) / 2));
    return (
      <span
        className={glyphClass}
        aria-hidden="true"
        style={{ width: `${diameter}px`, height: `${diameter}px`, gap: `${gap}px` }}
      >
        {SPINNER_DOT_DELAYS_MS.map((delay, i) => (
          <span
            key={i}
            className={spinnerDotRecipe()}
            style={{
              width: `${dotSize}px`,
              height: `${dotSize}px`,
              animationDuration: `${speedMs * 1.5}ms`,
              animationDelay: `${delay}ms`,
            }}
          />
        ))}
      </span>
    );
  }

  if (variant === 'pulse') {
    return (
      <span
        className={glyphClass}
        aria-hidden="true"
        style={{
          width: `${diameter}px`,
          height: `${diameter}px`,
          animationDuration: `${speedMs * 1.5}ms`,
        }}
      />
    );
  }

  // Default — ring. Wrapper carries the spin animation so the SVG itself stays as a static
  // composite (cheaper for the GPU than animating a `transform` on the SVG element).
  // 24×24 viewBox keeps the SVG simple; geometry scales via `width` / `height`.
  return (
    <span
      className={glyphClass}
      aria-hidden="true"
      style={{
        width: `${diameter}px`,
        height: `${diameter}px`,
        animationDuration: `${speedMs}ms`,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        width={diameter}
        height={diameter}
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth={thickness}
          opacity={trackOpacity}
        />
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray="56.5"
          strokeDashoffset="42"
          transform="rotate(-90 12 12)"
        />
      </svg>
    </span>
  );
}

function resolveDiameter(size: SpinnerSize): number {
  return typeof size === 'number' ? size : SPINNER_SIZE_PX[size];
}

// Re-export for tests / advanced consumers (e.g. Stat tile sizing a Spinner against an Icon row).
export { SPINNER_SIZE_PX, SPINNER_SPEED_MS };