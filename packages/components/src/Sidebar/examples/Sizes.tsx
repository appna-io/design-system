import { Sidebar } from 'apx-ds';

import { CogIcon, HomeIcon, InboxIcon } from './_icons';

/**
 * Three size scales side by side. Affects font size, item padding, icon size, and the overall
 * vertical rhythm of the rail. `md` is the canonical default; `sm` for dense admin panels;
 * `lg` for marketing dashboards.
 */
export default function Sizes() {
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div
          key={size}
          className="h-[260px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)"
        >
          <div className="border-b border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) px-3 py-1.5 text-xs font-mono text-(--sds-color-text-muted)">
            size=&quot;{size}&quot;
          </div>
          <Sidebar ariaLabel={`Size ${size}`} variant="default" size={size}>
            {items}
          </Sidebar>
        </div>
      ))}
    </div>
  );
}
