import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Stat, StatGroup } from '../src/Stat';
import { renderWithTheme as render } from './utils';

describe('Stat — prop-driven API', () => {
  it('renders label + value', () => {
    render(<Stat label="Revenue" value="$12,400" />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$12,400')).toBeInTheDocument();
  });

  it('formats numeric value with Intl.NumberFormat (default)', () => {
    render(<Stat label="Users" value={1240} locale="en-US" />);
    expect(screen.getByText('1,240')).toBeInTheDocument();
  });

  it('formats currency with locale', () => {
    render(
      <Stat label="MRR" value={12400} format="currency" currency="USD" locale="en-US" />,
    );
    expect(screen.getByText(/\$12,400\.00/)).toBeInTheDocument();
  });

  it('formats percent with fractionDigits', () => {
    render(
      <Stat
        label="Conversion"
        value={0.214}
        format="percent"
        fractionDigits={1}
        locale="en-US"
      />,
    );
    expect(screen.getByText('21.4%')).toBeInTheDocument();
  });

  it('formats compact', () => {
    render(<Stat label="Signups" value={12400} format="compact" locale="en-US" />);
    expect(screen.getByText(/12\.4K/i)).toBeInTheDocument();
  });

  it('passes through string value untouched', () => {
    render(<Stat label="Status" value="On track" />);
    expect(screen.getByText('On track')).toBeInTheDocument();
  });

  it('renders delta with positive tone for up direction', () => {
    const { container } = render(
      <Stat label="Users" value={1240} delta={{ value: 12.3, direction: 'up' }} />,
    );
    const chip = container.querySelector('[data-stat-delta]')!;
    expect(chip).toHaveAttribute('data-tone', 'positive');
    expect(chip).toHaveAttribute('data-direction', 'up');
  });

  it('renders delta with negative tone for down direction', () => {
    const { container } = render(
      <Stat label="Users" value={1240} delta={{ value: 5, direction: 'down' }} />,
    );
    const chip = container.querySelector('[data-stat-delta]')!;
    expect(chip).toHaveAttribute('data-tone', 'negative');
  });

  it('inverse flips the tone — down becomes positive (churn going down is good)', () => {
    const { container } = render(
      <Stat
        label="Churn"
        value={0.04}
        format="percent"
        delta={{ value: 1.1, direction: 'down', inverse: true }}
      />,
    );
    const chip = container.querySelector('[data-stat-delta]')!;
    expect(chip).toHaveAttribute('data-tone', 'positive');
  });

  it('neutral direction produces neutral tone', () => {
    const { container } = render(
      <Stat label="Open" value={42} delta={{ value: 0, direction: 'neutral' }} />,
    );
    const chip = container.querySelector('[data-stat-delta]')!;
    expect(chip).toHaveAttribute('data-tone', 'neutral');
  });

  it('uses Unicode minus sign for down direction', () => {
    const { container } = render(
      <Stat label="Users" value={1240} delta={{ value: 5, direction: 'down' }} />,
    );
    // The visible chip text includes the sign + magnitude + suffix
    const chip = container.querySelector('[data-stat-delta]')!;
    expect(chip.textContent).toMatch(/\u22125%/);
  });

  it('plus sign for up direction', () => {
    const { container } = render(
      <Stat label="Users" value={1240} delta={{ value: 5, direction: 'up' }} />,
    );
    const chip = container.querySelector('[data-stat-delta]')!;
    expect(chip.textContent).toMatch(/\+5%/);
  });

  it('respects delta.label override for visible string', () => {
    const { container } = render(
      <Stat
        label="Users"
        value={1240}
        delta={{ value: 5, direction: 'up', label: 'gained 5 users' }}
      />,
    );
    const chip = container.querySelector('[data-stat-delta]')!;
    expect(chip.textContent).toContain('gained 5 users');
  });

  it('renders caption when provided', () => {
    render(<Stat label="X" value={1} caption="vs yesterday" />);
    expect(screen.getByText('vs yesterday')).toBeInTheDocument();
  });

  it('renders children as extra content (e.g. sparkline slot)', () => {
    render(
      <Stat label="X" value={1}>
        <div data-testid="sparkline">spark</div>
      </Stat>,
    );
    expect(screen.getByTestId('sparkline')).toBeInTheDocument();
  });

  it('loading state hides value and exposes aria-busy', () => {
    const { container } = render(<Stat label="X" loading />);
    const root = container.querySelector('[data-stat]')!;
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(root).toHaveAttribute('role', 'status');
  });

  it('loading suppresses the delta chip', () => {
    const { container } = render(
      <Stat label="X" value={5} loading delta={{ value: 1, direction: 'up' }} />,
    );
    expect(container.querySelector('[data-stat-delta]')).toBeNull();
  });

  it('error state renders role=alert', () => {
    const { container } = render(<Stat label="X" error="Failed to load" />);
    const alert = container.querySelector('[role="alert"]')!;
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Failed to load');
  });

  it('error suppresses the delta chip', () => {
    const { container } = render(
      <Stat label="X" error="boom" delta={{ value: 1, direction: 'up' }} />,
    );
    expect(container.querySelector('[data-stat-delta]')).toBeNull();
  });

  it('variant applies data attribute', () => {
    const { container } = render(<Stat label="X" value={1} variant="elevated" />);
    const root = container.querySelector('[data-stat]')!;
    expect(root).toHaveAttribute('data-variant', 'elevated');
  });

  it('size + align apply data attributes', () => {
    const { container } = render(<Stat label="X" value={1} size="lg" align="end" />);
    const root = container.querySelector('[data-stat]')!;
    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root).toHaveAttribute('data-align', 'end');
  });

  it('colorize=auto tints the value with delta tone (positive)', () => {
    const { container } = render(
      <Stat label="X" value={5} delta={{ value: 1, direction: 'up' }} colorize="auto" />,
    );
    const valueEl = container.querySelector('[data-stat-value]')!;
    expect(valueEl).toHaveAttribute('data-tone', 'positive');
  });

  it('colorize=never keeps value tone neutral even with delta', () => {
    const { container } = render(
      <Stat label="X" value={5} delta={{ value: 1, direction: 'up' }} colorize="never" />,
    );
    const valueEl = container.querySelector('[data-stat-value]')!;
    expect(valueEl).toHaveAttribute('data-tone', 'neutral');
  });

  it('synthesises aria-label from label + value + delta', () => {
    const { container } = render(
      <Stat label="Revenue" value={1240} delta={{ value: 5, direction: 'up' }} locale="en-US" />,
    );
    const root = container.querySelector('[data-stat]')!;
    const ariaLabel = root.getAttribute('aria-label') ?? '';
    expect(ariaLabel).toContain('Revenue');
    expect(ariaLabel).toContain('1,240');
    expect(ariaLabel).toContain('up 5%');
  });
});

describe('Stat — compound API', () => {
  it('switches to compound mode when Stat.Value is a child', () => {
    const { container } = render(
      <Stat label="ignored-shortcut">
        <Stat.Label>Compound label</Stat.Label>
        <Stat.Value>Compound value</Stat.Value>
      </Stat>,
    );
    expect(screen.getByText('Compound label')).toBeInTheDocument();
    expect(screen.getByText('Compound value')).toBeInTheDocument();
    // The shortcut label should NOT render
    expect(screen.queryByText('ignored-shortcut')).toBeNull();
    // Compound mode skips aria-label synthesis
    const root = container.querySelector('[data-stat]')!;
    expect(root).not.toHaveAttribute('aria-label');
  });

  it('compound Stat.Delta tints by direction', () => {
    const { container } = render(
      <Stat>
        <Stat.Label>X</Stat.Label>
        <Stat.Value>1</Stat.Value>
        <Stat.Delta value={5} direction="down" />
      </Stat>,
    );
    const chip = container.querySelector('[data-stat-delta]')!;
    expect(chip).toHaveAttribute('data-tone', 'negative');
  });
});

describe('Stat — polymorphism', () => {
  it('as prop swaps the root element', () => {
    const { container } = render(<Stat as="article" label="X" value={1} />);
    expect(container.querySelector('article[data-stat]')).toBeInTheDocument();
  });

  it('forwards arbitrary data attributes', () => {
    const { container } = render(
      <Stat label="X" value={1} data-testid="my-stat" />,
    );
    expect(container.querySelector('[data-testid="my-stat"]')).toBeInTheDocument();
  });
});

describe('StatGroup', () => {
  it('renders children', () => {
    render(
      <StatGroup>
        <Stat label="A" value={1} />
        <Stat label="B" value={2} />
      </StatGroup>,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('auto-inserts a vertical divider between row stats when divider=true', () => {
    const { container } = render(
      <StatGroup direction="row" divider>
        <Stat label="A" value={1} />
        <Stat label="B" value={2} />
        <Stat label="C" value={3} />
      </StatGroup>,
    );
    const dividers = container.querySelectorAll('[data-stat-group-divider]');
    expect(dividers).toHaveLength(2);
    expect(dividers[0]).toHaveAttribute('data-orientation', 'vertical');
  });

  it('auto-inserts horizontal dividers for column direction', () => {
    const { container } = render(
      <StatGroup direction="column" divider>
        <Stat label="A" value={1} />
        <Stat label="B" value={2} />
      </StatGroup>,
    );
    const dividers = container.querySelectorAll('[data-stat-group-divider]');
    expect(dividers).toHaveLength(1);
    expect(dividers[0]).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('respects custom divider node', () => {
    const { container } = render(
      <StatGroup divider={<div data-testid="custom-divider" />}>
        <Stat label="A" value={1} />
        <Stat label="B" value={2} />
      </StatGroup>,
    );
    expect(container.querySelectorAll('[data-testid="custom-divider"]')).toHaveLength(1);
  });

  it('no divider when divider=false', () => {
    const { container } = render(
      <StatGroup divider={false}>
        <Stat label="A" value={1} />
        <Stat label="B" value={2} />
      </StatGroup>,
    );
    expect(container.querySelector('[data-stat-group-divider]')).toBeNull();
  });
});