import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MultiCombobox } from '../src/Combobox';
import { renderWithTheme as render } from './utils';

const FRAMEWORKS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'SolidJS' },
];

function getInput(): HTMLInputElement {
  return screen.getByRole('combobox') as HTMLInputElement;
}
function queryListbox(): HTMLElement | null {
  return screen.queryByRole('listbox');
}

describe('MultiCombobox — rendering', () => {
  it('listbox carries aria-multiselectable="true"', async () => {
    const user = userEvent.setup();
    render(
      <MultiCombobox options={FRAMEWORKS} placeholder="Pick" aria-label="Frameworks" />,
    );
    await user.click(getInput());
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    expect(queryListbox()).toHaveAttribute('aria-multiselectable', 'true');
  });

  it('renders initial selected values as removable badge chips', () => {
    render(
      <MultiCombobox
        options={FRAMEWORKS}
        placeholder="Pick"
        aria-label="Frameworks"
        defaultValue={['react', 'svelte']}
      />,
    );
    // The chips and the (always-mounted but hidden) listbox options both contain the label
    // strings, so the most precise probe is the per-chip remove button — its aria-label is
    // unique to the chip surface.
    expect(screen.getByRole('button', { name: /remove react/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove svelte/i })).toBeInTheDocument();
  });
});

describe('MultiCombobox — selection', () => {
  it('clicking an option toggles it into the value list (stays open)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiCombobox
        options={FRAMEWORKS}
        placeholder="Pick"
        aria-label="Frameworks"
        onChange={onChange}
      />,
    );
    await user.click(getInput());
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    await user.click(screen.getByRole('option', { name: 'Vue' }));
    expect(onChange).toHaveBeenLastCalledWith(['vue']);
    // Multi mode default: closeOnSelect=false → stays open.
    expect(queryListbox()).toBeInTheDocument();
  });

  it('clicking the same option twice removes it', async () => {
    const user = userEvent.setup();
    function Controlled(): ReactElement {
      const [v, setV] = useState<string[]>([]);
      return (
        <MultiCombobox
          options={FRAMEWORKS}
          placeholder="Pick"
          aria-label="Frameworks"
          value={v}
          onChange={setV}
        />
      );
    }
    render(<Controlled />);
    await user.click(getInput());
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    await user.click(screen.getByRole('option', { name: 'Vue' }));
    // Chip appears — probe via the unique remove-button aria-label.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /remove vue/i })).toBeInTheDocument(),
    );
    await user.click(screen.getByRole('option', { name: 'Vue' }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /remove vue/i })).toBeNull(),
    );
  });

  it('Backspace on empty input removes last chip', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiCombobox
        options={FRAMEWORKS}
        placeholder="Pick"
        aria-label="Frameworks"
        defaultValue={['react', 'vue']}
        onChange={onChange}
      />,
    );
    const input = getInput();
    input.focus();
    await user.keyboard('{Backspace}');
    expect(onChange).toHaveBeenLastCalledWith(['react']);
  });

  it('clicking a chip remove button removes that chip', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiCombobox
        options={FRAMEWORKS}
        placeholder="Pick"
        aria-label="Frameworks"
        defaultValue={['react', 'vue']}
        onChange={onChange}
      />,
    );
    const removeReact = screen.getByRole('button', { name: /remove react/i });
    await user.click(removeReact);
    expect(onChange).toHaveBeenLastCalledWith(['vue']);
  });

  it('maxSelections caps additions', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiCombobox
        options={FRAMEWORKS}
        placeholder="Pick"
        aria-label="Frameworks"
        maxSelections={1}
        defaultValue={['react']}
        onChange={onChange}
      />,
    );
    await user.click(getInput());
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    await user.click(screen.getByRole('option', { name: 'Vue' }));
    // Already at max; addition is a no-op.
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('MultiCombobox — creatable', () => {
  it('Enter on create row adds the new value to the selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiCombobox
        options={FRAMEWORKS}
        placeholder="Pick"
        aria-label="Frameworks"
        creatable
        onCreateOption={(label) => ({ value: label.toLowerCase(), label })}
        onChange={onChange}
      />,
    );
    const input = getInput();
    await user.click(input);
    await user.type(input, 'Qwik');
    await waitFor(() => expect(screen.getByText(/Create "Qwik"/)).toBeInTheDocument());
    await user.keyboard('{Enter}');
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['qwik']));
  });
});

describe('MultiCombobox — form integration', () => {
  it('emits one hidden input per selected value', () => {
    const { container } = render(
      <MultiCombobox
        options={FRAMEWORKS}
        placeholder="Pick"
        aria-label="Frameworks"
        name="frameworks"
        defaultValue={['react', 'svelte']}
      />,
    );
    const hiddens = container.querySelectorAll('input[type="hidden"][name="frameworks"]');
    expect(hiddens).toHaveLength(2);
    expect(Array.from(hiddens).map((n) => (n as HTMLInputElement).value).sort()).toEqual([
      'react',
      'svelte',
    ]);
  });
});