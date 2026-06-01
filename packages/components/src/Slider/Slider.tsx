'use client';

import { forwardRef, useControllableState, useId, warn } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useCallback, useMemo, type CSSProperties } from 'react';

import { valueToPercent } from './computeValueFromPointer';
import { sliderRecipes } from './Slider.recipe';
import { useSliderInteraction } from './useSliderInteraction';
import type { SliderMark, SliderProps, SliderValue, SliderVariant } from './Slider.types';

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;
const DEFAULT_MIN_STEPS_BETWEEN = 1;

/**
 * Numeric range input — one component, two modes:
 *
 *   <Slider defaultValue={50} />                       // single thumb, returns number
 *   <Slider mode="range" defaultValue={[20, 80]} />    // two thumbs, returns number[]
 *
 * Internally values are always an array; the public API unwraps to `number` when `mode='single'`.
 * That unification lets one set of math helpers (`clampThumb`, `clampToStep`) and one interaction
 * hook (`useSliderInteraction`) drive both modes.
 *
 * **W3C Slider pattern.** Each thumb is its own `role="slider"` with arrow/page/home/end keys.
 * Pointer-down on the track jumps the nearest thumb. Vertical orientation reads top-as-max.
 *
 * **No Motion-library dependency.** The thumb scale-up on drag and the fill width transitions
 * are pure CSS. `prefers-reduced-motion` collapses them via Tailwind's `motion-reduce:` variant.
 *
 * **Tooltip is opt-in.** The default value bubble is a small floating `<span>` in the DS emphasis
 * tone. Consumers wanting Phase 17 Tooltip pass a `renderValueLabel` slot.
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(props, ref) {
  const {
    mode = 'single',
    value: valueProp,
    defaultValue,
    min = DEFAULT_MIN,
    max = DEFAULT_MAX,
    step = DEFAULT_STEP,
    minStepsBetweenThumbs = DEFAULT_MIN_STEPS_BETWEEN,
    marks,
    showTicks = false,
    showValueLabel = 'never',
    formatValue,
    renderValueLabel,
    orientation = 'horizontal',
    variant,
    size,
    color,
    disabled = false,
    invalid = false,
    name,
    onChange,
    onChangeEnd,
    className,
    style,
    sx,
    id: providedId,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    getAriaValueText,
    getThumbAriaLabel,
    ...rest
  } = props;

  const internalId = useId(providedId);

  // Normalize value: internal state is always number[]. Public API exposes `number` for single.
  const toArray = useCallback(
    (v: SliderValue | undefined): number[] | undefined => {
      if (v === undefined) return undefined;
      return Array.isArray(v) ? v : [v];
    },
    [],
  );
  const fromArray = useCallback(
    (arr: number[]): SliderValue => (mode === 'single' ? arr[0]! : arr.slice()),
    [mode],
  );

  const controlledArr = toArray(valueProp);
  const defaultArr = toArray(defaultValue) ?? (mode === 'single' ? [min] : [min, max]);

  // useControllableState handles both modes via the array form. We re-derive `fromArray` on commit.
  const onArrayChange = useCallback(
    (next: number[]) => onChange?.(fromArray(next)),
    [fromArray, onChange],
  );
  const [valuesState = defaultArr, setValues] = useControllableState<number[]>({
    value: controlledArr,
    defaultValue: defaultArr,
    onChange: onArrayChange,
  });
  const values = valuesState;

  warn(
    Boolean(ariaLabel) || Boolean(ariaLabelledBy) || Boolean(getThumbAriaLabel),
    '<Slider> needs an accessible name. Pass `aria-label`, `aria-labelledby`, or `getThumbAriaLabel`.',
    'SLIDER_NO_LABEL',
  );

  const commitEnd = useCallback(
    (final: number[]) => onChangeEnd?.(fromArray(final)),
    [fromArray, onChangeEnd],
  );

  const interaction = useSliderInteraction({
    values,
    min,
    max,
    step,
    minStepsBetweenThumbs,
    orientation,
    disabled,
    commit: setValues,
    commitEnd,
  });

  const { className: rootCls, style: rootStyle } = useThemedClasses({
    recipe: sliderRecipes.root,
    componentName: 'Slider',
    slot: 'root',
    props: { orientation, className, sx, style },
  });
  const { className: trackCls } = useThemedClasses({
    recipe: sliderRecipes.track,
    componentName: 'Slider',
    slot: 'track',
    props: { variant, size, orientation },
  });
  const { className: fillCls } = useThemedClasses({
    recipe: sliderRecipes.fill,
    componentName: 'Slider',
    slot: 'fill',
    props: { variant, color, orientation },
  });
  const { className: thumbCls } = useThemedClasses({
    recipe: sliderRecipes.thumb,
    componentName: 'Slider',
    slot: 'thumb',
    props: { variant, size, color, orientation },
  });
  const { className: markCls } = useThemedClasses({
    recipe: sliderRecipes.mark,
    componentName: 'Slider',
    slot: 'mark',
    props: { orientation },
  });
  const { className: markLabelCls } = useThemedClasses({
    recipe: sliderRecipes.markLabel,
    componentName: 'Slider',
    slot: 'markLabel',
    props: { size, orientation },
  });
  const { className: valueLabelCls } = useThemedClasses({
    recipe: sliderRecipes.valueLabel,
    componentName: 'Slider',
    slot: 'valueLabel',
    props: { orientation },
  });

  // Range mode: fill spans min-thumb → max-thumb. Single mode: fill spans 0% → thumb.
  const sortedPercents = useMemo(() => values.map((v) => valueToPercent(v, min, max)), [
    values,
    min,
    max,
  ]);
  const fillStyle = useMemo<CSSProperties>(() => {
    if (values.length === 1) {
      const p = sortedPercents[0]!;
      return orientation === 'horizontal'
        ? { insetInlineStart: '0%', width: `${p}%` }
        : { bottom: '0%', height: `${p}%` };
    }
    const lo = Math.min(...sortedPercents);
    const hi = Math.max(...sortedPercents);
    return orientation === 'horizontal'
      ? { insetInlineStart: `${lo}%`, width: `${hi - lo}%` }
      : { bottom: `${lo}%`, height: `${hi - lo}%` };
  }, [values.length, sortedPercents, orientation]);

  const trackProps = interaction.getTrackProps();
  const isRangeRole = mode === 'range' || values.length > 1;

  const allMarks = useMemo<SliderMark[]>(() => {
    const fromProp = marks ?? [];
    if (!showTicks) return fromProp;
    if (step == null || step <= 0) return fromProp;
    const ticks: SliderMark[] = [];
    for (let v = min; v <= max; v = Math.round((v + step) * 1e6) / 1e6) {
      if (!fromProp.some((m) => m.value === v)) ticks.push({ value: v });
    }
    return [...fromProp, ...ticks];
  }, [marks, showTicks, step, min, max]);

  const format = useMemo(() => formatValue ?? ((v: number) => String(v)), [formatValue]);
  const ariaValueText = useCallback(
    (v: number, idx: number) =>
      getAriaValueText ? getAriaValueText(v, idx) : String(format(v) ?? v),
    [getAriaValueText, format],
  );
  const thumbAriaLabel = useCallback(
    (idx: number) => {
      if (getThumbAriaLabel) return getThumbAriaLabel(idx);
      if (mode === 'single') return ariaLabel ?? 'Value';
      if (idx === 0) return 'Minimum value';
      if (idx === values.length - 1) return 'Maximum value';
      return `Value ${idx + 1}`;
    },
    [getThumbAriaLabel, mode, ariaLabel, values.length],
  );

  const valueLabelVisible = useCallback(
    (idx: number) => {
      switch (showValueLabel) {
        case 'always':
          return true;
        case 'hover':
          return interaction.hoveringTrack || interaction.draggingIndex === idx;
        case 'focus':
          return interaction.focusedIndex === idx || interaction.draggingIndex === idx;
        case 'never':
        default:
          return false;
      }
    },
    [showValueLabel, interaction.hoveringTrack, interaction.draggingIndex, interaction.focusedIndex],
  );

  return (
    <div
      ref={ref}
      className={rootCls}
      style={rootStyle ?? undefined}
      data-disabled={disabled || undefined}
      data-orientation={orientation}
      role={isRangeRole ? 'group' : undefined}
      aria-label={isRangeRole ? ariaLabel : undefined}
      aria-labelledby={isRangeRole ? ariaLabelledBy : undefined}
      id={internalId}
      {...rest}
    >
      <span
        className={trackCls}
        data-orientation={orientation}
        {...trackProps}
      >
        <span
          className={fillCls}
          style={fillStyle}
          data-dragging={interaction.draggingIndex != null || undefined}
          aria-hidden="true"
        />
        {allMarks.map((m, i) => (
          <SliderMarkDot
            key={`mark-${i}-${m.value}`}
            mark={m}
            min={min}
            max={max}
            orientation={orientation}
            markCls={markCls}
            markLabelCls={markLabelCls}
            isActive={isValueInActiveRange(m.value, values, mode)}
          />
        ))}
        {values.map((v, i) => {
          const thumbProps = interaction.getThumbProps(i);
          const percent = sortedPercents[i]!;
          const visible = valueLabelVisible(i);
          const formatted = format(v);
          const label = renderValueLabel ? renderValueLabel(formatted, v) : formatted;
          return (
            <span
              key={`thumb-${i}`}
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={v}
              aria-valuetext={ariaValueText(v, i)}
              aria-orientation={orientation}
              aria-disabled={disabled || undefined}
              aria-invalid={invalid || undefined}
              aria-label={thumbAriaLabel(i)}
              aria-labelledby={!isRangeRole && !ariaLabel ? ariaLabelledBy : undefined}
              className={thumbCls}
              data-invalid={invalid || undefined}
              data-variant={resolveBaseVariant(variant)}
              style={positionStyle(percent, orientation)}
              {...thumbProps}
            >
              {showValueLabel !== 'never' ? (
                <span
                  className={valueLabelCls}
                  data-visible={visible ? 'true' : 'false'}
                  aria-hidden="true"
                >
                  {label}
                </span>
              ) : null}
            </span>
          );
        })}
      </span>
      {name
        ? values.map((v, i) => (
            <input
              key={`hidden-${i}`}
              type="range"
              tabIndex={-1}
              aria-hidden="true"
              className="sr-only"
              name={hiddenInputName(name, mode, i, values.length)}
              value={v}
              min={min}
              max={max}
              step={step ?? 'any'}
              readOnly
            />
          ))
        : null}
    </div>
  );
}, 'Slider');

/**
 * One mark dot + (optionally) its label, positioned along the track. Marks are non-interactive
 * (purely decorative); pointer events bubble up to the track.
 */
function SliderMarkDot(props: {
  mark: SliderMark;
  min: number;
  max: number;
  orientation: 'horizontal' | 'vertical';
  markCls: string;
  markLabelCls: string;
  isActive: boolean;
}) {
  const { mark, min, max, orientation, markCls, markLabelCls, isActive } = props;
  const percent = valueToPercent(mark.value, min, max);
  return (
    <>
      <span
        className={markCls}
        data-active={isActive || undefined}
        style={positionStyle(percent, orientation)}
        aria-hidden="true"
      />
      {mark.label != null ? (
        <span
          className={markLabelCls}
          style={positionStyle(percent, orientation)}
          aria-hidden="true"
        >
          {mark.label}
        </span>
      ) : null}
    </>
  );
}

/**
 * Decide thumb / mark position via `inset-inline-start` (horizontal) or `bottom` (vertical).
 * The recipe paints `top-1/2 -translate-y-1/2` (horizontal) or `start-1/2 -translate-x-1/2`
 * (vertical) so this style only owns the major-axis coordinate.
 */
function positionStyle(percent: number, orientation: 'horizontal' | 'vertical'): CSSProperties {
  return orientation === 'horizontal'
    ? { insetInlineStart: `${percent}%` }
    : { bottom: `${percent}%` };
}

/**
 * Is the mark's value in the currently-active filled range? Used by the recipe to invert the
 * mark dot color so it stays visible against a colored fill.
 */
function isValueInActiveRange(
  value: number,
  values: readonly number[],
  mode: 'single' | 'range',
): boolean {
  if (mode === 'single') return value <= values[0]!;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  return value >= lo && value <= hi;
}

/**
 * Pick the form name suffix for the hidden inputs. Single mode: bare `name`. Range mode with two
 * thumbs: `name-min` and `name-max`. N-thumb (`N >= 3`): `name-0`, `name-1`, … so each value
 * is uniquely addressable in `FormData`.
 */
function hiddenInputName(
  baseName: string,
  mode: 'single' | 'range',
  index: number,
  total: number,
): string {
  if (mode === 'single' || total === 1) return baseName;
  if (total === 2) return `${baseName}-${index === 0 ? 'min' : 'max'}`;
  return `${baseName}-${index}`;
}

/**
 * Pick the scalar variant out of a `ResponsiveValue<SliderVariant>` so we can set it on the
 * thumb's `data-variant` attribute (used by the recipe to switch the thumb fill via
 * `data-[variant=…]:bg-current`). Responsive overrides happen via Tailwind breakpoints inside
 * the recipe class string, but the *base* value drives the attribute selector.
 */
function resolveBaseVariant(value: SliderProps['variant']): SliderVariant {
  if (value === undefined) return 'solid';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Partial<Record<string, SliderVariant>>;
    return obj.base ?? obj.sm ?? obj.md ?? obj.lg ?? 'solid';
  }
  return 'solid';
}