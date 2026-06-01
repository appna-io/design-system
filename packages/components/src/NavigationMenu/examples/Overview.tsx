import { Div, NavigationMenu } from '@apx-ui/ds';

/**
 * Quick-review demo of `<NavigationMenu />` — horizontal nav with flat links
 * and a dropdown panel for nested destinations.
 */
export default function Overview() {
  return (
    <Div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
      <NavigationMenu activeHref="/pricing" indicator>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
            <NavigationMenu.Link href="/integrations">Integrations</NavigationMenu.Link>
            <NavigationMenu.Link href="/changelog">Changelog</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/customers">Customers</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/docs">Docs</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>
    </Div>
  );
}