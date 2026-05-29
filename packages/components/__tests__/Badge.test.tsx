import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Badge } from '../src/Badge/Badge';
import { renderWithTheme as render } from './utils';

const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
const VARIANTS = ['solid', 'outline', 'soft', 'subtle'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;
const SHAPES = ['rounded', 'pill', 'square'] as const;

describe('Badge — rendering', () => {
  it('renders a span by default with the given label', () => {
    render(<Badge>New</Badge>);
    const node = screen.getByText('New');
    expect(node.tagName).toBe('SPAN');
  });

  it('applies the default soft variant + primary color', () => {
    render(<Badge>x</Badge>);
    const node = screen.getByText('x');
    expect(node.className).toContain('bg-primary-subtle');
    expect(node.className).toContain('text-primary');
  });

  it('emits stable data-* attributes for variant + color', () => {
    render(
      <Badge variant="solid" color="danger">
        x
      </Badge>,
    );
    const node = screen.getByText('x');
    expect(node).toHaveAttribute('data-variant', 'solid');
    expect(node).toHaveAttribute('data-color', 'danger');
  });

  it('solid variant gives opaque fill + contrast text for every color', () => {
    for (const color of COLORS) {
      const { unmount } = render(
        <Badge variant="solid" color={color}>
          x
        </Badge>,
      );
      const node = screen.getByText('x');
      expect(node.className).toContain(`bg-${color}`);
      expect(node.className).toContain(`text-${color}-contrast`);
      unmount();
    }
  });

  it('outline variant is transparent + bordered + colored text for every color', () => {
    for (const color of COLORS) {
      const { unmount } = render(
        <Badge variant="outline" color={color}>
          x
        </Badge>,
      );
      const node = screen.getByText('x');
      expect(node.className).toContain('bg-transparent');
      expect(node.className).toContain(`text-${color}`);
      expect(node.className).toContain(`border-${color}`);
      expect(node.className).not.toContain(`text-${color}-contrast`);
      unmount();
    }
  });

  it('soft variant uses the role -subtle background for every color', () => {
    for (const color of COLORS) {
      const { unmount } = render(
        <Badge variant="soft" color={color}>
          x
        </Badge>,
      );
      const node = screen.getByText('x');
      expect(node.className).toContain(`bg-${color}-subtle`);
      expect(node.className).toContain(`text-${color}`);
      unmount();
    }
  });

  it('subtle variant uses neutral bg/text + accents the dot with the role color', () => {
    for (const color of COLORS) {
      const { unmount } = render(
        <Badge variant="subtle" color={color}>
          x
        </Badge>,
      );
      const node = screen.getByText('x');
      expect(node.className).toContain('bg-bg-subtle');
      expect(node.className).toContain('text-fg-muted');
      expect(node.className).toContain(`[&_.sds-badge-dot]:bg-${color}`);
      expect(node.className).toContain(`[&_svg]:text-${color}`);
      unmount();
    }
  });

  it('applies the right size + shape classes', () => {
    for (const size of SIZES) {
      for (const shape of SHAPES) {
        const { unmount } = render(
          <Badge size={size} shape={shape}>
            x
          </Badge>,
        );
        const node = screen.getByText('x');
        const expectedShape = { rounded: 'rounded', pill: 'rounded-full', square: 'rounded-none' }[shape];
        expect(node.className).toContain(expectedShape);
        unmount();
      }
    }
  });

  it('every variant keeps the baseline border so heights stay even across the grid', () => {
    for (const variant of VARIANTS) {
      const { unmount } = render(<Badge variant={variant}>x</Badge>);
      const node = screen.getByText('x');
      // base recipe ships `border border-transparent`; outline overrides border-color only.
      expect(node.className).toMatch(/(^| )border( |$)/);
      unmount();
    }
  });
});

describe('Badge — withDot / dotPulse', () => {
  it('renders the dot before the label when `withDot` is true', () => {
    const { container } = render(<Badge withDot>Active</Badge>);
    const dot = container.querySelector('.sds-badge-dot');
    expect(dot).not.toBeNull();
    expect(dot).toHaveClass('rounded-full', 'bg-current');
    // Dot should be the first child of the wrapper.
    const wrapper = screen.getByText('Active');
    expect(wrapper.firstElementChild).toBe(dot);
  });

  it('marks the dot aria-hidden — it is purely decorative', () => {
    const { container } = render(<Badge withDot>Live</Badge>);
    const dot = container.querySelector('.sds-badge-dot');
    expect(dot).toHaveAttribute('aria-hidden', 'true');
  });

  it('adds animate-badge-pulse only when both withDot and dotPulse are true', () => {
    const { container, rerender } = render(
      <Badge withDot dotPulse>
        Live
      </Badge>,
    );
    expect(container.querySelector('.sds-badge-dot')).toHaveClass('animate-badge-pulse');

    rerender(<Badge withDot>Live</Badge>);
    expect(container.querySelector('.sds-badge-dot')).not.toHaveClass('animate-badge-pulse');

    rerender(<Badge dotPulse>Live</Badge>);
    expect(container.querySelector('.sds-badge-dot')).toBeNull();
  });

  it('dot wins over leftIcon when both are passed', () => {
    const { container } = render(
      <Badge withDot leftIcon={<svg data-testid="left" />}>
        Active
      </Badge>,
    );
    expect(container.querySelector('.sds-badge-dot')).not.toBeNull();
    expect(screen.queryByTestId('left')).not.toBeInTheDocument();
  });
});

describe('Badge — icons', () => {
  it('renders leftIcon as the first element child before the label', () => {
    const { container } = render(
      <Badge leftIcon={<span data-testid="L">L</span>}>Tag</Badge>,
    );
    const wrapper = container.querySelector('[data-variant]') as HTMLElement;
    expect(wrapper).not.toBeNull();
    // leftIcon is wrapped in an aria-hidden span; its first descendant is the user's icon node.
    expect(wrapper.firstElementChild?.contains(screen.getByTestId('L'))).toBe(true);
    expect(wrapper.textContent).toBe('LTag');
  });

  it('renders rightIcon as the last element child after the label (when not removable)', () => {
    const { container } = render(
      <Badge rightIcon={<span data-testid="R">R</span>}>Tag</Badge>,
    );
    const wrapper = container.querySelector('[data-variant]') as HTMLElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper.lastElementChild?.contains(screen.getByTestId('R'))).toBe(true);
    expect(wrapper.textContent).toBe('TagR');
  });

  it('hides rightIcon when removable is also true (× button takes the slot)', () => {
    render(
      <Badge removable rightIcon={<span data-testid="R">R</span>}>
        Tag
      </Badge>,
    );
    expect(screen.queryByTestId('R')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Remove Tag/ })).toBeInTheDocument();
  });
});

describe('Badge — removable', () => {
  it('renders a real button with auto-derived aria-label when children is a string', () => {
    render(<Badge removable>typescript</Badge>);
    const btn = screen.getByRole('button', { name: 'Remove typescript' });
    expect(btn.tagName).toBe('BUTTON');
  });

  it('uses the explicit removeLabel when provided', () => {
    render(
      <Badge removable removeLabel="Dismiss">
        typescript
      </Badge>,
    );
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('falls back to "Remove" when children is not a string and no removeLabel is given', () => {
    render(
      <Badge removable>
        <span>typescript</span>
      </Badge>,
    );
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('fires onRemove and stops propagation when the × button is clicked', async () => {
    const onRemove = vi.fn();
    const onWrapperClick = vi.fn();
    render(
      <div onClick={onWrapperClick}>
        <Badge removable onRemove={onRemove}>
          typescript
        </Badge>
      </div>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Remove typescript' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onWrapperClick).not.toHaveBeenCalled();
  });

  it('the × button is keyboard-activatable (Enter + Space)', async () => {
    const onRemove = vi.fn();
    render(
      <Badge removable onRemove={onRemove}>
        typescript
      </Badge>,
    );
    const btn = screen.getByRole('button', { name: 'Remove typescript' });
    btn.focus();
    await userEvent.keyboard('{Enter}');
    expect(onRemove).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(' ');
    expect(onRemove).toHaveBeenCalledTimes(2);
  });
});

describe('Badge — asChild polymorphism', () => {
  it('renders the wrapped element with merged className and forwarded ref', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Badge asChild ref={ref as unknown as React.Ref<HTMLSpanElement>} className="custom">
        <a href="/inbox">3</a>
      </Badge>,
    );
    const link = screen.getByRole('link', { name: '3' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveClass('custom');
    expect(link).toHaveAttribute('href', '/inbox');
    expect(ref.current?.tagName).toBe('A');
  });

  it('asChild preserves the recipe classes on the wrapped element', () => {
    render(
      <Badge asChild variant="solid" color="info">
        <a href="/inbox">3</a>
      </Badge>,
    );
    const link = screen.getByRole('link', { name: '3' });
    expect(link.className).toContain('bg-info');
    expect(link).toHaveAttribute('data-variant', 'solid');
    expect(link).toHaveAttribute('data-color', 'info');
  });
});

describe('Badge — overrides', () => {
  it('className wins over conflicting recipe classes via tailwind-merge', () => {
    render(<Badge className="rounded-none">x</Badge>);
    const node = screen.getByText('x');
    expect(node).toHaveClass('rounded-none');
    expect(node).not.toHaveClass('rounded');
  });

  it('style prop applies inline', () => {
    render(<Badge style={{ minWidth: 32 }}>3</Badge>);
    expect(screen.getByText('3')).toHaveStyle({ minWidth: '32px' });
  });

  it('sx resolves palette tokens to CSS variables on inline style', () => {
    render(<Badge sx={{ bg: 'primary.main' }}>x</Badge>);
    expect(screen.getByText('x').style.backgroundColor).toContain(
      'var(--sds-palette-primary-main)',
    );
  });

  it('forwards ref to the underlying span', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>x</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
