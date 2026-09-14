import type {
  CSSProperties,
  ElementType,
  ForwardedRef,
  ReactNode,
} from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

import type { StackGap } from '../Stack/Stack.types';

/** Stat visual chrome. */
export type StatVariant = 'default' | 'elevated' | 'minimal';

/** Stat size; drives value font scale + gap rhythm. */
/**
 * `sm` / `md` / `lg` are the product sizes — a dashboard tile, a summary card, a KPI header.
 *
 * `display` is the **marketing** step, and it exists because `countUp` didn't have one. That prop
 * was written for the "by the numbers" band on a landing page, but the scale stopped at `lg`
 * (`text-4xl`, in the body face) — so the band it was built for could not be rendered with it, and
 * two templates hand-wrote their numerals rather than shrink and lose their display face to adopt
 * the component. `display` is 3.75–4.5rem in the display face: the numerals become the visual
 * event rather than a data readout.
 *
 * `tabular-nums` is inherited from the base and is load-bearing at this size — a proportional face
 * re-measures the row on every frame of a count-up, so the whole band jitters.
 */
export type StatSize = 'sm' | 'md' | 'lg' | 'display';

/** Stat axis alignment. `start` / `end` are logical (flip in RTL). */
export type StatAlign = 'start' | 'center' | 'end';

/** Whether delta tone applies only to the delta chip or bleeds onto the value too. */
export type StatColorize = 'auto' | 'never';

/** Numeric formatting strategy. */
export type StatFormat = 'auto' | 'number' | 'currency' | 'percent' | 'compact';

/** Trend direction encoded by the consumer; `inverse` flips good vs bad. */
export type StatDeltaDirection = 'up' | 'down' | 'neutral';

/** Delta payload — structured so the component owns color + icon + sign. */
export interface StatDelta {
  /** Numeric delta value (e.g. `12.3` for `+12.3%`). */
  value: number;
  /** Trend direction. Drives icon + color (subject to `inverse`). */
  direction: StatDeltaDirection;
  /** Override the formatted string (e.g. `'+$120'`). When set, `value`/`suffix` are ignored for display. */
  label?: ReactNode;
  /** Suffix appended to the formatted value. @default '%' */
  suffix?: string;
  /** When `true`, treat `down` as positive (e.g. churn going down is good). @default false */
  inverse?: boolean;
}

/** Direction of layout in `StatGroup`. */
export type StatGroupDirection = 'row' | 'column';

export interface StatProps {
  /** Accessible label. Required unless using compound subcomponents. */
  label?: ReactNode;
  /** Value to display. Strings/ReactNodes pass through; numbers go through `Intl.NumberFormat`. */
  value?: ReactNode | number;
  /** Secondary line under the value (e.g. "vs last week"). */
  caption?: ReactNode;
  /** Leading icon. `aria-hidden`. */
  icon?: ReactNode;
  /** Trend / delta indicator. */
  delta?: StatDelta;

  /** Numeric format strategy. @default 'auto' */
  format?: StatFormat;
  /** ISO currency code for `format='currency'`. @default 'USD' */
  currency?: string;
  /** Override fraction digits. */
  fractionDigits?: number;
  /** Override locale; falls back to runtime default. */
  locale?: string;

  /** @default 'default' */
  variant?: StatVariant;
  /** @default 'md' */
  size?: StatSize;
  /** @default 'start' */
  align?: StatAlign;
  /** Whether to tint the value with the delta tone. @default 'auto' (delta-only) */
  colorize?: StatColorize;

  /** When `true`, renders a `<Spinner>` + `aria-busy="true"` and hides the value. */
  loading?: boolean;
  /** When set, renders an error message with `role="alert"` instead of the value. */
  error?: string;

  /**
   * Roll the number up from zero when the value scrolls into view — the "by the numbers" band
   * treatment.
   *
   * Applies only to a numeric `value` in the prop-driven form, and only once: a stat that
   * re-counts every time you scroll back past it is a distraction rather than a delight.
   *
   * Every intermediate frame goes through the same formatter as the final value, so a
   * `format="currency"` stat counts in currency rather than counting in raw digits and snapping
   * to a currency string at the end.
   *
   * **Purely visual.** The accessible name is always built from the final value, so assistive
   * tech announces the fact rather than narrating the animation. Under `prefers-reduced-motion`
   * the final value renders immediately.
   *
   * @default false
   */
  countUp?: boolean;

  /** Additional content rendered after caption (e.g. a sparkline). */
  children?: ReactNode;

  /** Override the root element. @default 'div' */
  as?: ElementType;
  /** Polymorphism via `<Slot>`. */
  asChild?: boolean;

  className?: string;
  style?: CSSProperties;
  sx?: Sx;
  ref?: ForwardedRef<HTMLElement>;
}

export interface StatGroupProps {
  /** Layout axis. Supports `ResponsiveValue<'row' | 'column'>`. @default 'row' */
  direction?: ResponsiveValue<StatGroupDirection>;
  /** Gap between stats (tailwind spacing scale). @default 4 */
  gap?: ResponsiveValue<StackGap>;
  /** When truthy, auto-inserts `<Divider />` between stats with auto-orientation. */
  divider?: boolean | ReactNode;
  /** Flex-align across the cross axis. @default 'stretch' */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Flex-justify along the main axis. @default 'start' */
  justify?: 'start' | 'center' | 'end' | 'between';
  /** Children — typically `<Stat>` instances. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  sx?: Sx;
  ref?: ForwardedRef<HTMLDivElement>;
}

/** Subcomponent prop bag — shared shape for `Stat.Icon` / `Stat.Label` / `Stat.Value` / `Stat.Caption`. */
export interface StatSubcomponentProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  sx?: Sx;
}

/** `Stat.Delta` props — same payload as the `delta` prop on `<Stat>`, plus passthrough. */
export interface StatDeltaSubcomponentProps extends StatSubcomponentProps {
  value: number;
  direction: StatDeltaDirection;
  label?: ReactNode;
  suffix?: string;
  inverse?: boolean;
}

/** Context shared from `<Stat>` to its compound subparts (size + colorize). */
export interface StatContextValue {
  size: StatSize;
  colorize: StatColorize;
}