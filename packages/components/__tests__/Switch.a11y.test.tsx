import { __resetWarnCache } from '@apx-ui/engine';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Switch } from '../src/Switch/Switch';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('Switch — accessibility', () => {
  it('passes axe-core for the default render', async () => {
    const { container } = render(<Switch>Notifications</Switch>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core across every variant × color cell (both states)', async () => {
    const variants = ['solid', 'outline', 'soft'] as const;
    const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
    const { container } = render(
      <div>
        {variants.flatMap((variant) =>
          colors.flatMap((color) => [
            <Switch key={`${variant}-${color}-off`} variant={variant} color={color}>
              {`${variant} ${color} off`}
            </Switch>,
            <Switch key={`${variant}-${color}-on`} variant={variant} color={color} defaultChecked>
              {`${variant} ${color} on`}
            </Switch>,
          ]),
        )}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for disabled / invalid / loading / description states', async () => {
    const { container } = render(
      <div>
        <Switch disabled>Disabled off</Switch>
        <Switch disabled defaultChecked>
          Disabled on
        </Switch>
        <Switch invalid description="Required for admins.">
          Two-factor
        </Switch>
        <Switch loading defaultChecked>
          Connecting
        </Switch>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('role="switch" is set on the hidden input', () => {
    render(<Switch>x</Switch>);
    expect(screen.getByRole('switch')).toBeInstanceOf(HTMLInputElement);
  });

  it('aria-checked is binary (true/false), never "mixed"', () => {
    const { rerender } = render(<Switch>x</Switch>);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    rerender(<Switch checked>x</Switch>);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('Tab focuses the switch', async () => {
    render(
      <>
        <button type="button">Before</button>
        <Switch>Notifications</Switch>
      </>,
    );
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('switch')).toHaveFocus();
  });

  it('Space toggles via keyboard; Enter is a no-op', async () => {
    const onCheckedChange = vi.fn();
    render(<Switch onCheckedChange={onCheckedChange}>x</Switch>);
    const input = screen.getByRole('switch');
    input.focus();
    await userEvent.keyboard(' ');
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Enter}');
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });

  it('loading blocks the keyboard toggle too', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch loading onCheckedChange={onCheckedChange}>
        x
      </Switch>,
    );
    const input = screen.getByRole('switch');
    input.focus();
    await userEvent.keyboard(' ');
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('loading state is exposed to AT via `aria-busy` on the input', () => {
    // The spinner lives inside the visually-decorative track (aria-hidden=true), so it doesn't
    // appear in the a11y tree directly. The canonical signal for "this control is busy" is
    // `aria-busy` on the switch role itself — screen readers announce it on focus / state read.
    const { container } = render(<Switch loading>Connecting</Switch>);
    const input = screen.getByRole('switch');
    expect(input).toHaveAttribute('aria-busy', 'true');
    // The decorative spinner still exists in the DOM for sighted users:
    expect(container.querySelector('[role="status"]')).not.toBeNull();
  });
});

describe('Switch — dev warnings', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    __resetWarnCache();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('warns when neither children, aria-label, nor aria-labelledby is provided', () => {
    render(<Switch />);
    expect(warnSpy).toHaveBeenCalled();
    const messages = warnSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(messages).toMatch(/accessible name/i);
  });

  it('does NOT warn when aria-label is provided', () => {
    render(<Switch aria-label="Notifications" />);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does NOT warn when children are provided', () => {
    render(<Switch>x</Switch>);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
