import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Combobox } from '../src/Combobox';
import { renderWithTheme as render } from './utils';

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'durian', label: 'Durian' },
];

/** Trigger lookup: the input itself is the combobox role-bearer. */
function getInput(): HTMLInputElement {
  return screen.getByRole('combobox') as HTMLInputElement;
}

function queryListbox(): HTMLElement | null {
  return screen.queryByRole('listbox');
}

describe('Combobox — rendering', () => {
  it('renders the input as role=combobox + listbox hidden until opened', () => {
    render(<Combobox options={FRUITS} placeholder="Pick" aria-label="Fruit" />);
    const input = getInput();
    expect(input).toHaveAttribute('role', 'combobox');
    expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).not.toHaveAttribute('aria-controls');
  });

  it('opens the listbox on ArrowDown', async () => {
    const user = userEvent.setup();
    render(<Combobox options={FRUITS} placeholder="Pick" aria-label="Fruit" />);
    const input = getInput();
    input.focus();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-controls', queryListbox()!.id);
  });

  it('renders all options when input is empty', async () => {
    const user = userEvent.setup();
    render(<Combobox options={FRUITS} placeholder="Pick" aria-label="Fruit" />);
    await user.click(getInput());
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });
});

describe('Combobox — filtering', () => {
  it('substring (default) filters options as user types', async () => {
    const user = userEvent.setup();
    render(<Combobox options={FRUITS} placeholder="Pick" aria-label="Fruit" />);
    const input = getInput();
    await user.click(input);
    await user.type(input, 'an');
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options.map((o) => o.textContent)).toEqual(['Banana', 'Durian']);
    });
  });

  it('startsWith matches only label prefixes', async () => {
    const user = userEvent.setup();
    render(
      <Combobox options={FRUITS} matchStrategy="startsWith" placeholder="Pick" aria-label="Fruit" />,
    );
    const input = getInput();
    await user.click(input);
    await user.type(input, 'a');
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options.map((o) => o.textContent)).toEqual(['Apple']);
    });
  });

  it('custom filterOption wins over matchStrategy', async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        options={FRUITS}
        placeholder="Pick"
        aria-label="Fruit"
        filterOption={(opt, query) => opt.label.length === query.length}
      />,
    );
    const input = getInput();
    await user.click(input);
    await user.type(input, 'xxxxx'); // 5 chars → only Apple (5) matches
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options.map((o) => o.textContent)).toEqual(['Apple']);
    });
  });

  it('renders "no results" when nothing matches', async () => {
    const user = userEvent.setup();
    render(<Combobox options={FRUITS} placeholder="Pick" aria-label="Fruit" />);
    const input = getInput();
    await user.click(input);
    await user.type(input, 'zzz');
    await waitFor(() => {
      expect(screen.queryByText(/No results/i)).toBeInTheDocument();
    });
  });
});

describe('Combobox — selection (single)', () => {
  it('clicking an option commits the value + closes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Combobox options={FRUITS} placeholder="Pick" aria-label="Fruit" onChange={onChange} />,
    );
    const input = getInput();
    await user.click(input);
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    await user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(onChange).toHaveBeenLastCalledWith('banana');
    await waitFor(() => expect(queryListbox()).toBeNull(), { timeout: 2000 });
    expect(input).toHaveValue('Banana');
  });

  it('Enter commits the highlighted item from keyboard', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Combobox options={FRUITS} placeholder="Pick" aria-label="Fruit" onChange={onChange} />,
    );
    const input = getInput();
    input.focus();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('banana');
  });

  it('Escape closes without selecting', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Combobox options={FRUITS} placeholder="Pick" aria-label="Fruit" onChange={onChange} />,
    );
    const input = getInput();
    input.focus();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(queryListbox()).toBeNull(), { timeout: 2000 });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clear button resets value', async () => {
    const user = userEvent.setup();
    function Controlled(): ReactElement {
      const [v, setV] = useState<string | null>('apple');
      return (
        <Combobox
          options={FRUITS}
          placeholder="Pick"
          aria-label="Fruit"
          value={v}
          onChange={setV}
          defaultInputValue="Apple"
        />
      );
    }
    render(<Controlled />);
    const clearBtn = screen.getByRole('button', { name: /clear selection/i });
    await user.click(clearBtn);
    expect(getInput()).toHaveValue('');
  });
});

describe('Combobox — keyboard nav', () => {
  it('ArrowDown / ArrowUp move highlight', async () => {
    const user = userEvent.setup();
    render(<Combobox options={FRUITS} placeholder="Pick" aria-label="Fruit" defaultOpen />);
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    const input = getInput();
    input.focus();
    await user.keyboard('{ArrowDown}'); // from Apple (seeded) → Banana
    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute(
        'data-highlighted',
        'true',
      ),
    );
    await user.keyboard('{ArrowUp}');
    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute(
        'data-highlighted',
        'true',
      ),
    );
  });

  it('Home / End jump to first / last enabled', async () => {
    const user = userEvent.setup();
    render(<Combobox options={FRUITS} placeholder="Pick" aria-label="Fruit" defaultOpen />);
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    const input = getInput();
    input.focus();
    await user.keyboard('{End}');
    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Durian' })).toHaveAttribute(
        'data-highlighted',
        'true',
      ),
    );
    await user.keyboard('{Home}');
    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute(
        'data-highlighted',
        'true',
      ),
    );
  });

  it('aria-activedescendant on the input tracks the highlight', async () => {
    const user = userEvent.setup();
    render(<Combobox options={FRUITS} placeholder="Pick" aria-label="Fruit" defaultOpen />);
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    const input = getInput();
    input.focus();
    await user.keyboard('{End}');
    await waitFor(() => {
      const id = input.getAttribute('aria-activedescendant');
      expect(id).toBeTruthy();
      expect(screen.getByRole('option', { name: 'Durian' }).id).toBe(id);
    });
  });
});

describe('Combobox — creatable', () => {
  it('shows + Create row when query has no match', async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        options={FRUITS}
        placeholder="Pick"
        aria-label="Fruit"
        creatable
        onCreateOption={(label) => ({ value: label.toLowerCase(), label })}
      />,
    );
    const input = getInput();
    await user.click(input);
    await user.type(input, 'Mango');
    await waitFor(() => {
      expect(screen.getByText(/Create "Mango"/)).toBeInTheDocument();
    });
  });

  it('Enter on the Create row calls onCreateOption + commits', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn((label: string) => ({ value: label.toLowerCase(), label }));
    const onChange = vi.fn();
    render(
      <Combobox
        options={FRUITS}
        placeholder="Pick"
        aria-label="Fruit"
        creatable
        onCreateOption={onCreate}
        onChange={onChange}
      />,
    );
    const input = getInput();
    await user.click(input);
    await user.type(input, 'Mango');
    // No matching options, just the create row; ArrowDown seeds highlight to the create row.
    await waitFor(() => expect(screen.getByText(/Create "Mango"/)).toBeInTheDocument());
    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith('Mango');
      expect(onChange).toHaveBeenCalledWith('mango');
    });
  });
});

describe('Combobox — form integration', () => {
  it('emits hidden input with selected value when name is set', () => {
    const { container } = render(
      <Combobox
        options={FRUITS}
        placeholder="Pick"
        aria-label="Fruit"
        name="fruit"
        defaultValue="apple"
      />,
    );
    const hidden = container.querySelector('input[type="hidden"]');
    expect(hidden).toBeInTheDocument();
    expect(hidden).toHaveAttribute('name', 'fruit');
    expect(hidden).toHaveAttribute('value', 'apple');
  });

  it('skips the hidden input when no name', () => {
    const { container } = render(
      <Combobox options={FRUITS} placeholder="Pick" aria-label="Fruit" defaultValue="apple" />,
    );
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
  });
});

describe('Combobox — close behavior', () => {
  it('closes on outside pointerdown', async () => {
    render(
      <div>
        <Combobox options={FRUITS} placeholder="Pick" aria-label="Fruit" defaultOpen />
        <button data-testid="outside">outside</button>
      </div>,
    );
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    fireEvent.pointerDown(screen.getByTestId('outside'));
    await waitFor(() => expect(queryListbox()).toBeNull(), { timeout: 2000 });
  });

  it('Tab closes the listbox', async () => {
    const user = userEvent.setup();
    render(<Combobox options={FRUITS} placeholder="Pick" aria-label="Fruit" defaultOpen />);
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    const input = getInput();
    input.focus();
    await user.keyboard('{Tab}');
    await waitFor(() => expect(queryListbox()).toBeNull(), { timeout: 2000 });
  });
});

describe('Combobox — variants + sizes', () => {
  it('size="sm" wrapper has min-h-8', () => {
    const { container } = render(
      <Combobox options={FRUITS} size="sm" aria-label="Fruit" placeholder="Pick" />,
    );
    const wrapper = container.querySelector('[data-disabled],[data-invalid],div');
    expect(wrapper?.className).toContain('min-h-8');
  });

  it('size="lg" wrapper has min-h-12', () => {
    const { container } = render(
      <Combobox options={FRUITS} size="lg" aria-label="Fruit" placeholder="Pick" />,
    );
    const wrapper = container.querySelector('div');
    expect(wrapper?.className).toContain('min-h-12');
  });

  it('variant="underline" wrapper drops corner radius', () => {
    const { container } = render(
      <Combobox options={FRUITS} variant="underline" aria-label="Fruit" placeholder="Pick" />,
    );
    const wrapper = container.querySelector('div');
    expect(wrapper?.className).toContain('rounded-none');
  });

  it('invalid → input has aria-invalid="true"', () => {
    render(<Combobox options={FRUITS} invalid aria-label="Fruit" placeholder="Pick" />);
    expect(getInput()).toHaveAttribute('aria-invalid', 'true');
  });

  it('required → input has aria-required="true"', () => {
    render(<Combobox options={FRUITS} required aria-label="Fruit" placeholder="Pick" />);
    expect(getInput()).toHaveAttribute('aria-required', 'true');
  });
});
