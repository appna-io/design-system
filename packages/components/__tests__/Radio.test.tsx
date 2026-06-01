import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Radio, RadioGroup } from '../src/Radio';
import { renderWithTheme as render } from './utils';

const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
const VARIANTS = ['solid', 'outline', 'soft'] as const;

function getInput(): HTMLInputElement {
  return screen.getByRole('radio') as HTMLInputElement;
}

function getControl(container: HTMLElement): HTMLElement {
  // The custom-painted indicator is the `aria-hidden` span sibling of the input.
  return container.querySelector('span[aria-hidden="true"][data-state]') as HTMLElement;
}

describe('Radio — rendering', () => {
  it('renders a real <input type="radio"> inside a <label>', () => {
    render(<Radio value="a">Option A</Radio>);
    const input = getInput();
    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('radio');
    expect(input.closest('label')).not.toBeNull();
  });

  it('visually hides the native input but keeps it in the a11y tree (peer + sr-only)', () => {
    render(<Radio value="a">Option A</Radio>);
    const input = getInput();
    expect(input.className).toContain('peer');
    expect(input.className).toContain('sr-only');
  });

  it('starts unchecked by default', () => {
    const { container } = render(<Radio value="a">Option A</Radio>);
    expect(getInput().checked).toBe(false);
    expect(getControl(container)).toHaveAttribute('data-state', 'unchecked');
  });

  it('defaultChecked initializes the uncontrolled standalone input as checked', () => {
    const { container } = render(
      <Radio value="a" defaultChecked>
        Option A
      </Radio>,
    );
    expect(getInput().checked).toBe(true);
    expect(getControl(container)).toHaveAttribute('data-state', 'checked');
  });

  it('controlled `checked` drives the input + indicator state when standalone', () => {
    const { container, rerender } = render(
      <Radio value="a" checked={false} onCheckedChange={() => {}}>
        Option A
      </Radio>,
    );
    expect(getInput().checked).toBe(false);
    rerender(
      <Radio value="a" checked onCheckedChange={() => {}}>
        Option A
      </Radio>,
    );
    expect(getInput().checked).toBe(true);
    expect(getControl(container)).toHaveAttribute('data-state', 'checked');
  });

  it('applies size classes to the control', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { container, unmount } = render(
        <Radio value="a" size={size}>
          x
        </Radio>,
      );
      const sizeClass = { sm: 'size-3.5', md: 'size-4', lg: 'size-5' }[size];
      const dotClass = { sm: 'before:size-1.5', md: 'before:size-2', lg: 'before:size-2.5' }[size];
      expect(getControl(container).className).toContain(sizeClass);
      expect(getControl(container).className).toContain(dotClass);
      unmount();
    }
  });

  it('is always circular regardless of variant (no shape axis)', () => {
    for (const variant of VARIANTS) {
      const { container, unmount } = render(
        <Radio value="a" variant={variant}>
          x
        </Radio>,
      );
      expect(getControl(container).className).toContain('rounded-full');
      unmount();
    }
  });

  it('renders the dot via the ::before pseudo-element (no extra DOM child)', () => {
    const { container } = render(<Radio value="a" defaultChecked>x</Radio>);
    const control = getControl(container);
    // The indicator span has no element children (the dot lives on the span's ::before).
    expect(control.children.length).toBe(0);
    // And the recipe wires the dot via `before:*` utilities + the scale-to-checked rule.
    expect(control.className).toContain('before:rounded-full');
    expect(control.className).toContain('data-[state=checked]:before:scale-100');
  });

  it('solid variant paints `bg-<color>` + `border-<color>` + contrast dot on checked', () => {
    for (const color of COLORS) {
      const { container, unmount } = render(
        <Radio value="a" variant="solid" color={color} defaultChecked>
          x
        </Radio>,
      );
      const cls = getControl(container).className;
      expect(cls).toContain(`data-[state=checked]:bg-${color}`);
      expect(cls).toContain(`data-[state=checked]:border-${color}`);
      expect(cls).toContain(`data-[state=checked]:before:bg-${color}-contrast`);
      unmount();
    }
  });

  it('outline variant skips bg fill, keeps colored border + colored dot', () => {
    for (const color of COLORS) {
      const { container, unmount } = render(
        <Radio value="a" variant="outline" color={color} defaultChecked>
          x
        </Radio>,
      );
      const cls = getControl(container).className;
      expect(cls).not.toContain(`data-[state=checked]:bg-${color} `);
      expect(cls).toContain(`data-[state=checked]:border-${color}`);
      expect(cls).toContain(`data-[state=checked]:before:bg-${color}`);
      unmount();
    }
  });

  it('soft variant uses `-subtle` bg + `-border` + role dot', () => {
    for (const color of COLORS) {
      const { container, unmount } = render(
        <Radio value="a" variant="soft" color={color} defaultChecked>
          x
        </Radio>,
      );
      const cls = getControl(container).className;
      expect(cls).toContain(`data-[state=checked]:bg-${color}-subtle`);
      expect(cls).toContain(`data-[state=checked]:border-${color}-border`);
      expect(cls).toContain(`data-[state=checked]:before:bg-${color}`);
      unmount();
    }
  });

  it('focus-visible ring color matches the active color for every variant × color cell', () => {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        const { container, unmount } = render(
          <Radio value="a" variant={variant} color={color}>
            x
          </Radio>,
        );
        expect(getControl(container).className).toContain(`peer-focus-visible:ring-${color}`);
        unmount();
      }
    }
  });
});

describe('Radio — interaction (standalone)', () => {
  it('clicking the label toggles the radio on', async () => {
    render(<Radio value="a">Option A</Radio>);
    expect(getInput().checked).toBe(false);
    await userEvent.click(screen.getByText('Option A'));
    expect(getInput().checked).toBe(true);
  });

  it('onCheckedChange fires with the new boolean', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Radio value="a" onCheckedChange={onCheckedChange}>
        x
      </Radio>,
    );
    await userEvent.click(getInput());
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('onChange still fires alongside onCheckedChange (native event preserved)', async () => {
    const onChange = vi.fn();
    const onCheckedChange = vi.fn();
    render(
      <Radio value="a" onChange={onChange} onCheckedChange={onCheckedChange}>
        x
      </Radio>,
    );
    await userEvent.click(getInput());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });

  it('disabled blocks click toggling + sets data-disabled on the root', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Radio value="a" disabled onCheckedChange={onCheckedChange}>
        x
      </Radio>,
    );
    const input = getInput();
    expect(input.disabled).toBe(true);
    expect(input.closest('label')).toHaveAttribute('data-disabled', 'true');
    await userEvent.click(screen.getByText('x'));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('works in fully-controlled standalone mode without internal divergence', async () => {
    function ControlledHarness() {
      const [checked, setChecked] = useState(false);
      return (
        <Radio value="a" checked={checked} onCheckedChange={setChecked}>
          ext
        </Radio>
      );
    }
    render(<ControlledHarness />);
    expect(getInput().checked).toBe(false);
    await userEvent.click(getInput());
    expect(getInput().checked).toBe(true);
  });
});

describe('Radio — invalid + description', () => {
  it('invalid sets data-invalid on the control + aria-invalid on the input', () => {
    const { container } = render(
      <Radio value="a" invalid>
        x
      </Radio>,
    );
    expect(getInput()).toHaveAttribute('aria-invalid', 'true');
    expect(getControl(container)).toHaveAttribute('data-invalid', 'true');
  });

  it('description renders only when provided and wires aria-describedby', () => {
    const { container, rerender } = render(<Radio value="a">x</Radio>);
    expect(container.querySelector('.text-fg-muted')).toBeNull();
    expect(getInput()).not.toHaveAttribute('aria-describedby');

    rerender(
      <Radio value="a" description="Best for most cases.">
        x
      </Radio>,
    );
    const desc = container.querySelector('.text-fg-muted') as HTMLElement;
    expect(desc).not.toBeNull();
    expect(desc.textContent).toBe('Best for most cases.');
    const describedBy = getInput().getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(desc.id).toBe(describedBy);
  });

  it('merges existing aria-describedby with the auto-generated description id', () => {
    render(
      <Radio value="a" aria-describedby="external-hint" description="Auto description.">
        x
      </Radio>,
    );
    const ids = (getInput().getAttribute('aria-describedby') ?? '').split(/\s+/);
    expect(ids).toContain('external-hint');
    expect(ids.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Radio — overrides + ref', () => {
  it('className wins over conflicting recipe classes via tailwind-merge on the root', () => {
    const { container } = render(
      <Radio value="a" className="opacity-30">
        x
      </Radio>,
    );
    const label = container.querySelector('label') as HTMLElement;
    expect(label).toHaveClass('opacity-30');
  });

  it('forwards ref to the underlying <input>', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Radio ref={ref} value="a">
        x
      </Radio>,
    );
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('radio');
  });

  it('labelPosition="left" reverses the root flex direction', () => {
    const { container } = render(
      <Radio value="a" labelPosition="left">
        x
      </Radio>,
    );
    const label = container.querySelector('label') as HTMLElement;
    expect(label.className).toContain('flex-row-reverse');
  });
});

describe('Radio — inside RadioGroup', () => {
  it('inherits variant / size / color defaults from the group', () => {
    const { container } = render(
      <RadioGroup variant="soft" size="lg" color="success">
        <Radio value="a">A</Radio>
      </RadioGroup>,
    );
    const cls = getControl(container).className;
    expect(cls).toContain('size-5'); // lg
    expect(cls).toContain('peer-focus-visible:ring-success'); // success
    expect(cls).toContain('data-[state=checked]:bg-success-subtle'); // soft + success
  });

  it('per-Radio props override group defaults', () => {
    const { container } = render(
      <RadioGroup variant="solid" size="md" color="primary">
        <Radio value="a" variant="outline" size="lg" color="danger">
          A
        </Radio>
      </RadioGroup>,
    );
    const cls = getControl(container).className;
    expect(cls).toContain('size-5'); // lg override
    expect(cls).toContain('border-2'); // outline override
    expect(cls).toContain('peer-focus-visible:ring-danger'); // danger override
  });

  it('group `name` propagates to each child input', () => {
    render(
      <RadioGroup name="size">
        <Radio value="s">Small</Radio>
        <Radio value="m">Medium</Radio>
      </RadioGroup>,
    );
    const inputs = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(inputs[0]!.name).toBe('size');
    expect(inputs[1]!.name).toBe('size');
  });

  it('per-Radio `name` overrides the group name when set explicitly', () => {
    render(
      <RadioGroup name="size">
        <Radio value="s" name="custom">
          Small
        </Radio>
      </RadioGroup>,
    );
    expect((screen.getByRole('radio') as HTMLInputElement).name).toBe('custom');
  });

  it('disabled at the group propagates to every child', () => {
    render(
      <RadioGroup disabled>
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );
    const inputs = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(inputs.every((i) => i.disabled)).toBe(true);
  });

  it('group `invalid` propagates to each child indicator (data-invalid + aria-invalid)', () => {
    const { container } = render(
      <RadioGroup invalid>
        <Radio value="a">A</Radio>
      </RadioGroup>,
    );
    expect(getInput()).toHaveAttribute('aria-invalid', 'true');
    expect(getControl(container)).toHaveAttribute('data-invalid', 'true');
  });
});