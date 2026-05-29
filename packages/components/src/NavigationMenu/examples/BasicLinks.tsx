import { NavigationMenu } from '@apx-ui/ds';

/**
 * The simplest NavigationMenu — flat list of links, no dropdowns. Pass
 * `activeHref` to highlight the current page; each link auto-resolves
 * `aria-current="page"` against it via the same `isActiveHref` helper the
 * Sidebar uses.
 */
export default function BasicLinks() {
  return (
    <div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
      <NavigationMenu activeHref="/pricing">
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
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
    </div>
  );
}
