import { Div, NavigationMenu } from '@apx-ui/ds';

/**
 * Three size scales — propagate down to triggers + content panels via context.
 */
export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" gap="4">
      <Div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
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
      </Div>

      <Div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
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
      </Div>

      <Div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
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
      </Div>
    </Div>
  );
}