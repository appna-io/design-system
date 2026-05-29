import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Menu } from '../src/Menu';
import { renderWithTheme as render } from './utils';

/**
 * Tests for `<Menu>`. Same testing strategy Popover / Modal use: real timers + `await waitFor`
 * for AnimatePresence exits, `userEvent.setup()` over raw `fireEvent` for click/tab/keyboard
 * sequences where the realistic pointer + focus + keyboard event ordering matters.
 *
 * Menu's keyboard logic is the bulk of what we test: arrow nav, Home/End, type-ahead,
 * Enter/Space commit, Escape close, Tab close, plus the compound surfaces (CheckboxItem,
 * RadioGroup, Sub).
 */

function queryMenu(): HTMLElement | null {
  return screen.queryByRole('menu');
}

function getMenu(): HTMLElement {
  return screen.getByRole('menu');
}

describe('Menu — rendering', () => {
  it('renders the trigger and keeps the content absent until clicked', () => {
    render(
      <Menu>
        <Menu.Trigger>Options</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>One</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    expect(screen.getByRole('button', { name: 'Options' })).toBeInTheDocument();
    expect(queryMenu()).toBeNull();
  });

  it('opens on click and wires aria-controls / aria-expanded / aria-haspopup', async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>One</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const menuId = getMenu().id;
    expect(trigger).toHaveAttribute('aria-controls', menuId);
    expect(getMenu()).toHaveAttribute('aria-labelledby', trigger.id);
  });

  it('renders Items, Labels, Groups, Separators with correct roles', async () => {
    const user = userEvent.setup();
    render(
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Label>Account</Menu.Label>
          <Menu.Group>
            <Menu.Item>Profile</Menu.Item>
            <Menu.Item>Settings</Menu.Item>
          </Menu.Group>
          <Menu.Separator />
          <Menu.Item>Logout</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
    // user is unused here but kept consistent.
    void user;
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getAllByRole('group')).toHaveLength(1);
  });
});

describe('Menu — close behavior', () => {
  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>One</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(queryMenu()).toBeNull(), { timeout: 2000 });
  });

  it('closes on outside pointerdown', async () => {
    render(
      <div>
        <Menu defaultOpen>
          <Menu.Trigger>Open</Menu.Trigger>
          <Menu.Content>
            <Menu.Item>One</Menu.Item>
          </Menu.Content>
        </Menu>
        <button data-testid="outside">outside</button>
      </div>,
    );
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
    fireEvent.pointerDown(screen.getByTestId('outside'));
    await waitFor(() => expect(queryMenu()).toBeNull(), { timeout: 2000 });
  });

  it('closes after Item.onSelect when closeOnSelect is true (default)', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item onSelect={onSelect}>Apply</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
    await user.click(screen.getByRole('menuitem', { name: 'Apply' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(queryMenu()).toBeNull(), { timeout: 2000 });
  });

  it('stays open after Item.onSelect when closeOnSelect=false at root', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Menu defaultOpen closeOnSelect={false}>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item onSelect={onSelect}>Apply</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
    await user.click(screen.getByRole('menuitem', { name: 'Apply' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(queryMenu()).toBeInTheDocument();
  });
});

describe('Menu — keyboard navigation', () => {
  function Three(): ReactElement {
    return (
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Apple</Menu.Item>
          <Menu.Item>Banana</Menu.Item>
          <Menu.Item>Cherry</Menu.Item>
        </Menu.Content>
      </Menu>
    );
  }

  it('ArrowDown highlights the next item', async () => {
    const user = userEvent.setup();
    render(<Three />);
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
    await user.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Apple' })).toHaveAttribute(
        'data-highlighted',
        'true',
      ),
    );
    await user.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Banana' })).toHaveAttribute(
        'data-highlighted',
        'true',
      ),
    );
  });

  it('ArrowUp wraps to last item when loop=true (default)', async () => {
    const user = userEvent.setup();
    render(<Three />);
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
    await user.keyboard('{ArrowUp}');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Cherry' })).toHaveAttribute(
        'data-highlighted',
        'true',
      ),
    );
  });

  it('Home / End jump to first / last enabled item', async () => {
    const user = userEvent.setup();
    render(<Three />);
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
    await user.keyboard('{End}');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Cherry' })).toHaveAttribute(
        'data-highlighted',
        'true',
      ),
    );
    await user.keyboard('{Home}');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Apple' })).toHaveAttribute(
        'data-highlighted',
        'true',
      ),
    );
  });

  it('Enter selects the highlighted item', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item onSelect={onSelect}>Apple</Menu.Item>
          <Menu.Item>Banana</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
    await user.keyboard('{ArrowDown}'); // highlight Apple
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('Tab closes the menu', async () => {
    const user = userEvent.setup();
    render(<Three />);
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
    await user.keyboard('{Tab}');
    await waitFor(() => expect(queryMenu()).toBeNull(), { timeout: 2000 });
  });

  it('type-ahead jumps to matching item', async () => {
    const user = userEvent.setup();
    render(<Three />);
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
    // Press "b" — should highlight Banana.
    await user.keyboard('b');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Banana' })).toHaveAttribute(
        'data-highlighted',
        'true',
      ),
    );
  });

  it('disabled items are skipped by arrow navigation', async () => {
    const user = userEvent.setup();
    render(
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>One</Menu.Item>
          <Menu.Item disabled>Two</Menu.Item>
          <Menu.Item>Three</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
    await user.keyboard('{ArrowDown}'); // One
    await user.keyboard('{ArrowDown}'); // should skip Two → Three
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Three' })).toHaveAttribute(
        'data-highlighted',
        'true',
      ),
    );
  });
});

describe('Menu — CheckboxItem', () => {
  it('toggles checked + emits onCheckedChange + does NOT close', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.CheckboxItem onCheckedChange={onChange}>Sidebar</Menu.CheckboxItem>
        </Menu.Content>
      </Menu>,
    );
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
    const item = screen.getByRole('menuitemcheckbox', { name: 'Sidebar' });
    expect(item).toHaveAttribute('aria-checked', 'false');

    await user.click(item);
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(item).toHaveAttribute('aria-checked', 'true');
    // Menu stays open after checkbox toggle.
    expect(queryMenu()).toBeInTheDocument();
  });

  it('controlled checked prop is honored', async () => {
    const user = userEvent.setup();
    function Controlled(): ReactElement {
      const [checked, setChecked] = useState(false);
      return (
        <Menu defaultOpen>
          <Menu.Trigger>Open</Menu.Trigger>
          <Menu.Content>
            <Menu.CheckboxItem checked={checked} onCheckedChange={setChecked}>
              Toggle
            </Menu.CheckboxItem>
          </Menu.Content>
        </Menu>
      );
    }
    render(<Controlled />);
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
    const item = screen.getByRole('menuitemcheckbox', { name: 'Toggle' });
    expect(item).toHaveAttribute('aria-checked', 'false');
    await user.click(item);
    expect(item).toHaveAttribute('aria-checked', 'true');
  });
});

describe('Menu — RadioGroup', () => {
  it('selecting an item sets aria-checked exclusively + emits onValueChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.RadioGroup onValueChange={onChange}>
            <Menu.RadioItem value="light">Light</Menu.RadioItem>
            <Menu.RadioItem value="dark">Dark</Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu>,
    );
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
    const light = screen.getByRole('menuitemradio', { name: 'Light' });
    const dark = screen.getByRole('menuitemradio', { name: 'Dark' });
    expect(light).toHaveAttribute('aria-checked', 'false');
    expect(dark).toHaveAttribute('aria-checked', 'false');

    await user.click(dark);
    expect(onChange).toHaveBeenLastCalledWith('dark');
    expect(dark).toHaveAttribute('aria-checked', 'true');
    expect(light).toHaveAttribute('aria-checked', 'false');
  });
});

describe('Menu — Sub', () => {
  function SubTree(): ReactElement {
    return (
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Parent</Menu.Item>
          <Menu.Sub>
            <Menu.SubTrigger>More tools</Menu.SubTrigger>
            <Menu.SubContent>
              <Menu.Item>Sub one</Menu.Item>
              <Menu.Item>Sub two</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
        </Menu.Content>
      </Menu>
    );
  }

  it('clicking SubTrigger opens the submenu (renders 2 menus)', async () => {
    const user = userEvent.setup();
    render(<SubTree />);
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(1));
    await user.click(screen.getByRole('menuitem', { name: /More tools/i }));
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(2));
  });

  it('clicking SubTrigger again closes the submenu', async () => {
    const user = userEvent.setup();
    render(<SubTree />);
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(1));
    const subTrigger = screen.getByRole('menuitem', { name: /More tools/i });
    await user.click(subTrigger);
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(2));
    await user.click(subTrigger);
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(1), { timeout: 2000 });
  });
});

describe('Menu — variant / size / color', () => {
  it('applies data-variant attribute', async () => {
    render(
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content variant="outline" color="primary">
          <Menu.Item>One</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
    expect(getMenu()).toHaveAttribute('data-variant', 'outline');
  });
});

describe('Menu — controlled state', () => {
  it('controlled open prop drives mount/unmount', async () => {
    const user = userEvent.setup();
    function Controlled(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <Menu open={open} onOpenChange={setOpen}>
          <Menu.Trigger>Toggle</Menu.Trigger>
          <Menu.Content>
            <Menu.Item>One</Menu.Item>
          </Menu.Content>
        </Menu>
      );
    }
    render(<Controlled />);
    expect(queryMenu()).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    await waitFor(() => expect(queryMenu()).toBeNull(), { timeout: 2000 });
  });
});

describe('Menu — context trigger', () => {
  it('right-click on trigger opens the menu', async () => {
    render(
      <Menu trigger="context">
        <Menu.Trigger>
          <div data-testid="target">Right click me</div>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item>One</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    expect(queryMenu()).toBeNull();
    fireEvent.contextMenu(screen.getByRole('button', { name: /Right click/i }), {
      clientX: 100,
      clientY: 100,
    });
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
  });
});

describe('Menu — ref forwarding', () => {
  it('forwards ref to Content', async () => {
    const ref: { current: HTMLDivElement | null } = { current: null };
    render(
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content ref={ref}>
          <Menu.Item>One</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    await waitFor(() => expect(ref.current).not.toBeNull());
    expect(ref.current).toBe(getMenu());
  });
});
