import { Div, Sidebar } from '@apx-ui/ds';

import { ChartIcon, DocIcon, FolderIcon, HomeIcon, InboxIcon } from './_icons';

export default function Overview() {
  return (
    <Div
      height={460}
      className="overflow-hidden rounded-md border border-(--sds-color-border-subtle)"
    >
      <Sidebar
        ariaLabel="Application navigation"
        variant="bordered"
        width={240}
        activeHref="/docs/api/auth"
        activeMatchStrategy="prefix"
      >
        <Sidebar.Section label="Workspace">
          <Sidebar.Item href="/" icon={<HomeIcon />}>
            Home
          </Sidebar.Item>
          <Sidebar.Item href="/inbox" icon={<InboxIcon />} badge={5} badgeColor="primary">
            Inbox
          </Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Section label="Reports">
          <Sidebar.Item href="/reports/sales" icon={<ChartIcon />}>
            Sales
          </Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Item icon={<FolderIcon />} expandable defaultExpanded>
          Documents
          <Sidebar.SubItems>
            <Sidebar.Item href="/docs/getting-started" icon={<DocIcon />}>
              Getting started
            </Sidebar.Item>
            <Sidebar.Item href="/docs/api/auth" icon={<DocIcon />}>
              API · Auth
            </Sidebar.Item>
          </Sidebar.SubItems>
        </Sidebar.Item>
      </Sidebar>
    </Div>
  );
}