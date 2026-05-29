import { NavigationMenu } from 'apx-ds';

/**
 * `trigger="click"` — dropdowns open ONLY on click. Used when the menu doubles
 * as an in-app navigation surface (rather than a marketing site) — clicks are
 * intentional, hover is incidental. Esc / outside-click / second click on the
 * trigger all close the panel.
 */
export default function ClickOnly() {
  return (
    <div className="rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
      <NavigationMenu trigger="click">
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Workspaces</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/workspaces/personal">Personal</NavigationMenu.Link>
            <NavigationMenu.Link href="/workspaces/team">Team</NavigationMenu.Link>
            <NavigationMenu.Link href="/workspaces/archive">Archive</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Account</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/profile">Profile</NavigationMenu.Link>
            <NavigationMenu.Link href="/settings">Settings</NavigationMenu.Link>
            <NavigationMenu.Link href="/billing">Billing</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu>
    </div>
  );
}
