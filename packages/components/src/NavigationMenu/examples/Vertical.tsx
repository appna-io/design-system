import { NavigationMenu } from 'apx-ds';

/**
 * Vertical orientation — items stack instead of laying out in a row, and
 * dropdowns open to the logical end (right in LTR, left in RTL). Useful for
 * side-rail navigation when Sidebar's full disclosure-tree feature is overkill.
 */
export default function Vertical() {
  return (
    <div className="flex justify-start rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
      <NavigationMenu orientation="vertical" indicator activeHref="/docs/components">
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/docs/getting-started">Getting started</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/docs/components">Components</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/docs/theming">Theming</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/docs/recipes">Recipes</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>
    </div>
  );
}
