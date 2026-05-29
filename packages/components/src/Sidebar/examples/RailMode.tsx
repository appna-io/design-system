import { useState } from 'react';
import { Button, Sidebar } from '@apx-ui/ds';

import { CogIcon, FolderIcon, HomeIcon, InboxIcon } from './_icons';

/**
 * Rail mode — when the sidebar is `collapsed`, item labels become `sr-only` (still announced
 * by screen readers) and each item is auto-wrapped in a Tooltip that surfaces the label on
 * hover / focus. The icon stays visible as the primary affordance.
 *
 * In production, the `collapsed` prop is typically wired to AppShell's `useAppShell().
 * isSidebarCollapsed`; here we drive it via local state so the example is self-contained and
 * @Ahmad can toggle it manually to verify the rail behavior.
 */
export default function RailMode() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="h-[460px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <div className="flex h-full">
        <Sidebar
          ariaLabel="Rail-mode navigation"
          variant="bordered"
          collapsed={collapsed}
          width={240}
          collapsedWidth={64}
          activeHref="/inbox"
        >
          <Sidebar.Item href="/" icon={<HomeIcon />}>
            Home
          </Sidebar.Item>
          <Sidebar.Item href="/inbox" icon={<InboxIcon />} badge={3}>
            Inbox
          </Sidebar.Item>
          <Sidebar.Item href="/projects" icon={<FolderIcon />}>
            Projects
          </Sidebar.Item>
          <Sidebar.Item href="/settings" icon={<CogIcon />}>
            Settings
          </Sidebar.Item>
        </Sidebar>
        <div className="flex-1 p-6">
          <Button onClick={() => setCollapsed((c) => !c)} variant="outline" size="sm">
            {collapsed ? 'Expand sidebar' : 'Collapse to rail'}
          </Button>
          <p className="mt-4 text-sm text-(--sds-color-text-muted)">
            Hover any rail icon to see its label in a Tooltip.
          </p>
        </div>
      </div>
    </div>
  );
}
