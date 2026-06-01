import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Textarea } from '../src/Textarea/Textarea';
import { renderWithTheme as render } from './utils';

describe('Textarea — rendering', () => {
  it('renders a native textarea with the given placeholder and aria-label', () => {
    render(<Textarea placeholder="Bio" aria-label="Bio" />);
    const ta = screen.getByRole('textbox', { name: 'Bio' });
    expect(ta.tagName).toBe('TEXTAREA');
    expect(ta).toHaveAttribute('placeholder', 'Bio');
  });

  it('applies the variant classes to the wrapper', () => {
    const { container, rerender } = render(<Textarea variant="outline" aria-label="x" />);
    expect(wrapperOf(container).className).toContain('bg-bg-paper');

    rerender(<Textarea variant="solid" aria-label="x" />);
    expect(wrapperOf(container).className).toContain('bg-bg-subtle');

    rerender(<Textarea variant="ghost" aria-label="x" />);
    expect(wrapperOf(container).className).toContain('bg-transparent');
    expect(wrapperOf(container).className).toContain('border-transparent');

    rerender(<Textarea variant="underline" aria-label="x" />);
    expect(wrapperOf(container).className).toContain('border-b');
    expect(wrapperOf(container).className).toContain('rounded-none');
  });

  it('applies the per-size font + radius classes to the wrapper', () => {
    const { container, rerender } = render(<Textarea size="sm" aria-label="x" />);
    expect(wrapperOf(container).className).toContain('rounded-sm');

    rerender(<Textarea size="lg" aria-label="x" />);
    expect(wrapperOf(container).className).toContain('rounded-lg');
    expect(wrapperOf(container).className).toContain('text-base');
  });

  it('outline applies a colored focus border + ring for every color (DRY with Input matrix)', () => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
    for (const color of colors) {
      const { container, unmount } = render(
        <Textarea variant="outline" color={color} aria-label={color} />,
      );
      const cls = wrapperOf(container).className;
      expect(cls).toContain(`focus-within:border-${color}`);
      expect(cls).toContain(`focus-within:ring-${color}`);
      unmount();
    }
  });

  it('ghost picks up the subtle bg on hover / focus for every color', () => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
    for (const color of colors) {
      const { container, unmount } = render(
        <Textarea variant="ghost" color={color} aria-label={color} />,
      );
      const cls = wrapperOf(container).className;
      expect(cls).toContain(`hover:bg-${color}-subtle`);
      expect(cls).toContain(`focus-within:bg-${color}-subtle`);
      expect(cls).toContain(`focus-within:ring-${color}`);
      unmount();
    }
  });

  it('underline drops the focus ring and rounded corners regardless of size', () => {
    const { container } = render(<Textarea variant="underline" size="lg" aria-label="x" />);
    const cls = wrapperOf(container).className;
    expect(cls).toContain('focus-within:ring-0');
    expect(cls).toContain('rounded-none');
  });

  it('fullWidth=true adds w-full (the default)', () => {
    const { container } = render(<Textarea aria-label="x" />);
    expect(wrapperOf(container)).toHaveClass('w-full');
  });

  it('fullWidth=false swaps to w-auto', () => {
    const { container } = render(<Textarea fullWidth={false} aria-label="x" />);
    expect(wrapperOf(container)).toHaveClass('w-auto');
    expect(wrapperOf(container)).not.toHaveClass('w-full');
  });
});

describe('Textarea — multi-line knobs', () => {
  it('passes rows through to the native textarea', () => {
    const { container } = render(<Textarea aria-label="x" rows={6} />);
    expect(container.querySelector('textarea')).toHaveAttribute('rows', '6');
  });

  it('passes maxLength through to the native textarea', () => {
    const { container } = render(<Textarea aria-label="x" maxLength={140} />);
    expect(container.querySelector('textarea')).toHaveAttribute('maxlength', '140');
  });

  it('resize prop maps to the correct Tailwind class on the inner textarea', () => {
    const cases = [
      ['none', 'resize-none'],
      ['vertical', 'resize-y'],
      ['horizontal', 'resize-x'],
      ['both', 'resize'],
    ] as const;
    for (const [resize, expected] of cases) {
      const { container, unmount } = render(
        <Textarea aria-label={resize} resize={resize} autoResize={false} />,
      );
      const ta = container.querySelector('textarea')!;
      expect(ta.className).toContain(expected);
      unmount();
    }
  });

  it('autoResize=true adds overflow-hidden to the textarea (so the JS-driven height has no scrollbar fight)', () => {
    const { container } = render(<Textarea aria-label="x" autoResize />);
    expect(container.querySelector('textarea')!.className).toContain('overflow-hidden');
  });

  it('autoResize=false leaves the resize class intact (no overflow-hidden override)', () => {
    const { container } = render(<Textarea aria-label="x" autoResize={false} resize="vertical" />);
    const ta = container.querySelector('textarea')!;
    expect(ta.className).toContain('resize-y');
    expect(ta.className).not.toContain('overflow-hidden');
  });
});

describe('Textarea — counter footer', () => {
  it('renders the counter only when showCount or maxLength is set', () => {
    const { container, rerender } = render(<Textarea aria-label="x" />);
    expect(container.querySelector('[data-at-limit], [aria-hidden="true"]')).toBeNull();

    rerender(<Textarea aria-label="x" showCount />);
    expect(container.querySelector('div[aria-hidden="true"]')).not.toBeNull();

    rerender(<Textarea aria-label="x" maxLength={50} />);
    expect(container.querySelector('div[aria-hidden="true"]')).not.toBeNull();
  });

  it('renders "current" without slash when showCount is set without maxLength', () => {
    render(<Textarea aria-label="x" showCount defaultValue="hello" />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders "current / max" when maxLength is also set', () => {
    render(<Textarea aria-label="x" showCount maxLength={50} defaultValue="hello" />);
    expect(screen.getByText('5 / 50')).toBeInTheDocument();
  });

  it('flips data-at-limit when the value length reaches maxLength', async () => {
    function ControlledLimit() {
      const [v, setV] = useState('1234');
      return (
        <Textarea
          aria-label="x"
          showCount
          maxLength={5}
          value={v}
          onChange={(e) => setV(e.target.value)}
        />
      );
    }
    const { container } = render(<ControlledLimit />);
    const counter = () => container.querySelector('div[aria-hidden="true"]') as HTMLElement | null;
    expect(counter()).not.toHaveAttribute('data-at-limit');

    await userEvent.type(screen.getByRole('textbox', { name: 'x' }), '5');
    expect(counter()).toHaveAttribute('data-at-limit', 'true');
  });

  it('counter is aria-hidden so screen readers don\'t double-announce', () => {
    const { container } = render(<Textarea aria-label="x" showCount />);
    expect(container.querySelector('div[aria-hidden="true"]')).not.toBeNull();
  });
});

describe('Textarea — auto-resize behavior', () => {
  it('sets an inline height on the textarea when autoResize is on (mount-time measure)', () => {
    const { container } = render(<Textarea aria-label="x" autoResize defaultValue="line" />);
    const ta = container.querySelector<HTMLTextAreaElement>('textarea')!;
    // jsdom returns 0 for scrollHeight, but the hook still writes `style.height` based on the
    // line-height × minRows floor. The exact pixel value depends on jsdom's computed style;
    // what we assert is that *some* inline height got written.
    expect(ta.style.height).not.toBe('');
  });

  it('does not write an inline height when autoResize is off', () => {
    const { container } = render(
      <Textarea aria-label="x" autoResize={false} defaultValue="line" />,
    );
    const ta = container.querySelector<HTMLTextAreaElement>('textarea')!;
    expect(ta.style.height).toBe('');
  });
});

describe('Textarea — state semantics', () => {
  it('invalid sets aria-invalid + data-invalid', () => {
    const { container } = render(<Textarea invalid aria-label="bad" />);
    const wrapper = wrapperOf(container);
    const ta = wrapper.querySelector('textarea')!;
    expect(ta).toHaveAttribute('aria-invalid', 'true');
    expect(wrapper).toHaveAttribute('data-invalid', 'true');
  });

  it('disabled sets the native attribute + data-disabled on the wrapper', () => {
    const { container } = render(<Textarea disabled aria-label="x" />);
    const wrapper = wrapperOf(container);
    const ta = wrapper.querySelector('textarea')!;
    expect(ta).toBeDisabled();
    expect(wrapper).toHaveAttribute('data-disabled', 'true');
  });

  it('readOnly stays focusable + does not prevent submission', () => {
    const { container } = render(<Textarea readOnly aria-label="x" defaultValue="hi" />);
    const ta = container.querySelector('textarea')!;
    expect(ta).toHaveAttribute('readonly');
    expect(ta).not.toBeDisabled();
  });

  it('required sets the native attribute + aria-required', () => {
    const { container } = render(<Textarea required aria-label="x" />);
    const ta = container.querySelector('textarea')!;
    expect(ta).toBeRequired();
    expect(ta).toHaveAttribute('aria-required', 'true');
  });
});

describe('Textarea — controlled / uncontrolled', () => {
  it('uncontrolled defaultValue propagates and is editable', async () => {
    render(<Textarea aria-label="x" defaultValue="hello" />);
    const ta = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'x' });
    expect(ta.value).toBe('hello');
    await userEvent.clear(ta);
    await userEvent.type(ta, 'world');
    expect(ta.value).toBe('world');
  });

  it('controlled value + onChange drive the state', async () => {
    const onChange = vi.fn();
    function Controlled() {
      const [v, setV] = useState('');
      return (
        <Textarea
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
    const ta = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'x' });
    await userEvent.type(ta, 'abc');
    expect(ta.value).toBe('abc');
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenLastCalledWith('abc');
  });

  it('controlled value updates the counter length', async () => {
    function Controlled() {
      const [v, setV] = useState('abcdef');
      return (
        <>
          <Textarea aria-label="x" value={v} showCount onChange={(e) => setV(e.target.value)} />
          <button type="button" onClick={() => setV('ab')}>
            shrink
          </button>
        </>
      );
    }
    render(<Controlled />);
    expect(screen.getByText('6')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'shrink' }));
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

describe('Textarea — overrides', () => {
  it('className wins over conflicting wrapper recipe classes via tailwind-merge', () => {
    const { container } = render(<Textarea aria-label="x" className="bg-red-500" />);
    const wrapper = wrapperOf(container);
    expect(wrapper).toHaveClass('bg-red-500');
    expect(wrapper).not.toHaveClass('bg-bg-paper');
  });

  it('style prop applies inline on the wrapper', () => {
    const { container } = render(<Textarea aria-label="x" style={{ minHeight: 240 }} />);
    expect(wrapperOf(container)).toHaveStyle({ minHeight: '240px' });
  });

  it('sx resolves radius tokens to CSS variables on the wrapper', () => {
    const { container } = render(<Textarea aria-label="x" sx={{ radius: 'xl' }} />);
    expect(wrapperOf(container).style.borderRadius).toContain('var(--sds-radius-xl)');
  });
});

describe('Textarea — ref forwarding', () => {
  it('forwards ref to the underlying <textarea>', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea aria-label="x" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});

describe('Textarea — DRY with Input shared layer', () => {
  it('imports the shared controlBase via the wrapper recipe (no copy-paste from Input)', () => {
    // After Phase 7¹, `controlBase` is layout-free — it carries `group/control`, the typography
    // defaults, focus-ring scaffolding, and the `aria-[invalid=true]` / `data-[disabled=true]`
    // attribute selectors. These four assertions catch any future drift that re-implements the
    // shared base by hand and drops one of the truly-shared concerns.
    const { container } = render(<Textarea aria-label="x" />);
    const cls = wrapperOf(container).className;
    expect(cls).toContain('group/control');
    expect(cls).toContain('outline-none');
    expect(cls).toContain('focus-within:ring-2');
    expect(cls).toContain('aria-[invalid=true]:border-danger');
  });

  it('adds its own block layout (Textarea picks `block w-full`, not Input\'s `flex`)', () => {
    const { container } = render(<Textarea aria-label="x" />);
    const cls = wrapperOf(container).className;
    expect(cls).toContain('block');
    expect(cls).toContain('relative');
    // Negative: we explicitly opted out of Input's flex shell so the resize handle stays reachable.
    expect(cls).not.toContain('flex');
    expect(cls).not.toContain('overflow-hidden');
  });

  it('inner <textarea> pins to the wrapper width (regression: textarea-alignment bug)', () => {
    // The wrapper is intentionally `block`, not `flex`, so `grow` / `self-stretch` on the inner
    // element are silently no-ops and the textarea collapses to its native `cols=20` width —
    // producing a “double frame” visual (the textarea sits narrow inside its wrapper). The fix
    // is `w-full` on the inner element. Guard against future regressions in either direction.
    const { container } = render(<Textarea aria-label="x" />);
    const ta = container.querySelector('textarea');
    expect(ta).not.toBeNull();
    const cls = ta!.className;
    expect(cls).toContain('w-full');
    expect(cls).toContain('min-w-0');
    expect(cls).not.toContain('grow');
    expect(cls).not.toContain('self-stretch');
  });

  it('inner <textarea> suppresses the UA focus ring at every level (regression: active-frame-mismatch Symptom B)', () => {
    // Underline variant relies on the wrapper's bottom rule for its focus affordance and
    // expects ZERO ring on the inner `<textarea>`. In Tailwind 3 the bare `outline-none`
    // utility (`outline: 2px solid transparent`) doesn't always beat the UA `:focus-visible`
    // rule, so we explicitly hide at `:focus` and `:focus-visible` too. Asserting on the class
    // string is enough — the regression would be someone dropping these explicit utilities
    // back to plain `outline-none` and silently re-enabling the browser ring.
    const { container } = render(<Textarea variant="underline" aria-label="x" />);
    const cls = container.querySelector('textarea')!.className;
    expect(cls).toContain('outline-none');
    expect(cls).toContain('focus:outline-none');
    expect(cls).toContain('focus-visible:outline-none');
  });
});

function wrapperOf(container: HTMLElement): HTMLElement {
  const wrapper = container.querySelector('textarea')?.parentElement;
  if (!wrapper) throw new Error('Could not find Textarea wrapper');
  return wrapper as HTMLElement;
}