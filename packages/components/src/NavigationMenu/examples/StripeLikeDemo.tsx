import { NavigationMenu, Card, Button } from 'apx-ds';

import {
  BookIcon,
  BoxIcon,
  ChartIcon,
  CodeIcon,
  MapIcon,
  PaintIcon,
  PlugIcon,
  RocketIcon,
  ShieldIcon,
  ZapIcon,
} from './_icons';

/**
 * Realistic SaaS top-nav demo — combines a mega-menu with featured slot,
 * regular dropdowns, simple links, and an active-indicator. Mirrors Stripe /
 * Vercel marketing-site conventions.
 */
export default function StripeLikeDemo() {
  return (
    <div className="rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default)">
      <header className="flex items-center justify-between gap-6 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-(--sds-color-text-default) text-xs font-bold text-(--sds-color-surface-default)">
            S
          </span>
          <span className="text-sm font-semibold">AppNA-SaaS</span>
        </div>

        <NavigationMenu indicator activeHref="/pricing">
          <NavigationMenu.Item>
            <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
            <NavigationMenu.Content variant="mega" columns={3}>
              <NavigationMenu.Group label="Build">
                <NavigationMenu.Link href="/sdk" icon={<CodeIcon />} description="Typed SDK + APIs">
                  SDK
                </NavigationMenu.Link>
                <NavigationMenu.Link
                  href="/components"
                  icon={<PaintIcon />}
                  description="50+ UI primitives"
                >
                  Components
                </NavigationMenu.Link>
                <NavigationMenu.Link
                  href="/integrations"
                  icon={<PlugIcon />}
                  description="200+ first-party"
                >
                  Integrations
                </NavigationMenu.Link>
              </NavigationMenu.Group>

              <NavigationMenu.Group label="Ship">
                <NavigationMenu.Link href="/cli" icon={<ZapIcon />} description="One-line deploys">
                  CLI
                </NavigationMenu.Link>
                <NavigationMenu.Link
                  href="/preview"
                  icon={<RocketIcon />}
                  description="Per-PR previews"
                >
                  Preview
                </NavigationMenu.Link>
                <NavigationMenu.Link
                  href="/edge"
                  icon={<MapIcon />}
                  description="Global edge runtime"
                >
                  Edge
                </NavigationMenu.Link>
              </NavigationMenu.Group>

              <NavigationMenu.Featured>
                <Card variant="elevated" size="sm">
                  <Card.Body>
                    <p className="mb-1 text-sm font-semibold">New: AI-assisted setup</p>
                    <p className="mb-3 text-xs text-(--sds-color-text-muted)">
                      Scaffold a typed app in 30 seconds with our generator.
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
            <NavigationMenu.Trigger>Solutions</NavigationMenu.Trigger>
            <NavigationMenu.Content variant="mega" columns={2}>
              <NavigationMenu.Group label="By role">
                <NavigationMenu.Link href="/devs" icon={<CodeIcon />}>
                  For developers
                </NavigationMenu.Link>
                <NavigationMenu.Link href="/designers" icon={<PaintIcon />}>
                  For designers
                </NavigationMenu.Link>
              </NavigationMenu.Group>

              <NavigationMenu.Group label="By size">
                <NavigationMenu.Link href="/startups" icon={<RocketIcon />}>
                  Startups
                </NavigationMenu.Link>
                <NavigationMenu.Link href="/enterprise" icon={<BoxIcon />}>
                  Enterprise
                </NavigationMenu.Link>
              </NavigationMenu.Group>
            </NavigationMenu.Content>
          </NavigationMenu.Item>

          <NavigationMenu.Item>
            <NavigationMenu.Trigger>Resources</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <NavigationMenu.Link href="/docs" icon={<BookIcon />}>
                Documentation
              </NavigationMenu.Link>
              <NavigationMenu.Link href="/changelog" icon={<ChartIcon />}>
                Changelog
              </NavigationMenu.Link>
              <NavigationMenu.Link href="/security" icon={<ShieldIcon />}>
                Security
              </NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>

          <NavigationMenu.Item>
            <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
          <Button variant="solid" size="sm">
            Sign up
          </Button>
        </div>
      </header>
    </div>
  );
}
