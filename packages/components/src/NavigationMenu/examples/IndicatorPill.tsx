import { Div, NavigationMenu } from '@apx-ui/ds';

/**
 * The `pill` indicator variant — a filled background slides behind the focused /
 * active item rather than an underline below it. Same animation mechanics, just
 * a different recipe. The pill sits at `z-index: -10` so the trigger label
 * still reads on top.
 */
export default function IndicatorPill() {
  return (
    <Div className="rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
      <NavigationMenu indicator indicatorVariant="pill" variant="pill" activeHref="/docs">
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
          <NavigationMenu.Link href="/blog">Blog</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>
    </Div>
  );
}