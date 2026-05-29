import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Menu } from '../src/Menu';
import type { MenuColor, MenuVariant } from '../src/Menu';
import { renderWithTheme as render } from './utils';

expect.extend(toHaveNoViolations);

const variants: MenuVariant[] = ['solid', 'outline', 'soft'];
const colors: MenuColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

describe('Menu — accessibility', () => {
  it('trigger carries aria-haspopup=menu, aria-expanded, aria-controls', async () => {
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
    expect(trigger).not.toHaveAttribute('aria-controls');

    await user.click(trigger);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeInTheDocument());
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', screen.getByRole('menu').id);
  });

  it('content carries role=menu, aria-labelledby trigger, aria-orientation', async () => {
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
    await user.click(trigger);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeInTheDocument());
    const menu = screen.getByRole('menu');
    expect(menu).toHaveAttribute('aria-labelledby', trigger.id);
    expect(menu).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('items carry role=menuitem and disabled items get aria-disabled', async () => {
    render(
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Enabled</Menu.Item>
          <Menu.Item disabled>Disabled</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    await waitFor(() => expect(screen.queryByRole('menu')).toBeInTheDocument());
    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(2);
    expect(items[0]).not.toHaveAttribute('aria-disabled');
    expect(items[1]).toHaveAttribute('aria-disabled', 'true');
  });

  it('CheckboxItem carries role=menuitemcheckbox + aria-checked', async () => {
    render(
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.CheckboxItem defaultChecked>Checked</Menu.CheckboxItem>
          <Menu.CheckboxItem>Unchecked</Menu.CheckboxItem>
        </Menu.Content>
      </Menu>,
    );
    await waitFor(() => expect(screen.queryByRole('menu')).toBeInTheDocument());
    const items = screen.getAllByRole('menuitemcheckbox');
    expect(items[0]).toHaveAttribute('aria-checked', 'true');
    expect(items[1]).toHaveAttribute('aria-checked', 'false');
  });

  it('RadioItem carries role=menuitemradio + exclusive aria-checked', async () => {
    render(
      <Menu defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.RadioGroup defaultValue="light">
            <Menu.RadioItem value="light">Light</Menu.RadioItem>
            <Menu.RadioItem value="dark">Dark</Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu>,
    );
    await waitFor(() => expect(screen.queryByRole('menu')).toBeInTheDocument());
    const items = screen.getAllByRole('menuitemradio');
    expect(items[0]).toHaveAttribute('aria-checked', 'true');
    expect(items[1]).toHaveAttribute('aria-checked', 'false');
  });

  it.each(variants)('axe passes for %s variant across all colors', async (variant) => {
    for (const color of colors) {
      const { container, unmount } = render(
        <Menu defaultOpen>
          <Menu.Trigger>Open</Menu.Trigger>
          <Menu.Content variant={variant} color={color}>
            <Menu.Label>Group</Menu.Label>
            <Menu.Group>
              <Menu.Item>Apple</Menu.Item>
              <Menu.Item>Banana</Menu.Item>
            </Menu.Group>
            <Menu.Separator />
            <Menu.CheckboxItem defaultChecked>Visible</Menu.CheckboxItem>
            <Menu.RadioGroup defaultValue="a">
              <Menu.RadioItem value="a">A</Menu.RadioItem>
              <Menu.RadioItem value="b">B</Menu.RadioItem>
            </Menu.RadioGroup>
          </Menu.Content>
        </Menu>,
      );
      await waitFor(() => expect(screen.queryByRole('menu')).toBeInTheDocument());
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      unmount();
    }
  });

  it('axe passes when menu is closed (no open content)', async () => {
    const { container } = render(
      <Menu>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>One</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
