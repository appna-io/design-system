import { useState } from 'react';
import { Button, Div, HStack, Sidebar, Typography } from '@apx-ui/ds';

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
    <Div
      height={420}
      className="overflow-hidden rounded-md border border-(--sds-color-border-subtle)"
    >
      <Div display="flex" className="h-full">
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
        <Div className="flex-1 p-6">
          <HStack gap={2}>
            <Button onClick={() => setLocked(false)} variant="solid" size="sm" disabled={!locked}>
              Unlock
            </Button>
            <Button onClick={() => setLocked(true)} variant="outline" size="sm" disabled={locked}>
              Lock
            </Button>
          </HStack>
          <Typography variant="bodySmall" color="fg.muted" className="mt-4">
            Disabled items refuse click, focus, and keyboard activation.
          </Typography>
        </Div>
      </Div>
    </Div>
  );
}