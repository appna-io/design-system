import { screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { CircularProgress } from '../src/Progress/CircularProgress';
import { renderWithTheme as render } from './utils';

const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;

function getSvg(root: HTMLElement): SVGSVGElement {
  const svg = root.querySelector('svg');
  if (!svg) throw new Error('CircularProgress: no <svg> rendered');
  return svg;
}

function getCircles(svg: SVGSVGElement): { track: SVGCircleElement; arc: SVGCircleElement } {
  const circles = svg.querySelectorAll('circle');
  const track = circles[0];
  const arc = circles[1];
  if (!track || !arc) throw new Error('CircularProgress: expected two <circle> children');
  return { track, arc };
}

describe('CircularProgress — sizing', () => {
  it('renders a 40×40 SVG for `size="md"` (default)', () => {
    render(<CircularProgress value={50} aria-label="x" />);
    const root = screen.getByRole('progressbar');
    const svg = getSvg(root);
    expect(svg).toHaveAttribute('width', '40');
    expect(svg).toHaveAttribute('height', '40');
    expect(svg).toHaveAttribute('viewBox', '0 0 40 40');
  });

  it('renders the right SVG dimensions for each token size', () => {
    const expected = { sm: 24, md: 40, lg: 56 } as const;
    for (const [size, px] of Object.entries(expected) as [keyof typeof expected, number][]) {
      const { unmount } = render(<CircularProgress size={size} value={50} aria-label="x" />);
      const svg = getSvg(screen.getByRole('progressbar'));
      expect(svg).toHaveAttribute('width', String(px));
      expect(svg).toHaveAttribute('height', String(px));
      unmount();
    }
  });

  it('numeric `size` sets the diameter directly + scales thickness', () => {
    render(<CircularProgress size={120} value={50} aria-label="x" />);
    const root = screen.getByRole('progressbar');
    expect(root).toHaveStyle({ width: '120px', height: '120px' });
    const svg = getSvg(root);
    expect(svg).toHaveAttribute('width', '120');
    expect(svg).toHaveAttribute('height', '120');
    // Thickness defaults to size / 10 when size is numeric.
    const { arc } = getCircles(svg);
    expect(arc).toHaveAttribute('stroke-width', '12');
  });

  it('explicit `thickness` overrides the size-derived default', () => {
    render(<CircularProgress size={120} thickness={6} value={50} aria-label="x" />);
    const svg = getSvg(screen.getByRole('progressbar'));
    const { track, arc } = getCircles(svg);
    expect(track).toHaveAttribute('stroke-width', '6');
    expect(arc).toHaveAttribute('stroke-width', '6');
  });
});

describe('CircularProgress — value math', () => {
  it('computes stroke-dashoffset from the percentage', () => {
    render(<CircularProgress value={50} aria-label="x" />);
    const svg = getSvg(screen.getByRole('progressbar'));
    const { arc } = getCircles(svg);
    // diameter=40, thickness=4 → r = 18, circumference = 2π·18 ≈ 113.097
    // 50% → dashOffset ≈ 56.5485
    const dashOffset = parseFloat(arc.getAttribute('stroke-dashoffset') ?? '0');
    const dashArray = parseFloat(arc.getAttribute('stroke-dasharray') ?? '0');
    expect(dashArray).toBeCloseTo(2 * Math.PI * 18, 3);
    expect(dashOffset).toBeCloseTo(2 * Math.PI * 18 * 0.5, 3);
  });

  it('value=0 → arc fully hidden (dashOffset === circumference)', () => {
    render(<CircularProgress value={0} aria-label="x" />);
    const svg = getSvg(screen.getByRole('progressbar'));
    const { arc } = getCircles(svg);
    const dashOffset = parseFloat(arc.getAttribute('stroke-dashoffset') ?? '0');
    const dashArray = parseFloat(arc.getAttribute('stroke-dasharray') ?? '0');
    expect(dashOffset).toBeCloseTo(dashArray, 3);
  });

  it('value=100 → arc fully visible (dashOffset === 0)', () => {
    render(<CircularProgress value={100} aria-label="x" />);
    const svg = getSvg(screen.getByRole('progressbar'));
    const { arc } = getCircles(svg);
    expect(parseFloat(arc.getAttribute('stroke-dashoffset') ?? 'NaN')).toBeCloseTo(0, 3);
  });

  it('clamps overflow + underflow', () => {
    const root1 = render(<CircularProgress value={150} aria-label="x" />).container.querySelector(
      '[role="progressbar"]',
    );
    expect(root1).toHaveAttribute('aria-valuenow', '100');

    render(<CircularProgress value={-10} aria-label="y" />);
    const root2 = screen.getByLabelText('y');
    expect(root2).toHaveAttribute('aria-valuenow', '0');
  });
});

describe('CircularProgress — indeterminate', () => {
  it('omits aria-valuenow and applies both spin + dash keyframe classes', () => {
    render(<CircularProgress indeterminate aria-label="loading" />);
    const root = screen.getByRole('progressbar');
    expect(root).not.toHaveAttribute('aria-valuenow');
    expect(root).toHaveAttribute('aria-valuetext', 'Loading');
    expect(root).toHaveAttribute('data-indeterminate', 'true');
    const svg = getSvg(root);
    expect(svg.className.baseVal).toContain('animate-circular-indeterminate-spin');
    const { arc } = getCircles(svg);
    expect(arc.className.baseVal).toContain('animate-circular-indeterminate-dash');
  });
});

describe('CircularProgress — variant / color', () => {
  it('default `variant="solid"` paints a neutral track', () => {
    render(<CircularProgress value={50} aria-label="x" />);
    const svg = getSvg(screen.getByRole('progressbar'));
    const { track } = getCircles(svg);
    expect(track.className.baseVal).toContain('stroke-bg-subtle');
  });

  it('variant="soft" paints the role -subtle on the track for every color', () => {
    for (const color of COLORS) {
      const { unmount } = render(
        <CircularProgress variant="soft" color={color} value={50} aria-label="x" />,
      );
      const svg = getSvg(screen.getByRole('progressbar'));
      const { track } = getCircles(svg);
      expect(track.className.baseVal).toContain(`stroke-${color}-subtle`);
      unmount();
    }
  });

  it('arc carries the role color for every color', () => {
    for (const color of COLORS) {
      const { unmount } = render(
        <CircularProgress value={50} color={color} aria-label="x" />,
      );
      const svg = getSvg(screen.getByRole('progressbar'));
      const { arc } = getCircles(svg);
      expect(arc.className.baseVal).toContain(`stroke-${color}`);
      unmount();
    }
  });
});

describe('CircularProgress — labels', () => {
  it('does not render a label by default', () => {
    render(<CircularProgress value={50} aria-label="x" />);
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  it('renders the percentage when `showLabel` is true', () => {
    render(<CircularProgress value={50} showLabel aria-label="x" />);
    const label = screen.getByText('50%');
    expect(label).toHaveAttribute('aria-hidden', 'true');
  });

  it('uses `labelFormat` when provided', () => {
    render(
      <CircularProgress
        value={3}
        max={5}
        showLabel
        labelFormat={(v, max) => `${v}/${max}`}
        aria-label="x"
      />,
    );
    expect(screen.getByText('3/5')).toBeInTheDocument();
  });

  it('hides the label under indeterminate mode', () => {
    render(<CircularProgress indeterminate showLabel aria-label="x" />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});

describe('CircularProgress — track opacity', () => {
  it('applies the default track opacity (0.2) inline', () => {
    render(<CircularProgress value={50} aria-label="x" />);
    const svg = getSvg(screen.getByRole('progressbar'));
    const { track } = getCircles(svg);
    expect(track.style.opacity).toBe('0.2');
  });

  it('honors a custom `trackOpacity`', () => {
    render(<CircularProgress value={50} trackOpacity={0.5} aria-label="x" />);
    const svg = getSvg(screen.getByRole('progressbar'));
    const { track } = getCircles(svg);
    expect(track.style.opacity).toBe('0.5');
  });
});

describe('CircularProgress — animation toggle', () => {
  it('omits `data-animated` when `animated={true}` (default)', () => {
    render(<CircularProgress value={50} aria-label="x" />);
    const svg = getSvg(screen.getByRole('progressbar'));
    const { arc } = getCircles(svg);
    expect(arc).not.toHaveAttribute('data-animated');
  });

  it('sets `data-animated="false"` when `animated={false}`', () => {
    render(<CircularProgress value={50} animated={false} aria-label="x" />);
    const svg = getSvg(screen.getByRole('progressbar'));
    const { arc } = getCircles(svg);
    expect(arc).toHaveAttribute('data-animated', 'false');
  });
});

describe('CircularProgress — overrides + ref', () => {
  it('className applies on the root', () => {
    render(<CircularProgress value={50} className="custom-x" aria-label="x" />);
    expect(screen.getByRole('progressbar')).toHaveClass('custom-x');
  });

  it('forwards ref to the root div', () => {
    const ref = createRef<HTMLDivElement>();
    render(<CircularProgress ref={ref} value={50} aria-label="x" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('role', 'progressbar');
  });
});
