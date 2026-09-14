import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Typography } from '../src';
import { renderWithTheme as render } from './utils';

/**
 * The fluid marketing display scale. These assert the *reasons* the variants exist — two
 * templates hand-rolled their own headline sizing before it did (`cadence-ops` stepped through
 * breakpoints, `northbound` wrote a raw `clamp()`), so the point is that neither should need to
 * again.
 */
describe('Typography — fluid display variants', () => {
  const fluid = ['displayLg', 'displayXl', 'display2Xl'] as const;

  it.each(fluid)('%s renders as H1 — it is a visual axis, not an outline one', (variant) => {
    render(
      <Typography variant={variant} data-testid="t">
        Northbound
      </Typography>,
    );
    expect(screen.getByTestId('t').tagName).toBe('H1');
  });

  it.each(fluid)('%s uses a fluid size token, never a fixed breakpoint step', (variant) => {
    render(
      <Typography variant={variant} data-testid="t">
        Northbound
      </Typography>,
    );
    const className = screen.getByTestId('t').className;

    // The whole point: one continuous size, not `text-4xl sm:text-5xl lg:text-6xl`.
    expect(className).toMatch(/text-display-(lg|xl|2xl)/);
    expect(className).not.toMatch(/(sm|md|lg|xl):text-/);
  });

  it.each(fluid)('%s tightens tracking and leading, as display type must', (variant) => {
    render(
      <Typography variant={variant} data-testid="t">
        Northbound
      </Typography>,
    );
    const className = screen.getByTestId('t').className;

    // Optical letter-spacing shrinks as type grows; at 80px+ `leading-tight` reads as two lines.
    expect(className).toContain('tracking-tighter');
    expect(className).toContain('leading-none');
  });

  it('keeps the fixed `display` variant unchanged for product UI', () => {
    render(
      <Typography variant="display" data-testid="t">
        Dashboard
      </Typography>,
    );
    const className = screen.getByTestId('t').className;
    expect(className).toContain('text-5xl');
    expect(className).not.toContain('text-display-');
  });

  it('lets a heading be visually huge without lying about the document outline', () => {
    render(
      <Typography variant="display2Xl" as="h2" data-testid="t">
        The programme
      </Typography>,
    );
    expect(screen.getByTestId('t').tagName).toBe('H2');
  });
});
