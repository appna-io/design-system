import { Div, NavigationMenu } from '@apx-ui/ds';

/**
 * Dropdown navigation — one Item has a `<NavigationMenu.Trigger>` + a sibling
 * `<NavigationMenu.Content>` that holds the panel. Hover or click toggles the
 * panel; arrow keys navigate inside it.
 */
export default function WithDropdown() {
  return (
    <Div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
      <NavigationMenu>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
            <NavigationMenu.Link href="/integrations">Integrations</NavigationMenu.Link>
            <NavigationMenu.Link href="/changelog">Changelog</NavigationMenu.Link>
            <NavigationMenu.Link href="/security">Security</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Resources</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/docs">Documentation</NavigationMenu.Link>
            <NavigationMenu.Link href="/guides">Guides</NavigationMenu.Link>
            <NavigationMenu.Link href="/blog">Blog</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/contact">Contact</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>
    </Div>
  );
}