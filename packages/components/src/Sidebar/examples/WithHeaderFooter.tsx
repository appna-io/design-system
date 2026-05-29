import { Sidebar } from '@apx-ui/ds';

import { CogIcon, FolderIcon, HomeIcon, InboxIcon, UserIcon } from './_icons';

/**
 * Sidebar with a Header (logo / app name at top) and a Footer (user account at bottom).
 * `<Sidebar.Spacer />` between the last item and the footer pushes the footer to the bottom
 * even when there are few items, matching the look of Notion / Linear / Slack sidebars.
 */
export default function WithHeaderFooter() {
  return (
    <div className="h-[460px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <Sidebar
        ariaLabel="Full-chrome navigation"
        variant="bordered"
        width={260}
        activeHref="/inbox"
      >
        <Sidebar.Header>
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-(--sds-color-surface-subtle) text-sm font-bold">
            A
          </div>
          <span className="font-semibold">Acme</span>
        </Sidebar.Header>
        <Sidebar.Section label="Workspace">
          <Sidebar.Item href="/" icon={<HomeIcon />}>
            Home
          </Sidebar.Item>
          <Sidebar.Item href="/inbox" icon={<InboxIcon />} badge={5}>
            Inbox
          </Sidebar.Item>
          <Sidebar.Item href="/projects" icon={<FolderIcon />}>
            Projects
          </Sidebar.Item>
          <Sidebar.Item href="/settings" icon={<CogIcon />}>
            Settings
          </Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Spacer />
        <Sidebar.Footer>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-(--sds-color-surface-subtle)">
            <UserIcon />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">Ada Lovelace</span>
            <span className="truncate text-xs text-(--sds-color-text-muted)">
              ada@example.com
            </span>
          </div>
        </Sidebar.Footer>
      </Sidebar>
    </div>
  );
}
