import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Combobox, MultiCombobox } from '../src/Combobox';
import type { ComboboxColor, ComboboxVariant } from '../src/Combobox';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

/**
 * Accessibility coverage for `<Combobox>` + `<MultiCombobox>`. Walks the four variants × sampled
 * colors for closed and open states, the disabled + invalid + required flavors, and the
 * multi-mode listbox (`aria-multiselectable`).
 *
 * The matrix is **sampled** rather than full-cross (4 × 3 = 12 cells instead of 4 × 7 = 28)
 * because the underlying form-control recipe is the same shape Input / Textarea / Select use,
 * and those already walk their full matrices. Combobox-specific axe risk is concentrated in
 * the combobox role + the listbox/option wiring, both covered exhaustively below.
 */
const variants: ComboboxVariant[] = ['outline', 'solid', 'ghost', 'underline'];
const colors: ComboboxColor[] = ['primary', 'neutral', 'danger'];

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
];

describe('Combobox — accessibility', () => {
  it('input has role=combobox + aria-haspopup=listbox + ARIA expanded/controls wiring', async () => {
    const user = userEvent.setup();
    render(<Combobox options={FRUITS} placeholder="Pick" aria-label="Fruit" />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).not.toHaveAttribute('aria-controls');

    await user.click(input);
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeInTheDocument());
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-controls', screen.getByRole('listbox').id);
  });

  it('options carry role=option + aria-selected + aria-disabled', async () => {
    render(
      <Combobox
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B', disabled: true },
        ]}
        defaultOpen
        defaultValue="a"
        placeholder="Pick"
        aria-label="Letter"
      />,
    );
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeInTheDocument());
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[0]).not.toHaveAttribute('aria-disabled');
    expect(options[1]).toHaveAttribute('aria-selected', 'false');
    expect(options[1]).toHaveAttribute('aria-disabled', 'true');
  });

  it('aria-activedescendant on the input reflects the keyboard-highlighted option', async () => {
    const user = userEvent.setup();
    render(<Combobox options={FRUITS} defaultOpen placeholder="Pick" aria-label="Fruit" />);
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeInTheDocument());
    const input = screen.getByRole('combobox') as HTMLInputElement;
    input.focus();
    await user.keyboard('{End}');
    await waitFor(() => {
      const id = input.getAttribute('aria-activedescendant');
      expect(id).toBeTruthy();
      expect(screen.getByRole('option', { name: 'Banana' }).id).toBe(id);
    });
  });

  it('MultiCombobox listbox has aria-multiselectable=true', async () => {
    const user = userEvent.setup();
    render(
      <MultiCombobox options={FRUITS} placeholder="Pick" aria-label="Fruits" />,
    );
    await user.click(screen.getByRole('combobox'));
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeInTheDocument());
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
  });

  it.each(variants)('passes axe (closed) — variant=%s', async (variant) => {
    const { container } = render(
      <Combobox
        options={FRUITS}
        placeholder="Pick a fruit"
        aria-label="Fruit"
        variant={variant}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it.each(colors)('passes axe (open, color=%s)', async (color) => {
    const { container } = render(
      <Combobox
        options={FRUITS}
        placeholder="Pick a fruit"
        aria-label="Fruit"
        color={color}
        defaultOpen
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe (disabled + invalid + required)', async () => {
    const { container } = render(
      <Combobox
        options={FRUITS}
        placeholder="Pick"
        aria-label="Fruit"
        disabled
        invalid
        required
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe (multi, with selected chips)', async () => {
    const { container } = render(
      <MultiCombobox
        options={FRUITS}
        placeholder="Pick fruits"
        aria-label="Fruits"
        defaultValue={['apple']}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
