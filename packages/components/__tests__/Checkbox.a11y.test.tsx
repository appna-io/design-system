import { __resetWarnCache } from '@apx-ui/engine';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Checkbox } from '../src/Checkbox/Checkbox';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('Checkbox — accessibility', () => {
  it('passes axe-core for the default render', async () => {
    const { container } = render(<Checkbox>Accept</Checkbox>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for every variant × color cell', async () => {
    const variants = ['solid', 'outline', 'soft'] as const;
    const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
    const { container } = render(
      <div>
        {variants.flatMap((variant) =>
          colors.map((color) => (
            <Checkbox key={`${variant}-${color}`} variant={variant} color={color} defaultChecked>
              {`${variant} ${color}`}
            </Checkbox>
          )),
        )}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for indeterminate / disabled / invalid + description states', async () => {
    const { container } = render(
      <div>
        <Checkbox indeterminate>Some selected</Checkbox>
        <Checkbox disabled>Disabled</Checkbox>
        <Checkbox disabled defaultChecked>
          Disabled checked
        </Checkbox>
        <Checkbox invalid description="You must accept.">
          Accept
        </Checkbox>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Tab focuses the checkbox', async () => {
    render(
      <>
        <button type="button">Before</button>
        <Checkbox>Accept</Checkbox>
      </>,
    );
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('checkbox')).toHaveFocus();
  });

  it('Space toggles via keyboard; Enter does NOT', async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox onCheckedChange={onCheckedChange}>x</Checkbox>);
    const input = screen.getByRole('checkbox');
    input.focus();
    await userEvent.keyboard(' ');
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Enter}');
    // Enter is a no-op on native checkbox + form submit (no form, so still 1).
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });

  it('aria-checked="mixed" is set ONLY for the indeterminate-without-checked combo', () => {
    const { rerender } = render(<Checkbox>x</Checkbox>);
    expect(screen.getByRole('checkbox')).not.toHaveAttribute('aria-checked');
    rerender(<Checkbox indeterminate>x</Checkbox>);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
    rerender(
      <Checkbox indeterminate checked>
        x
      </Checkbox>,
    );
    expect(screen.getByRole('checkbox')).not.toHaveAttribute('aria-checked', 'mixed');
  });
});

describe('Checkbox — dev warnings', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    __resetWarnCache();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('warns when neither children nor aria-label is provided', () => {
    render(<Checkbox />);
    expect(warnSpy).toHaveBeenCalled();
    const message = warnSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(message).toMatch(/accessible name/i);
  });

  it('does NOT warn when an aria-label is provided without children', () => {
    render(<Checkbox aria-label="Accept terms" />);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does NOT warn when children are provided', () => {
    render(<Checkbox>x</Checkbox>);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
