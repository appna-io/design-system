import { Div, Sidebar, Typography } from '@apx-ui/ds';

import { CogIcon, FolderIcon, HomeIcon, InboxIcon, UserIcon } from './_icons';

/**
 * Sidebar with a Header (logo / app name at top) and a Footer (user account at bottom).
 * `<Sidebar.Spacer />` between the last item and the footer pushes the footer to the bottom
 * even when there are few items, matching the look of Notion / Linear / Slack sidebars.
 */
export default function WithHeaderFooter() {
  return (
    <Div
      height={460}
      className="overflow-hidden rounded-md border border-(--sds-color-border-subtle)"
    >
      <Sidebar
        ariaLabel="Full-chrome navigation"
        variant="bordered"
        width={260}
        activeHref="/inbox"
      >
        <Sidebar.Header>
          <Div
            display="flex"
            alignItems="center"
            justifyContent="center"
            className="h-7 w-7 rounded-md bg-(--sds-color-surface-subtle) text-sm font-bold"
          >
            A
          </Div>
          <Typography as="span" weight="semibold">
            Acme
          </Typography>
        </Sidebar.Header>
        <Sidebar.Section label="Workspace">
          <Sidebar.Item href="/" icon={<HomeIcon />}>
            Home
          </Sidebar.Item>
          <Sidebar.Item href="/inbox" icon={<InboxIcon />} badge={5}>
            Inbox
          </Sidebar.Item>
          <Sidebar.Item href="/projects" icon={<FolderIcon />}>
            Projects
          </Sidebar.Item>
          <Sidebar.Item href="/settings" icon={<CogIcon />}>
            Settings
          </Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Spacer />
        <Sidebar.Footer>
          <Div
            display="flex"
            alignItems="center"
            justifyContent="center"
            className="h-7 w-7 rounded-full bg-(--sds-color-surface-subtle)"
          >
            <UserIcon />
          </Div>
          <Div display="flex" flexDirection="column" className="min-w-0">
            <Typography as="span" variant="bodySmall" weight="medium" className="truncate">
              Ada Lovelace
            </Typography>
            <Typography as="span" variant="caption" color="fg.muted" className="truncate">
              ada@example.com
            </Typography>
          </Div>
        </Sidebar.Footer>
      </Sidebar>
    </Div>
  );
}