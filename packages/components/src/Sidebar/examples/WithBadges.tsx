import { Div, Sidebar } from '@apx-ui/ds';

import { CalendarIcon, FolderIcon, HomeIcon, InboxIcon, StarIcon } from './_icons';

/**
 * Showcases the full badge color spectrum on Sidebar.Item — useful for unread counts, status
 * indicators, "new" labels, and counts across categories. Mix of numeric and text badges.
 */
export default function WithBadges() {
  return (
    <Div
      height={460}
      className="overflow-hidden rounded-md border border-(--sds-color-border-subtle)"
    >
      <Sidebar ariaLabel="Badge showcase" variant="bordered" width={240}>
        <Sidebar.Item href="/" icon={<HomeIcon />} badge="New" badgeColor="info">
          Home
        </Sidebar.Item>
        <Sidebar.Item href="/inbox" icon={<InboxIcon />} badge={3} badgeColor="primary">
          Inbox
        </Sidebar.Item>
        <Sidebar.Item href="/starred" icon={<StarIcon />} badge={12} badgeColor="warning">
          Starred
        </Sidebar.Item>
        <Sidebar.Item href="/calendar" icon={<CalendarIcon />} badge="Live" badgeColor="success">
          Calendar
        </Sidebar.Item>
        <Sidebar.Item href="/archive" icon={<FolderIcon />} badge={99} badgeColor="neutral">
          Archive
        </Sidebar.Item>
        <Sidebar.Item href="/alerts" icon={<InboxIcon />} badge={2} badgeColor="danger">
          Alerts
        </Sidebar.Item>
      </Sidebar>
    </Div>
  );
}