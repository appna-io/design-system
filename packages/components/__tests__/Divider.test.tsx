import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Divider } from '../src/Divider';
import { renderWithTheme as render } from './utils';

/**
 * `<Divider />` is a pure primitive with no state, so tests focus on the prop matrix and the
 * `<hr>` / `<div role="separator">` element-switch. The thickness × orientation compound rule
 * gets explicit coverage because it's the only spot where two axes have to agree.
 */

describe('Divider — element switch', () => {
  it('renders an <hr> by default', () => {
    const { container } = render(<Divider />);
    const el = container.querySelector('hr');
    expect(el).not.toBeNull();
  });

  it('renders a <div role="separator"> when given children', () => {
    render(<Divider>OR</Divider>);
    const el = screen.getByRole('separator');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveTextContent('OR');
  });

  it('honors the `as` prop', () => {
    const { container } = render(<Divider as="li" role="separator" />);
    const el = container.querySelector('li');
    expect(el).not.toBeNull();
    expect(el).toHaveAttribute('role', 'separator');
  });
});

describe('Divider — orientation', () => {
  it('defaults to horizontal — no aria-orientation emitted (spec default)', () => {
    const { container } = render(<Divider />);
    const el = container.querySelector('hr')!;
    expect(el).not.toHaveAttribute('aria-orientation');
    expect(el).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('vertical orientation emits aria-orientation="vertical"', () => {
    const { container } = render(<Divider orientation="vertical" />);
    const el = container.querySelector('hr')!;
    expect(el).toHaveAttribute('aria-orientation', 'vertical');
    expect(el).toHaveAttribute('data-orientation', 'vertical');
  });
});

describe('Divider — thickness × orientation compound', () => {
  it('horizontal × 1 → border-t', () => {
    const { container } = render(<Divider thickness={1} />);
    expect(container.querySelector('hr')!.className).toContain('border-t');
  });

  it('horizontal × 2 → border-t-2', () => {
    const { container } = render(<Divider thickness={2} />);
    expect(container.querySelector('hr')!.className).toContain('border-t-2');
  });

  it('horizontal × 4 → border-t-4', () => {
    const { container } = render(<Divider thickness={4} />);
    expect(container.querySelector('hr')!.className).toContain('border-t-4');
  });

  it('vertical × 1 → border-s', () => {
    const { container } = render(<Divider orientation="vertical" thickness={1} />);
    const cls = container.querySelector('hr')!.className;
    expect(cls).toContain('border-s');
    expect(cls).not.toContain('border-t');
  });

  it('vertical × 2 → border-s-2', () => {
    const { container } = render(<Divider orientation="vertical" thickness={2} />);
    expect(container.querySelector('hr')!.className).toContain('border-s-2');
  });

  it('vertical × 4 → border-s-4', () => {
    const { container } = render(<Divider orientation="vertical" thickness={4} />);
    expect(container.querySelector('hr')!.className).toContain('border-s-4');
  });
});

describe('Divider — variant', () => {
  it.each(['solid', 'dashed', 'dotted'] as const)('applies `border-%s`', (variant) => {
    const { container } = render(<Divider variant={variant} />);
    expect(container.querySelector('hr')!.className).toContain(`border-${variant}`);
  });
});

describe('Divider — color', () => {
  it.each(['subtle', 'default', 'strong'] as const)('applies `border-border-%s`', (color) => {
    const { container } = render(<Divider color={color} />);
    expect(container.querySelector('hr')!.className).toContain(`border-border-${color}`);
  });
});

describe('Divider — decorative', () => {
  it('switches role to presentation and adds aria-hidden', () => {
    const { container } = render(<Divider decorative />);
    const el = container.querySelector('hr')!;
    expect(el).toHaveAttribute('role', 'presentation');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('decorative + labeled also sets role=presentation', () => {
    render(<Divider decorative>OR</Divider>);
    const el = screen.getByText('OR').closest('div')!;
    expect(el).toHaveAttribute('role', 'presentation');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Divider — labeled variant', () => {
  it('renders two flanking spans with aria-hidden', () => {
    const { container } = render(<Divider>OR</Divider>);
    const lines = container.querySelectorAll('[data-divider-line]');
    expect(lines).toHaveLength(2);
    lines.forEach((line) => {
      expect(line).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('labelPosition=start collapses the leading line', () => {
    const { container } = render(<Divider labelPosition="start">Section</Divider>);
    const leading = container.querySelector('[data-divider-line="leading"]')!;
    const trailing = container.querySelector('[data-divider-line="trailing"]')!;
    expect(leading.className).toContain('hidden');
    expect(trailing.className).toContain('flex-1');
  });

  it('labelPosition=end collapses the trailing line', () => {
    const { container } = render(<Divider labelPosition="end">Section</Divider>);
    const leading = container.querySelector('[data-divider-line="leading"]')!;
    const trailing = container.querySelector('[data-divider-line="trailing"]')!;
    expect(leading.className).toContain('flex-1');
    expect(trailing.className).toContain('hidden');
  });

  it('labelPosition=center keeps both lines flex-1', () => {
    const { container } = render(<Divider labelPosition="center">Section</Divider>);
    const leading = container.querySelector('[data-divider-line="leading"]')!;
    const trailing = container.querySelector('[data-divider-line="trailing"]')!;
    expect(leading.className).toContain('flex-1');
    expect(trailing.className).toContain('flex-1');
  });

  it('passes color through to the flank lines', () => {
    const { container } = render(<Divider color="strong">Strong</Divider>);
    const leading = container.querySelector('[data-divider-line="leading"]')!;
    expect(leading.className).toContain('border-border-strong');
  });
});

describe('Divider — className / sx passthrough', () => {
  it('merges className for the unlabeled form', () => {
    const { container } = render(<Divider className="my-8" />);
    expect(container.querySelector('hr')!.className).toContain('my-8');
  });

  it('merges className for the labeled form', () => {
    render(<Divider className="my-8">Section</Divider>);
    const el = screen.getByRole('separator');
    expect(el.className).toContain('my-8');
  });
});
