import { __resetWarnCache } from '@apx-ui/engine';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Input } from '../src/Input/Input';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('Input — accessibility', () => {
  it('passes axe with a wrapping <label>', async () => {
    const { container } = render(
      <label>
        Email
        <Input type="email" />
      </label>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe with `aria-label`', async () => {
    const { container } = render(<Input aria-label="Search" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe for every variant × invalid × disabled state', async () => {
    const { container } = render(
      <div>
        {(['outline', 'solid', 'ghost', 'underline'] as const).map((v) => (
          <div key={v}>
            <Input aria-label={`${v} default`} variant={v} />
            <Input aria-label={`${v} invalid`} variant={v} invalid />
            <Input aria-label={`${v} disabled`} variant={v} disabled />
            <Input aria-label={`${v} loading`} variant={v} loading />
          </div>
        ))}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Tab moves focus onto the input (not the wrapper)', async () => {
    render(<Input aria-label="x" />);
    await userEvent.tab();
    expect(screen.getByRole('textbox', { name: 'x' })).toHaveFocus();
  });

  it('Esc does nothing unless the consumer wires a handler', async () => {
    const onKeyDown = vi.fn();
    render(<Input aria-label="x" defaultValue="hello" onKeyDown={onKeyDown} />);
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'x' });
    input.focus();
    await userEvent.keyboard('{Escape}');
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(input.value).toBe('hello');
  });

  it('exposes aria-describedby for helper / error text', async () => {
    render(
      <div>
        <Input aria-label="x" aria-describedby="msg" invalid />
        <p id="msg">Please enter a valid email</p>
      </div>,
    );
    expect(screen.getByRole('textbox', { name: 'x' })).toHaveAttribute(
      'aria-describedby',
      'msg',
    );
  });
});

describe('Input — dev warnings', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    __resetWarnCache();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('warns when the input has no associated label and no aria-label', () => {
    render(<Input />);
    expect(warnSpy).toHaveBeenCalled();
    const message = warnSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(message).toMatch(/INPUT_NO_LABEL/);
  });

  it('does NOT warn when aria-label is provided', () => {
    render(<Input aria-label="search" />);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does NOT warn when wrapped in a <label>', () => {
    render(
      <label>
        Email
        <Input />
      </label>,
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does NOT warn when paired with a `<label for>`', () => {
    render(
      <>
        <label htmlFor="email-1">Email</label>
        <Input id="email-1" />
      </>,
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });
});