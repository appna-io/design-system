import { NavigationMenu } from 'apx-ds';

/**
 * Three size scales — propagate down to triggers + content panels via context.
 */
export default function Sizes() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
        <NavigationMenu size="sm" indicator activeHref="/pricing">
          <NavigationMenu.Item>
            <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link href="/docs">Docs</NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu>
      </div>

      <div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
        <NavigationMenu size="md" indicator activeHref="/pricing">
          <NavigationMenu.Item>
            <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link href="/docs">Docs</NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu>
      </div>

      <div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
        <NavigationMenu size="lg" indicator activeHref="/pricing">
          <NavigationMenu.Item>
            <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link href="/docs">Docs</NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu>
      </div>
    </div>
  );
}
