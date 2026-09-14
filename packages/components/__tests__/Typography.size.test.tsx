import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Typography } from '../src';
import { renderWithTheme as render } from './utils';

/**
 * `variant` drives the type scale *and* the element, so the natural way to ask for a size made a
 * semantic promise nobody meant — it shipped an `h1 → h4` skip and eight phantom subheadings on a
 * list of company names. `size` is the same scale with the promise removed.
 */
describe('Typography — size is the scale without the semantics', () => {
  it('renders a real heading for `variant`', () => {
    render(<Typography variant="h4">Section title</Typography>);
    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
  });

  it('renders no heading for `size` — this is the whole point', () => {
    render(<Typography size="h4">Acme Corp</Typography>);
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('Acme Corp').tagName).toBe('SPAN');
  });

  it('gives `size` exactly the same visual scale as `variant`', () => {
    const { unmount } = render(
      <Typography variant="h4" data-testid="a">
        x
      </Typography>,
    );
    const withVariant = screen.getByTestId('a').className;
    unmount();

    render(
      <Typography size="h4" data-testid="b">
        x
      </Typography>,
    );
    // Identical typography, different promise. If these ever diverge, `size` stops being a
    // drop-in and authors go back to reaching for `variant`.
    expect(screen.getByTestId('b').className).toBe(withVariant);
  });

  it('lets `as` override the element for either', () => {
    render(
      <Typography size="h4" as="p" data-testid="t">
        Blurb
      </Typography>,
    );
    expect(screen.getByTestId('t').tagName).toBe('P');
  });

  it('works for the display scale, where the trap is worst', () => {
    // `display2Xl` defaults to `<h1>` — right for a hero, wrong for the oversized pull quote
    // every one of these templates has.
    render(<Typography size="display2Xl">A pull quote, not a heading</Typography>);
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('warns when both are set, and `variant` wins', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Typography variant="h2" size="h4">
        Which one?
      </Typography>,
    );
    expect(spy).toHaveBeenCalled();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    spy.mockRestore();
  });

  it('still defaults to body with neither set', () => {
    render(<Typography data-testid="t">Just text</Typography>);
    expect(screen.getByTestId('t').tagName).toBe('P');
  });
});
