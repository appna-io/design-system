import { Sidebar } from '@apx-ui/ds';

import { CogIcon, HomeIcon, InboxIcon } from './_icons';

/**
 * All four chrome variants side by side. `default` is transparent (sits inside whatever
 * surface its container provides), `bordered` adds a logical-end border, `floating` is a
 * detached card with shadow and rounded corners, and `ghost` is fully transparent for use
 * over custom backgrounds.
 */
export default function Variants() {
  const items = (
    <>
      <Sidebar.Item href="/" icon={<HomeIcon />}>
        Home
      </Sidebar.Item>
      <Sidebar.Item href="/inbox" icon={<InboxIcon />} badge={3}>
        Inbox
      </Sidebar.Item>
      <Sidebar.Item href="/settings" icon={<CogIcon />}>
        Settings
      </Sidebar.Item>
    </>
  );
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {(['default', 'bordered', 'floating', 'ghost'] as const).map((variant) => (
        <div
          key={variant}
          className="h-[280px] overflow-hidden rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-muted)"
        >
          <div className="border-b border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) px-3 py-1.5 text-xs font-mono text-(--sds-color-text-muted)">
            variant=&quot;{variant}&quot;
          </div>
          <Sidebar ariaLabel={`Variant ${variant}`} variant={variant} width="100%">
            {items}
          </Sidebar>
        </div>
      ))}
    </div>
  );
}
