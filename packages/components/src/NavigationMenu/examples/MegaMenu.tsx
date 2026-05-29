import { NavigationMenu } from '@apx-ui/ds';

import {
  BookIcon,
  BoxIcon,
  ChartIcon,
  CodeIcon,
  PaintIcon,
  PlugIcon,
  RocketIcon,
  ShieldIcon,
} from './_icons';

/**
 * Mega-menu — `<NavigationMenu.Content variant="mega" columns={3}>` widens the
 * panel and switches to a CSS grid. Each `<NavigationMenu.Group>` is a column
 * with an optional `<h3>` label and a stack of links.
 */
export default function MegaMenu() {
  return (
    <div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
      <NavigationMenu>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Solutions</NavigationMenu.Trigger>
          <NavigationMenu.Content variant="mega" columns={3}>
            <NavigationMenu.Group label="By role">
              <NavigationMenu.Link
                href="/developers"
                icon={<CodeIcon />}
                description="APIs, SDKs, and CLIs"
              >
                For developers
              </NavigationMenu.Link>
              <NavigationMenu.Link
                href="/designers"
                icon={<PaintIcon />}
                description="Design system tools"
              >
                For designers
              </NavigationMenu.Link>
              <NavigationMenu.Link
                href="/operators"
                icon={<ShieldIcon />}
                description="Run with confidence"
              >
                For operators
              </NavigationMenu.Link>
            </NavigationMenu.Group>

            <NavigationMenu.Group label="By company size">
              <NavigationMenu.Link
                href="/startups"
                icon={<RocketIcon />}
                description="Move fast — fewer than 50 employees"
              >
                Startups
              </NavigationMenu.Link>
              <NavigationMenu.Link
                href="/scaleups"
                icon={<ChartIcon />}
                description="Growing teams — 50 to 500 employees"
              >
                Scale-ups
              </NavigationMenu.Link>
              <NavigationMenu.Link
                href="/enterprise"
                icon={<BoxIcon />}
                description="Custom contracts — 500+ employees"
              >
                Enterprise
              </NavigationMenu.Link>
            </NavigationMenu.Group>

            <NavigationMenu.Group label="By industry">
              <NavigationMenu.Link
                href="/saas"
                icon={<PlugIcon />}
                description="Software-as-a-service"
              >
                SaaS
              </NavigationMenu.Link>
              <NavigationMenu.Link
                href="/fintech"
                icon={<ChartIcon />}
                description="Financial services"
              >
                Fintech
              </NavigationMenu.Link>
              <NavigationMenu.Link
                href="/education"
                icon={<BookIcon />}
                description="Schools & universities"
              >
                Education
              </NavigationMenu.Link>
            </NavigationMenu.Group>
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
