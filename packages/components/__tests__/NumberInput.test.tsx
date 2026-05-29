import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { NumberInput } from '../src/NumberInput';
import { renderWithTheme as render } from './utils';

describe('NumberInput — rendering', () => {
  it('renders an <input> with role="spinbutton"', () => {
    render(<NumberInput aria-label="qty" defaultValue={1} />);
    const input = screen.getByRole('spinbutton', { name: 'qty' });
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('displays the formatted value', () => {
    render(<NumberInput aria-label="qty" defaultValue={1234.5} locale="en-US" />);
    const input = screen.getByRole('spinbutton', { name: 'qty' }) as HTMLInputElement;
    expect(input.value).toBe('1,234.5');
  });

  it('renders an empty string when value is null', () => {
    render(<NumberInput aria-label="qty" defaultValue={null} />);
    const input = screen.getByRole('spinbutton', { name: 'qty' }) as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('renders the increment / decrement buttons by default', () => {
    render(<NumberInput aria-label="qty" defaultValue={1} />);
    expect(screen.getByRole('button', { name: 'Increment' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decrement' })).toBeInTheDocument();
  });

  it('hides the stepper buttons when hideStepperButtons is set', () => {
    render(<NumberInput aria-label="qty" defaultValue={1} hideStepperButtons />);
    expect(screen.queryByRole('button', { name: 'Increment' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Decrement' })).toBeNull();
  });

  it('forwards ref to the visible <input>', () => {
    const ref = createRef<HTMLInputElement>();
    render(<NumberInput aria-label="qty" ref={ref} defaultValue={1} />);
    expect(ref.current?.tagName).toBe('INPUT');
  });
});

describe('NumberInput — aria-* value triad', () => {
  it('emits aria-valuemin / aria-valuemax / aria-valuenow / aria-valuetext', () => {
    render(<NumberInput aria-label="qty" defaultValue={42} min={0} max={100} locale="en-US" />);
    const input = screen.getByRole('spinbutton', { name: 'qty' });
    expect(input).toHaveAttribute('aria-valuemin', '0');
    expect(input).toHaveAttribute('aria-valuemax', '100');
    expect(input).toHaveAttribute('aria-valuenow', '42');
    expect(input).toHaveAttribute('aria-valuetext', '42');
  });

  it('omits aria-valuenow when value is null', () => {
    render(<NumberInput aria-label="qty" defaultValue={null} />);
    const input = screen.getByRole('spinbutton', { name: 'qty' });
    expect(input).not.toHaveAttribute('aria-valuenow');
  });
});

describe('NumberInput — typing + onChange', () => {
  it('fires onChange with a number when the user types digits', async () => {
    const handle = vi.fn();
    render(<NumberInput aria-label="qty" onChange={handle} defaultValue={null} locale="en-US" />);
    const input = screen.getByRole('spinbutton', { name: 'qty' });
    await userEvent.type(input, '42');
    expect(handle).toHaveBeenLastCalledWith(42);
  });

  it('fires onChange(null) when the user clears the input', async () => {
    const handle = vi.fn();
    render(<NumberInput aria-label="qty" onChange={handle} defaultValue={10} locale="en-US" />);
    const input = screen.getByRole('spinbutton', { name: 'qty' }) as HTMLInputElement;
    await userEvent.clear(input);
    expect(handle).toHaveBeenLastCalledWith(null);
  });

  it('does not clamp mid-edit (typing a small digit on the way to a larger value)', async () => {
    const handle = vi.fn();
    render(
      <NumberInput
        aria-label="qty"
        onChange={handle}
        defaultValue={null}
        min={10}
        max={100}
        locale="en-US"
      />,
    );
    const input = screen.getByRole('spinbutton', { name: 'qty' });
    await userEvent.type(input, '5');
    expect(handle).toHaveBeenLastCalledWith(5);
  });
});

describe('NumberInput — stepper buttons', () => {
  it('increments on click of +', async () => {
    const handle = vi.fn();
    render(<NumberInput aria-label="qty" defaultValue={5} step={1} onChange={handle} />);
    await userEvent.click(screen.getByRole('button', { name: 'Increment' }));
    expect(handle).toHaveBeenLastCalledWith(6);
  });

  it('decrements on click of −', async () => {
    const handle = vi.fn();
    render(<NumberInput aria-label="qty" defaultValue={5} step={1} onChange={handle} />);
    await userEvent.click(screen.getByRole('button', { name: 'Decrement' }));
    expect(handle).toHaveBeenLastCalledWith(4);
  });

  it('disables + at max', () => {
    render(<NumberInput aria-label="qty" defaultValue={10} min={0} max={10} step={1} />);
    expect(screen.getByRole('button', { name: 'Increment' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decrement' })).not.toBeDisabled();
  });

  it('disables − at min', () => {
    render(<NumberInput aria-label="qty" defaultValue={0} min={0} max={10} step={1} />);
    expect(screen.getByRole('button', { name: 'Decrement' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Increment' })).not.toBeDisabled();
  });

  it('renders three stepper buttons in split mode', () => {
    render(<NumberInput aria-label="qty" defaultValue={1} stepperPosition="split" />);
    expect(screen.getByRole('button', { name: 'Increment' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decrement' })).toBeInTheDocument();
  });

  it('stepper buttons are not in the tab order', () => {
    render(<NumberInput aria-label="qty" defaultValue={1} />);
    expect(screen.getByRole('button', { name: 'Increment' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('button', { name: 'Decrement' })).toHaveAttribute('tabindex', '-1');
  });

  it('uses translatable labels when provided', () => {
    render(
      <NumberInput
        aria-label="qty"
        defaultValue={1}
        incrementLabel="Plus"
        decrementLabel="Moins"
      />,
    );
    expect(screen.getByRole('button', { name: 'Plus' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Moins' })).toBeInTheDocument();
  });
});

describe('NumberInput — keyboard', () => {
  it('ArrowUp increments by step', async () => {
    const handle = vi.fn();
    render(<NumberInput aria-label="qty" defaultValue={5} step={1} onChange={handle} />);
    const input = screen.getByRole('spinbutton', { name: 'qty' });
    input.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(handle).toHaveBeenLastCalledWith(6);
  });

  it('ArrowDown decrements by step', async () => {
    const handle = vi.fn();
    render(<NumberInput aria-label="qty" defaultValue={5} step={1} onChange={handle} />);
    const input = screen.getByRole('spinbutton', { name: 'qty' });
    input.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(handle).toHaveBeenLastCalledWith(4);
  });

  it('Shift+ArrowUp increments by largeStep', async () => {
    const handle = vi.fn();
    render(
      <NumberInput
        aria-label="qty"
        defaultValue={5}
        step={1}
        largeStep={10}
        onChange={handle}
      />,
    );
    const input = screen.getByRole('spinbutton', { name: 'qty' });
    input.focus();
    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
    expect(handle).toHaveBeenLastCalledWith(15);
  });

  it('PageUp + PageDown use largeStep', async () => {
    const handle = vi.fn();
    render(
      <NumberInput
        aria-label="qty"
        defaultValue={5}
        step={1}
        largeStep={10}
        onChange={handle}
      />,
    );
    const input = screen.getByRole('spinbutton', { name: 'qty' });
    input.focus();
    await userEvent.keyboard('{PageUp}');
    expect(handle).toHaveBeenLastCalledWith(15);
    await userEvent.keyboard('{PageDown}');
    expect(handle).toHaveBeenLastCalledWith(5);
  });

  it('Home jumps to min when defined', async () => {
    const handle = vi.fn();
    render(<NumberInput aria-label="qty" defaultValue={50} min={0} max={100} onChange={handle} />);
    const input = screen.getByRole('spinbutton', { name: 'qty' });
    input.focus();
    await userEvent.keyboard('{Home}');
    expect(handle).toHaveBeenLastCalledWith(0);
  });

  it('End jumps to max when defined', async () => {
    const handle = vi.fn();
    render(<NumberInput aria-label="qty" defaultValue={50} min={0} max={100} onChange={handle} />);
    const input = screen.getByRole('spinbutton', { name: 'qty' });
    input.focus();
    await userEvent.keyboard('{End}');
    expect(handle).toHaveBeenLastCalledWith(100);
  });

  it('Escape reverts to the value at focus-in', async () => {
    const handle = vi.fn();
    render(<NumberInput aria-label="qty" defaultValue={10} onChange={handle} locale="en-US" />);
    const input = screen.getByRole('spinbutton', { name: 'qty' }) as HTMLInputElement;
    input.focus();
    await userEvent.clear(input);
    await userEvent.type(input, '99');
    expect(handle).toHaveBeenLastCalledWith(99);
    await userEvent.keyboard('{Escape}');
    expect(handle).toHaveBeenLastCalledWith(10);
  });
});

describe('NumberInput — clamp on blur', () => {
  it('clamps to max on blur when value exceeds max', async () => {
    const handle = vi.fn();
    render(
      <NumberInput
        aria-label="qty"
        defaultValue={50}
        min={0}
        max={100}
        onChange={handle}
        onChangeEnd={handle}
        locale="en-US"
      />,
    );
    const input = screen.getByRole('spinbutton', { name: 'qty' }) as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, '999');
    act(() => input.blur());
    expect(handle).toHaveBeenLastCalledWith(100);
  });

  it('does not clamp on blur when clampOnBlur=false', async () => {
    const handle = vi.fn();
    render(
      <NumberInput
        aria-label="qty"
        defaultValue={50}
        min={0}
        max={100}
        clampOnBlur={false}
        onChangeEnd={handle}
        locale="en-US"
      />,
    );
    const input = screen.getByRole('spinbutton', { name: 'qty' }) as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, '999');
    act(() => input.blur());
    expect(handle).toHaveBeenLastCalledWith(999);
  });
});

describe('NumberInput — precision', () => {
  it('rounds to precision on blur', async () => {
    const handle = vi.fn();
    render(
      <NumberInput
        aria-label="qty"
        defaultValue={0}
        precision={2}
        onChangeEnd={handle}
        locale="en-US"
      />,
    );
    const input = screen.getByRole('spinbutton', { name: 'qty' }) as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, '3.456');
    act(() => input.blur());
    expect(handle).toHaveBeenLastCalledWith(3.46);
  });
});

describe('NumberInput — controlled mode', () => {
  it('reflects parent state changes', async () => {
    function Demo() {
      const [v, setV] = useState<number | null>(0);
      return (
        <>
          <NumberInput aria-label="qty" value={v} onChange={setV} locale="en-US" />
          <button type="button" onClick={() => setV(99)}>
            set 99
          </button>
        </>
      );
    }
    render(<Demo />);
    const input = screen.getByRole('spinbutton', { name: 'qty' }) as HTMLInputElement;
    expect(input.value).toBe('0');
    await userEvent.click(screen.getByRole('button', { name: 'set 99' }));
    expect(input.value).toBe('99');
  });
});

describe('NumberInput — form submission', () => {
  it('renders a hidden input carrying the canonical value when name is provided', () => {
    render(<NumberInput aria-label="qty" name="quantity" defaultValue={1234.56} locale="en-US" />);
    const visible = screen.getByRole('spinbutton', { name: 'qty' }) as HTMLInputElement;
    expect(visible.value).toBe('1,234.56');
    const hidden = visible.parentElement?.querySelector('input[type="hidden"]');
    expect(hidden).not.toBeNull();
    expect(hidden).toHaveAttribute('name', 'quantity');
    expect(hidden).toHaveAttribute('value', '1234.56');
  });

  it('emits "" in the hidden input when value is null', () => {
    render(<NumberInput aria-label="qty" name="quantity" defaultValue={null} />);
    const visible = screen.getByRole('spinbutton', { name: 'qty' }) as HTMLInputElement;
    const hidden = visible.parentElement?.querySelector('input[type="hidden"]');
    expect(hidden).toHaveAttribute('value', '');
  });
});

describe('NumberInput — locale display', () => {
  it('formats with de-DE separators', () => {
    render(
      <NumberInput
        aria-label="qty"
        defaultValue={1234.56}
        locale="de-DE"
        format={{ minimumFractionDigits: 2 }}
      />,
    );
    const input = screen.getByRole('spinbutton', { name: 'qty' }) as HTMLInputElement;
    expect(input.value).toBe('1.234,56');
  });

  it('parses input typed in the active locale', async () => {
    const handle = vi.fn();
    render(
      <NumberInput
        aria-label="qty"
        defaultValue={null}
        locale="de-DE"
        onChange={handle}
      />,
    );
    const input = screen.getByRole('spinbutton', { name: 'qty' });
    await userEvent.type(input, '1.234,5');
    expect(handle).toHaveBeenLastCalledWith(1234.5);
  });
});
