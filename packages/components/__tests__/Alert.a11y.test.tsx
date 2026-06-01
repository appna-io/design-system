import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

import { Alert } from '../src/Alert';
import type { AlertColor, AlertVariant } from '../src/Alert';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('Alert — accessibility', () => {
  it('passes axe in the default configuration', async () => {
    const { container } = render(<Alert>Default note.</Alert>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe for every variant × color cell', async () => {
    const VARIANTS: readonly AlertVariant[] = ['solid', 'outline', 'soft', 'inline'];
    const COLORS: readonly AlertColor[] = ['info', 'success', 'warning', 'danger', 'neutral'];
    const { container } = render(
      <div>
        {VARIANTS.flatMap((variant) =>
          COLORS.map((color) => (
            <Alert key={`${variant}-${color}`} variant={variant} color={color}>
              <Alert.Title>{`${variant} ${color}`}</Alert.Title>
              <Alert.Description>Body copy.</Alert.Description>
            </Alert>
          )),
        )}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe with a closable alert (button has accessible name)', async () => {
    const { container } = render(
      <Alert closable color="info">
        x
      </Alert>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('icon container is aria-hidden', () => {
    const { container } = render(<Alert>x</Alert>);
    const iconContainer = container.querySelector('[aria-hidden="true"]');
    expect(iconContainer).not.toBeNull();
  });

  it('close button has an accessible name', () => {
    render(<Alert closable>x</Alert>);
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
  });

  it('close button is keyboard-reachable and fires onClose on Enter', async () => {
    const onClose = vi.fn();
    render(
      <Alert closable onClose={onClose}>
        x
      </Alert>,
    );
    const button = screen.getByRole('button', { name: /dismiss/i });
    button.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClose).toHaveBeenCalled();
  });

  it('exposes aria-live="polite" for status roles', () => {
    render(<Alert color="info">x</Alert>);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('exposes aria-live="assertive" for alert roles', () => {
    render(<Alert color="danger">x</Alert>);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });
});