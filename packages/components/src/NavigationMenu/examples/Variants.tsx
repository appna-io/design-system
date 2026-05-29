import { NavigationMenu } from '@apx-ui/ds';

/** Three visual chrome variants — `default` / `ghost` / `pill`. */
export default function Variants() {
  return (
    <div className="space-y-3">
      {(['default', 'ghost', 'pill'] as const).map((variant) => (
        <div
          key={variant}
          className="rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--sds-color-text-muted)">
            variant=&quot;{variant}&quot;
          </p>
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
        </div>
      ))}
    </div>
  );
}
