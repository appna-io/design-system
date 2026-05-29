import { useState } from 'react';
import { NavigationMenu } from '@apx-ui/ds';

/**
 * Controlled `activeHref` — the consumer keeps the active path in state and
 * passes it in. Items self-compare via the shared `isActiveHref` helper so the
 * active state is always derived; consumers never set it on each Item by hand.
 */
export default function ActiveHrefControlled() {
  const [activeHref, setActiveHref] = useState('/pricing');

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {['/features', '/pricing', '/docs', '/blog'].map((path) => (
          <button
            key={path}
            type="button"
            onClick={() => setActiveHref(path)}
            className="rounded-md border border-(--sds-color-border-subtle) px-3 py-1 text-xs font-medium hover:bg-(--sds-color-surface-subtle)"
          >
            Set active to {path}
          </button>
        ))}
      </div>

      <div className="rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
        <NavigationMenu indicator activeHref={activeHref}>
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
      </div>
    </div>
  );
}
