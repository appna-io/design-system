import { __resetWarnCache } from '@apx-ui/engine';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Button } from '../src/Button/Button';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('Button — accessibility', () => {
  it('passes axe-core for the default render', async () => {
    const { container } = render(<Button>Save</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for the loading / disabled / icon-with-label states', async () => {
    const { container } = render(
      <div>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
        <Button aria-label="search" leftIcon={<svg />} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Space activates the button via the keyboard', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    screen.getByRole('button').focus();
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Enter activates the button via the keyboard', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    screen.getByRole('button').focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled prevents both pointer and keyboard activation', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Go
      </Button>,
    );
    const btn = screen.getByRole('button');
    btn.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('Button — dev warnings', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    __resetWarnCache();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('warns when iconOnly is rendered without aria-label', () => {
    render(<Button leftIcon={<svg />} />);
    expect(warnSpy).toHaveBeenCalled();
    const message = warnSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(message).toMatch(/aria-label/i);
  });

  it('does NOT warn when iconOnly has an aria-label', () => {
    render(<Button aria-label="search" leftIcon={<svg />} />);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});