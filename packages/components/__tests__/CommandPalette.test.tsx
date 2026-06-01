import { fireEvent, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CommandPalette } from '../src/CommandPalette/CommandPalette';
import { commands, palette, type Command } from '../src/CommandPalette/headless/commandStore';
import { useRegisterCommand } from '../src/CommandPalette/headless/useRegisterCommand';
import type { CommandPalettePage, CommandPaletteProps } from '../src/CommandPalette/CommandPalette.types';

import { renderWithTheme as render } from './utils';

const SAMPLE: Command[] = [
  { id: 'new-doc', label: 'New Document', shortcut: '⌘N', category: 'File', onSelect: () => undefined },
  { id: 'open', label: 'Open File', shortcut: '⌘O', category: 'File', keywords: ['load'], onSelect: () => undefined },
  { id: 'save', label: 'Save', shortcut: '⌘S', category: 'File', onSelect: () => undefined },
  { id: 'close', label: 'Close Window', category: 'View', onSelect: () => undefined },
  { id: 'theme', label: 'Toggle Theme', onSelect: () => undefined },
];

function getInput(): HTMLInputElement {
  return screen.getByRole('combobox') as HTMLInputElement;
}

/**
 * Render the palette behind a trigger button. `defaultOpen` doesn't reliably trigger Modal's
 * focus-trap activation in jsdom (the initial-mount + AnimatePresence handshake races); using
 * an open-via-click pattern matches Modal's own test setup and works deterministically.
 */
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

async function renderOpen(props: Omit<CommandPaletteProps, 'open' | 'onOpenChange'>): Promise<void> {
  const user = userEvent.setup();
  render(<Harness {...props} />);
  await user.click(screen.getByTestId('trigger'));
  await screen.findByRole('dialog');
  await waitFor(() => expect(getInput()).toHaveFocus());
}

beforeEach(() => {
  commands.__reset();
});

afterEach(() => {
  commands.__reset();
});

describe('CommandPalette — rendering', () => {
  it('does not render the dialog when closed', () => {
    render(<CommandPalette commands={SAMPLE} disableGlobalHotkey />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('opens and renders dialog/input/listbox', async () => {
    await renderOpen({ commands: SAMPLE });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(getInput()).toBeInTheDocument();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('renders one option per command (default + category-grouped)', async () => {
    await renderOpen({ commands: SAMPLE });
    expect(screen.getAllByRole('option')).toHaveLength(5);
  });

  it('focuses the input when the palette opens', async () => {
    await renderOpen({ commands: SAMPLE });
    expect(getInput()).toHaveFocus();
  });
});

describe('CommandPalette — ARIA wiring', () => {
  it('input has combobox + listbox controls + activedescendant', async () => {
    await renderOpen({ commands: SAMPLE });
    const input = getInput();
    expect(input).toHaveAttribute('role', 'combobox');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input.getAttribute('aria-controls')).toBe(screen.getByRole('listbox').id);
    expect(input.getAttribute('aria-activedescendant')).toBeTruthy();
  });

  it('dialog uses translations.paletteLabel by default', async () => {
    await renderOpen({ commands: SAMPLE });
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Command palette');
  });

  it('respects ariaLabel override', async () => {
    await renderOpen({ commands: SAMPLE, ariaLabel: 'Quick switcher' });
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Quick switcher');
  });
});

describe('CommandPalette — filtering', () => {
  it('substring filter narrows the visible options', async () => {
    const user = userEvent.setup();
    await renderOpen({ commands: SAMPLE });
    await user.type(getInput(), 'sav');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
    expect(screen.getByRole('option')).toHaveTextContent('Save');
  });

  it('matches keywords by default', async () => {
    const user = userEvent.setup();
    await renderOpen({ commands: SAMPLE });
    await user.type(getInput(), 'load');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
    expect(screen.getByRole('option')).toHaveTextContent('Open File');
  });

  it('renders empty state with the typed query when no match', async () => {
    const user = userEvent.setup();
    await renderOpen({ commands: SAMPLE });
    await user.type(getInput(), 'zzzzz');
    await waitFor(() => expect(screen.queryAllByRole('option')).toHaveLength(0));
    expect(screen.getByText('No results for "zzzzz"')).toBeInTheDocument();
  });

  it('supports fuzzy strategy', async () => {
    const user = userEvent.setup();
    await renderOpen({ commands: SAMPLE, filterStrategy: 'fuzzy' });
    await user.type(getInput(), 'tgthm');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
    expect(screen.getByRole('option')).toHaveTextContent('Toggle Theme');
  });
});

describe('CommandPalette — keyboard navigation', () => {
  it('ArrowDown / ArrowUp move the highlight via aria-activedescendant', async () => {
    const user = userEvent.setup();
    await renderOpen({ commands: SAMPLE });
    const input = getInput();
    const firstActive = input.getAttribute('aria-activedescendant');
    await user.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(input.getAttribute('aria-activedescendant')).not.toBe(firstActive),
    );
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(input.getAttribute('aria-activedescendant')).toBe(firstActive));
  });

  it('Enter executes the highlighted command and closes the palette', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Harness commands={[{ id: 'a', label: 'Alpha', onSelect }]} />);
    await user.click(screen.getByTestId('trigger'));
    await screen.findByRole('dialog');
    await waitFor(() => expect(getInput()).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('clicking a row executes it', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Harness commands={[{ id: 'a', label: 'Alpha', onSelect }]} />);
    await user.click(screen.getByTestId('trigger'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('option', { name: /alpha/i }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('Esc closes the palette', async () => {
    await renderOpen({ commands: SAMPLE });
    fireEvent.keyDown(getInput(), { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('Home / End jump to first / last commands', async () => {
    const user = userEvent.setup();
    await renderOpen({ commands: SAMPLE });
    const input = getInput();
    await user.keyboard('{End}');
    const options = screen.getAllByRole('option');
    const lastId = options[options.length - 1]?.id;
    expect(input.getAttribute('aria-activedescendant')).toBe(lastId);
    await user.keyboard('{Home}');
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0]?.id);
  });
});

describe('CommandPalette — controlled state', () => {
  it('reflects external open state and reports closures', async () => {
    const user = userEvent.setup();
    await renderOpen({ commands: SAMPLE });
    fireEvent.keyDown(getInput(), { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByTestId('trigger'));
    await screen.findByRole('dialog');
  });
});

describe('CommandPalette — sub-pages', () => {
  const pages: Record<string, CommandPalettePage> = {
    theme: {
      title: 'Change Theme',
      placeholder: 'Pick a theme…',
      commands: [
        { id: 't-light', label: 'Light', onSelect: () => undefined },
        { id: 't-dark', label: 'Dark', onSelect: () => undefined },
      ],
    },
  };

  it('pushPage from onSelect swaps the visible command list', async () => {
    const user = userEvent.setup();
    const rootCmds: Command[] = [
      {
        id: 'theme',
        label: 'Theme',
        onSelect: ({ palette: p }) => p.pushPage('theme'),
      },
    ];
    render(<Harness commands={rootCmds} pages={pages} />);
    await user.click(screen.getByTestId('trigger'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('option', { name: /theme/i }));
    await waitFor(() => expect(screen.getByText('Change Theme')).toBeInTheDocument());
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(
      expect.arrayContaining([expect.stringContaining('Light'), expect.stringContaining('Dark')]),
    );
  });

  it('Esc inside a sub-page pops back to the root', async () => {
    const user = userEvent.setup();
    const rootCmds: Command[] = [
      {
        id: 'theme',
        label: 'Theme',
        onSelect: ({ palette: p }) => p.pushPage('theme'),
      },
    ];
    render(<Harness commands={rootCmds} pages={pages} />);
    await user.click(screen.getByTestId('trigger'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('option', { name: /theme/i }));
    await screen.findByText('Change Theme');
    fireEvent.keyDown(getInput(), { key: 'Escape' });
    await waitFor(() => expect(screen.queryByText('Change Theme')).not.toBeInTheDocument());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('Backspace on empty query inside a sub-page pops back', async () => {
    const user = userEvent.setup();
    const rootCmds: Command[] = [
      {
        id: 'theme',
        label: 'Theme',
        onSelect: ({ palette: p }) => p.pushPage('theme'),
      },
    ];
    render(<Harness commands={rootCmds} pages={pages} />);
    await user.click(screen.getByTestId('trigger'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('option', { name: /theme/i }));
    await screen.findByText('Change Theme');
    fireEvent.keyDown(getInput(), { key: 'Backspace' });
    await waitFor(() => expect(screen.queryByText('Change Theme')).not.toBeInTheDocument());
  });
});

describe('CommandPalette — imperative + hook registration', () => {
  it('hook-registered commands appear in the visible list', async () => {
    function Host(): ReactElement {
      useRegisterCommand({ id: 'hook-cmd', label: 'Hook Cmd', onSelect: () => undefined });
      return <Harness />;
    }
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByTestId('trigger'));
    await screen.findByRole('dialog');
    expect(screen.getByText('Hook Cmd')).toBeInTheDocument();
  });

  it('imperative commands.register adds to the same store', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByTestId('trigger'));
    await screen.findByRole('dialog');
    act(() => {
      commands.register({ id: 'imp-cmd', label: 'Imperative Cmd', onSelect: () => undefined });
    });
    await waitFor(() => expect(screen.getByText('Imperative Cmd')).toBeInTheDocument());
  });

  it('declarative commands win on id collision', async () => {
    function Host(): ReactElement {
      useRegisterCommand({ id: 'shared', label: 'From hook', onSelect: () => undefined });
      return (
        <Harness commands={[{ id: 'shared', label: 'From prop', onSelect: () => undefined }]} />
      );
    }
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByTestId('trigger'));
    await screen.findByRole('dialog');
    expect(screen.getByText('From prop')).toBeInTheDocument();
    expect(screen.queryByText('From hook')).not.toBeInTheDocument();
  });
});

describe('CommandPalette — recents', () => {
  it('respects controlled recentCommandIds prop', async () => {
    await renderOpen({ commands: SAMPLE, recentCommandIds: ['save', 'close'] });
    expect(screen.getByText('Recently used')).toBeInTheDocument();
    const recentLabels = screen
      .getAllByRole('option')
      .slice(0, 2)
      .map((el) => el.textContent ?? '');
    expect(recentLabels[0]).toContain('Save');
    expect(recentLabels[1]).toContain('Close Window');
  });

  it('tracks recents internally when trackRecents is true (default)', async () => {
    const user = userEvent.setup();
    render(<Harness commands={SAMPLE} />);
    // Open + select once
    await user.click(screen.getByTestId('trigger'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('option', { name: /save/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    // Re-open and confirm Save is at the top under "Recently used"
    await user.click(screen.getByTestId('trigger'));
    await screen.findByRole('dialog');
    expect(screen.getByText('Recently used')).toBeInTheDocument();
    const firstOption = screen.getAllByRole('option')[0];
    expect(firstOption).toHaveTextContent('Save');
  });
});

describe('CommandPalette — custom renderers', () => {
  it('renderCommand replaces the default row layout', async () => {
    await renderOpen({
      commands: SAMPLE,
      renderCommand: ({ command }) => (
        <span data-testid={`row-${command.id}`}>★ {command.label}</span>
      ),
    });
    expect(screen.getByTestId('row-save')).toHaveTextContent('★ Save');
  });

  it('renderEmpty overrides the empty state', async () => {
    const user = userEvent.setup();
    await renderOpen({
      commands: SAMPLE,
      renderEmpty: (q) => <span data-testid="empty">nothing for {q}</span>,
    });
    await user.type(getInput(), 'zzzz');
    await waitFor(() =>
      expect(screen.getByTestId('empty')).toHaveTextContent('nothing for zzzz'),
    );
  });

  it('renderFooter={null} hides the footer', async () => {
    await renderOpen({ commands: SAMPLE, renderFooter: null });
    expect(screen.queryByText(/navigate/i)).not.toBeInTheDocument();
  });
});

describe('CommandPalette — async onSelect', () => {
  it('awaits a Promise from onSelect before closing', async () => {
    const user = userEvent.setup();
    let resolveFn: (() => void) | null = null;
    const onSelect = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveFn = resolve;
        }),
    );
    render(<Harness commands={[{ id: 'a', label: 'Alpha', onSelect }]} />);
    await user.click(screen.getByTestId('trigger'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('option', { name: /alpha/i }));
    expect(onSelect).toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await act(async () => {
      resolveFn?.();
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('CommandPalette — imperative palette controller', () => {
  it('palette.open() opens a mounted palette', async () => {
    render(<CommandPalette commands={SAMPLE} disableGlobalHotkey />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    act(() => {
      palette.open();
    });
    await screen.findByRole('dialog');
  });

  it('palette.close() closes it', async () => {
    await renderOpen({ commands: SAMPLE });
    act(() => {
      palette.close();
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});