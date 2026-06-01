import { screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import {
  Spinner,
  SPINNER_SIZE_PX,
  SPINNER_SPEED_MS,
} from '../src/Spinner/Spinner';
import { renderWithTheme as render } from './utils';

const VARIANTS = ['ring', 'dots', 'pulse'] as const;
const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
const SPEEDS = ['slow', 'normal', 'fast'] as const;

describe('Spinner — rendering & defaults', () => {
  it('renders a div with role="status", aria-busy, aria-live by default', () => {
    render(<Spinner data-testid="sp" />);
    const node = screen.getByTestId('sp');
    expect(node.tagName).toBe('DIV');
    expect(node).toHaveAttribute('role', 'status');
    expect(node).toHaveAttribute('aria-busy', 'true');
    expect(node).toHaveAttribute('aria-live', 'polite');
  });

  it('hidden label populates aria-label="Loading" by default (no inner span)', () => {
    render(<Spinner data-testid="sp" />);
    const node = screen.getByTestId('sp');
    expect(node).toHaveAttribute('aria-label', 'Loading');
    // No visible label child (sr-only path is via aria-label).
    expect(node.querySelector('span.sr-only')).toBeNull();
  });

  it('custom label string flows into aria-label when placement is hidden', () => {
    render(<Spinner data-testid="sp" label="Loading users" />);
    const node = screen.getByTestId('sp');
    expect(node).toHaveAttribute('aria-label', 'Loading users');
  });

  it('forwards a ref to the root div', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Spinner ref={ref} data-testid="sp" />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('merges consumer className onto the wrapper', () => {
    render(<Spinner data-testid="sp" className="my-spinner" />);
    const node = screen.getByTestId('sp');
    expect(node.className).toContain('my-spinner');
  });

  it('emits stable data-variant + data-speed attributes', () => {
    for (const variant of VARIANTS) {
      for (const speed of SPEEDS) {
        const { unmount } = render(
          <Spinner data-testid="sp" variant={variant} speed={speed} />,
        );
        const node = screen.getByTestId('sp');
        expect(node).toHaveAttribute('data-variant', variant);
        expect(node).toHaveAttribute('data-speed', speed);
        unmount();
      }
    }
  });
});

describe('Spinner — variant: ring', () => {
  it('renders an SVG with two circles (track + arc) inside an animate-spin wrapper', () => {
    render(<Spinner data-testid="sp" variant="ring" />);
    const node = screen.getByTestId('sp');
    const wrapper = node.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('animate-spin');
    expect(wrapper.className).toContain('motion-reduce:animate-none');
    const svg = wrapper.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute('aria-hidden')).toBe('true');
    expect(svg!.querySelectorAll('circle')).toHaveLength(2);
  });

  it('applies inline width/height matching the token diameter', () => {
    render(<Spinner data-testid="sp" variant="ring" size="lg" />);
    const wrapper = screen.getByTestId('sp').firstElementChild as HTMLElement;
    expect(wrapper.style.width).toBe(`${SPINNER_SIZE_PX.lg}px`);
    expect(wrapper.style.height).toBe(`${SPINNER_SIZE_PX.lg}px`);
  });

  it('numeric size drops straight to px', () => {
    render(<Spinner data-testid="sp" variant="ring" size={64} />);
    const wrapper = screen.getByTestId('sp').firstElementChild as HTMLElement;
    expect(wrapper.style.width).toBe('64px');
    expect(wrapper.style.height).toBe('64px');
  });

  it('thickness flows into both circle stroke-widths', () => {
    render(<Spinner data-testid="sp" variant="ring" thickness={3} />);
    const circles = screen
      .getByTestId('sp')
      .querySelectorAll<SVGCircleElement>('circle');
    for (const c of Array.from(circles)) {
      expect(c.getAttribute('stroke-width')).toBe('3');
    }
  });

  it('trackOpacity is applied to the background circle only', () => {
    render(<Spinner data-testid="sp" variant="ring" trackOpacity={0.5} />);
    const circles = screen
      .getByTestId('sp')
      .querySelectorAll<SVGCircleElement>('circle');
    const [track, arc] = Array.from(circles);
    expect(track?.getAttribute('opacity')).toBe('0.5');
    expect(arc?.getAttribute('opacity')).toBeNull();
  });

  it('speed maps to inline animationDuration (ms) on the wrapper', () => {
    for (const speed of SPEEDS) {
      const { unmount } = render(<Spinner data-testid="sp" variant="ring" speed={speed} />);
      const wrapper = screen.getByTestId('sp').firstElementChild as HTMLElement;
      expect(wrapper.style.animationDuration).toBe(`${SPINNER_SPEED_MS[speed]}ms`);
      unmount();
    }
  });
});

describe('Spinner — variant: dots', () => {
  it('renders three dot children inside the glyph wrapper', () => {
    render(<Spinner data-testid="sp" variant="dots" />);
    const wrapper = screen.getByTestId('sp').firstElementChild as HTMLElement;
    expect(wrapper.children).toHaveLength(3);
    expect(wrapper.getAttribute('aria-hidden')).toBe('true');
  });

  it('each dot carries the animate-spinner-bounce utility', () => {
    render(<Spinner data-testid="sp" variant="dots" />);
    const wrapper = screen.getByTestId('sp').firstElementChild as HTMLElement;
    for (const dot of Array.from(wrapper.children) as HTMLElement[]) {
      expect(dot.className).toContain('animate-spinner-bounce');
      expect(dot.className).toContain('motion-reduce:animate-none');
    }
  });

  it('each dot has a unique staggered animationDelay (0 / 160 / 320 ms)', () => {
    render(<Spinner data-testid="sp" variant="dots" />);
    const wrapper = screen.getByTestId('sp').firstElementChild as HTMLElement;
    const delays = Array.from(wrapper.children).map(
      (d) => (d as HTMLElement).style.animationDelay,
    );
    expect(delays).toEqual(['0ms', '160ms', '320ms']);
  });

  it('dot animationDuration scales with speed (1.5× base)', () => {
    render(<Spinner data-testid="sp" variant="dots" speed="fast" />);
    const wrapper = screen.getByTestId('sp').firstElementChild as HTMLElement;
    const first = wrapper.firstElementChild as HTMLElement;
    expect(first.style.animationDuration).toBe(`${SPINNER_SPEED_MS.fast * 1.5}ms`);
  });
});

describe('Spinner — variant: pulse', () => {
  it('renders a single disc with the pulse animation', () => {
    render(<Spinner data-testid="sp" variant="pulse" />);
    const wrapper = screen.getByTestId('sp').firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('animate-spinner-pulse');
    expect(wrapper.className).toContain('motion-reduce:animate-none');
    expect(wrapper.className).toContain('rounded-full');
    expect(wrapper.className).toContain('bg-current');
    expect(wrapper.getAttribute('aria-hidden')).toBe('true');
  });

  it('pulse disc respects the size diameter', () => {
    render(<Spinner data-testid="sp" variant="pulse" size="xl" />);
    const wrapper = screen.getByTestId('sp').firstElementChild as HTMLElement;
    expect(wrapper.style.width).toBe(`${SPINNER_SIZE_PX.xl}px`);
    expect(wrapper.style.height).toBe(`${SPINNER_SIZE_PX.xl}px`);
  });
});

describe('Spinner — color', () => {
  it('omitting color leaves no text-* class on the glyph (currentColor inherits)', () => {
    render(<Spinner data-testid="sp" />);
    const wrapper = screen.getByTestId('sp').firstElementChild as HTMLElement;
    for (const color of COLORS) {
      expect(wrapper.className).not.toContain(`text-${color}`);
    }
  });

  it('every role color flows the expected text-* class', () => {
    const expected: Record<(typeof COLORS)[number], string> = {
      primary: 'text-primary',
      secondary: 'text-secondary',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
      info: 'text-info',
      neutral: 'text-fg-muted',
    };
    for (const color of COLORS) {
      const { unmount } = render(<Spinner data-testid="sp" color={color} />);
      const wrapper = screen.getByTestId('sp').firstElementChild as HTMLElement;
      expect(wrapper.className).toContain(expected[color]);
      unmount();
    }
  });
});

describe('Spinner — label placement', () => {
  it('labelPlacement="hidden" renders no inner span (announcement via aria-label)', () => {
    render(<Spinner data-testid="sp" label="Loading invoices" />);
    const node = screen.getByTestId('sp');
    expect(node.querySelectorAll('span').length).toBeGreaterThan(0); // glyph span
    // No span with the label text.
    expect(screen.queryByText('Loading invoices')).toBeNull();
    expect(node).toHaveAttribute('aria-label', 'Loading invoices');
  });

  it('labelPlacement="end" renders the label text and drops aria-label on the wrapper', () => {
    render(<Spinner data-testid="sp" label="Saving" labelPlacement="end" />);
    const node = screen.getByTestId('sp');
    expect(node).not.toHaveAttribute('aria-label');
    expect(screen.getByText('Saving')).toBeInTheDocument();
    // Wrapper should be flex-row.
    expect(node.className).toContain('flex-row');
  });

  it('labelPlacement="bottom" renders the label text and stacks column', () => {
    render(<Spinner data-testid="sp" label="Loading" labelPlacement="bottom" />);
    const node = screen.getByTestId('sp');
    expect(node.className).toContain('flex-col');
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('explicit aria-label always wins (even when label placement is visible)', () => {
    render(
      <Spinner
        data-testid="sp"
        label="Saving"
        labelPlacement="end"
        aria-label="Custom announcement"
      />,
    );
    const node = screen.getByTestId('sp');
    expect(node).toHaveAttribute('aria-label', 'Custom announcement');
  });
});

describe('Spinner — exported size table', () => {
  it('matches the documented px diameters', () => {
    expect(SPINNER_SIZE_PX).toEqual({ xs: 12, sm: 16, md: 20, lg: 32, xl: 48 });
  });

  it('matches the documented speed durations (ms)', () => {
    expect(SPINNER_SPEED_MS).toEqual({ slow: 1200, normal: 800, fast: 500 });
  });
});