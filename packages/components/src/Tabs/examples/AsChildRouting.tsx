import { Tabs } from '@apx-ui/ds';

/**
 * Tabs that drive a router: `asChild` lets `<Tabs.Trigger>` wrap a real anchor/link. The trigger
 * keeps the ARIA roles + active-state classes while the anchor owns the href + navigation. Swap
 * the plain `<a>` for your framework's link primitive (`<Link>` from next/link, etc.).
 */
export default function AsChildRouting() {
  return (
    <Tabs defaultValue="/overview" aria-label="Routing-driven tabs">
      <Tabs.List>
        <Tabs.Trigger asChild value="/overview">
          <a href="#overview">Overview</a>
        </Tabs.Trigger>
        <Tabs.Trigger asChild value="/activity">
          <a href="#activity">Activity</a>
        </Tabs.Trigger>
        <Tabs.Trigger asChild value="/settings">
          <a href="#settings">Settings</a>
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="/overview">Overview panel content.</Tabs.Panel>
      <Tabs.Panel value="/activity">Activity panel content.</Tabs.Panel>
      <Tabs.Panel value="/settings">Settings panel content.</Tabs.Panel>
    </Tabs>
  );
}