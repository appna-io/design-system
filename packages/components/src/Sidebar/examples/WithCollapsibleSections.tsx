import { Div, Sidebar } from '@apx-ui/ds';

import { ChartIcon, FolderIcon, HomeIcon, InboxIcon } from './_icons';

/**
 * Sidebar with collapsible sections — click any section header to fold its items away. Uses
 * the same `grid-template-rows: 0fr → 1fr` mechanism Accordion uses, so the animation reads
 * smooth without measuring heights in JS. Both controlled and uncontrolled modes are supported;
 * this example uses uncontrolled (`defaultOpen`).
 */
export default function WithCollapsibleSections() {
  return (
    <Div
      height={480}
      className="overflow-hidden rounded-md border border-(--sds-color-border-subtle)"
    >
      <Sidebar
        ariaLabel="Collapsible navigation"
        variant="bordered"
        width={240}
        activeHref="/inbox"
      >
        <Sidebar.Section label="Workspace" collapsible defaultOpen>
          <Sidebar.Item href="/" icon={<HomeIcon />}>
            Home
          </Sidebar.Item>
          <Sidebar.Item href="/inbox" icon={<InboxIcon />} badge={3}>
            Inbox
          </Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Section label="Reports" collapsible defaultOpen badge={2} badgeColor="info">
          <Sidebar.Item href="/reports/sales" icon={<ChartIcon />}>
            Sales
          </Sidebar.Item>
          <Sidebar.Item href="/reports/retention" icon={<ChartIcon />}>
            Retention
          </Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Section label="Archive" collapsible defaultOpen={false}>
          <Sidebar.Item href="/archive/2025" icon={<FolderIcon />}>
            2025
          </Sidebar.Item>
          <Sidebar.Item href="/archive/2024" icon={<FolderIcon />}>
            2024
          </Sidebar.Item>
        </Sidebar.Section>
      </Sidebar>
    </Div>
  );
}