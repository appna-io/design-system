import { screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Skeleton } from '../src/Skeleton/Skeleton';
import { SkeletonAvatar } from '../src/Skeleton/SkeletonAvatar';
import { SkeletonText } from '../src/Skeleton/SkeletonText';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
const VARIANTS = ['solid', 'soft'] as const;
const ANIMATIONS = ['shimmer', 'pulse', 'none'] as const;

describe('Skeleton — accessibility', () => {
  it('passes axe-core for the default render', async () => {
    const { container } = render(<Skeleton width={120} height={20} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for every variant × color cell', async () => {
    const { container } = render(
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {VARIANTS.flatMap((variant) =>
          COLORS.map((color) => (
            <li key={`${variant}-${color}`}>
              <Skeleton variant={variant} color={color} width={120} height={16} />
            </li>
          )),
        )}
      </ul>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for every animation value', async () => {
    const { container } = render(
      <div>
        {ANIMATIONS.map((animation) => (
          <Skeleton key={animation} animation={animation} width={120} height={16} />
        ))}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe-core for the canonical card composition', async () => {
    const { container } = render(
      <div>
        <Skeleton width="100%" height={160} rounded="md" />
        <Skeleton width="70%" height={20} />
        <SkeletonText lines={3} height={12} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Skeleton root reports role=status + aria-label=Loading exactly once for SR users', () => {
    render(<Skeleton data-testid="sk" />);
    const node = screen.getByTestId('sk');
    expect(node).toHaveAttribute('role', 'status');
    expect(node).toHaveAttribute('aria-label', 'Loading');
  });

  it('SkeletonText wrapper announces once; inner lines are silenced via aria-hidden', () => {
    const { container } = render(<SkeletonText lines={4} />);
    const wrapper = container.querySelector<HTMLDivElement>('[data-sds-skeleton-text]')!;
    expect(wrapper).toHaveAttribute('role', 'status');
    expect(wrapper).toHaveAttribute('aria-label', 'Loading');
    for (const line of Array.from(wrapper.children) as HTMLDivElement[]) {
      expect(line).toHaveAttribute('aria-hidden', 'true');
      expect(line).not.toHaveAttribute('role');
    }
  });

  it('SkeletonAvatar default render exposes the loading status role', () => {
    render(<SkeletonAvatar data-testid="avatar" />);
    const node = screen.getByTestId('avatar');
    expect(node).toHaveAttribute('role', 'status');
    expect(node).toHaveAttribute('aria-label', 'Loading');
  });

  it('aria-hidden=true suppresses both role and aria-label so nested compositions stay quiet', () => {
    render(<Skeleton data-testid="sk" aria-hidden="true" />);
    const node = screen.getByTestId('sk');
    expect(node).not.toHaveAttribute('role');
    expect(node).not.toHaveAttribute('aria-label');
  });

  it('respects prefers-reduced-motion by emitting the motion-reduce:animate-none utility', () => {
    render(<Skeleton data-testid="sk" animation="shimmer" />);
    const node = screen.getByTestId('sk');
    expect(node.className).toContain('motion-reduce:animate-none');
    expect(node.className).toContain('motion-reduce:opacity-70');
  });
});