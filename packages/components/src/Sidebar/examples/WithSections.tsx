import { Sidebar } from '@apx-ui/ds';

import { ChartIcon, FolderIcon, HomeIcon, InboxIcon, StarIcon } from './_icons';

/**
 * Sidebar grouped into labeled sections (static — neither collapsible). Demonstrates the
 * uppercase muted section label convention used by GitHub / Linear / Notion. Items inside each
 * section inherit the root's size + active-match settings.
 */
export default function WithSections() {
  return (
    <div className="h-[460px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <Sidebar
        ariaLabel="Sectioned navigation"
        variant="bordered"
        width={240}
        activeHref="/inbox"
      >
        <Sidebar.Section label="Workspace">
          <Sidebar.Item href="/" icon={<HomeIcon />}>
            Home
          </Sidebar.Item>
          <Sidebar.Item href="/inbox" icon={<InboxIcon />} badge={5} badgeColor="primary">
            Inbox
          </Sidebar.Item>
          <Sidebar.Item href="/starred" icon={<StarIcon />}>
            Starred
          </Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Section label="Reports">
          <Sidebar.Item href="/reports/sales" icon={<ChartIcon />}>
            Sales
          </Sidebar.Item>
          <Sidebar.Item href="/reports/retention" icon={<ChartIcon />}>
            Retention
          </Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Section label="Projects">
          <Sidebar.Item href="/projects/launch" icon={<FolderIcon />}>
            Launch
          </Sidebar.Item>
          <Sidebar.Item href="/projects/api" icon={<FolderIcon />}>
            API
          </Sidebar.Item>
        </Sidebar.Section>
      </Sidebar>
    </div>
  );
}
