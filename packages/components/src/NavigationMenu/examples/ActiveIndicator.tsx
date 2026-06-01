import { Div, NavigationMenu, Typography } from '@apx-ui/ds';

/**
 * Animated indicator under the active / focused / hovered item. Pass
 * `indicator` to render the Indicator and `indicatorVariant` to pick
 * between underline / pill / bar.
 */
export default function ActiveIndicator() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      <Div>
        <Typography
          variant="caption"
          weight="semibold"
          className="mb-2 uppercase tracking-wide text-(--sds-color-text-muted)"
        >
          underline (default)
        </Typography>
        <Div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
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
        </Div>
      </Div>

      <Div>
        <Typography
          variant="caption"
          weight="semibold"
          className="mb-2 uppercase tracking-wide text-(--sds-color-text-muted)"
        >
          pill
        </Typography>
        <Div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
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
        </Div>
      </Div>

      <Div>
        <Typography
          variant="caption"
          weight="semibold"
          className="mb-2 uppercase tracking-wide text-(--sds-color-text-muted)"
        >
          bar
        </Typography>
        <Div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
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
        </Div>
      </Div>
    </Div>
  );
}