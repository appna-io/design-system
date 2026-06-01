import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CommandPalette } from '../src/CommandPalette/CommandPalette';
import { Kbd } from '../src/CommandPalette/Kbd';
import { commands, type Command } from '../src/CommandPalette/headless/commandStore';
import type {
  CommandPaletteColor,
  CommandPalettePage,
  CommandPaletteProps,
  CommandPaletteSize,
  CommandPaletteVariant,
} from '../src/CommandPalette/CommandPalette.types';

import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const SAMPLE: Command[] = [
  { id: 'a', label: 'Alpha', shortcut: '⌘A', category: 'Letters', onSelect: () => undefined },
  { id: 'b', label: 'Beta', shortcut: '⌘B', category: 'Letters', onSelect: () => undefined },
  { id: 'c', label: 'Cherry', category: 'Fruit', onSelect: () => undefined },
  { id: 'd', label: 'Disabled', disabled: true, onSelect: () => undefined },
];

function Harness(props: Omit<CommandPaletteProps, 'open' | 'onOpenChange'>): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" data-testid="trigger" onClick={() => setOpen(true)}>
        Open
      </button>
      <CommandPalette open={open} onOpenChange={setOpen} disableGlobalHotkey {...props} />
    </>
  );
}

async function openHarness(props: Omit<CommandPaletteProps, 'open' | 'onOpenChange'>): Promise<HTMLElement> {
  const user = userEvent.setup();
  const { container } = render(<Harness {...props} />);
  await user.click(screen.getByTestId('trigger'));
  await screen.findByRole('dialog');
  await waitFor(() => expect(screen.getByRole('combobox')).toHaveFocus());
  return container;
}

beforeEach(() => commands.__reset());
afterEach(() => commands.__reset());

describe('CommandPalette — ARIA pattern', () => {
  it('dialog + combobox + listbox + option roles are wired correctly', async () => {
    await openHarness({ commands: SAMPLE });
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label');

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input.getAttribute('aria-controls')).toBe(screen.getByRole('listbox').id);
    const active = input.getAttribute('aria-activedescendant');
    expect(active).toBeTruthy();

    const options = screen.getAllByRole('option');
    options.forEach((opt) => {
      expect(opt).toHaveAttribute('aria-selected');
      expect(opt).toHaveAttribute('tabindex', '-1');
    });

    // The active descendant points to one of the rendered option ids.
    expect(options.map((o) => o.id)).toContain(active);
  });

  it('disabled commands carry aria-disabled', async () => {
    await openHarness({ commands: SAMPLE });
    const disabled = screen.getByRole('option', { name: /disabled/i });
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
  });

  it('category headers are role=presentation (not announced as headings)', async () => {
    await openHarness({ commands: SAMPLE });
    // Category text is rendered without an option/heading role.
    const letters = screen.getByText('Letters');
    expect(letters.getAttribute('role')).toBe('presentation');
  });
});

describe('CommandPalette — axe', () => {
  const variants: CommandPaletteVariant[] = ['solid', 'soft', 'minimal'];
  const sizes: CommandPaletteSize[] = ['sm', 'md', 'lg'];
  const colors: CommandPaletteColor[] = ['primary', 'neutral', 'danger'];

  for (const variant of variants) {
    it(`has no violations: variant="${variant}"`, async () => {
      const container = await openHarness({ commands: SAMPLE, variant });
      const result = await axe(container);
      expect(result).toHaveNoViolations();
    });
  }

  for (const size of sizes) {
    it(`has no violations: size="${size}"`, async () => {
      const container = await openHarness({ commands: SAMPLE, size });
      const result = await axe(container);
      expect(result).toHaveNoViolations();
    });
  }

  for (const color of colors) {
    it(`has no violations: color="${color}"`, async () => {
      const container = await openHarness({ commands: SAMPLE, color });
      const result = await axe(container);
      expect(result).toHaveNoViolations();
    });
  }

  it('has no violations on a sub-page', async () => {
    const pages: Record<string, CommandPalettePage> = {
      theme: {
        title: 'Change Theme',
        commands: [
          { id: 'l', label: 'Light', onSelect: () => undefined },
          { id: 'd', label: 'Dark', onSelect: () => undefined },
        ],
      },
    };
    const cmds: Command[] = [
      { id: 'theme', label: 'Theme', onSelect: ({ palette: p }) => p.pushPage('theme') },
    ];
    const user = userEvent.setup();
    const { container } = render(<Harness commands={cmds} pages={pages} />);
    await user.click(screen.getByTestId('trigger'));
    await screen.findByRole('dialog');
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveFocus());
    await user.click(screen.getByRole('option', { name: /theme/i }));
    await screen.findByText('Change Theme');
    const result = await axe(container);
    expect(result).toHaveNoViolations();
  });

  it('has no violations on empty state', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness commands={SAMPLE} />);
    await user.click(screen.getByTestId('trigger'));
    await screen.findByRole('dialog');
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveFocus());
    await user.type(screen.getByRole('combobox'), 'zzzz');
    await waitFor(() => expect(screen.queryAllByRole('option')).toHaveLength(0));
    const result = await axe(container);
    expect(result).toHaveNoViolations();
  });
});

describe('Kbd — accessibility', () => {
  it('renders as a semantic <kbd> element', () => {
    render(<Kbd>K</Kbd>);
    const kbd = document.querySelector('kbd');
    expect(kbd).toBeTruthy();
    expect(kbd?.textContent).toBe('K');
  });

  it('renders each key in a multi-key form as its own <kbd>', () => {
    render(<Kbd keys={['Ctrl', 'Shift', 'P']} />);
    const kbds = document.querySelectorAll('kbd');
    expect(kbds).toHaveLength(3);
  });

  it('translates "cmd" via macKey when platform=mac', () => {
    render(<Kbd platform="mac">cmd</Kbd>);
    expect(document.querySelector('kbd')?.textContent).toBe('⌘');
  });

  it('translates "cmd" to "Ctrl" when platform=win', () => {
    render(<Kbd platform="win">cmd</Kbd>);
    expect(document.querySelector('kbd')?.textContent).toBe('Ctrl');
  });

  it('has no axe violations in solid/outline/soft variants', async () => {
    const { container } = render(
      <div>
        <Kbd>K</Kbd>
        <Kbd variant="outline">K</Kbd>
        <Kbd variant="soft">K</Kbd>
        <Kbd size="sm">⌘</Kbd>
        <Kbd size="lg">⌘</Kbd>
        <Kbd keys={['Cmd', 'K']} platform="mac" />
      </div>,
    );
    const result = await axe(container);
    expect(result).toHaveNoViolations();
  });
});