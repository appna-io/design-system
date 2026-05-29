import { screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Spinner } from '../src/Spinner/Spinner';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const VARIANTS = ['ring', 'dots', 'pulse'] as const;
const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
const PLACEMENTS = ['hidden', 'end', 'bottom'] as const;

describe('Spinner — accessibility', () => {
  it('passes axe-core for the default render', async () => {
    const { container } = render(<Spinner />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core across every variant × color cell', async () => {
    const { container } = render(
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {VARIANTS.flatMap((variant) =>
          COLORS.map((color) => (
            <li key={`${variant}-${color}`}>
              <Spinner variant={variant} color={color} />
            </li>
          )),
        )}
      </ul>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core across every label placement', async () => {
    const { container } = render(
      <div>
        {PLACEMENTS.map((placement) => (
          <Spinner key={placement} label={`Loading ${placement}`} labelPlacement={placement} />
        ))}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core inside a button (currentColor + nested status semantics)', async () => {
    const { container } = render(
      <button type="button" style={{ color: '#0d4ef2' }} aria-label="Save changes">
        <Spinner size="sm" />
      </button>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Spinner wrapper carries role=status + aria-busy=true regardless of variant', () => {
    for (const variant of VARIANTS) {
      const { unmount } = render(<Spinner data-testid="sp" variant={variant} />);
      const node = screen.getByTestId('sp');
      expect(node).toHaveAttribute('role', 'status');
      expect(node).toHaveAttribute('aria-busy', 'true');
      expect(node).toHaveAttribute('aria-live', 'polite');
      unmount();
    }
  });

  it('hidden label placement uses aria-label for the announcement', () => {
    render(<Spinner data-testid="sp" label="Loading users" />);
    const node = screen.getByTestId('sp');
    expect(node).toHaveAttribute('aria-label', 'Loading users');
  });

  it('visible label placement removes wrapper aria-label so the visible text wins', () => {
    render(<Spinner data-testid="sp" label="Saving" labelPlacement="end" />);
    const node = screen.getByTestId('sp');
    expect(node).not.toHaveAttribute('aria-label');
    expect(screen.getByText('Saving')).toBeInTheDocument();
  });

  it('the animated glyph (SVG / dots / pulse) is always aria-hidden', () => {
    for (const variant of VARIANTS) {
      const { unmount } = render(<Spinner data-testid="sp" variant={variant} />);
      const glyph = screen.getByTestId('sp').firstElementChild as HTMLElement;
      expect(glyph.getAttribute('aria-hidden')).toBe('true');
      unmount();
    }
  });

  it('respects prefers-reduced-motion by emitting the motion-reduce:animate-none utility', () => {
    for (const variant of VARIANTS) {
      const { unmount } = render(<Spinner data-testid="sp" variant={variant} />);
      const glyph = screen.getByTestId('sp').firstElementChild as HTMLElement;
      if (variant === 'dots') {
        // Dot children carry the utility individually.
        for (const dot of Array.from(glyph.children) as HTMLElement[]) {
          expect(dot.className).toContain('motion-reduce:animate-none');
        }
      } else {
        expect(glyph.className).toContain('motion-reduce:animate-none');
      }
      unmount();
    }
  });
});
