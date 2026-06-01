import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Toggle } from '../src/Toggle';
import { renderWithTheme as render } from './utils';

describe('Toggle — standalone rendering', () => {
  it('renders an unpressed button by default', () => {
    render(<Toggle aria-label="Bold">B</Toggle>);
    const btn = screen.getByRole('button', { name: 'Bold' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(btn).toHaveAttribute('data-state', 'off');
  });

  it('honors defaultPressed for the uncontrolled flow', () => {
    render(
      <Toggle defaultPressed aria-label="Bold">
        B
      </Toggle>,
    );
    const btn = screen.getByRole('button', { name: 'Bold' });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(btn).toHaveAttribute('data-state', 'on');
  });

  it('clicks flip pressed state (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<Toggle aria-label="Bold">B</Toggle>);
    const btn = screen.getByRole('button', { name: 'Bold' });
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('fires onPressedChange on every flip (uncontrolled)', async () => {
    const onPressedChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Toggle aria-label="Bold" onPressedChange={onPressedChange}>
        B
      </Toggle>,
    );
    await user.click(screen.getByRole('button', { name: 'Bold' }));
    expect(onPressedChange).toHaveBeenLastCalledWith(true);
    await user.click(screen.getByRole('button', { name: 'Bold' }));
    expect(onPressedChange).toHaveBeenLastCalledWith(false);
  });

  it('controlled: external pressed flows in, onPressedChange flows out', async () => {
    function Controlled() {
      const [p, setP] = useState(false);
      return (
        <Toggle pressed={p} onPressedChange={setP} aria-label="Bold">
          B
        </Toggle>
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    const btn = screen.getByRole('button', { name: 'Bold' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('disabled: click does nothing, button is disabled', async () => {
    const onPressedChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Toggle aria-label="Bold" disabled onPressedChange={onPressedChange}>
        B
      </Toggle>,
    );
    const btn = screen.getByRole('button', { name: 'Bold' });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onPressedChange).not.toHaveBeenCalled();
  });

  it('Space and Enter activate via native button semantics', async () => {
    const user = userEvent.setup();
    render(<Toggle aria-label="Bold">B</Toggle>);
    const btn = screen.getByRole('button', { name: 'Bold' });
    btn.focus();
    await user.keyboard(' ');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard('{Enter}');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('forwards ref to the underlying button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Toggle ref={ref} aria-label="Bold">
        B
      </Toggle>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('merges consumer className with recipe classes', () => {
    render(
      <Toggle aria-label="Bold" className="custom-flag">
        B
      </Toggle>,
    );
    const btn = screen.getByRole('button', { name: 'Bold' });
    expect(btn.className).toContain('custom-flag');
  });

  it('variant/size/color resolve to recipe classes', () => {
    const { rerender } = render(
      <Toggle aria-label="x" variant="outline" color="primary" size="sm">
        x
      </Toggle>,
    );
    const btn = screen.getByRole('button', { name: 'x' });
    expect(btn.className).toContain('border-primary-border');
    expect(btn.className).toContain('h-8');

    rerender(
      <Toggle aria-label="x" variant="solid" color="success" size="lg">
        x
      </Toggle>,
    );
    const btn2 = screen.getByRole('button', { name: 'x' });
    expect(btn2.className).toContain('bg-success-subtle');
    expect(btn2.className).toContain('h-12');
  });
});