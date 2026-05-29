import { Sidebar } from 'apx-ds';

import { CogIcon, FolderIcon, HomeIcon, PlusIcon } from './_icons';

/**
 * Demonstrates `<Sidebar.Spacer />` — fills available vertical space and pushes following
 * items toward the bottom of the rail. Common pattern: primary navigation up top, "New …"
 * call-to-action at the bottom.
 */
export default function WithSpacer() {
  return (
    <div className="h-[460px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <Sidebar ariaLabel="Spacer example" variant="bordered" width={240}>
        <Sidebar.Item href="/" icon={<HomeIcon />}>
          Home
        </Sidebar.Item>
        <Sidebar.Item href="/projects" icon={<FolderIcon />}>
          Projects
        </Sidebar.Item>
        <Sidebar.Item href="/settings" icon={<CogIcon />}>
          Settings
        </Sidebar.Item>
        <Sidebar.Spacer />
        <Sidebar.Item icon={<PlusIcon />} variant="ghost" onClick={() => undefined}>
          New project
        </Sidebar.Item>
      </Sidebar>
    </div>
  );
}
