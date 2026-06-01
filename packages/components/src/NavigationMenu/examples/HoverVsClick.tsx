import { Div, NavigationMenu, Typography } from '@apx-ui/ds';

/**
 * Trigger interaction modes — hover, click, and both (the default).
 *
 * `'hover'`  — only hover opens the panel. Best for marketing pages where
 *               the user expects "hover for more".
 * `'click'`  — only click opens; hover is a no-op. Best for keyboard /
 *               touch-heavy surfaces or when users complain about "menus
 *               popping open by accident".
 * `'both'`   — hover OR click both work. The default — sweep with the mouse,
 *               click on touch.
 */
export default function HoverVsClick() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      <Div>
        <Typography
          variant="caption"
          weight="semibold"
          className="mb-2 uppercase tracking-wide text-(--sds-color-text-muted)"
        >
          hover only
        </Typography>
        <Div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
          <NavigationMenu trigger="hover">
            <NavigationMenu.Item>
              <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
                <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
              </NavigationMenu.Content>
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
          click only
        </Typography>
        <Div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
          <NavigationMenu trigger="click">
            <NavigationMenu.Item>
              <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
                <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
              </NavigationMenu.Content>
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
          both (default)
        </Typography>
        <Div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
          <NavigationMenu>
            <NavigationMenu.Item>
              <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
                <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu>
        </Div>
      </Div>
    </Div>
  );
}