import { useState } from 'react';
import { AppShell, Button, HStack, Sidebar, Stack, useAppShell } from '@apx-ui/ds';

import {
  CalendarIcon,
  ChartIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  PlusIcon,
  UserIcon,
} from './_icons';

/**
 * The canonical "Linear-style dashboard" demo: Sidebar dropped into an AppShell's `sidebar`
 * slot, with a header hosting the collapse toggle and the Sidebar honoring AppShell's
 * `isSidebarCollapsed` state. Sections + collapsible groups + badges + footer profile.
 *
 * This example renders enough chrome that the rail-mode transition is genuinely visible:
 * expanded view shows full labels + badge pills + section headers; collapsed view falls back
 * to icon-only with auto-Tooltips.
 */
function ShellHeader() {
  return (
    <HStack gap={3} align="center" className="w-full">
      <ShellCollapseButton />
      <strong className="text-base">Acme</strong>
      <span className="text-xs text-(--sds-color-text-muted)">Dashboard</span>
    </HStack>
  );
}

function ShellCollapseButton() {
  // We read AppShell's hook to wire up the hamburger button → sidebar collapsed state.
  const { toggleSidebar, isSidebarCollapsed } = useAppShell();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSidebar}
      aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      ☰
    </Button>
  );
}

function ShellSidebar({ activePath }: { activePath: string }) {
  const { isSidebarCollapsed } = useAppShell();
  return (
    <Sidebar
      ariaLabel="Acme navigation"
      variant="default"
      collapsed={isSidebarCollapsed}
      activeHref={activePath}
      activeMatchStrategy="prefix"
    >
      <Sidebar.Section label="Workspace">
        <Sidebar.Item href="/" icon={<HomeIcon />}>
          Home
        </Sidebar.Item>
        <Sidebar.Item href="/inbox" icon={<InboxIcon />} badge={3} badgeColor="primary">
          Inbox
        </Sidebar.Item>
        <Sidebar.Item href="/calendar" icon={<CalendarIcon />}>
          Calendar
        </Sidebar.Item>
      </Sidebar.Section>
      <Sidebar.Section label="Reports" collapsible defaultOpen>
        <Sidebar.Item href="/reports/sales" icon={<ChartIcon />}>
          Sales
        </Sidebar.Item>
        <Sidebar.Item href="/reports/retention" icon={<ChartIcon />}>
          Retention
        </Sidebar.Item>
      </Sidebar.Section>
      <Sidebar.Section label="Projects" collapsible defaultOpen>
        <Sidebar.Item href="/projects/launch" icon={<FolderIcon />}>
          Launch
        </Sidebar.Item>
        <Sidebar.Item href="/projects/api" icon={<FolderIcon />}>
          API
        </Sidebar.Item>
        <Sidebar.Item icon={<PlusIcon />} variant="ghost" onClick={() => undefined}>
          New project
        </Sidebar.Item>
      </Sidebar.Section>
      <Sidebar.Spacer />
      <Sidebar.Footer>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-(--sds-color-surface-subtle)">
          <UserIcon />
        </div>
        {!isSidebarCollapsed && (
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">Ada Lovelace</span>
            <span className="truncate text-xs text-(--sds-color-text-muted)">Admin</span>
          </div>
        )}
      </Sidebar.Footer>
    </Sidebar>
  );
}

export default function DashboardDemo() {
  const [activePath] = useState('/inbox');
  return (
    <div className="h-[560px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <AppShell
        header={<ShellHeader />}
        sidebar={<ShellSidebar activePath={activePath} />}
        sidebarWidth={260}
        sidebarCollapsedWidth={64}
        footer={<span>© 2026 Acme, Inc.</span>}
      >
        <Stack gap={4}>
          <h2 className="text-xl font-semibold">Inbox · 3 unread</h2>
          <p className="text-sm text-(--sds-color-text-muted)">
            Click the ☰ button in the header to collapse the sidebar into rail mode. Hover any
            icon in the rail to see its label in a Tooltip. The active item ({activePath}) stays
            highlighted in both modes.
          </p>
          <HStack gap={3}>
            <Button size="sm">Compose</Button>
            <Button size="sm" variant="outline">
              Refresh
            </Button>
            <Button size="sm" variant="ghost">
              Mark all read
            </Button>
          </HStack>
          <Stack gap={2} className="rounded-md border border-(--sds-color-border-subtle) p-4">
            <h3 className="text-sm font-semibold">Welcome</h3>
            <p className="text-sm text-(--sds-color-text-muted)">
              This is a working slot composition. The Sidebar reads
              <code className="ms-1 font-mono">useAppShell().isSidebarCollapsed</code> directly
              so consumers don&apos;t have to thread the prop manually.
            </p>
          </Stack>
        </Stack>
      </AppShell>
    </div>
  );
}
