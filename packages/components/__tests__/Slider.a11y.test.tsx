import { __resetWarnCache } from '@apx-ui/engine';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Slider } from '../src/Slider/Slider';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('Slider — accessibility', () => {
  it('passes axe-core for the default single-thumb render', async () => {
    const { container } = render(<Slider aria-label="Volume" defaultValue={50} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for the default range render', async () => {
    const { container } = render(
      <Slider mode="range" aria-label="Range" defaultValue={[20, 80]} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core across the 4 variants × 7 colors matrix', async () => {
    const variants = ['solid', 'outline', 'soft', 'minimal'] as const;
    const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
    const { container } = render(
      <div>
        {variants.flatMap((variant) =>
          colors.map((color) => (
            <Slider
              key={`${variant}-${color}`}
              variant={variant}
              color={color}
              aria-label={`${variant} ${color}`}
              defaultValue={60}
            />
          )),
        )}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for disabled / invalid / vertical / marks / continuous', async () => {
    const { container } = render(
      <div>
        <Slider aria-label="Disabled" disabled defaultValue={50} />
        <Slider aria-label="Invalid" invalid defaultValue={50} />
        <Slider aria-label="Vertical" orientation="vertical" defaultValue={50} />
        <Slider
          aria-label="With marks"
          defaultValue={50}
          marks={[
            { value: 0, label: '0' },
            { value: 50, label: 'Mid' },
            { value: 100, label: '100' },
          ]}
        />
        <Slider aria-label="Continuous" defaultValue={0.42} min={0} max={1} step={null} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('each thumb has role=slider with the canonical ARIA props', () => {
    render(
      <Slider
        mode="range"
        aria-label="Range"
        defaultValue={[20, 80]}
        min={0}
        max={100}
      />,
    );
    for (const thumb of screen.getAllByRole('slider')) {
      expect(thumb).toHaveAttribute('aria-valuemin', '0');
      expect(thumb).toHaveAttribute('aria-valuemax', '100');
      expect(thumb).toHaveAttribute('aria-orientation', 'horizontal');
      expect(thumb).toHaveAttribute('aria-valuenow');
      expect(thumb).toHaveAttribute('aria-valuetext');
    }
  });

  it('range thumbs default to "Minimum value" / "Maximum value" aria-labels', () => {
    render(<Slider mode="range" aria-label="x" defaultValue={[20, 80]} />);
    const [lo, hi] = screen.getAllByRole('slider');
    expect(lo).toHaveAttribute('aria-label', 'Minimum value');
    expect(hi).toHaveAttribute('aria-label', 'Maximum value');
  });

  it('N-thumb range labels fall back to "Value N"', () => {
    render(
      <Slider mode="range" aria-label="x" defaultValue={[10, 30, 60, 90]} />,
    );
    const thumbs = screen.getAllByRole('slider');
    expect(thumbs[0]).toHaveAttribute('aria-label', 'Minimum value');
    expect(thumbs[1]).toHaveAttribute('aria-label', 'Value 2');
    expect(thumbs[2]).toHaveAttribute('aria-label', 'Value 3');
    expect(thumbs[3]).toHaveAttribute('aria-label', 'Maximum value');
  });

  it('getThumbAriaLabel overrides per-thumb labels', () => {
    render(
      <Slider
        mode="range"
        aria-label="EQ"
        defaultValue={[10, 50, 90]}
        getThumbAriaLabel={(i) => `Band ${i + 1}`}
      />,
    );
    const thumbs = screen.getAllByRole('slider');
    expect(thumbs[0]).toHaveAttribute('aria-label', 'Band 1');
    expect(thumbs[1]).toHaveAttribute('aria-label', 'Band 2');
    expect(thumbs[2]).toHaveAttribute('aria-label', 'Band 3');
  });

  it('getAriaValueText customizes the announced value', () => {
    render(
      <Slider
        aria-label="Price"
        defaultValue={42}
        getAriaValueText={(v) => `$${v}.00`}
      />,
    );
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '$42.00');
  });

  it('single thumb gets the root aria-label when no per-thumb override is set', () => {
    render(<Slider aria-label="Volume" defaultValue={50} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-label', 'Volume');
  });

  it('disabled removes thumbs from the tab order and sets aria-disabled', () => {
    render(<Slider mode="range" aria-label="x" disabled defaultValue={[20, 80]} />);
    for (const thumb of screen.getAllByRole('slider')) {
      expect(thumb).toHaveAttribute('aria-disabled', 'true');
      expect(thumb).toHaveAttribute('tabindex', '-1');
    }
  });

  it('Tab focuses each thumb in order', async () => {
    render(
      <>
        <button type="button">Before</button>
        <Slider mode="range" aria-label="Range" defaultValue={[20, 80]} />
        <button type="button">After</button>
      </>,
    );
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getAllByRole('slider')[0]!).toHaveFocus();
    await userEvent.tab();
    expect(screen.getAllByRole('slider')[1]!).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('vertical orientation sets aria-orientation on every thumb', () => {
    render(
      <Slider
        mode="range"
        aria-label="x"
        orientation="vertical"
        defaultValue={[20, 80]}
      />,
    );
    for (const thumb of screen.getAllByRole('slider')) {
      expect(thumb).toHaveAttribute('aria-orientation', 'vertical');
    }
  });
});

describe('Slider — dev warnings', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    __resetWarnCache();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('warns when no accessible name is provided', () => {
    render(<Slider defaultValue={50} />);
    expect(warnSpy).toHaveBeenCalled();
    const messages = warnSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(messages).toMatch(/accessible name/i);
  });

  it('does NOT warn when aria-label is set', () => {
    render(<Slider aria-label="Volume" defaultValue={50} />);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does NOT warn when getThumbAriaLabel is set', () => {
    render(
      <Slider
        defaultValue={50}
        getThumbAriaLabel={() => 'Per-thumb label'}
      />,
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });
});