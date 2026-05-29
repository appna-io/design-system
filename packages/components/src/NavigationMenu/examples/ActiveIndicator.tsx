import { NavigationMenu } from '@apx-ui/ds';

/**
 * Animated indicator under the active / focused / hovered item. Pass
 * `indicator` to render the Indicator and `indicatorVariant` to pick
 * between underline / pill / bar.
 */
export default function ActiveIndicator() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--sds-color-text-muted)">
          underline (default)
        </p>
        <div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
          <NavigationMenu indicator activeHref="/pricing">
            <NavigationMenu.Item>
              <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavigationMenu.Link href="/docs">Docs</NavigationMenu.Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavigationMenu.Link href="/contact">Contact</NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--sds-color-text-muted)">
          pill
        </p>
        <div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
          <NavigationMenu indicator indicatorVariant="pill" activeHref="/docs">
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

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--sds-color-text-muted)">
          bar
        </p>
        <div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
          <NavigationMenu indicator indicatorVariant="bar" activeHref="/features">
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
    </div>
  );
}
