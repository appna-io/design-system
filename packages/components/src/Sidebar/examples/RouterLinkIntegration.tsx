import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { Sidebar } from '@apx-ui/ds';

import { HomeIcon, InboxIcon, FolderIcon } from './_icons';

/**
 * Stand-in for a framework router Link (Next.js / React Router / TanStack Router). The key
 * insight: any element that accepts `href` + className + ref works via `asChild`. The Sidebar
 * applies its styling and a11y attributes onto the consumer's component, and the consumer
 * retains all their routing behavior (client-side transitions, prefetch, etc.).
 */
const RouterLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }>(
  function RouterLink({ to, children, ...rest }, ref) {
    // In a real app this would call your router's navigation API; we just preventDefault here
    // to show the asChild plumbing without leaving the page.
    return (
      <a
        ref={ref}
        href={to}
        onClick={(e) => {
          e.preventDefault();
        }}
        data-router-link=""
        {...rest}
      >
        {children}
      </a>
    );
  },
);

export default function RouterLinkIntegration() {
  return (
    <div className="h-[420px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <Sidebar
        ariaLabel="Router-link example"
        variant="bordered"
        width={240}
        activeHref="/inbox"
      >
        <Sidebar.Item asChild icon={<HomeIcon />}>
          <RouterLink to="/">Home</RouterLink>
        </Sidebar.Item>
        <Sidebar.Item asChild icon={<InboxIcon />} badge={3}>
          <RouterLink to="/inbox">Inbox</RouterLink>
        </Sidebar.Item>
        <Sidebar.Item asChild icon={<FolderIcon />}>
          <RouterLink to="/projects">Projects</RouterLink>
        </Sidebar.Item>
      </Sidebar>
    </div>
  );
}
