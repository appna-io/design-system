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
export type StatSize = 'sm' | 'md' | 'lg';

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
