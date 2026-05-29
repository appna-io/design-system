import { __resetWarnCache } from '@apx-ui/engine';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Textarea } from '../src/Textarea/Textarea';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('Textarea — accessibility', () => {
  it('passes axe with a wrapping <label>', async () => {
    const { container } = render(
      <label>
        Bio
        <Textarea />
      </label>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe with `aria-label`', async () => {
    const { container } = render(<Textarea aria-label="Bio" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe for every variant × invalid × disabled state', async () => {
    const { container } = render(
      <div>
        {(['outline', 'solid', 'ghost', 'underline'] as const).map((v) => (
          <div key={v}>
            <Textarea aria-label={`${v} default`} variant={v} />
            <Textarea aria-label={`${v} invalid`} variant={v} invalid />
            <Textarea aria-label={`${v} disabled`} variant={v} disabled />
          </div>
        ))}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Tab moves focus onto the textarea (not the wrapper)', async () => {
    render(<Textarea aria-label="x" />);
    await userEvent.tab();
    expect(screen.getByRole('textbox', { name: 'x' })).toHaveFocus();
  });

  it('Shift+Enter inserts a newline natively', async () => {
    render(<Textarea aria-label="x" />);
    const ta = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'x' });
    ta.focus();
    await userEvent.keyboard('line1{Shift>}{Enter}{/Shift}line2');
    expect(ta.value).toBe('line1\nline2');
  });

  it('exposes aria-describedby for helper / error text', async () => {
    render(
      <div>
        <Textarea aria-label="x" aria-describedby="msg" invalid />
        <p id="msg">Please provide more detail</p>
      </div>,
    );
    expect(screen.getByRole('textbox', { name: 'x' })).toHaveAttribute(
      'aria-describedby',
      'msg',
    );
  });

  it('counter footer is aria-hidden so the count is not double-announced', () => {
    const { container } = render(<Textarea aria-label="x" showCount maxLength={100} />);
    const counter = container.querySelector('div[aria-hidden="true"]');
    expect(counter).not.toBeNull();
  });
});

describe('Textarea — dev warnings', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    __resetWarnCache();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('warns when the textarea has no associated label and no aria-label', () => {
    render(<Textarea />);
    expect(warnSpy).toHaveBeenCalled();
    const message = warnSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(message).toMatch(/TEXTAREA_NO_LABEL/);
  });

  it('does NOT warn when aria-label is provided', () => {
    render(<Textarea aria-label="bio" />);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does NOT warn when wrapped in a <label>', () => {
    render(
      <label>
        Bio
        <Textarea />
      </label>,
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does NOT warn when paired with a `<label for>`', () => {
    render(
      <>
        <label htmlFor="bio-1">Bio</label>
        <Textarea id="bio-1" />
      </>,
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
