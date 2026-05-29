import { screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Progress } from '../src/Progress/Progress';
import { useProgressValue } from '../src/Progress/useProgressValue';
import { renderWithTheme as render } from './utils';

const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
const VARIANTS = ['solid', 'soft', 'striped'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;
const ROUNDED = ['sm', 'md', 'lg', 'full'] as const;

describe('Progress — value math', () => {
  it('paints the bar at the given percentage of the full range', () => {
    render(<Progress value={50} aria-label="upload" />);
    const bar = screen.getByRole('progressbar').firstElementChild as HTMLElement;
    expect(bar).toHaveStyle({ width: '50%' });
  });

  it('clamps `value` above max to 100% (and exposes the clamped value via aria)', () => {
    render(<Progress value={150} max={100} aria-label="upload" />);
    const root = screen.getByRole('progressbar');
    const bar = root.firstElementChild as HTMLElement;
    expect(bar).toHaveStyle({ width: '100%' });
    expect(root).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps `value` below min to 0% (and exposes the clamped value via aria)', () => {
    render(<Progress value={-10} min={0} max={100} aria-label="upload" />);
    const root = screen.getByRole('progressbar');
    const bar = root.firstElementChild as HTMLElement;
    expect(bar).toHaveStyle({ width: '0%' });
    expect(root).toHaveAttribute('aria-valuenow', '0');
  });

  it('honors a non-default `min` / `max` range', () => {
    render(<Progress value={3} min={1} max={5} aria-label="step" />);
    const root = screen.getByRole('progressbar');
    const bar = root.firstElementChild as HTMLElement;
    expect(bar).toHaveStyle({ width: '50%' });
    expect(root).toHaveAttribute('aria-valuenow', '3');
    expect(root).toHaveAttribute('aria-valuemin', '1');
    expect(root).toHaveAttribute('aria-valuemax', '5');
  });

  it('useProgressValue clamps + computes percent in isolation', () => {
    expect(useProgressValue({ value: 25 })).toEqual({ clampedValue: 25, percent: 25 });
    expect(useProgressValue({ value: 200, max: 100 }).clampedValue).toBe(100);
    expect(useProgressValue({ value: -5, min: 0 }).clampedValue).toBe(0);
    expect(useProgressValue({ indeterminate: true })).toEqual({ clampedValue: 0, percent: 0 });
  });
});

describe('Progress — indeterminate', () => {
  it('omits aria-valuenow and applies the indeterminate keyframe class', () => {
    render(<Progress indeterminate aria-label="loading" />);
    const root = screen.getByRole('progressbar');
    expect(root).not.toHaveAttribute('aria-valuenow');
    expect(root).toHaveAttribute('aria-valuetext', 'Loading');
    expect(root).toHaveAttribute('data-indeterminate', 'true');
    const bar = root.firstElementChild as HTMLElement;
    expect(bar.className).toContain('animate-progress-indeterminate');
    // Determinate paints `style={{ width: ... }}`. Indeterminate must not.
    expect(bar.style.width).toBe('');
  });

  it('indeterminate overrides any provided `value`', () => {
    render(<Progress indeterminate value={66} aria-label="loading" />);
    const root = screen.getByRole('progressbar');
    expect(root).not.toHaveAttribute('aria-valuenow');
  });
});

describe('Progress — striped', () => {
  it('`striped={true}` adds data-striped on the bar', () => {
    render(
      <Progress striped value={40} aria-label="x" />,
    );
    const bar = screen.getByRole('progressbar').firstElementChild as HTMLElement;
    expect(bar).toHaveAttribute('data-striped', 'true');
  });

  it('`variant="striped"` is equivalent to `striped={true}`', () => {
    render(<Progress variant="striped" value={40} aria-label="x" />);
    const bar = screen.getByRole('progressbar').firstElementChild as HTMLElement;
    expect(bar).toHaveAttribute('data-striped', 'true');
  });

  it('omits data-striped when neither prop is set', () => {
    render(<Progress value={40} aria-label="x" />);
    const bar = screen.getByRole('progressbar').firstElementChild as HTMLElement;
    expect(bar).not.toHaveAttribute('data-striped');
  });
});

describe('Progress — labels', () => {
  it('does not render a label by default', () => {
    render(<Progress value={66} aria-label="x" />);
    const root = screen.getByRole('progressbar');
    // Label is the only `<span>` child; a determinate bar without `showLabel` has none.
    expect(root.querySelector('span')).toBeNull();
  });

  it('renders the percentage when `showLabel` is true', () => {
    render(<Progress value={66} showLabel aria-label="x" />);
    expect(screen.getByText('66%')).toBeInTheDocument();
  });

  it('uses `labelFormat` when provided', () => {
    render(
      <Progress
        value={2.4 * 1024 * 1024 * 1024}
        max={4 * 1024 * 1024 * 1024}
        showLabel
        labelFormat={(v, max) => `${(v / 1024 ** 3).toFixed(1)} GB / ${max / 1024 ** 3} GB`}
        aria-label="download"
      />,
    );
    expect(screen.getByText('2.4 GB / 4 GB')).toBeInTheDocument();
  });

  it('the visual label is aria-hidden so the percentage is not announced twice', () => {
    render(<Progress value={50} showLabel aria-label="x" />);
    const label = screen.getByText('50%');
    expect(label).toHaveAttribute('aria-hidden', 'true');
  });

  it('hides the label entirely under indeterminate mode', () => {
    render(<Progress indeterminate showLabel aria-label="x" />);
    const root = screen.getByRole('progressbar');
    expect(root.querySelector('span')).toBeNull();
  });
});

describe('Progress — variant / size / color / rounded', () => {
  it('every variant lands on a known compound rule for every color', () => {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        const { unmount } = render(
          <Progress variant={variant} color={color} value={50} aria-label="x" />,
        );
        const root = screen.getByRole('progressbar');
        const bar = root.firstElementChild as HTMLElement;
        // Bar always carries the role color. (`solid` + `striped` paint the role on the bar;
        // `soft` paints `-subtle` on the track and the role on the bar.)
        expect(bar.className).toContain(`bg-${color}`);
        if (variant === 'soft') {
          expect(root.className).toContain(`bg-${color}-subtle`);
        } else {
          expect(root.className).toContain('bg-bg-subtle');
        }
        unmount();
      }
    }
  });

  it('applies the right size class', () => {
    const heightClass = { sm: 'h-1', md: 'h-2', lg: 'h-3' };
    for (const size of SIZES) {
      const { unmount } = render(<Progress size={size} value={50} aria-label="x" />);
      const root = screen.getByRole('progressbar');
      expect(root.className).toContain(heightClass[size]);
      unmount();
    }
  });

  it('applies the right rounded class', () => {
    const roundedClass = {
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
    };
    for (const rounded of ROUNDED) {
      const { unmount } = render(<Progress rounded={rounded} value={50} aria-label="x" />);
      const root = screen.getByRole('progressbar');
      expect(root.className).toContain(roundedClass[rounded]);
      unmount();
    }
  });

  it('emits stable data-* attributes for variant', () => {
    render(<Progress variant="soft" value={50} aria-label="x" />);
    const root = screen.getByRole('progressbar');
    expect(root).toHaveAttribute('data-variant', 'soft');
  });
});

describe('Progress — animation toggle', () => {
  it('omits the `data-animated` attribute when `animated={true}` (default)', () => {
    render(<Progress value={50} aria-label="x" />);
    const bar = screen.getByRole('progressbar').firstElementChild as HTMLElement;
    expect(bar).not.toHaveAttribute('data-animated');
  });

  it('sets `data-animated="false"` when `animated={false}`', () => {
    render(<Progress value={50} animated={false} aria-label="x" />);
    const bar = screen.getByRole('progressbar').firstElementChild as HTMLElement;
    expect(bar).toHaveAttribute('data-animated', 'false');
  });
});

describe('Progress — overrides + ref', () => {
  it('className wins over conflicting recipe classes via tailwind-merge', () => {
    render(
      <Progress
        value={50}
        rounded="full"
        className="rounded-none"
        aria-label="x"
      />,
    );
    const root = screen.getByRole('progressbar');
    expect(root).toHaveClass('rounded-none');
    expect(root).not.toHaveClass('rounded-full');
  });

  it('style prop applies inline on the root track', () => {
    render(<Progress value={50} style={{ minWidth: 200 }} aria-label="x" />);
    expect(screen.getByRole('progressbar')).toHaveStyle({ minWidth: '200px' });
  });

  it('forwards ref to the root div', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Progress ref={ref} value={50} aria-label="x" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('role', 'progressbar');
  });
});
