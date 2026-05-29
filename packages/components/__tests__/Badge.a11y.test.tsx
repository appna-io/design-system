import { __resetWarnCache } from '@apx-ui/engine';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Badge } from '../src/Badge/Badge';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('Badge — accessibility', () => {
  it('passes axe-core for the default render', async () => {
    const { container } = render(<Badge>Beta</Badge>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for every variant × color cell', async () => {
    const variants = ['solid', 'outline', 'soft', 'subtle'] as const;
    const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
    const { container } = render(
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {variants.flatMap((variant) =>
          colors.map((color) => (
            <li key={`${variant}-${color}`}>
              <Badge variant={variant} color={color}>
                {color}
              </Badge>
            </li>
          )),
        )}
      </ul>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for the dot + removable + asChild states', async () => {
    const { container } = render(
      <div>
        <Badge withDot dotPulse>
          Live
        </Badge>
        <Badge removable onRemove={() => {}}>
          tag
        </Badge>
        <Badge asChild>
          <a href="#x">3</a>
        </Badge>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('the decorative dot is aria-hidden', () => {
    const { container } = render(<Badge withDot>Live</Badge>);
    expect(container.querySelector('.sds-badge-dot')).toHaveAttribute('aria-hidden', 'true');
  });

  it('the remove button is keyboard-reachable via Tab', async () => {
    render(
      <>
        <button type="button">Before</button>
        <Badge removable>typescript</Badge>
      </>,
    );
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Remove typescript' })).toHaveFocus();
  });
});

describe('Badge — dev warnings', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    __resetWarnCache();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('warns when removable is set with non-string children and no removeLabel', () => {
    render(
      <Badge removable>
        <span>typescript</span>
      </Badge>,
    );
    expect(warnSpy).toHaveBeenCalled();
    const message = warnSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(message).toMatch(/removeLabel/i);
  });

  it('does NOT warn when removable + non-string children + removeLabel is provided', () => {
    render(
      <Badge removable removeLabel="Dismiss">
        <span>typescript</span>
      </Badge>,
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does NOT warn when removable is set on string children (label auto-derived)', () => {
    render(<Badge removable>typescript</Badge>);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
