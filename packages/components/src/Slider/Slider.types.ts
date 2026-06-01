import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Stylistic family for the **filled track + thumb** combo. The off-track stays neutral across
 * all four variants (a subtle grey rail) so the active range reads as the primary visual signal.
 *
 *   `solid`    — Filled track + paper-white thumb with a colored ring. Default.
 *   `outline`  — Hollow off-track (1-px border), filled colored on-track, colored thumb.
 *   `soft`     — Tinted `-subtle` filled track + colored thumb. Quiet.
 *   `minimal`  — Filled track with `opacity-70`, no thumb border. Embed-in-dense-UI mode.
 */
export type SliderVariant = 'solid' | 'outline' | 'soft' | 'minimal';

export type SliderSize = 'sm' | 'md' | 'lg';

export type SliderColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export type SliderOrientation = 'horizontal' | 'vertical';

/**
 * Single thumb → consumer gets `number`. Range / N-thumb → consumer gets `number[]` (any length).
 */
export type SliderMode = 'single' | 'range';

/** Reads `number` for `mode='single'` and `number[]` for `mode='range'`. */
export type SliderValue = number | number[];

/**
 * One mark on the slider scale. `value` is required; `label` is optional — a mark without a
 * label still renders the tick dot, useful for "ticks every N steps" patterns.
 */
export interface SliderMark {
  value: number;
  label?: ReactNode;
}

/**
 * Behavior of the floating value label above each thumb.
 *
 *   `never`   — never render (default; cheapest).
 *   `hover`   — render while pointer is over the track.
 *   `focus`   — render while a thumb is keyboard-focused.
 *   `always`  — render unconditionally (good for data-viz contexts).
 */
export type SliderValueLabelMode = 'always' | 'hover' | 'focus' | 'never';

/**
 * Public props for `<Slider />`. Extends `HTMLAttributes<HTMLDivElement>` because the root is a
 * `<div>` — the *thumbs* are the actual `role="slider"` controls, each one focusable on its own.
 */
export interface SliderProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'color' | 'defaultValue' | 'onChange' | 'children'
  > {
  /** Single thumb vs N-thumb range. @default 'single' */
  mode?: SliderMode | undefined;

  /** Controlled value. `number` for single, `number[]` for range. */
  value?: SliderValue | undefined;
  /** Uncontrolled initial value. */
  defaultValue?: SliderValue | undefined;
  /** Lower bound. @default 0 */
  min?: number | undefined;
  /** Upper bound. @default 100 */
  max?: number | undefined;
  /**
   * Discrete step. Pass `null` for a continuous slider (no snapping; smooth pointer drag).
   * @default 1
   */
  step?: number | null | undefined;
  /**
   * Range mode only — minimum number of `step`s between adjacent thumbs. Defaults to `1` so
   * thumbs can touch but not cross. Set to `0` to allow overlap. Ignored when `step` is `null`.
   * @default 1
   */
  minStepsBetweenThumbs?: number | undefined;

  /** Marks rendered as tick dots on the track; `label` adds a caption below (or beside). */
  marks?: SliderMark[] | undefined;
  /** Show a small tick at every `step` value (off by default — only on for sparse step counts). */
  showTicks?: boolean | undefined;

  /** Behavior of the floating value bubble above each thumb. @default 'never' */
  showValueLabel?: SliderValueLabelMode | undefined;
  /** Custom formatter for the value bubble content. @default `(v) => String(v)` */
  formatValue?: ((value: number) => ReactNode) | undefined;
  /**
   * Slot for a custom value-label renderer (e.g. wrapping a Tooltip). Receives the value already
   * formatted by `formatValue`. The default returns a small floating tag in the DS's emphasis tone.
   */
  renderValueLabel?: ((formatted: ReactNode, value: number) => ReactNode) | undefined;

  /** Layout direction. @default 'horizontal' */
  orientation?: SliderOrientation | undefined;

  /** Stylistic family. @default 'solid' */
  variant?: ResponsiveValue<SliderVariant> | undefined;
  /** Track thickness + thumb diameter scale. @default 'md' */
  size?: ResponsiveValue<SliderSize> | undefined;
  /** Palette role for the filled track + thumb accent. @default 'primary' */
  color?: ResponsiveValue<SliderColor> | undefined;

  /** Block all interaction; visual + a11y disabled. */
  disabled?: boolean | undefined;
  /** Visual + a11y invalid state (red ring on thumbs). */
  invalid?: boolean | undefined;

  /**
   * Hidden `<input type="range">` name for form submission. In range mode, suffix `-min` /
   * `-max` are appended (or `-0` / `-1` / … for N-thumb sliders).
   */
  name?: string | undefined;

  /** Accessible label for the slider as a whole. In range mode, applied to the root `role=group`. */
  'aria-label'?: string | undefined;
  /** ID of an external label element; applied to root in range mode, to thumb in single mode. */
  'aria-labelledby'?: string | undefined;
  /**
   * Per-thumb a11y label text. Receives the thumb's value and (in range mode) the thumb's
   * index. @default value-based ("Minimum value", "Maximum value", or "Value")
   */
  getAriaValueText?: ((value: number, index: number) => string) | undefined;
  /**
   * Per-thumb `aria-label`. Range default: `['Minimum value', 'Maximum value', …]`. Single
   * default: inherits the root `aria-label` if set, else "Value".
   */
  getThumbAriaLabel?: ((index: number) => string) | undefined;

  /** Fires on every value commit during drag and every keyboard step. */
  onChange?: ((value: SliderValue) => void) | undefined;
  /** Fires once on pointerup / keyup — useful for splitting "preview" from "expensive write". */
  onChangeEnd?: ((value: SliderValue) => void) | undefined;

  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
  /** Standard inline style. Wins over `sx` for shared keys. */
  style?: CSSProperties | undefined;
  /** Override className on the root. Wins over recipe + theme via tailwind-merge. */
  className?: string | undefined;
}