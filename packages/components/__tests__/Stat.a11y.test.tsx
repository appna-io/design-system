import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Stat, StatGroup } from '../src/Stat';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

describe('Stat — accessibility', () => {
  it('synthesises an aria-label that announces label, value and delta', () => {
    const { container } = render(
      <Stat
        label="Revenue"
        value={12400}
        format="currency"
        currency="USD"
        locale="en-US"
        delta={{ value: 12.3, direction: 'up' }}
      />,
    );
    const root = container.querySelector('[data-stat]')!;
    const ariaLabel = root.getAttribute('aria-label') ?? '';
    expect(ariaLabel).toMatch(/Revenue/);
    expect(ariaLabel).toMatch(/\$12,400/);
    expect(ariaLabel).toMatch(/up 12\.3%/);
  });

  it('consumer aria-label wins over synthesised one', () => {
    const { container } = render(
      <Stat label="Revenue" value={5} aria-label="custom label" />,
    );
    const root = container.querySelector('[data-stat]')!;
    expect(root).toHaveAttribute('aria-label', 'custom label');
  });

  it('loading state announces via role=status + aria-busy', () => {
    const { container } = render(<Stat label="Revenue" loading />);
    const root = container.querySelector('[data-stat]')!;
    expect(root).toHaveAttribute('role', 'status');
    expect(root).toHaveAttribute('aria-busy', 'true');
  });

  it('error state uses role=alert', () => {
    const { container } = render(<Stat label="Revenue" error="Failed" />);
    expect(container.querySelector('[role="alert"]')).toHaveTextContent('Failed');
  });

  it('delta arrow icons are aria-hidden (decoration only)', () => {
    const { container } = render(
      <Stat label="X" value={1} delta={{ value: 5, direction: 'up' }} />,
    );
    // The arrow icon lives in the delta chip; verify aria-hidden coverage
    const chip = container.querySelector('[data-stat-delta]')!;
    const ariaHiddenNodes = chip.querySelectorAll('[aria-hidden="true"]');
    expect(ariaHiddenNodes.length).toBeGreaterThanOrEqual(1);
  });

  it('delta has sr-only sentence form for screen readers', () => {
    const { container } = render(
      <Stat label="X" value={1} delta={{ value: 12.3, direction: 'up' }} />,
    );
    const chip = container.querySelector('[data-stat-delta]')!;
    const srOnly = chip.querySelector('.sr-only');
    expect(srOnly).not.toBeNull();
    expect(srOnly!.textContent).toMatch(/up 12\.3%/);
  });

  it('neutral delta announces "unchanged"', () => {
    const { container } = render(
      <Stat label="X" value={1} delta={{ value: 0, direction: 'neutral' }} />,
    );
    const chip = container.querySelector('[data-stat-delta]')!;
    const srOnly = chip.querySelector('.sr-only');
    expect(srOnly!.textContent).toMatch(/unchanged/);
  });

  it('icon prop is rendered aria-hidden', () => {
    const { container } = render(
      <Stat label="X" value={1} icon={<svg data-testid="icon" />} />,
    );
    const iconWrap = container.querySelector('[data-stat-icon]')!;
    expect(iconWrap).toHaveAttribute('aria-hidden', 'true');
  });

  it('no axe violations — default mode', async () => {
    const { container } = render(
      <Stat
        label="Revenue"
        value={12400}
        format="currency"
        currency="USD"
        locale="en-US"
        delta={{ value: 12.3, direction: 'up' }}
        caption="vs last week"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('no axe violations — loading mode', async () => {
    const { container } = render(<Stat label="Revenue" loading />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('no axe violations — error mode', async () => {
    const { container } = render(<Stat label="Revenue" error="Failed to load" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('no axe violations — compound mode', async () => {
    const { container } = render(
      <Stat>
        <Stat.Label>MRR</Stat.Label>
        <Stat.Value>$84,512</Stat.Value>
        <Stat.Delta value={5.4} direction="up" />
        <Stat.Caption>+$4,341</Stat.Caption>
      </Stat>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('no axe violations — variants', async () => {
    const { container } = render(
      <>
        <Stat variant="default" label="A" value={1} />
        <Stat variant="elevated" label="B" value={2} />
        <Stat variant="minimal" label="C" value={3} />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('no axe violations — StatGroup with dividers', async () => {
    const { container } = render(
      <StatGroup divider gap={6}>
        <Stat label="A" value={1} />
        <Stat label="B" value={2} delta={{ value: 5, direction: 'up' }} />
        <Stat label="C" value={3} format="percent" />
      </StatGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
