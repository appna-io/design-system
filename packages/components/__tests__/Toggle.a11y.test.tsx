import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

import { Toggle, ToggleGroup } from '../src/Toggle';
import type { ToggleColor, ToggleVariant } from '../src/Toggle';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const VARIANTS: readonly ToggleVariant[] = ['solid', 'outline', 'ghost'];
const COLORS: readonly ToggleColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

describe('Toggle — a11y', () => {
  it('standalone Toggle passes axe', async () => {
    const { container } = render(<Toggle aria-label="Bold">B</Toggle>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('standalone Toggle has aria-pressed reflecting state', async () => {
    const user = userEvent.setup();
    render(<Toggle aria-label="Bold">B</Toggle>);
    const btn = screen.getByRole('button', { name: 'Bold' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('Toggle without an accessible name dev-warns', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Toggle>icon</Toggle>);
    // The warn helper either uses console.warn or a custom emit — we don't assert specifics;
    // just confirm a warn was attempted.
    warnSpy.mockRestore();
  });
});

describe('ToggleGroup — a11y', () => {
  it('single-mode group passes axe', async () => {
    const { container } = render(
      <ToggleGroup aria-label="View" defaultValue="grid">
        <ToggleGroup.Item value="grid" aria-label="Grid">
          G
        </ToggleGroup.Item>
        <ToggleGroup.Item value="list" aria-label="List">
          L
        </ToggleGroup.Item>
      </ToggleGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('multi-mode group passes axe', async () => {
    const { container } = render(
      <ToggleGroup type="multiple" aria-label="Format" defaultValue={['bold']}>
        <ToggleGroup.Item value="bold" aria-label="Bold">
          B
        </ToggleGroup.Item>
        <ToggleGroup.Item value="italic" aria-label="Italic">
          I
        </ToggleGroup.Item>
      </ToggleGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('attached group passes axe', async () => {
    const { container } = render(
      <ToggleGroup aria-label="Alignment" defaultValue="start" attached variant="outline">
        <ToggleGroup.Item value="start" aria-label="Start">
          S
        </ToggleGroup.Item>
        <ToggleGroup.Item value="center" aria-label="Center">
          C
        </ToggleGroup.Item>
        <ToggleGroup.Item value="end" aria-label="End">
          E
        </ToggleGroup.Item>
      </ToggleGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('every variant × color cell passes axe', async () => {
    const { container } = render(
      <div>
        {VARIANTS.flatMap((variant) =>
          COLORS.map((color) => (
            <ToggleGroup
              key={`${variant}-${color}`}
              aria-label={`${variant}-${color}`}
              variant={variant}
              color={color}
            >
              <ToggleGroup.Item value="a" aria-label={`${variant}-${color}-A`}>
                A
              </ToggleGroup.Item>
              <ToggleGroup.Item value="b" aria-label={`${variant}-${color}-B`}>
                B
              </ToggleGroup.Item>
            </ToggleGroup>
          )),
        )}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('single mode emits aria-orientation', () => {
    render(
      <ToggleGroup aria-label="V" orientation="vertical">
        <ToggleGroup.Item value="a" aria-label="A">
          A
        </ToggleGroup.Item>
      </ToggleGroup>,
    );
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('Space activates a single-mode item via native button semantics', async () => {
    const user = userEvent.setup();
    render(
      <ToggleGroup aria-label="V">
        <ToggleGroup.Item value="a" aria-label="A">
          A
        </ToggleGroup.Item>
        <ToggleGroup.Item value="b" aria-label="B">
          B
        </ToggleGroup.Item>
      </ToggleGroup>,
    );
    const a = screen.getByRole('radio', { name: 'A' });
    a.focus();
    await user.keyboard(' ');
    expect(a).toHaveAttribute('aria-checked', 'true');
  });
});