import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Input } from '../src/Input/Input';
import { renderWithTheme as render } from './utils';

describe('Input — rendering', () => {
  it('renders a native input with the given placeholder and aria-label', () => {
    render(<Input placeholder="Email" aria-label="Email address" />);
    const input = screen.getByRole('textbox', { name: 'Email address' });
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('placeholder', 'Email');
  });

  it('applies the size variant classes to the wrapper', () => {
    const { container, rerender } = render(<Input size="sm" aria-label="x" />);
    expect(wrapperOf(container)).toHaveClass('h-8');
    rerender(<Input size="lg" aria-label="x" />);
    expect(wrapperOf(container)).toHaveClass('h-12');
  });

  it('applies the variant classes to the wrapper', () => {
    const { container, rerender } = render(<Input variant="outline" aria-label="x" />);
    expect(wrapperOf(container).className).toContain('bg-bg-paper');

    rerender(<Input variant="solid" aria-label="x" />);
    expect(wrapperOf(container).className).toContain('bg-bg-subtle');

    rerender(<Input variant="ghost" aria-label="x" />);
    expect(wrapperOf(container).className).toContain('bg-transparent');
    expect(wrapperOf(container).className).toContain('border-transparent');

    rerender(<Input variant="underline" aria-label="x" />);
    expect(wrapperOf(container).className).toContain('border-b');
    expect(wrapperOf(container).className).toContain('rounded-none');
  });

  it('outline applies a colored focus border + ring for every color', () => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
    for (const color of colors) {
      const { container, unmount } = render(
        <Input variant="outline" color={color} aria-label={color} />,
      );
      const cls = wrapperOf(container).className;
      expect(cls).toContain(`focus-within:border-${color}`);
      expect(cls).toContain(`focus-within:ring-${color}`);
      unmount();
    }
  });

  it('ghost picks up the role subtle bg on hover / focus for every color', () => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
    for (const color of colors) {
      const { container, unmount } = render(
        <Input variant="ghost" color={color} aria-label={color} />,
      );
      const cls = wrapperOf(container).className;
      expect(cls).toContain(`hover:bg-${color}-subtle`);
      expect(cls).toContain(`focus-within:bg-${color}-subtle`);
      expect(cls).toContain(`focus-within:ring-${color}`);
      unmount();
    }
  });

  it('underline drops the focus ring and rounded corners regardless of size', () => {
    const { container } = render(<Input variant="underline" size="lg" aria-label="x" />);
    const cls = wrapperOf(container).className;
    expect(cls).toContain('focus-within:ring-0');
    expect(cls).toContain('rounded-none');
  });

  it('fullWidth=true adds w-full (the default)', () => {
    const { container } = render(<Input aria-label="x" />);
    expect(wrapperOf(container)).toHaveClass('w-full');
  });

  it('fullWidth=false swaps to w-auto', () => {
    const { container } = render(<Input fullWidth={false} aria-label="x" />);
    expect(wrapperOf(container)).toHaveClass('w-auto');
    expect(wrapperOf(container)).not.toHaveClass('w-full');
  });

  it('inner <input> suppresses the UA focus ring at every level (regression: active-frame-mismatch Symptom B mirror)', () => {
    // Underline expects ZERO ring on the inner element — the wrapper's bottom rule is the focus
    // affordance. In Tailwind 3 plain `outline-none` is `outline: 2px solid transparent` and
    // can lose to the UA `:focus-visible { outline: auto … }` rule, leaking a rectangular
    // browser ring. We explicitly hide at `:focus` and `:focus-visible` too. Mirror of the
    // Textarea regression test — same surface, same defect class. See
    // `plans/bugs/textarea-active-frame-mismatch.md` (fix-order item 3).
    const { container } = render(<Input variant="underline" aria-label="x" />);
    const cls = container.querySelector('input')!.className;
    expect(cls).toContain('outline-none');
    expect(cls).toContain('focus:outline-none');
    expect(cls).toContain('focus-visible:outline-none');
  });
});

describe('Input — slots (icons + addons)', () => {
  it('renders leftIcon inside the wrapper, before the input', () => {
    const { container } = render(
      <Input
        aria-label="search"
        leftIcon={<span data-testid="L">L</span>}
        placeholder="Search…"
      />,
    );
    const wrapper = wrapperOf(container);
    const children = Array.from(wrapper.children);
    const inputIndex = children.findIndex((c) => c.tagName === 'INPUT');
    const iconIndex = children.findIndex((c) => c.contains(screen.getByTestId('L')));
    expect(iconIndex).toBeGreaterThanOrEqual(0);
    expect(iconIndex).toBeLessThan(inputIndex);
  });

  it('renders rightIcon inside the wrapper, after the input', () => {
    const { container } = render(
      <Input
        aria-label="search"
        rightIcon={<span data-testid="R">R</span>}
        placeholder="Search…"
      />,
    );
    const wrapper = wrapperOf(container);
    const children = Array.from(wrapper.children);
    const inputIndex = children.findIndex((c) => c.tagName === 'INPUT');
    const iconIndex = children.findIndex((c) => c.contains(screen.getByTestId('R')));
    expect(iconIndex).toBeGreaterThan(inputIndex);
  });

  it('leftAddon / rightAddon render as wrapper siblings of the input', () => {
    const { container } = render(
      <Input aria-label="url" leftAddon="https://" rightAddon=".com" placeholder="site" />,
    );
    const wrapper = wrapperOf(container);
    const texts = Array.from(wrapper.children).map((c) => c.textContent);
    expect(texts[0]).toBe('https://');
    expect(texts[texts.length - 1]).toBe('.com');
    expect(wrapper.querySelector('input')).not.toBeNull();
  });

  it('addon spans use the shared border + subtle bg', () => {
    const { container } = render(
      <Input aria-label="x" leftAddon="@" />,
    );
    const wrapper = wrapperOf(container);
    const addon = wrapper.firstElementChild as HTMLElement;
    expect(addon.className).toContain('bg-bg-subtle');
    expect(addon.className).toContain('border-e');
  });
});

describe('Input — state semantics', () => {
  it('invalid sets aria-invalid + data-invalid', () => {
    const { container } = render(<Input invalid aria-label="bad" />);
    const wrapper = wrapperOf(container);
    const input = wrapper.querySelector('input')!;
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(wrapper).toHaveAttribute('data-invalid', 'true');
  });

  it('disabled sets the native attribute + data-disabled on the wrapper', () => {
    const { container } = render(<Input disabled aria-label="x" />);
    const wrapper = wrapperOf(container);
    const input = wrapper.querySelector('input')!;
    expect(input).toBeDisabled();
    expect(wrapper).toHaveAttribute('data-disabled', 'true');
  });

  it('readOnly stays focusable + does not prevent submission', () => {
    const { container } = render(<Input readOnly aria-label="x" defaultValue="hi" />);
    const input = container.querySelector('input')!;
    expect(input).toHaveAttribute('readonly');
    expect(input).not.toBeDisabled();
  });

  it('loading sets aria-busy, readOnly (not disabled), and renders a spinner', () => {
    const { container } = render(<Input loading aria-label="x" />);
    const wrapper = wrapperOf(container);
    const input = container.querySelector('input')!;
    expect(input).toHaveAttribute('aria-busy', 'true');
    expect(input).toHaveAttribute('readonly');
    expect(input).not.toBeDisabled();
    expect(wrapper).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector('[role="status"]')).not.toBeNull();
  });

  it('loading swaps the rightIcon for the spinner', () => {
    const { container, rerender } = render(
      <Input aria-label="x" rightIcon={<span data-testid="R">R</span>} />,
    );
    expect(screen.getByTestId('R')).toBeInTheDocument();
    rerender(<Input aria-label="x" loading rightIcon={<span data-testid="R">R</span>} />);
    expect(screen.queryByTestId('R')).not.toBeInTheDocument();
    expect(container.querySelector('[role="status"]')).not.toBeNull();
  });

  it('required sets the native attribute', () => {
    const { container } = render(<Input required aria-label="x" />);
    expect(container.querySelector('input')).toBeRequired();
  });
});

describe('Input — controlled / uncontrolled', () => {
  it('uncontrolled defaultValue propagates and is editable', async () => {
    render(<Input aria-label="x" defaultValue="hello" />);
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'x' });
    expect(input.value).toBe('hello');
    await userEvent.clear(input);
    await userEvent.type(input, 'world');
    expect(input.value).toBe('world');
  });

  it('controlled value + onChange drive the state', async () => {
    const onChange = vi.fn();
    function Controlled() {
      const [v, setV] = useState('');
      return (
        <Input
          aria-label="x"
          value={v}
          onChange={(e) => {
            setV(e.target.value);
            onChange(e.target.value);
          }}
        />
      );
    }
    render(<Controlled />);
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'x' });
    await userEvent.type(input, 'abc');
    expect(input.value).toBe('abc');
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenLastCalledWith('abc');
  });
});

describe('Input — overrides', () => {
  it('className wins over conflicting wrapper recipe classes via tailwind-merge', () => {
    const { container } = render(<Input aria-label="x" className="h-20" />);
    const wrapper = wrapperOf(container);
    expect(wrapper).toHaveClass('h-20');
    expect(wrapper).not.toHaveClass('h-10');
  });

  it('style prop applies inline on the wrapper', () => {
    const { container } = render(<Input aria-label="x" style={{ minWidth: 320 }} />);
    expect(wrapperOf(container)).toHaveStyle({ minWidth: '320px' });
  });

  it('sx resolves radius tokens to CSS variables on the wrapper', () => {
    const { container } = render(<Input aria-label="x" sx={{ radius: 'xl' }} />);
    expect(wrapperOf(container).style.borderRadius).toContain('var(--sds-radius-xl)');
  });

  it('htmlSize maps to the native size attribute', () => {
    const { container } = render(<Input aria-label="x" htmlSize={4} />);
    expect(container.querySelector('input')).toHaveAttribute('size', '4');
  });
});

describe('Input — ref forwarding', () => {
  it('forwards ref to the underlying <input>', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input aria-label="x" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

function wrapperOf(container: HTMLElement): HTMLElement {
  const wrapper = container.querySelector('input')?.parentElement;
  if (!wrapper) throw new Error('Could not find Input wrapper');
  return wrapper as HTMLElement;
}