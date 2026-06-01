import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Radio, RadioGroup } from '../src/Radio';
import { renderWithTheme as render } from './utils';

function getInputs(): HTMLInputElement[] {
  return screen.getAllByRole('radio') as HTMLInputElement[];
}

describe('RadioGroup — rendering', () => {
  it('renders a div with role="radiogroup"', () => {
    render(
      <RadioGroup aria-label="Size">
        <Radio value="a">A</Radio>
      </RadioGroup>,
    );
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('default vertical orientation uses flex-col, horizontal uses inline-flex flex-row', () => {
    const { rerender } = render(
      <RadioGroup aria-label="x">
        <Radio value="a">A</Radio>
      </RadioGroup>,
    );
    const groupV = screen.getByRole('radiogroup');
    expect(groupV.className).toContain('flex-col');
    expect(groupV).toHaveAttribute('data-orientation', 'vertical');

    rerender(
      <RadioGroup aria-label="x" orientation="horizontal">
        <Radio value="a">A</Radio>
      </RadioGroup>,
    );
    const groupH = screen.getByRole('radiogroup');
    expect(groupH.className).toContain('flex-row');
    expect(groupH).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('responsive orientation falls back to the base axis for the layout class', () => {
    render(
      <RadioGroup aria-label="x" orientation={{ base: 'vertical', md: 'horizontal' }}>
        <Radio value="a">A</Radio>
      </RadioGroup>,
    );
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAttribute('data-orientation', 'vertical');
    expect(group.className).toContain('flex-col');
  });

  it('aria-required + aria-invalid reflect the props', () => {
    const { rerender } = render(
      <RadioGroup aria-label="x">
        <Radio value="a">A</Radio>
      </RadioGroup>,
    );
    expect(screen.getByRole('radiogroup')).not.toHaveAttribute('aria-required');
    expect(screen.getByRole('radiogroup')).not.toHaveAttribute('aria-invalid');

    rerender(
      <RadioGroup aria-label="x" required invalid>
        <Radio value="a">A</Radio>
      </RadioGroup>,
    );
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-required', 'true');
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
  });

  it('merges consumer className with the layout class without clobbering it', () => {
    render(
      <RadioGroup aria-label="x" className="opacity-50">
        <Radio value="a">A</Radio>
      </RadioGroup>,
    );
    const group = screen.getByRole('radiogroup');
    expect(group.className).toContain('flex-col');
    expect(group.className).toContain('opacity-50');
  });
});

describe('RadioGroup — uncontrolled + controlled', () => {
  it('uncontrolled: defaultValue selects the matching child', () => {
    render(
      <RadioGroup defaultValue="b" aria-label="x">
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
        <Radio value="c">C</Radio>
      </RadioGroup>,
    );
    const inputs = getInputs();
    expect(inputs[0]!.checked).toBe(false);
    expect(inputs[1]!.checked).toBe(true);
    expect(inputs[2]!.checked).toBe(false);
  });

  it('uncontrolled: clicking another option moves the selection without consumer state', async () => {
    render(
      <RadioGroup defaultValue="a" aria-label="x">
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );
    await userEvent.click(screen.getByText('B'));
    const [a, b] = getInputs();
    expect(a!.checked).toBe(false);
    expect(b!.checked).toBe(true);
  });

  it('controlled: external state drives every child', async () => {
    function Controlled() {
      const [val, setVal] = useState('a');
      return (
        <>
          <RadioGroup value={val} onValueChange={setVal} aria-label="x">
            <Radio value="a">A</Radio>
            <Radio value="b">B</Radio>
          </RadioGroup>
          <button type="button" onClick={() => setVal('b')}>
            external set b
          </button>
        </>
      );
    }
    render(<Controlled />);
    expect(getInputs()[0]!.checked).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: 'external set b' }));
    expect(getInputs()[1]!.checked).toBe(true);
  });

  it('onValueChange fires with the new value when an option is picked', async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup onValueChange={onValueChange} aria-label="x">
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );
    await userEvent.click(screen.getByText('B'));
    expect(onValueChange).toHaveBeenCalledWith('b');
  });

  it("does NOT fire onValueChange for the already-selected option's click", async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup defaultValue="a" onValueChange={onValueChange} aria-label="x">
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );
    // Native radios don't fire change when the already-checked one is clicked.
    await userEvent.click(screen.getByText('A'));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe('RadioGroup — keyboard navigation (native)', () => {
  it('Tab focuses the first radio in the group', async () => {
    render(
      <>
        <button type="button">Before</button>
        <RadioGroup defaultValue="a" aria-label="x">
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      </>,
    );
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
    await userEvent.tab();
    // Native: only the currently-checked radio is in the tab order.
    expect(getInputs()[0]!).toHaveFocus();
  });

  it('Space selects a non-selected focused radio', async () => {
    render(
      <RadioGroup defaultValue="a" aria-label="x">
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );
    const inputs = getInputs();
    inputs[1]!.focus();
    await userEvent.keyboard(' ');
    expect(inputs[1]!.checked).toBe(true);
  });
});

describe('RadioGroup — form participation', () => {
  it('submits the selected value under the group `name`', () => {
    let captured: FormData | null = null;
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          captured = new FormData(e.currentTarget);
        }}
      >
        <RadioGroup name="size" defaultValue="m" aria-label="x">
          <Radio value="s">Small</Radio>
          <Radio value="m">Medium</Radio>
          <Radio value="l">Large</Radio>
        </RadioGroup>
        <button type="submit">Submit</button>
      </form>,
    );
    screen.getByRole('button', { name: 'Submit' }).click();
    expect(captured).not.toBeNull();
    expect(captured!.get('size')).toBe('m');
  });

  it('no selection → no value submitted under the group name', () => {
    let captured: FormData | null = null;
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          captured = new FormData(e.currentTarget);
        }}
      >
        <RadioGroup name="size" aria-label="x">
          <Radio value="s">Small</Radio>
          <Radio value="m">Medium</Radio>
        </RadioGroup>
        <button type="submit">Submit</button>
      </form>,
    );
    screen.getByRole('button', { name: 'Submit' }).click();
    expect(captured!.get('size')).toBeNull();
  });
});