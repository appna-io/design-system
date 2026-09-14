import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ColorPicker } from '../src/ColorPicker/ColorPicker';
import { ColorInput } from '../src/ColorPicker/ColorInput';
import { ColorSwatch } from '../src/ColorPicker/ColorSwatch';
import { renderWithTheme as render } from './utils';

// jsdom doesn't ship `Element#setPointerCapture` — stub it on the prototype so the picker's
// pointerdown handler can call it without throwing. The interaction tests still pass because
// the capture is a nice-to-have, not a precondition.
beforeAll(() => {
  if (!Element.prototype.setPointerCapture) {
    (Element.prototype as Element & { setPointerCapture?: (id: number) => void }).setPointerCapture =
      () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    (Element.prototype as Element & { releasePointerCapture?: (id: number) => void }).releasePointerCapture =
      () => {};
  }
});

function getTrigger(): HTMLElement {
  // The picker trigger is the only button at the top level (Popover.Content is portaled and
  // only mounted while open). Filter by `data-trigger-variant` to be safe.
  const trigger = document.querySelector<HTMLElement>('[data-trigger-variant]');
  if (!trigger) throw new Error('trigger not rendered');
  return trigger;
}

describe('ColorPicker — rendering', () => {
  it('renders a swatch-style trigger by default', () => {
    render(<ColorPicker defaultValue="#6c5ce7" ariaLabel="Brand color" />);
    const trigger = getTrigger();
    expect(trigger).toHaveAttribute('data-trigger-variant', 'swatch');
  });

  it('renders the button trigger when triggerVariant="button"', () => {
    render(<ColorPicker defaultValue="#6c5ce7" triggerVariant="button" ariaLabel="x" />);
    expect(getTrigger()).toHaveAttribute('data-trigger-variant', 'button');
  });

  it('renders the input trigger when triggerVariant="input"', () => {
    render(<ColorPicker defaultValue="#6c5ce7" triggerVariant="input" ariaLabel="x" />);
    expect(getTrigger()).toHaveAttribute('data-trigger-variant', 'input');
  });

  it('renders a visible label when provided', () => {
    render(<ColorPicker defaultValue="#000" label="Brand" />);
    expect(screen.getByText('Brand')).toBeInTheDocument();
  });

  it('renders helper text when not invalid', () => {
    render(<ColorPicker defaultValue="#000" label="x" helperText="Pick wisely" />);
    expect(screen.getByText('Pick wisely')).toBeInTheDocument();
  });

  it('renders error, marks the trigger via data-invalid, and announces it through aria-describedby', () => {
    // `aria-invalid` is not supported on `role=button` (ARIA spec / axe), so the error state is
    // exposed as `data-invalid` for styling + the error text is wired via `aria-describedby`.
    render(<ColorPicker defaultValue="#000" label="x" error="Choose a color" />);
    const error = screen.getByText('Choose a color');
    expect(error).toBeInTheDocument();
    expect(getTrigger()).toHaveAttribute('data-invalid', 'true');
    expect(getTrigger().getAttribute('aria-describedby')).toContain(error.id);
  });

  it('renders a hidden input for form submission when `name` is set', () => {
    const { container } = render(<ColorPicker defaultValue="#abcdef" name="brand" />);
    const hidden = container.querySelector('input[type="hidden"][name="brand"]') as HTMLInputElement;
    expect(hidden).not.toBeNull();
    expect(hidden.value).toBe('#abcdef');
  });

  it('respects `disabled` on the trigger', () => {
    render(<ColorPicker defaultValue="#000" disabled ariaLabel="x" />);
    expect(getTrigger()).toBeDisabled();
  });
});

describe('ColorPicker — popover open / close', () => {
  it('opens the picker on trigger click', async () => {
    const user = userEvent.setup();
    render(<ColorPicker defaultValue="#6c5ce7" ariaLabel="x" />);
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(getTrigger());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows the saturation square + hue slider when open', async () => {
    const user = userEvent.setup();
    render(<ColorPicker defaultValue="#6c5ce7" ariaLabel="x" />);
    await user.click(getTrigger());
    // SaturationSquare is the role=slider with aria-label resembling "Saturation"
    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBeGreaterThanOrEqual(2);
  });

  it('hides the format tabs in presetsOnly mode', async () => {
    const user = userEvent.setup();
    render(
      <ColorPicker
        defaultValue="#000"
        presets={['#FF0000', '#00FF00', '#0000FF']}
        presetsOnly
        ariaLabel="x"
      />,
    );
    await user.click(getTrigger());
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});

describe('ColorPicker — value commit', () => {
  it('fires onChange when a preset is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ColorPicker
        defaultValue="#000000"
        presets={['#ff0000']}
        onChange={onChange}
        ariaLabel="x"
      />,
    );
    await user.click(getTrigger());
    const preset = screen.getByRole('option');
    await user.click(preset);
    expect(onChange).toHaveBeenCalled();
    const [next, meta] = onChange.mock.calls[0]!;
    expect((next as string).toLowerCase()).toBe('#ff0000');
    expect(meta).toEqual({ format: 'hex', source: 'preset' });
  });

  it('preserves format="auto" with the incoming format', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ColorPicker
        defaultValue="rgb(0, 0, 0)"
        presets={['#ff0000']}
        onChange={onChange}
        ariaLabel="x"
      />,
    );
    await user.click(getTrigger());
    await user.click(screen.getByRole('option'));
    const [, meta] = onChange.mock.calls[0]!;
    expect(meta).toEqual({ format: 'rgb', source: 'preset' });
  });

  it('forces hex format when format="hex"', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ColorPicker
        defaultValue="rgb(0, 0, 0)"
        presets={['#ff0000']}
        format="hex"
        onChange={onChange}
        ariaLabel="x"
      />,
    );
    await user.click(getTrigger());
    await user.click(screen.getByRole('option'));
    const [out] = onChange.mock.calls[0]!;
    expect(out).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('closes on preset pick when closeOnSelect + presetsOnly', async () => {
    const user = userEvent.setup();
    render(
      <ColorPicker
        defaultValue="#000"
        presets={['#ff0000']}
        presetsOnly
        closeOnSelect
        ariaLabel="x"
      />,
    );
    await user.click(getTrigger());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('option'));
    // AnimatePresence drives an exit animation; the dialog node lingers until the exit
    // completes. Wait for either the unmount or the fading-out opacity to confirm that the
    // picker received + acted on the close request.
    await waitFor(
      () => {
        const dialog = screen.queryByRole('dialog');
        const opacity = dialog ? Number(dialog.style.opacity || '1') : 0;
        expect(opacity).toBeLessThan(1);
      },
      { timeout: 1500 },
    );
  });
});

describe('ColorPicker — saturation square interaction', () => {
  it('updates value on ArrowRight (saturation up)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ColorPicker defaultValue="hsl(0, 0%, 50%)" onChange={onChange} ariaLabel="Color" />,
    );
    await user.click(getTrigger());
    const square = screen.getByRole('slider', { name: /saturation/i });
    square.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalled();
  });

  it('Home key sets saturation to 0', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ColorPicker defaultValue="#ff0000" onChange={onChange} ariaLabel="x" />,
    );
    await user.click(getTrigger());
    const square = screen.getByRole('slider', { name: /saturation/i });
    act(() => square.focus());
    await user.keyboard('{Home}');
    expect(onChange).toHaveBeenCalled();
  });
});

describe('ColorPicker — hex input', () => {
  it('commits a typed hex value on Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker defaultValue="#000000" onChange={onChange} ariaLabel="x" />);
    await user.click(getTrigger());
    const hexInput = screen.getByLabelText(/hex/i, { selector: 'input' });
    await user.clear(hexInput);
    await user.type(hexInput, '#ff0000{Enter}');
    expect(onChange).toHaveBeenCalled();
    const [next] = onChange.mock.calls.at(-1)!;
    expect((next as string).toLowerCase()).toBe('#ff0000');
  });
});

describe('ColorSwatch', () => {
  it('renders with an aria-label fallback to the value', () => {
    render(<ColorSwatch value="#6c5ce7" />);
    expect(screen.getByRole('img', { name: /6c5ce7/i })).toBeInTheDocument();
  });

  it('renders an inline label when `showLabel` is set', () => {
    render(<ColorSwatch value="#000" showLabel="Black" />);
    expect(screen.getByText('Black')).toBeInTheDocument();
  });

  it('supports custom aria-label override', () => {
    render(<ColorSwatch value="#000" ariaLabel="Primary brand" />);
    expect(screen.getByRole('img', { name: 'Primary brand' })).toBeInTheDocument();
  });
});

describe('ColorInput', () => {
  it('renders an input with the controlled value', () => {
    render(<ColorInput value="#6c5ce7" ariaLabel="Color value" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('#6c5ce7');
  });

  it('commits parsed input on Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorInput value="#000000" onChange={onChange} ariaLabel="x" />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '#abcdef{Enter}');
    expect(onChange).toHaveBeenCalled();
    const [next] = onChange.mock.calls.at(-1)!;
    expect((next as string).toLowerCase()).toBe('#abcdef');
  });

  it('reverts to canonical value on Escape', async () => {
    const user = userEvent.setup();
    render(<ColorInput defaultValue="#000000" ariaLabel="x" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.clear(input);
    await user.type(input, 'nope{Escape}');
    expect(input.value).toBe('#000000');
  });
});

describe('ColorPicker — alpha', () => {
  it('hides alpha slider when enableAlpha is false', async () => {
    const user = userEvent.setup();
    render(<ColorPicker defaultValue="#000" ariaLabel="x" />);
    await user.click(getTrigger());
    expect(screen.queryByRole('slider', { name: /transparency/i })).toBeNull();
  });

  it('renders alpha slider when enableAlpha is true', async () => {
    const user = userEvent.setup();
    render(<ColorPicker defaultValue="rgba(0, 0, 0, 0.5)" enableAlpha ariaLabel="x" />);
    await user.click(getTrigger());
    expect(screen.getByRole('slider', { name: /transparency/i })).toBeInTheDocument();
  });
});

describe('ColorPicker — contrast chip', () => {
  it('renders a status chip when enableContrastCheck is true', async () => {
    const user = userEvent.setup();
    render(
      <ColorPicker
        defaultValue="#000000"
        enableContrastCheck
        contrastAgainst="#FFFFFF"
        ariaLabel="x"
      />,
    );
    await user.click(getTrigger());
    const chip = screen.getByRole('status');
    expect(chip).toHaveAttribute('data-level', 'AAA');
  });
});
describe('ColorPicker — preset swatch respects reduced motion', () => {
  // The bug: the swatch carried `transition-transform … motion-reduce:transition-none` alongside a
  // bare `hover:scale-110`. Suppressing the *transition* leaves the *transform* — so a
  // reduced-motion user still got the 110% growth, it just snapped there instead of easing. The
  // handling looked present and did the opposite of its intent.
  it('gates both the transform and its transition on motion-safe', async () => {
    const user = userEvent.setup();
    render(
      <ColorPicker defaultValue="#000000" presets={['#ff0000', '#00ff00']} presetsOnly ariaLabel="x" />,
    );
    await user.click(getTrigger());

    const swatch = document.querySelector<HTMLElement>('[data-preset-index]');

    // No early return: if the swatch isn't found the test must FAIL, not quietly pass. An
    // escape hatch here made the first version of this test green against the very bug it was
    // written to catch.
    expect(swatch, 'preset swatch not rendered — selector is stale').not.toBeNull();

    const classes = swatch!.className.split(/\s+/);
    const scale = classes.find((c) => c.includes('scale-110'));
    const transition = classes.find((c) => c.includes('transition-transform'));

    expect(scale, 'the swatch should still scale on hover').toBeDefined();
    expect(scale!.startsWith('motion-safe:')).toBe(true);
    expect(transition).toBeDefined();
    expect(transition!.startsWith('motion-safe:')).toBe(true);

    // And nothing left behind that tries to *undo* motion — an undo rule sits at the same
    // specificity as the rule it beats, so it only wins by emission order.
    expect(classes.some((c) => c.startsWith('motion-reduce:'))).toBe(false);
  });
});
