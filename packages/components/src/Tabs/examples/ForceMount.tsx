import { Tabs } from 'apx-ds';

/**
 * `forceMount` keeps each panel mounted even when inactive. Inactive panels are still hidden
 * from the a11y tree (via the `hidden` attribute), but their subtree is preserved — useful for
 * embedded players, complex form state you don't want to lose, or expensive trees you don't
 * want to remount on every tab switch.
 */
export default function ForceMount() {
  return (
    <Tabs defaultValue="player" aria-label="Always-mounted tabs">
      <Tabs.List>
        <Tabs.Trigger value="player">Player</Tabs.Trigger>
        <Tabs.Trigger value="form">Form draft</Tabs.Trigger>
        <Tabs.Trigger value="report">Report</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="player" forceMount>
        <p>Video player keeps playing in the background even when this panel is hidden.</p>
      </Tabs.Panel>
      <Tabs.Panel value="form" forceMount>
        <p>Form draft preserved across tab switches.</p>
      </Tabs.Panel>
      <Tabs.Panel value="report" forceMount>
        <p>Pre-rendered report stays in the DOM, no re-fetch on tab switch.</p>
      </Tabs.Panel>
    </Tabs>
  );
}
