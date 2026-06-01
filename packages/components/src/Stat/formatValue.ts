import type { ReactNode } from 'react';

import type { StatFormat } from './Stat.types';

export interface FormatValueOptions {
  /** Raw value. Strings / ReactNodes are returned untouched. */
  value: ReactNode | number;
  /** Strategy. @default 'auto' (same as `'number'` for numeric values) */
  format?: StatFormat;
  /** ISO currency code for `format='currency'`. @default 'USD' */
  currency?: string;
  /** Override min/max fraction digits. */
  fractionDigits?: number;
  /** Explicit locale override (e.g. `'de-DE'`). */
  locale?: string;
}

/**
 * Numeric formatter for `<Stat>` (and any future consumer that needs the same KPI rules).
 *
 * - Strings & ReactNodes pass through unchanged — consumers can pre-format their own values.
 * - Numbers are routed through `Intl.NumberFormat` with strategy-specific defaults.
 * - `locale` falls back to the runtime default; passing `undefined` to Intl picks up the
 *   environment's locale, which Node sets to `'en-US'` in tests but the browser inherits.
 *
 * Pure & deterministic — easy to unit test without React.
 */
export function formatValue({
  value,
  format = 'auto',
  currency = 'USD',
  fractionDigits,
  locale,
}: FormatValueOptions): ReactNode {
  if (typeof value !== 'number' || Number.isNaN(value)) return value;

  const loc = locale ?? undefined;

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat(loc, {
        style: 'currency',
        currency,
        minimumFractionDigits: fractionDigits ?? 2,
        maximumFractionDigits: fractionDigits ?? 2,
      }).format(value);
    case 'percent':
      return new Intl.NumberFormat(loc, {
        style: 'percent',
        minimumFractionDigits: fractionDigits ?? 0,
        maximumFractionDigits: fractionDigits ?? 1,
      }).format(value);
    case 'compact':
      return new Intl.NumberFormat(loc, {
        notation: 'compact',
        maximumFractionDigits: fractionDigits ?? 1,
      }).format(value);
    case 'number':
    case 'auto':
    default:
      return new Intl.NumberFormat(loc, {
        minimumFractionDigits: fractionDigits ?? 0,
        maximumFractionDigits: fractionDigits ?? 2,
      }).format(value);
  }
}