import type { ReactNode } from 'react';

import type { StatDelta, StatDeltaDirection } from './Stat.types';

export type StatDeltaTone = 'positive' | 'negative' | 'neutral';
export type StatDeltaArrow = 'up' | 'down' | 'flat';

export interface DeltaPresentation {
  tone: StatDeltaTone;
  /** Which arrow glyph to render (or `'flat'` for the dash). */
  arrow: StatDeltaArrow;
  /** Sign character matching the direction. Uses Unicode minus for typographic parity. */
  sign: '+' | '\u2212' | '';
  /** Pre-formatted "+12.3%" / "−5.4%" / "0%" string (or the consumer's `label` override). */
  formatted: ReactNode;
  /** Sentence-form for `aria-label` ("up 12.3 percent"). */
  ariaText: string;
}

/**
 * Single source of truth for delta-chip presentation. Owns the color tone (so `inverse`
 * does the right thing for "churn down = good"), the arrow glyph, the sign, and the
 * default formatted string. Consumers can override the visual string via `delta.label`
 * but the tone + a11y text stay grounded in `direction`.
 */
export function deltaPresentation(
  delta: StatDelta,
  inverse: boolean = delta.inverse ?? false,
): DeltaPresentation {
  const direction: StatDeltaDirection = delta.direction;

  const positiveDir: StatDeltaDirection = inverse ? 'down' : 'up';
  const negativeDir: StatDeltaDirection = inverse ? 'up' : 'down';

  const tone: StatDeltaTone =
    direction === 'neutral'
      ? 'neutral'
      : direction === positiveDir
        ? 'positive'
        : direction === negativeDir
          ? 'negative'
          : 'neutral';

  const arrow: StatDeltaArrow =
    direction === 'up' ? 'up' : direction === 'down' ? 'down' : 'flat';

  const sign: '+' | '\u2212' | '' =
    direction === 'up' ? '+' : direction === 'down' ? '\u2212' : '';

  const suffix = delta.suffix ?? '%';
  const numeric = Math.abs(delta.value);
  const defaultFormatted = `${sign}${numeric}${suffix}`;
  const formatted: ReactNode = delta.label ?? defaultFormatted;

  const ariaDirection =
    direction === 'up' ? 'up' : direction === 'down' ? 'down' : 'unchanged';
  const ariaText =
    direction === 'neutral'
      ? `unchanged ${numeric}${suffix}`.trim()
      : `${ariaDirection} ${numeric}${suffix}`;

  return { tone, arrow, sign, formatted, ariaText };
}