import { Div, NavigationMenu } from '@apx-ui/ds';

/**
 * `trigger="hover"` — dropdowns open ONLY on hover, never on click. Power-user
 * mode for desktop marketing sites. Note: on touch devices the trigger has no
 * way to open; consumers should pair this with a `'both'` mode plus a viewport
 * media query, or stick to `'both'` (the default) which works for everyone.
 */
export default function HoverOnly() {
  return (
    <Div className="rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
      <NavigationMenu trigger="hover" hoverDelay={100} closeDelay={200}>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
            <NavigationMenu.Link href="/integrations">Integrations</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Resources</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/docs">Docs</NavigationMenu.Link>
            <NavigationMenu.Link href="/blog">Blog</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>
    </Div>
  );
}