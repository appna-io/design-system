import { Tabs } from 'apx-ds';

export default function Vertical() {
  return (
    <Tabs orientation="vertical" defaultValue="profile" aria-label="Account settings" className="min-h-[220px]">
      <Tabs.List>
        <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
        <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
        <Tabs.Trigger value="billing">Billing</Tabs.Trigger>
        <Tabs.Trigger value="api">API keys</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="profile">Your name, avatar, and bio.</Tabs.Panel>
      <Tabs.Panel value="notifications">Email and push notification preferences.</Tabs.Panel>
      <Tabs.Panel value="billing">Payment methods and invoices.</Tabs.Panel>
      <Tabs.Panel value="api">Personal access tokens and service keys.</Tabs.Panel>
    </Tabs>
  );
}
