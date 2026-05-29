import { useState } from 'react';
import { Button, HStack, Sidebar } from '@apx-ui/ds';

import { FolderIcon, HomeIcon, InboxIcon } from './_icons';

/**
 * `activeMatchStrategy="prefix"` keeps a parent route highlighted while you're on its child
 * pages — `/inbox` stays active when you're on `/inbox/42`. The boundary check (`+ '/'`)
 * prevents `/p` from wrongly matching `/photos`.
 *
 * Use the buttons to flip between routes and watch the active-state move around.
 */
export default function ActiveHrefPrefix() {
  const [path, setPath] = useState('/inbox/42');
  return (
    <div className="h-[460px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <div className="flex h-full">
        <Sidebar
          ariaLabel="Prefix-match example"
          variant="bordered"
          width={240}
          activeHref={path}
          activeMatchStrategy="prefix"
        >
          <Sidebar.Item href="/" icon={<HomeIcon />}>
            Home
          </Sidebar.Item>
          <Sidebar.Item href="/inbox" icon={<InboxIcon />}>
            Inbox
          </Sidebar.Item>
          <Sidebar.Item href="/projects" icon={<FolderIcon />}>
            Projects
          </Sidebar.Item>
        </Sidebar>
        <div className="flex-1 p-6">
          <p className="text-sm text-(--sds-color-text-muted)">
            Current path: <code className="font-mono">{path}</code>
          </p>
          <HStack gap={2} className="mt-4 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => setPath('/')}>
              /
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPath('/inbox')}>
              /inbox
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPath('/inbox/42')}>
              /inbox/42 (child)
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPath('/projects/launch')}>
              /projects/launch
            </Button>
          </HStack>
        </div>
      </div>
    </div>
  );
}
