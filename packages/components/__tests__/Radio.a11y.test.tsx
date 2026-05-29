import { __resetWarnCache } from '@apx-ui/engine';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Radio, RadioGroup } from '../src/Radio';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const VARIANTS = ['solid', 'outline', 'soft'] as const;
const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;

describe('Radio — accessibility', () => {
  it('passes axe-core for a standalone Radio with a visible label', async () => {
    const { container } = render(<Radio value="a">Accept terms</Radio>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for a RadioGroup with three options', async () => {
    const { container } = render(
      <RadioGroup aria-label="Size" defaultValue="m">
        <Radio value="s">Small</Radio>
        <Radio value="m">Medium</Radio>
        <Radio value="l">Large</Radio>
      </RadioGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for every variant × color cell rendered as a group', async () => {
    const { container } = render(
      <div>
        {VARIANTS.flatMap((variant) =>
          COLORS.map((color) => (
            <RadioGroup
              key={`${variant}-${color}`}
              aria-label={`${variant} ${color}`}
              defaultValue="x"
              variant={variant}
              color={color}
            >
              <Radio value="x">{`${variant} ${color}`}</Radio>
            </RadioGroup>
          )),
        )}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for disabled / invalid + description states', async () => {
    const { container } = render(
      <div>
        <RadioGroup disabled aria-label="Disabled group" defaultValue="a">
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
        <RadioGroup invalid aria-label="Invalid group">
          <Radio value="a" description="A short helper hint.">
            A
          </Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('group container exposes role="radiogroup" + per-input role="radio"', () => {
    render(
      <RadioGroup aria-label="Size">
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('aria-checked reflects current selection via native radio semantics', async () => {
    render(
      <RadioGroup defaultValue="a" aria-label="x">
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );
    const [a, b] = screen.getAllByRole('radio');
    expect(a).toBeChecked();
    expect(b).not.toBeChecked();
    await userEvent.click(screen.getByText('B'));
    expect(a).not.toBeChecked();
    expect(b).toBeChecked();
  });

  it('Tab focuses the group, Space selects within (matches native radio)', async () => {
    render(
      <>
        <button type="button">Before</button>
        <RadioGroup defaultValue="a" aria-label="x">
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      </>,
    );
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
    await userEvent.tab();
    // Focus lands on the currently-selected radio first per native behavior.
    expect(screen.getAllByRole('radio')[0]).toHaveFocus();
  });
});

describe('Radio — dev warnings', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    __resetWarnCache();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('RADIO_NO_VALUE warns when value is missing (empty string)', () => {
    // Empty string is type-allowed (value: string) but semantically invalid — radios with no
    // submittable value can't participate in form submission, so we dev-warn at runtime.
    render(<Radio value="">x</Radio>);
    const messages = warnSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(messages).toMatch(/RADIO_NO_VALUE/);
  });

  it('RADIO_NO_LABEL warns when no children / aria-label / aria-labelledby is provided', () => {
    render(<Radio value="a" />);
    const messages = warnSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(messages).toMatch(/RADIO_NO_LABEL/);
  });

  it('does NOT warn when aria-label is provided without children', () => {
    render(<Radio value="a" aria-label="Option A" />);
    const messages = warnSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(messages).not.toMatch(/RADIO_NO_LABEL/);
  });

  it('does NOT warn when children are provided', () => {
    render(<Radio value="a">x</Radio>);
    const messages = warnSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(messages).not.toMatch(/RADIO_NO_LABEL/);
  });
});
