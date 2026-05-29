import { Sidebar } from '@apx-ui/ds';

import { CogIcon, FolderIcon, HomeIcon, InboxIcon } from './_icons';

/**
 * Minimal flat sidebar — no sections, no header/footer chrome. Sets a fixed inline width so
 * the example renders correctly outside an AppShell (in production, AppShell's grid column
 * handles the width and this prop is omitted).
 */
export default function BasicFlat() {
  return (
    <div className="h-[420px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <Sidebar ariaLabel="Basic flat navigation" variant="bordered" width={220} activeHref="/inbox">
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
    </div>
  );
}
