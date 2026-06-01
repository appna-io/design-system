import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from '../src/Checkbox/Checkbox';
import { renderWithTheme as render } from './utils';

const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
const VARIANTS = ['solid', 'outline', 'soft'] as const;
const SHAPES = ['square', 'rounded', 'circle'] as const;

function getInput(): HTMLInputElement {
  return screen.getByRole('checkbox') as HTMLInputElement;
}

function getControl(container: HTMLElement): HTMLElement {
  // The custom-painted indicator is the `aria-hidden` span sibling of the input.
  const node = container.querySelector('span[aria-hidden="true"][data-state]') as HTMLElement;
  return node;
}

describe('Checkbox — rendering', () => {
  it('renders a real <input type="checkbox"> inside a <label>', () => {
    render(<Checkbox>Accept</Checkbox>);
    const input = getInput();
    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('checkbox');
    expect(input.closest('label')).not.toBeNull();
  });

  it('hides the native input visually but keeps it in the a11y tree', () => {
    render(<Checkbox>Accept</Checkbox>);
    const input = getInput();
    expect(input.className).toContain('sr-only');
  });

  it('starts unchecked by default and renders no glyph', () => {
    const { container } = render(<Checkbox>Accept</Checkbox>);
    expect(getInput().checked).toBe(false);
    const control = getControl(container);
    expect(control).toHaveAttribute('data-state', 'unchecked');
    expect(control.querySelector('svg')).toBeNull();
  });

  it('defaultChecked initializes the uncontrolled input as checked', () => {
    const { container } = render(<Checkbox defaultChecked>Accept</Checkbox>);
    expect(getInput().checked).toBe(true);
    expect(getControl(container)).toHaveAttribute('data-state', 'checked');
    expect(getControl(container).querySelector('svg')).not.toBeNull();
  });

  it('controlled `checked` prop drives the input + indicator state', () => {
    const { container, rerender } = render(<Checkbox checked={false}>Accept</Checkbox>);
    expect(getInput().checked).toBe(false);
    rerender(<Checkbox checked>Accept</Checkbox>);
    expect(getInput().checked).toBe(true);
    expect(getControl(container)).toHaveAttribute('data-state', 'checked');
  });

  it('applies size + shape classes to the control', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      for (const shape of SHAPES) {
        const { container, unmount } = render(
          <Checkbox size={size} shape={shape}>
            x
          </Checkbox>,
        );
        const control = getControl(container);
        const sizeClass = { sm: 'size-3.5', md: 'size-4', lg: 'size-5' }[size];
        const shapeClass = { square: 'rounded-sm', rounded: 'rounded-md', circle: 'rounded-full' }[shape];
        expect(control.className).toContain(sizeClass);
        expect(control.className).toContain(shapeClass);
        unmount();
      }
    }
  });

  it('uses CSS-var-mapped radius utilities so the Tailwind preset can flow theme variants through (e.g. Katana diagonal corners)', () => {
    // The whole point of this assertion: every radius utility the recipe emits must be one of the
    // tokens declared on `apxTailwindPreset.theme.extend.borderRadius`. Those keys resolve to
    // `var(--sds-radius-*)` — meaning switching `theme.variant` to `katana` (which redefines those
    // vars to `'<n>px 0px'`) makes the Checkbox box draw with diagonal corners with **zero**
    // recipe / component changes. If anyone ever swaps in a literal pixel value (e.g.
    // `rounded-[2px]`) for a shape, this test fails before the variant adaptation regresses.
    const presetMappedRadii = new Set([
      'rounded-none',
      'rounded-xs',
      'rounded-sm',
      'rounded-md',
      'rounded-lg',
      'rounded-xl',
      'rounded-2xl',
      'rounded-3xl',
      'rounded-full',
    ]);
    for (const shape of SHAPES) {
      const { container, unmount } = render(<Checkbox shape={shape}>x</Checkbox>);
      const control = getControl(container);
      const tokens = control.className.split(/\s+/).filter((c) => c.startsWith('rounded'));
      expect(tokens.length).toBeGreaterThan(0);
      for (const token of tokens) {
        expect(presetMappedRadii.has(token)).toBe(true);
      }
      unmount();
    }
  });

  it('solid variant paints `bg-<color>` + `text-<color>-contrast` on the checked control', () => {
    for (const color of COLORS) {
      const { container, unmount } = render(
        <Checkbox variant="solid" color={color} defaultChecked>
          x
        </Checkbox>,
      );
      const control = getControl(container);
      expect(control.className).toContain(`data-[state=checked]:bg-${color}`);
      expect(control.className).toContain(`data-[state=checked]:text-${color}-contrast`);
      unmount();
    }
  });

  it('outline variant skips the bg fill but keeps `border-<color>` + `text-<color>`', () => {
    for (const color of COLORS) {
      const { container, unmount } = render(
        <Checkbox variant="outline" color={color} defaultChecked>
          x
        </Checkbox>,
      );
      const control = getControl(container);
      expect(control.className).not.toContain(`data-[state=checked]:bg-${color} `);
      expect(control.className).toContain(`data-[state=checked]:border-${color}`);
      expect(control.className).toContain(`data-[state=checked]:text-${color}`);
      unmount();
    }
  });

  it('soft variant uses `-subtle` bg + `-border` border + role text', () => {
    for (const color of COLORS) {
      const { container, unmount } = render(
        <Checkbox variant="soft" color={color} defaultChecked>
          x
        </Checkbox>,
      );
      const control = getControl(container);
      expect(control.className).toContain(`data-[state=checked]:bg-${color}-subtle`);
      expect(control.className).toContain(`data-[state=checked]:border-${color}-border`);
      expect(control.className).toContain(`data-[state=checked]:text-${color}`);
      unmount();
    }
  });

  it('focus-visible ring color matches the active color for every variant × color cell', () => {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        const { container, unmount } = render(
          <Checkbox variant={variant} color={color}>
            x
          </Checkbox>,
        );
        expect(getControl(container).className).toContain(`peer-focus-visible:ring-${color}`);
        unmount();
      }
    }
  });
});

describe('Checkbox — indeterminate', () => {
  it('sets the DOM `indeterminate` property when the prop is true and not checked', () => {
    render(<Checkbox indeterminate>Some</Checkbox>);
    expect(getInput().indeterminate).toBe(true);
    expect(getInput()).toHaveAttribute('aria-checked', 'mixed');
  });

  it('renders the minus glyph (not the check) while indeterminate', () => {
    const { container } = render(<Checkbox indeterminate>Some</Checkbox>);
    const control = getControl(container);
    expect(control).toHaveAttribute('data-state', 'indeterminate');
    expect(control.querySelector('svg')).not.toBeNull();
  });

  it('updates the DOM property when the prop changes after mount', () => {
    const { rerender } = render(<Checkbox indeterminate={false}>x</Checkbox>);
    expect(getInput().indeterminate).toBe(false);
    rerender(<Checkbox indeterminate>x</Checkbox>);
    expect(getInput().indeterminate).toBe(true);
    rerender(<Checkbox indeterminate={false}>x</Checkbox>);
    expect(getInput().indeterminate).toBe(false);
  });

  it('does NOT set aria-checked="mixed" when both indeterminate and checked are true', () => {
    render(
      <Checkbox indeterminate checked>
        x
      </Checkbox>,
    );
    expect(getInput()).not.toHaveAttribute('aria-checked', 'mixed');
  });
});

describe('Checkbox — interaction', () => {
  it('clicking the label toggles the checkbox', async () => {
    render(<Checkbox>Accept</Checkbox>);
    expect(getInput().checked).toBe(false);
    await userEvent.click(screen.getByText('Accept'));
    expect(getInput().checked).toBe(true);
  });

  it('onCheckedChange fires with the new boolean', async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox onCheckedChange={onCheckedChange}>x</Checkbox>);
    await userEvent.click(getInput());
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    await userEvent.click(getInput());
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it('onChange still fires alongside onCheckedChange (native event preserved)', async () => {
    const onChange = vi.fn();
    const onCheckedChange = vi.fn();
    render(
      <Checkbox onChange={onChange} onCheckedChange={onCheckedChange}>
        x
      </Checkbox>,
    );
    await userEvent.click(getInput());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });

  it('Space toggles the checkbox via keyboard', async () => {
    render(<Checkbox>x</Checkbox>);
    const input = getInput();
    input.focus();
    await userEvent.keyboard(' ');
    expect(input.checked).toBe(true);
  });

  it('disabled blocks click toggling + sets data-disabled on the root', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox disabled onCheckedChange={onCheckedChange}>
        x
      </Checkbox>,
    );
    const input = getInput();
    expect(input.disabled).toBe(true);
    expect(input.closest('label')).toHaveAttribute('data-disabled', 'true');
    await userEvent.click(screen.getByText('x'));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('works in fully-controlled mode without internal state divergence', async () => {
    function ControlledHarness() {
      const [checked, setChecked] = useState(false);
      return (
        <Checkbox checked={checked} onCheckedChange={setChecked}>
          ext
        </Checkbox>
      );
    }
    render(<ControlledHarness />);
    expect(getInput().checked).toBe(false);
    await userEvent.click(getInput());
    expect(getInput().checked).toBe(true);
  });
});

describe('Checkbox — form participation', () => {
  it('participates in a form submission like a native checkbox', () => {
    let captured: FormData | null = null;
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          captured = new FormData(e.currentTarget);
        }}
      >
        <Checkbox name="terms" value="accepted" defaultChecked>
          Accept
        </Checkbox>
        <button type="submit">Submit</button>
      </form>,
    );
    screen.getByRole('button', { name: 'Submit' }).click();
    expect(captured).not.toBeNull();
    expect(captured!.get('terms')).toBe('accepted');
  });

  it('an unchecked box is NOT included in the submitted form data', () => {
    let captured: FormData | null = null;
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          captured = new FormData(e.currentTarget);
        }}
      >
        <Checkbox name="terms" value="accepted">
          Accept
        </Checkbox>
        <button type="submit">Submit</button>
      </form>,
    );
    screen.getByRole('button', { name: 'Submit' }).click();
    expect(captured!.get('terms')).toBeNull();
  });
});

describe('Checkbox — invalid + description', () => {
  it('invalid sets data-invalid on the control + aria-invalid on the input', () => {
    const { container } = render(<Checkbox invalid>x</Checkbox>);
    expect(getInput()).toHaveAttribute('aria-invalid', 'true');
    expect(getControl(container)).toHaveAttribute('data-invalid', 'true');
  });

  it('description renders only when provided and wires aria-describedby on the input', () => {
    const { container, rerender } = render(<Checkbox>x</Checkbox>);
    expect(container.querySelector('.text-fg-muted')).toBeNull();
    expect(getInput()).not.toHaveAttribute('aria-describedby');

    rerender(<Checkbox description="You can change this later.">x</Checkbox>);
    const desc = container.querySelector('.text-fg-muted') as HTMLElement;
    expect(desc).not.toBeNull();
    expect(desc.textContent).toBe('You can change this later.');
    const describedBy = getInput().getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(desc.id).toBe(describedBy);
  });

  it('merges existing aria-describedby with the auto-generated description id', () => {
    render(
      <Checkbox aria-describedby="external-hint" description="Auto description.">
        x
      </Checkbox>,
    );
    const ids = (getInput().getAttribute('aria-describedby') ?? '').split(/\s+/);
    expect(ids).toContain('external-hint');
    // The auto id is React's useId output; we just check there are two distinct ids.
    expect(ids.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Checkbox — overrides + ref', () => {
  it('className wins over conflicting recipe classes via tailwind-merge on the root', () => {
    const { container } = render(<Checkbox className="opacity-30">x</Checkbox>);
    const label = container.querySelector('label') as HTMLElement;
    expect(label).toHaveClass('opacity-30');
  });

  it('forwards ref to the underlying <input>', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref}>x</Checkbox>);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('checkbox');
  });

  it('labelPosition="left" reverses the root flex direction', () => {
    const { container } = render(<Checkbox labelPosition="left">x</Checkbox>);
    const label = container.querySelector('label') as HTMLElement;
    expect(label.className).toContain('flex-row-reverse');
  });
});