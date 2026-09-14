import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Typography } from '../src';
import { renderWithTheme as render } from './utils';

/**
 * Regression guard for the gap that shipped keyboard-invisible links in four templates: a
 * `Typography actLike="a"` contributed no focus styling of its own, so every call site had to
 * remember a ring and the ones that forgot failed silently.
 */
describe('Typography — interactive focus', () => {
  it('gives a link a focus indicator without the call site asking', () => {
    render(
      <Typography actLike="a" href="/agenda" data-testid="t">
        Agenda
      </Typography>,
    );
    expect(screen.getByTestId('t').className).toContain('focus-visible:outline-2');
  });

  it('uses outline, not ring — a box-shadow ring lands diagonally on hard-offset shadow themes', () => {
    render(
      <Typography as="a" href="/tickets" data-testid="t">
        Tickets
      </Typography>,
    );
    const className = screen.getByTestId('t').className;
    expect(className).toContain('focus-visible:outline-focus');
    expect(className).not.toContain('focus-visible:ring');
  });

  it('covers a button-rendered Typography too', () => {
    render(
      <Typography as="button" data-testid="t">
        Filter
      </Typography>,
    );
    expect(screen.getByTestId('t').className).toContain('focus-visible:outline-2');
  });

  it('leaves non-interactive text alone — an indicator on a paragraph is noise', () => {
    render(<Typography data-testid="t">Just a paragraph</Typography>);
    expect(screen.getByTestId('t').className).not.toContain('focus-visible:outline');
  });

  it('leaves an <a> with no href alone — it is not in the tab order', () => {
    render(
      <Typography as="a" data-testid="t">
        Placeholder
      </Typography>,
    );
    expect(screen.getByTestId('t').className).not.toContain('focus-visible:outline');
  });

  it('still lets a consumer override the treatment', () => {
    render(
      <Typography actLike="a" href="/x" className="focus-visible:outline-8" data-testid="t">
        Custom
      </Typography>,
    );
    // Consumer className is merged last, so a deliberate override still wins.
    expect(screen.getByTestId('t').className).toContain('focus-visible:outline-8');
  });
});
