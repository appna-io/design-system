import { Div, NavigationMenu, Typography } from '@apx-ui/ds';

/**
 * Mobile collapse — when the viewport is below `mobileBreakpoint` the menu
 * renders nothing. Consumers pair this with AppShell's hamburger / Drawer to
 * provide a full mobile navigation experience.
 *
 * Resize the browser below 768px (md breakpoint default) to see the menu hide.
 */
export default function MobileCollapse() {
  return (
    <Div
      display="flex"
      flexDirection="column"
      gap="3"
      className="rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3"
    >
      <Typography variant="caption" className="text-(--sds-color-text-muted)">
        Resize the viewport below 768px (md) to see the menu hide. The hamburger
        slot under the mobile breakpoint is the AppShell&apos;s responsibility.
      </Typography>
      <Div className="flex justify-center">
        <NavigationMenu mobileBreakpoint="md">
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