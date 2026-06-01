import { Div, NavigationMenu, Typography } from '@apx-ui/ds';

/** Three visual chrome variants — `default` / `ghost` / `pill`. */
export default function Variants() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      {(['default', 'ghost', 'pill'] as const).map((variant) => (
        <Div
          key={variant}
          className="rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3"
        >
          <Typography
            variant="caption"
            weight="semibold"
            className="mb-2 uppercase tracking-wide text-(--sds-color-text-muted)"
          >
            variant=&quot;{variant}&quot;
          </Typography>
          <NavigationMenu variant={variant} activeHref="/pricing" indicator>
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
      ))}
    </Div>
  );
}