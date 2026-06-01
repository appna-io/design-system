import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../src/Button/Button';
import { renderWithTheme as render } from './utils';

describe('Button — rendering', () => {
  it('renders a native button with the given label', () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole('button', { name: 'Click me' });
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('applies the size variant classes', () => {
    const { rerender } = render(<Button size="sm">x</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-8');
    rerender(<Button size="lg">x</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-12');
  });

  it('applies the color variant classes via compound variants', () => {
    render(<Button color="danger">x</Button>);
    expect(screen.getByRole('button').className).toMatch(/bg-danger/);
  });

  it('solid variant gives an opaque fill + contrast text for every color', () => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
    for (const color of colors) {
      const { unmount } = render(
        <Button variant="solid" color={color}>
          x
        </Button>,
      );
      const btn = screen.getByRole('button');
      expect(btn.className).toContain(`bg-${color}`);
      expect(btn.className).toContain(`text-${color}-contrast`);
      expect(btn.className).toContain(`hover:bg-${color}-hover`);
      unmount();
    }
  });

  it('outline variant is transparent + bordered + colored text for every color', () => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
    for (const color of colors) {
      const { unmount } = render(
        <Button variant="outline" color={color}>
          x
        </Button>,
      );
      const btn = screen.getByRole('button');
      expect(btn.className).toContain('bg-transparent');
      expect(btn.className).toContain(`text-${color}`);
      expect(btn.className).toContain(`border-${color}-border`);
      expect(btn.className).toContain(`hover:bg-${color}-subtle`);
      // outline must NOT inherit solid's contrast text class
      expect(btn.className).not.toContain(`text-${color}-contrast`);
      unmount();
    }
  });

  it('ghost variant has no border + transparent fill + colored text for every color', () => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
    for (const color of colors) {
      const { unmount } = render(
        <Button variant="ghost" color={color}>
          x
        </Button>,
      );
      const btn = screen.getByRole('button');
      expect(btn.className).toContain('bg-transparent');
      expect(btn.className).toContain(`text-${color}`);
      expect(btn.className).toContain(`hover:bg-${color}-subtle`);
      // ghost is borderless beyond the base transparent border — it must NOT pick up any
      // role-specific border color
      expect(btn.className).not.toContain(`border-${color}-border`);
      unmount();
    }
  });

  it('all variants share the same baseline layout border so heights match across the grid', () => {
    // The base recipe ships `border border-transparent` so outline (which overrides border-color)
    // doesn't push the box-sizing math. Every variant must keep that baseline.
    const variants = ['solid', 'outline', 'ghost'] as const;
    for (const variant of variants) {
      const { unmount } = render(<Button variant={variant}>x</Button>);
      const btn = screen.getByRole('button');
      expect(btn.className).toMatch(/(^| )border( |$)/);
      unmount();
    }
  });

  it('focus-visible ring color matches the active color for every variant × color cell', () => {
    const variants = ['solid', 'outline', 'ghost'] as const;
    const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
    for (const variant of variants) {
      for (const color of colors) {
        const { unmount } = render(
          <Button variant={variant} color={color}>
            x
          </Button>,
        );
        expect(screen.getByRole('button').className).toContain(`focus-visible:ring-${color}`);
        unmount();
      }
    }
  });

  it('adds `w-full` when fullWidth is true', () => {
    render(<Button fullWidth>x</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('infers iconOnly when no children but an icon is present and adds the square class', () => {
    render(<Button aria-label="search" leftIcon={<svg data-testid="ic" />} />);
    const btn = screen.getByRole('button', { name: 'search' });
    expect(btn).toHaveClass('aspect-square');
    expect(screen.getByTestId('ic')).toBeInTheDocument();
  });

  it('renders leftIcon before the label and rightIcon after', () => {
    render(
      <Button leftIcon={<span data-testid="L">L</span>} rightIcon={<span data-testid="R">R</span>}>
        Mid
      </Button>,
    );
    const btn = screen.getByRole('button');
    const order = Array.from(btn.querySelectorAll('[data-testid]')).map((n) =>
      n.getAttribute('data-testid'),
    );
    expect(order).toEqual(['L', 'R']);
    expect(btn.textContent).toContain('Mid');
  });
});

describe('Button — disabled / loading semantics', () => {
  it('disabled sets aria-disabled, the native attribute, and blocks onClick', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        x
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('loading sets aria-busy, hides leftIcon, swaps label with loadingText, and blocks onClick', async () => {
    const onClick = vi.fn();
    render(
      <Button
        loading
        loadingText="Saving…"
        leftIcon={<span data-testid="L">L</span>}
        onClick={onClick}
      >
        Save
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByTestId('L')).not.toBeInTheDocument();
    expect(btn).toHaveTextContent('Saving…');
    expect(btn).not.toHaveTextContent(/^Save$/);
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('loading without loadingText keeps the children visible', () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Save');
  });
});

describe('Button — interaction', () => {
  it('fires onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref to the underlying button', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>x</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});

describe('Button — overrides', () => {
  it('className wins over conflicting recipe classes via tailwind-merge', () => {
    render(<Button className="h-20">x</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('h-20');
    expect(btn).not.toHaveClass('h-10');
  });

  it('style prop applies inline', () => {
    render(<Button style={{ minWidth: 200 }}>x</Button>);
    expect(screen.getByRole('button')).toHaveStyle({ minWidth: '200px' });
  });

  it('sx resolves palette tokens to CSS variables on inline style', () => {
    render(<Button sx={{ bg: 'primary.main' }}>x</Button>);
    expect(screen.getByRole('button').style.backgroundColor).toContain(
      'var(--sds-palette-primary-main)',
    );
  });
});

describe('Button — asChild polymorphism', () => {
  it('renders the child element with merged className and forwarded ref', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Button asChild ref={ref as unknown as React.Ref<HTMLButtonElement>} className="custom">
        <a href="/docs">Docs</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveClass('custom');
    expect(link).toHaveAttribute('href', '/docs');
    expect(ref.current?.tagName).toBe('A');
  });

  it('asChild + disabled does NOT add the native disabled attr but does add aria-disabled', () => {
    render(
      <Button asChild disabled>
        <a href="/docs">Docs</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).not.toHaveAttribute('disabled');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('data-disabled', 'true');
  });
});