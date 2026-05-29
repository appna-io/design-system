import { NavigationMenu, Card, Button } from 'apx-ds';

import { CodeIcon, PaintIcon, RocketIcon, ZapIcon } from './_icons';

/**
 * Mega-menu with a `<NavigationMenu.Featured>` slot — the rightmost column is
 * a marketing showcase rendered alongside the regular link groups. The
 * Featured slot accepts any ReactNode; here we drop a `<Card>` with a CTA.
 */
export default function MegaMenuWithFeatured() {
  return (
    <div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
      <NavigationMenu>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
          <NavigationMenu.Content variant="mega" columns={3}>
            <NavigationMenu.Group label="Build">
              <NavigationMenu.Link href="/sdk" icon={<CodeIcon />} description="TypeScript SDK">
                SDK
              </NavigationMenu.Link>
              <NavigationMenu.Link href="/components" icon={<PaintIcon />} description="50+ components">
                Components
              </NavigationMenu.Link>
            </NavigationMenu.Group>

            <NavigationMenu.Group label="Ship">
              <NavigationMenu.Link href="/cli" icon={<ZapIcon />} description="One-line deploys">
                CLI
              </NavigationMenu.Link>
              <NavigationMenu.Link href="/preview" icon={<RocketIcon />} description="Per-PR previews">
                Preview
              </NavigationMenu.Link>
            </NavigationMenu.Group>

            <NavigationMenu.Featured>
              <Card variant="elevated" size="sm">
                <Card.Body>
                  <p className="mb-2 text-sm font-semibold">New: AI-assisted setup</p>
                  <p className="mb-3 text-xs text-(--sds-color-text-muted)">
                    Scaffold a fully-typed app in 30 seconds with our generator.
                  </p>
                  <Button size="sm" variant="solid">
                    Try the generator
                  </Button>
                </Card.Body>
              </Card>
            </NavigationMenu.Featured>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/docs">Docs</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>
    </div>
  );
}
