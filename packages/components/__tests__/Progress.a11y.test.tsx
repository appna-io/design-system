import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { CircularProgress } from '../src/Progress/CircularProgress';
import { Progress } from '../src/Progress/Progress';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
const LINEAR_VARIANTS = ['solid', 'soft', 'striped'] as const;
const CIRCULAR_VARIANTS = ['solid', 'soft'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

describe('Progress — accessibility (linear)', () => {
  it('passes axe-core for the default render', async () => {
    const { container } = render(<Progress value={50} aria-label="upload" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for every variant × color × size cell', async () => {
    const { container } = render(
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {LINEAR_VARIANTS.flatMap((variant) =>
          COLORS.flatMap((color) =>
            SIZES.map((size) => (
              <li key={`${variant}-${color}-${size}`}>
                <Progress
                  variant={variant}
                  color={color}
                  size={size}
                  value={42}
                  aria-label={`${variant}-${color}-${size}`}
                />
              </li>
            )),
          ),
        )}
      </ul>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('exposes the `progressbar` role with min/max/now for determinate', () => {
    const { getByRole } = render(<Progress value={42} aria-label="x" />);
    const root = getByRole('progressbar');
    expect(root).toHaveAttribute('aria-valuemin', '0');
    expect(root).toHaveAttribute('aria-valuemax', '100');
    expect(root).toHaveAttribute('aria-valuenow', '42');
    expect(root).toHaveAttribute('aria-valuetext', '42%');
  });

  it('omits aria-valuenow for indeterminate (correct ARIA)', () => {
    const { getByRole } = render(<Progress indeterminate aria-label="x" />);
    const root = getByRole('progressbar');
    expect(root).not.toHaveAttribute('aria-valuenow');
  });

  it('the inline percentage label is aria-hidden', () => {
    const { getByText } = render(<Progress value={50} showLabel aria-label="x" />);
    expect(getByText('50%')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('CircularProgress — accessibility', () => {
  it('passes axe-core for the default render', async () => {
    const { container } = render(<CircularProgress value={50} aria-label="loading" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for every variant × color × size cell', async () => {
    const { container } = render(
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {CIRCULAR_VARIANTS.flatMap((variant) =>
          COLORS.flatMap((color) =>
            SIZES.map((size) => (
              <li key={`${variant}-${color}-${size}`}>
                <CircularProgress
                  variant={variant}
                  color={color}
                  size={size}
                  value={42}
                  aria-label={`${variant}-${color}-${size}`}
                />
              </li>
            )),
          ),
        )}
      </ul>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('exposes the `progressbar` role with min/max/now for determinate', () => {
    const { getByRole } = render(<CircularProgress value={42} aria-label="x" />);
    const root = getByRole('progressbar');
    expect(root).toHaveAttribute('aria-valuemin', '0');
    expect(root).toHaveAttribute('aria-valuemax', '100');
    expect(root).toHaveAttribute('aria-valuenow', '42');
    expect(root).toHaveAttribute('aria-valuetext', '42%');
  });

  it('the inner SVG is aria-hidden so SR readers do not double-announce the dial', () => {
    const { getByRole } = render(<CircularProgress value={50} aria-label="x" />);
    const svg = getByRole('progressbar').querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('the centered label is aria-hidden', () => {
    const { getByText } = render(<CircularProgress value={50} showLabel aria-label="x" />);
    expect(getByText('50%')).toHaveAttribute('aria-hidden', 'true');
  });

  it('omits aria-valuenow for indeterminate (correct ARIA)', () => {
    const { getByRole } = render(<CircularProgress indeterminate aria-label="x" />);
    const root = getByRole('progressbar');
    expect(root).not.toHaveAttribute('aria-valuenow');
  });
});