import { useState } from 'react';
import { Button, HStack, Sidebar } from 'apx-ds';

import { CogIcon, FolderIcon, HomeIcon } from './_icons';

/**
 * Disabled items get `aria-disabled="true"` + `tabIndex=-1`, can't fire onClick, and are
 * styled with reduced opacity. Useful for "locked" features behind plan tiers or unverified
 * accounts. The Lock/Unlock buttons here toggle the state at runtime so @Ahmad can verify the
 * exact same DOM nodes flip in and out of the disabled state without remounting.
 */
export default function Disabled() {
  const [locked, setLocked] = useState(true);
  return (
    <div className="h-[420px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <div className="flex h-full">
        <Sidebar ariaLabel="Disabled-state example" variant="bordered" width={240}>
          <Sidebar.Item href="/" icon={<HomeIcon />}>
            Home
          </Sidebar.Item>
          <Sidebar.Item href="/projects" icon={<FolderIcon />} disabled={locked}>
            Projects (paid)
          </Sidebar.Item>
          <Sidebar.Item href="/settings" icon={<CogIcon />} disabled={locked}>
            Settings (paid)
          </Sidebar.Item>
        </Sidebar>
        <div className="flex-1 p-6">
          <HStack gap={2}>
            <Button onClick={() => setLocked(false)} variant="solid" size="sm" disabled={!locked}>
              Unlock
            </Button>
            <Button onClick={() => setLocked(true)} variant="outline" size="sm" disabled={locked}>
              Lock
            </Button>
          </HStack>
          <p className="mt-4 text-sm text-(--sds-color-text-muted)">
            Disabled items refuse click, focus, and keyboard activation.
          </p>
        </div>
      </div>
    </div>
  );
}
