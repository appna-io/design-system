import { screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Skeleton } from '../src/Skeleton/Skeleton';
import { SkeletonAvatar, SKELETON_AVATAR_SIZE_PX } from '../src/Skeleton/SkeletonAvatar';
import { SkeletonText } from '../src/Skeleton/SkeletonText';
import { renderWithTheme as render } from './utils';

const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
const ROUNDED = ['none', 'sm', 'md', 'lg', 'full'] as const;
const ANIMATIONS = ['shimmer', 'pulse', 'none'] as const;
const AVATAR_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

describe('Skeleton — rendering', () => {
  it('renders a div with role="status" and aria-label="Loading" by default', () => {
    render(<Skeleton data-testid="sk" />);
    const node = screen.getByTestId('sk');
    expect(node.tagName).toBe('DIV');
    expect(node).toHaveAttribute('role', 'status');
    expect(node).toHaveAttribute('aria-label', 'Loading');
  });

  it('applies the default solid + neutral bg-bg-subtle and rounded-md', () => {
    render(<Skeleton data-testid="sk" />);
    const node = screen.getByTestId('sk');
    expect(node.className).toContain('bg-bg-subtle');
    expect(node.className).toContain('rounded-md');
  });

  it('numeric width/height coerce to px', () => {
    render(<Skeleton data-testid="sk" width={120} height={20} />);
    const node = screen.getByTestId('sk') as HTMLDivElement;
    expect(node.style.width).toBe('120px');
    expect(node.style.height).toBe('20px');
  });

  it('string width/height pass through verbatim', () => {
    render(<Skeleton data-testid="sk" width="100%" height="3rem" />);
    const node = screen.getByTestId('sk') as HTMLDivElement;
    expect(node.style.width).toBe('100%');
    expect(node.style.height).toBe('3rem');
  });

  it('omitting width/height leaves the inline dimensions empty', () => {
    render(<Skeleton data-testid="sk" />);
    const node = screen.getByTestId('sk') as HTMLDivElement;
    expect(node.style.width).toBe('');
    expect(node.style.height).toBe('');
  });

  it('emits a stable data-animation attribute for every animation value', () => {
    for (const animation of ANIMATIONS) {
      const { unmount } = render(<Skeleton data-testid="sk" animation={animation} />);
      const node = screen.getByTestId('sk');
      expect(node).toHaveAttribute('data-animation', animation);
      unmount();
    }
  });

  it('shimmer adds the animate-skeleton-shimmer utility + inline gradient style', () => {
    render(<Skeleton data-testid="sk" animation="shimmer" />);
    const node = screen.getByTestId('sk') as HTMLDivElement;
    expect(node.className).toContain('animate-skeleton-shimmer');
    expect(node.className).toContain('motion-reduce:animate-none');
    expect(node.style.backgroundImage).toContain('linear-gradient');
    expect(node.style.backgroundSize).toBe('200% 100%');
  });

  it('pulse adds the animate-skeleton-pulse utility and does NOT set a gradient', () => {
    render(<Skeleton data-testid="sk" animation="pulse" />);
    const node = screen.getByTestId('sk') as HTMLDivElement;
    expect(node.className).toContain('animate-skeleton-pulse');
    expect(node.className).toContain('motion-reduce:animate-none');
    expect(node.style.backgroundImage).toBe('');
  });

  it('animation="none" emits neither animate-* nor a gradient', () => {
    render(<Skeleton data-testid="sk" animation="none" />);
    const node = screen.getByTestId('sk') as HTMLDivElement;
    expect(node.className).not.toContain('animate-skeleton-shimmer');
    expect(node.className).not.toContain('animate-skeleton-pulse');
    expect(node.style.backgroundImage).toBe('');
  });

  it('applies the right rounded class for every value', () => {
    const expected: Record<(typeof ROUNDED)[number], string> = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
    };
    for (const rounded of ROUNDED) {
      const { unmount } = render(<Skeleton data-testid="sk" rounded={rounded} />);
      const node = screen.getByTestId('sk');
      expect(node.className).toContain(expected[rounded]);
      unmount();
    }
  });

  it('soft + every color picks up the role -subtle background', () => {
    for (const color of COLORS) {
      const { unmount } = render(
        <Skeleton data-testid="sk" variant="soft" color={color} />,
      );
      const node = screen.getByTestId('sk');
      expect(node.className).toContain(`bg-${color}-subtle`);
      unmount();
    }
  });

  it('solid variant always carries the neutral subtle base regardless of color', () => {
    for (const color of COLORS) {
      const { unmount } = render(
        <Skeleton data-testid="sk" variant="solid" color={color} />,
      );
      const node = screen.getByTestId('sk');
      expect(node.className).toContain('bg-bg-subtle');
      expect(node.className).not.toContain(`bg-${color}-subtle`);
      unmount();
    }
  });

  it('forwards a ref to the root div', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} data-testid="sk" />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('merges consumer className after the themed class', () => {
    render(<Skeleton data-testid="sk" className="my-skeleton" />);
    const node = screen.getByTestId('sk');
    expect(node.className).toContain('my-skeleton');
    expect(node.className).toContain('rounded-md');
  });

  it('honors explicit aria-label override', () => {
    render(<Skeleton data-testid="sk" aria-label="Fetching user profile" />);
    const node = screen.getByTestId('sk');
    expect(node).toHaveAttribute('aria-label', 'Fetching user profile');
  });

  it('respects aria-hidden=true by dropping role + aria-label so wrappers can own the announcement', () => {
    render(<Skeleton data-testid="sk" aria-hidden="true" />);
    const node = screen.getByTestId('sk');
    expect(node).not.toHaveAttribute('role');
    expect(node).not.toHaveAttribute('aria-label');
    expect(node).toHaveAttribute('aria-hidden', 'true');
  });

  it('always carries the base layout + isolation classes for the gradient overlay to work', () => {
    render(<Skeleton data-testid="sk" />);
    const node = screen.getByTestId('sk');
    expect(node.className).toContain('block');
    expect(node.className).toContain('relative');
    expect(node.className).toContain('overflow-hidden');
  });
});

describe('SkeletonText — rendering', () => {
  it('renders the requested number of lines', () => {
    const { container } = render(
      <SkeletonText data-testid="text" lines={5} />,
    );
    const root = container.querySelector<HTMLDivElement>('[data-sds-skeleton-text]');
    expect(root).not.toBeNull();
    const lines = root!.children;
    expect(lines).toHaveLength(5);
  });

  it('defaults to 3 lines when lines prop is omitted', () => {
    const { container } = render(<SkeletonText />);
    const root = container.querySelector<HTMLDivElement>('[data-sds-skeleton-text]');
    expect(root!.children).toHaveLength(3);
  });

  it('shortens the last line to lastLineWidth (60% by default)', () => {
    const { container } = render(<SkeletonText lines={3} />);
    const root = container.querySelector<HTMLDivElement>('[data-sds-skeleton-text]')!;
    const lastLine = root.children[2] as HTMLDivElement;
    expect(lastLine.style.width).toBe('60%');
  });

  it('honors a custom lastLineWidth (string)', () => {
    const { container } = render(<SkeletonText lines={2} lastLineWidth="35%" />);
    const root = container.querySelector<HTMLDivElement>('[data-sds-skeleton-text]')!;
    const lastLine = root.children[1] as HTMLDivElement;
    expect(lastLine.style.width).toBe('35%');
  });

  it('honors a custom lastLineWidth (number → px)', () => {
    const { container } = render(<SkeletonText lines={2} lastLineWidth={120} />);
    const root = container.querySelector<HTMLDivElement>('[data-sds-skeleton-text]')!;
    const lastLine = root.children[1] as HTMLDivElement;
    expect(lastLine.style.width).toBe('120px');
  });

  it('every non-last line is full width', () => {
    const { container } = render(<SkeletonText lines={4} />);
    const root = container.querySelector<HTMLDivElement>('[data-sds-skeleton-text]')!;
    for (let i = 0; i < 3; i++) {
      const line = root.children[i] as HTMLDivElement;
      expect(line.style.width).toBe('100%');
    }
  });

  it('applies the right gap class per spacing token', () => {
    const cases: Array<['sm' | 'md' | 'lg', string]> = [
      ['sm', 'gap-1'],
      ['md', 'gap-2'],
      ['lg', 'gap-3'],
    ];
    for (const [spacing, klass] of cases) {
      const { container, unmount } = render(<SkeletonText lines={2} spacing={spacing} />);
      const root = container.querySelector<HTMLDivElement>('[data-sds-skeleton-text]')!;
      expect(root.className).toContain(klass);
      unmount();
    }
  });

  it('passes height through to every inner line (numeric)', () => {
    const { container } = render(<SkeletonText lines={2} height={20} />);
    const root = container.querySelector<HTMLDivElement>('[data-sds-skeleton-text]')!;
    for (const line of Array.from(root.children) as HTMLDivElement[]) {
      expect(line.style.height).toBe('20px');
    }
  });

  it('coerces lines={0} to a single line (defensive)', () => {
    const { container } = render(<SkeletonText lines={0} />);
    const root = container.querySelector<HTMLDivElement>('[data-sds-skeleton-text]')!;
    expect(root.children).toHaveLength(1);
  });

  it('inner lines carry aria-hidden so only the wrapper announces', () => {
    const { container } = render(<SkeletonText lines={3} />);
    const root = container.querySelector<HTMLDivElement>('[data-sds-skeleton-text]')!;
    for (const line of Array.from(root.children) as HTMLDivElement[]) {
      expect(line).toHaveAttribute('aria-hidden', 'true');
      expect(line).not.toHaveAttribute('role');
    }
  });
});

describe('SkeletonAvatar — rendering', () => {
  it('matches <Avatar> size table 1:1', () => {
    expect(SKELETON_AVATAR_SIZE_PX).toEqual({
      xs: 24,
      sm: 32,
      md: 40,
      lg: 48,
      xl: 64,
      '2xl': 96,
    });
  });

  it('renders width=height=diameter for every token size', () => {
    for (const size of AVATAR_SIZES) {
      const expected = SKELETON_AVATAR_SIZE_PX[size];
      const { unmount } = render(<SkeletonAvatar data-testid="avatar" size={size} />);
      const node = screen.getByTestId('avatar') as HTMLDivElement;
      expect(node.style.width).toBe(`${expected}px`);
      expect(node.style.height).toBe(`${expected}px`);
      expect(node.className).toContain('rounded-full');
      unmount();
    }
  });

  it('renders numeric size verbatim (100 → 100×100)', () => {
    render(<SkeletonAvatar data-testid="avatar" size={100} />);
    const node = screen.getByTestId('avatar') as HTMLDivElement;
    expect(node.style.width).toBe('100px');
    expect(node.style.height).toBe('100px');
    expect(node.className).toContain('rounded-full');
  });

  it('defaults to size="md" → 40×40', () => {
    render(<SkeletonAvatar data-testid="avatar" />);
    const node = screen.getByTestId('avatar') as HTMLDivElement;
    expect(node.style.width).toBe('40px');
    expect(node.style.height).toBe('40px');
  });
});