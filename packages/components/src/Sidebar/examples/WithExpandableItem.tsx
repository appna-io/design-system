import { Sidebar } from '@apx-ui/ds';

import { DocIcon, FolderIcon, HomeIcon } from './_icons';

/**
 * Sidebar with two-level expandable items — useful for documentation navigation where a single
 * parent ("Documents") has child links underneath it. The parent item is a button (not a link)
 * because clicking expand/collapse and "navigate to documents index" usually want different
 * affordances; consumers who want both can add a leading "Overview" sub-item.
 */
export default function WithExpandableItem() {
  return (
    <div className="h-[460px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <Sidebar
        ariaLabel="Docs navigation"
        variant="bordered"
        width={260}
        activeHref="/docs/api/auth"
        activeMatchStrategy="prefix"
      >
        <Sidebar.Item href="/" icon={<HomeIcon />}>
          Home
        </Sidebar.Item>
        <Sidebar.Item icon={<FolderIcon />} expandable defaultExpanded>
          Documents
          <Sidebar.SubItems>
            <Sidebar.Item href="/docs/getting-started" icon={<DocIcon />}>
              Getting started
            </Sidebar.Item>
            <Sidebar.Item icon={<DocIcon />} expandable defaultExpanded>
              API
              <Sidebar.SubItems>
                <Sidebar.Item href="/docs/api/auth">Auth</Sidebar.Item>
                <Sidebar.Item href="/docs/api/billing">Billing</Sidebar.Item>
                <Sidebar.Item href="/docs/api/webhooks">Webhooks</Sidebar.Item>
              </Sidebar.SubItems>
            </Sidebar.Item>
            <Sidebar.Item href="/docs/changelog" icon={<DocIcon />}>
              Changelog
            </Sidebar.Item>
          </Sidebar.SubItems>
        </Sidebar.Item>
        <Sidebar.Item href="/docs/support" icon={<DocIcon />}>
          Support
        </Sidebar.Item>
      </Sidebar>
    </div>
  );
}
