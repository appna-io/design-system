import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Select } from '../src/Select';
import { renderWithTheme as render } from './utils';

/**
 * Tests for `<Select>`. Same `userEvent.setup() + waitFor` testing strategy Menu uses; the
 * shared keyboard hook lives at `_shared/useListKeyboard.ts` so Menu's exhaustive keyboard
 * coverage applies here transitively. The tests below focus on Select-specific behavior:
 *
 *  - The combobox ARIA pattern (`role="combobox"`, `aria-haspopup="listbox"`,
 *    `aria-activedescendant`).
 *  - Value selection lifecycle (Trigger label reflects selection, listbox closes on pick).
 *  - Form integration (hidden `<input type="hidden" name>`).
 *  - Form-control attribute bridging (`invalid` → `aria-invalid`, `required` → `aria-required`).
 *  - Variants / sizes / colors.
 *  - Controlled value + open state.
 */

function queryListbox(): HTMLElement | null {
  return screen.queryByRole('listbox');
}

function getListbox(): HTMLElement {
  return screen.getByRole('listbox');
}

function getTrigger(): HTMLElement {
  return screen.getByRole('combobox');
}

describe('Select — rendering', () => {
  it('renders the trigger and keeps the listbox absent until clicked', () => {
    render(
      <Select placeholder="Pick one">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">A</Select.Item>
        </Select.Content>
      </Select>,
    );
    expect(getTrigger()).toBeInTheDocument();
    expect(queryListbox()).toBeNull();
  });

  it('wires combobox ARIA: role, aria-haspopup, aria-expanded, aria-controls', async () => {
    const user = userEvent.setup();
    render(
      <Select placeholder="Pick">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">A</Select.Item>
        </Select.Content>
      </Select>,
    );
    const trigger = getTrigger();
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-controls');

    await user.click(trigger);
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', getListbox().id);
    expect(getListbox()).toHaveAttribute('aria-labelledby', trigger.id);
  });

  it('renders the placeholder when no value', () => {
    render(
      <Select placeholder="Select a country">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="fr">France</Select.Item>
        </Select.Content>
      </Select>,
    );
    expect(getTrigger()).toHaveTextContent('Select a country');
    expect(getTrigger()).toHaveAttribute('data-placeholder', 'true');
  });

  it('renders the selected item label when a value is set', () => {
    render(
      <Select defaultValue="fr">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="fr">France</Select.Item>
          <Select.Item value="de">Germany</Select.Item>
        </Select.Content>
      </Select>,
    );
    expect(getTrigger()).toHaveTextContent('France');
    expect(getTrigger()).not.toHaveAttribute('data-placeholder');
  });

  it('renders Groups, Labels, Separators with correct roles', async () => {
    render(
      <Select defaultOpen placeholder="Pick">
        <Select.Trigger />
        <Select.Content>
          <Select.Group>
            <Select.Label>Europe</Select.Label>
            <Select.Item value="fr">France</Select.Item>
          </Select.Group>
          <Select.Separator />
          <Select.Group>
            <Select.Label>Asia</Select.Label>
            <Select.Item value="jp">Japan</Select.Item>
          </Select.Group>
        </Select.Content>
      </Select>,
    );
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getAllByRole('group')).toHaveLength(2);
  });
});

describe('Select — selection', () => {
  it('clicking an item selects it, closes the listbox, and updates the trigger label', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select placeholder="Pick" onValueChange={onValueChange}>
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">Apple</Select.Item>
          <Select.Item value="b">Banana</Select.Item>
        </Select.Content>
      </Select>,
    );
    await user.click(getTrigger());
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());

    await user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(onValueChange).toHaveBeenLastCalledWith('b');
    await waitFor(() => expect(queryListbox()).toBeNull(), { timeout: 2000 });
    expect(getTrigger()).toHaveTextContent('Banana');
  });

  it('selecting via Enter from keyboard nav commits + closes', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select placeholder="Pick" onValueChange={onValueChange}>
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">Apple</Select.Item>
          <Select.Item value="b">Banana</Select.Item>
        </Select.Content>
      </Select>,
    );
    const trigger = getTrigger();
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    // ArrowDown opens and seeds highlight on first enabled item (Apple). Press Enter to commit.
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith('a');
    await waitFor(() => expect(queryListbox()).toBeNull(), { timeout: 2000 });
  });

  it('disabled items are not selectable via click', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select defaultOpen placeholder="Pick" onValueChange={onValueChange}>
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">A</Select.Item>
          <Select.Item value="b" disabled>
            B
          </Select.Item>
        </Select.Content>
      </Select>,
    );
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    await user.click(screen.getByRole('option', { name: 'B' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('selected item carries aria-selected="true" and data-selected="true"', async () => {
    render(
      <Select defaultOpen defaultValue="a">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">A</Select.Item>
          <Select.Item value="b">B</Select.Item>
        </Select.Content>
      </Select>,
    );
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    const a = screen.getByRole('option', { name: 'A' });
    const b = screen.getByRole('option', { name: 'B' });
    expect(a).toHaveAttribute('aria-selected', 'true');
    expect(a).toHaveAttribute('data-selected', 'true');
    expect(b).toHaveAttribute('aria-selected', 'false');
    expect(b).not.toHaveAttribute('data-selected');
  });
});

describe('Select — close behavior', () => {
  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(
      <Select defaultOpen placeholder="Pick">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">A</Select.Item>
        </Select.Content>
      </Select>,
    );
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(queryListbox()).toBeNull(), { timeout: 2000 });
  });

  it('closes on outside pointerdown', async () => {
    render(
      <div>
        <Select defaultOpen placeholder="Pick">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="a">A</Select.Item>
          </Select.Content>
        </Select>
        <button data-testid="outside">outside</button>
      </div>,
    );
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    fireEvent.pointerDown(screen.getByTestId('outside'));
    await waitFor(() => expect(queryListbox()).toBeNull(), { timeout: 2000 });
  });

  it('Tab closes the listbox', async () => {
    const user = userEvent.setup();
    render(
      <Select defaultOpen placeholder="Pick">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">A</Select.Item>
        </Select.Content>
      </Select>,
    );
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    await user.keyboard('{Tab}');
    await waitFor(() => expect(queryListbox()).toBeNull(), { timeout: 2000 });
  });
});

describe('Select — keyboard navigation', () => {
  function ThreeFruits(): ReactElement {
    return (
      <Select defaultOpen placeholder="Pick a fruit">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="banana">Banana</Select.Item>
          <Select.Item value="cherry">Cherry</Select.Item>
        </Select.Content>
      </Select>
    );
  }

  it('ArrowDown highlights the next enabled item', async () => {
    const user = userEvent.setup();
    render(<ThreeFruits />);
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    await user.keyboard('{ArrowDown}');
    // Highlight is seeded on open; first arrow press advances from the first item to the next.
    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute(
        'data-highlighted',
        'true',
      ),
    );
  });

  it('type-ahead jumps to matching item', async () => {
    const user = userEvent.setup();
    render(<ThreeFruits />);
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    await user.keyboard('c');
    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute(
        'data-highlighted',
        'true',
      ),
    );
  });

  it('aria-activedescendant updates as highlight moves', async () => {
    const user = userEvent.setup();
    render(<ThreeFruits />);
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    const listbox = getListbox();
    await user.keyboard('{End}');
    await waitFor(() => {
      const id = listbox.getAttribute('aria-activedescendant');
      expect(id).toBeTruthy();
      expect(screen.getByRole('option', { name: 'Cherry' }).id).toBe(id);
    });
  });
});

describe('Select — form integration', () => {
  it('renders a hidden input with the name + value', () => {
    const { container } = render(
      <Select name="country" defaultValue="fr">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="fr">France</Select.Item>
        </Select.Content>
      </Select>,
    );
    const hidden = container.querySelector('input[type="hidden"]');
    expect(hidden).toBeInTheDocument();
    expect(hidden).toHaveAttribute('name', 'country');
    expect(hidden).toHaveAttribute('value', 'fr');
  });

  it('does not render the hidden input when name is omitted', () => {
    const { container } = render(
      <Select defaultValue="fr">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="fr">France</Select.Item>
        </Select.Content>
      </Select>,
    );
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
  });

  it('updates hidden input value when the selection changes', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Select name="fruit" placeholder="Pick">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">Apple</Select.Item>
          <Select.Item value="b">Banana</Select.Item>
        </Select.Content>
      </Select>,
    );
    await user.click(getTrigger());
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    await user.click(screen.getByRole('option', { name: 'Banana' }));
    await waitFor(() => {
      const hidden = container.querySelector('input[type="hidden"]');
      expect(hidden).toHaveAttribute('value', 'b');
    });
  });
});

describe('Select — form-control attributes', () => {
  it('invalid → aria-invalid="true" on the trigger', () => {
    render(
      <Select invalid placeholder="Pick">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">A</Select.Item>
        </Select.Content>
      </Select>,
    );
    expect(getTrigger()).toHaveAttribute('aria-invalid', 'true');
    expect(getTrigger()).toHaveAttribute('data-invalid', 'true');
  });

  it('required → aria-required="true" on the trigger', () => {
    render(
      <Select required placeholder="Pick">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">A</Select.Item>
        </Select.Content>
      </Select>,
    );
    expect(getTrigger()).toHaveAttribute('aria-required', 'true');
  });

  it('disabled → trigger gets disabled attribute + does not open on click', async () => {
    const user = userEvent.setup();
    render(
      <Select disabled placeholder="Pick">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">A</Select.Item>
        </Select.Content>
      </Select>,
    );
    expect(getTrigger()).toBeDisabled();
    await user.click(getTrigger());
    // Disabled buttons don't fire onClick — listbox should never appear.
    expect(queryListbox()).toBeNull();
  });
});

describe('Select — controlled', () => {
  it('controlled value updates on selection callback', async () => {
    const user = userEvent.setup();
    function Controlled(): ReactElement {
      const [value, setValue] = useState('');
      return (
        <Select value={value} onValueChange={setValue} placeholder="Pick">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="a">A</Select.Item>
            <Select.Item value="b">B</Select.Item>
          </Select.Content>
        </Select>
      );
    }
    render(<Controlled />);
    await user.click(getTrigger());
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    await user.click(screen.getByRole('option', { name: 'B' }));
    await waitFor(() => expect(getTrigger()).toHaveTextContent('B'));
  });

  it('controlled open prop wins over click', async () => {
    const user = userEvent.setup();
    function PinnedOpen(): ReactElement {
      const [open] = useState(true);
      return (
        <Select open={open} placeholder="Pick">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="a">A</Select.Item>
          </Select.Content>
        </Select>
      );
    }
    render(<PinnedOpen />);
    await waitFor(() => expect(queryListbox()).toBeInTheDocument());
    // Esc should fire the close callback but the controlled `open` prop pins it open.
    await user.keyboard('{Escape}');
    // Stays open because the controller doesn't toggle it.
    expect(queryListbox()).toBeInTheDocument();
  });
});

describe('Select — variants and sizes', () => {
  it('size="sm" trigger has h-8 (matches Input height)', () => {
    render(
      <Select size="sm" placeholder="Pick">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">A</Select.Item>
        </Select.Content>
      </Select>,
    );
    expect(getTrigger().className).toContain('h-8');
  });

  it('size="md" trigger has h-10', () => {
    render(
      <Select size="md" placeholder="Pick">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">A</Select.Item>
        </Select.Content>
      </Select>,
    );
    expect(getTrigger().className).toContain('h-10');
  });

  it('size="lg" trigger has h-12', () => {
    render(
      <Select size="lg" placeholder="Pick">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">A</Select.Item>
        </Select.Content>
      </Select>,
    );
    expect(getTrigger().className).toContain('h-12');
  });

  it('variant="underline" strips border-radius via compound rule', () => {
    render(
      <Select variant="underline" placeholder="Pick">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a">A</Select.Item>
        </Select.Content>
      </Select>,
    );
    expect(getTrigger().className).toContain('rounded-none');
  });
});